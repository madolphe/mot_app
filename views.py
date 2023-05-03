from django.shortcuts import render, redirect, HttpResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_protect

from .models import SecondaryTask, Episode
from manager_app.models import ParticipantProfile, Study
from survey_app.models import Answer
from survey_app.views import questionnaire
from manager_app.utils import add_message
from .utils import assign_mot_condition
from .sequence_manager.seq_manager import MotParamsWrapper
from .models import CognitiveTask, CognitiveResult
from .forms import ConsentForm

from collections import defaultdict
import json
import datetime
import random

import kidlearn_lib as k_lib
from kidlearn_lib import functions as func

from .get_participant_progression import get_exp_status, get_staircase_episodes, get_zpdes_hull_episodes


# #################### Views and utilities for general-task #####################

@login_required
def general_tutorial(request):
    user = request.user
    participant = user.participantprofile
    # If participant has a session assigned, set request.session.active_session to True
    if participant.current_session:
        request.session['active_session'] = json.dumps(True)
    parameter_dict = {}
    return render(request, 'introduction/general_tuto.html',
                  {"CONTEXT": {"participant": participant, "parameter_dict": parameter_dict}})


@login_required
def mot_consent_page(request):
    user = request.user
    participant = user.participantprofile
    # In Prolific study, participants are not asked to provide their email adress
    is_prolific_user = "prolific" or "ufov" in participant.study.name
    form = ConsentForm(request.POST or None, request=request, is_prolific_user=is_prolific_user)
    if form.is_valid():
        participant.consent = True
        if not is_prolific_user and form.cleaned_data['request_reminder']:
            participant.remind = True
            participant.email = form.cleaned_data['email']
        participant.save()
        return redirect(reverse('end_task'))
    return render(request, 'introduction/consent_page.html', {'CONTEXT': {
        'username': user.username,
        'project': participant.study.project,
        'form': form}})


# #################### View for MOT tutorial #####################
@login_required
def mot_tutorial(request):
    user = request.user
    participant = user.participantprofile
    # If participant has a session assigned, set request.session.active_session to True
    if participant.current_session:
        request.session['active_session'] = json.dumps(True)
    return render(request, 'mot_app/tutorial.html',
                  {'CONTEXT': {"participant": participant,
                               'distractor_path': "guard",
                               'background_path': "arena",
                               'target_path': "goblin",
                               'map_path': "",
                               'next_episode_function': 'next_episode',
                               'exit_function': 'mot_close_task',
                               'restart_function': 'restart_episode',
                               }})

# #################### Views and utilities for MOT training #####################
# Methods for mot_task view (i.e entry point after home page):
@login_required
def mot_task(request):
    """
    View called when button "begin task" is selected.
    :param request:
    :return:
    """
    participant = ParticipantProfile.objects.get(user=request.user.id)
    # First checks on extra_json to make sure he has been assigned to a group + that some fields are init:
    # has_already_played_the_game is True if nb_episodes field doesn't exist (i.e no episodes in history)
    has_started_eval = check_participant_extra_json(participant)
    # Then init a MotParamsWrapper:
    request.session['mot_wrapper'] = MotParamsWrapper(participant)
    if 'game_time_to_end' in participant.extra_json:
        # If players has already played / reload page (and delete cache) for this session, game_time has to be set:
        request.session['mot_wrapper'].parameters['game_time'] = int(participant.extra_json['game_time_to_end'])
    # Set new sequence_manager (erase the previous one if exists):
    set_sequence_manager(participant, request)
    # Check if in an evaluation procedure: if it's the case returns a dict with activity parameters
    act_parameters = get_evaluation_participant_activity(participant, request,
                                                         has_started_eval_from_home=has_started_eval)
    if not act_parameters:
        # Otherwise sample a new activity from history
        act_parameters = sample_activity_based_on_history(request)
    # Use the correct gamification context of the day:
    map, (bg, dist, targ) = retrieve_gaming_context(participant)
    return render(request, 'mot_app/app_MOT.html',
                  {'CONTEXT': {'parameter_dict': json.dumps(act_parameters),
                               'distractor_path': dist,
                               'background_path': bg,
                               'target_path': targ,
                               'map_path': map,
                               'next_episode_function': 'next_episode',
                               'exit_function': 'mot_close_task',
                               'restart_function': 'restart_episode',
                               }})


def check_participant_extra_json(participant):
    # First assign condition if first connexion:
    if "condition" not in participant.extra_json:
        # Participant hasn't been put in a group:
        assign_mot_condition(participant)
        # Set new mot_wrapper (erase old one if exists):
    if "participant_nb_progress_clicked" not in participant.extra_json:
        participant.extra_json['participant_nb_progress_clicked'] = [0]
        participant.save()
    if "nb_episodes" not in participant.extra_json:
        participant.extra_json['nb_episodes'] = 0
        participant.save()
    if "gaming_context" not in participant.extra_json:
        stories = ["cine_part1", "cine_part2", "goblin", "mythology"]
        # random.shuffle(stories)
        participant_sessions_stories = [f"{story}_map_{i}" for story in stories for i in range(1, 5)]
        participant.extra_json["gaming_context"] = participant_sessions_stories
        participant.save()
    return check_participant_evaluation(participant)


def retrieve_gaming_context(participant, default_mode=False):
    """
    This method takes a participant as input and outputs the correct progress_map, distractor, target and background
    """
    if "gaming_context" not in participant.extra_json or default_mode:
        return "goblin_map_1", "classical_background", "classical_distractor", "classical_target"
    types = ["background", "distractor", "target"]
    ref_dict = {
        "cine_part1_map_1": (f"space_{type}" for type in types),
        "cine_part1_map_2": (f"alfred_{type}" for type in types),
        "cine_part1_map_3": (f"singing_{type}" for type in types),
        "cine_part1_map_4": (f"western_{type}" for type in types),
        "cine_part2_map_1": (f"spartacus_{type}" for type in types),
        "cine_part2_map_2": (f"spy_{type}" for type in types),
        "cine_part2_map_3": (f"bond_{type}" for type in types),
        "cine_part2_map_4": (f"arsene_{type}" for type in types),
        "goblin_map_1": (f"g_forest_{type}" for type in types),
        "goblin_map_2": (f"classical_{type}" for type in types),
        "goblin_map_3": (f"g_desert_{type}" for type in types),
        "goblin_map_4": (f"g_snow_{type}" for type in types),
        "mythology_map_1": (f"aztec_{type}" for type in types),
        "mythology_map_2": (f"medieval_{type}" for type in types),
        "mythology_map_3": (f"antic_{type}" for type in types),
        "mythology_map_4": (f"egypt_{type}" for type in types)
    }
    # the MOT training starts on day 2; index should then be -1:
    mot_session_index = participant.current_session.index - 1
    # there are 2 training per day;
    shift_index = 1
    if len([elt for elt in participant.task_names_list if elt == "simple-mot-practice"]) == 2:
        shift_index = 0
    # index is not in [0;7] but in [0;13]
    index_gaming = (mot_session_index * 2) + shift_index
    map = participant.extra_json["gaming_context"][index_gaming]
    return map, ref_dict[map]


def check_participant_evaluation(participant):
    # has_already_played_eval has to be turned True if the participants started playing the eval, disconnected and
    # then get back on evaluation
    has_started_eval = False
    # The idea is simple: if the participant has started the evaluation; the index will be at least 1
    # This checks only occurs in mot_task view (i.e from home)
    if "index_evaluation" in participant.extra_json:
        if int(participant.extra_json["index_evaluation"]) > 0:
            has_started_eval = True
    return has_started_eval


def set_sequence_manager(participant, request):
    dir_path = "static/JSON/config_files"
    if participant.extra_json['condition'] == 'zpdes':
        zpdes_params = func.load_json(file_name='ZPDES_mot', dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.ZpdesHssbg(zpdes_params)
    else:
        mot_baseline_params = func.load_json(file_name="mot_baseline_params", dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.MotBaselineSequence(mot_baseline_params)


def sample_activity_based_on_history(request):
    """
    This method takes a sequence_manager and based on history of episodes played, updates it.
    Then it samples a new episode and update the metrics for progress visualisation.
    Returns a dict with activity parameters.
    """
    participant = request.session['mot_wrapper'].participant
    update_sequence_manager_from_history(request)
    # Get parameters for task:
    parameters = request.session['mot_wrapper'].sample_task(request.session['seq_manager'], participant)
    # Add progress_array to parameters dict:
    parameters['nb_success_array'], parameters['progress_array'] = get_sr_from_seq_manager(
        request.session['seq_manager'],
        participant.extra_json['condition'])
    return parameters


def update_sequence_manager_from_history(request):
    # Build his history :
    history = Episode.objects.filter(participant=request.user, is_training=True)
    for episode in history:
        # Call mot_wrapper to parse django episodes and update seq_manager
        request.session['seq_manager'] = request.session['mot_wrapper'].update(episode, request.session['seq_manager'])


# Within mot_task view - on some session; an evaluation mode can be turned on:
def get_evaluation_participant_activity(participant, request, has_started_eval_from_home=False):
    """
    IF the evaluation mode is turned on; returns a dict with correct activity parameters
    To find the corresponding dict, this method retrieves the correct activity index and calls
    get_evaluation_activity_from_index().
    Else return None
    """
    # Sessions to be evaluated:
    evaluated_sessions = [1, 4, 5, 8]
    # First check if participant is in specific sessions:
    if participant.current_session.index in evaluated_sessions:
        # Check if he has completed the evaluation of this corresponding session:
        if "sessions_evaluated" in participant.extra_json:
            if participant.current_session.index in participant.extra_json["sessions_evaluated"]:
                return None
        # Else no array of evaluated sessions / index not in the array:
        # Try to retrieve activity index of the evaluation phase:
        if "index_evaluation" in participant.extra_json:
            if has_started_eval_from_home:
                # If participant comes from home and enter this condition, it means he has already played on the
                # evaluation; This also means that index_evaluation has been incremented on generation of last episode
                participant.extra_json["index_evaluation"] -= 1
            index = participant.extra_json["index_evaluation"]
        else:
            # index_evaluation has not been added / has been removed:
            participant.extra_json["index_evaluation"] = index = 0
        participant.save()
        # Returns an activity (/!\ Nothing is done on progress metrics outside of MotParamsWrapper)
        return get_evaluation_activity_from_index(index, request, participant)
    else:
        return None


def get_evaluation_activity_from_index(index, request, participant):
    """
    Returns an activity and update the extra_json (i.e if no more activities; remove extra_json["index_evaluation"],
    and add session_index to participant.extra_json["sessions_evaluated"]
    """
    activity, evaluation_done = request.session['mot_wrapper'].sample_evaluation_task(index, participant)
    # Return is_training in activity
    activity['is_training'] = False
    participant.extra_json["index_evaluation"] += 1
    if evaluation_done:
        participant.extra_json["last_one_to_store"] = True
        del participant.extra_json["index_evaluation"]
        if "sessions_evaluated" not in participant.extra_json:
            participant.extra_json["sessions_evaluated"] = [participant.current_session.index]
        else:
            participant.extra_json["sessions_evaluated"].append(participant.current_session.index)
    participant.save()
    return activity


# Useful function to compute the progress and display it to user:
def get_sr_from_seq_manager(seq_manager, group):
    if group == 'zpdes':
        return get_zpdes_sr_from_seq_manager(seq_manager)
    return get_baseline_sr_from_seq_manager(seq_manager)


def get_zpdes_sr_from_seq_manager(seq_manager):
    nb_success, max_lvl_array = [], []
    sub_dims_name = [f'nb{i}' for i in range(2, 8)]
    for sub_dim_index, list_success in enumerate(seq_manager.SSBGs['MAIN'].SSB[0].success):
        if len(list_success) == 0:
            nb_success.append(0)
            max_lvl_array.append(-1)
        else:
            # nb_success.append(sum(list_success))
            nb_success.append(sum(list(map(lambda x: not x < 1, list_success))))
            max_lvl = 0
            for sub_dim_SSB in seq_manager.SSBGs[sub_dims_name[sub_dim_index]].SSB:
                max_lvl += len(list(filter(None, sub_dim_SSB.bandval)))
            max_lvl_array.append((max_lvl - 8) * 100 / 28)
    return nb_success, format_progress_array(max_lvl_array)


def get_baseline_sr_from_seq_manager(seq_manager):
    nb_success, step_max_lvl_array = seq_manager.nb_success, seq_manager.maximum_step_staircase
    max_lvl_array = []
    # First, fill dimensions with maximum lvl:
    for i in range(step_max_lvl_array['MAIN']):
        max_lvl_array += [100]
    # Then for current main dim
    lvl = sum(step_max_lvl_array['sub_dims'])
    max_lvl_array.append(lvl * 100 / 28)
    # Finally for remaining dims, fill with 8 (lowest value):
    for i in range(step_max_lvl_array['MAIN'] + 1, 7):
        max_lvl_array += [-1]
    return nb_success, format_progress_array(max_lvl_array)


def format_progress_array(progress_array):
    '''
    This function allows to pass from relative maximum lvl achieved (i.e current max lvl / global max) to a correspoding
    index (to choose corresponding image in front)
    '''
    returned_array = []
    lvls = [-1, 0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100, 110]
    for val in progress_array:
        for index_lvl, lvl in enumerate(lvls):
            if val < lvl:
                # index lvl - 1 corresponds to correct class BUT need to have - 2 bc we want disable to be -1
                returned_array.append(index_lvl - 2)
                break
    return list(map(int, returned_array))


# Super useful function to manage next_episode presentation:
@login_required
@csrf_exempt
def next_episode(request):
    participant = ParticipantProfile.objects.get(user=request.user.id)
    mot_wrapper = request.session['mot_wrapper']
    params = request.POST.dict()
    episode = save_last_episode(participant, request, params)
    # Keep track of participant game_time and nb clicks on progress :
    update_participant_extra_json_intra_training(participant, request, params)
    # Sample new episode :
    parameters = get_evaluation_participant_activity(participant, request)
    if not parameters:
        request.session['seq_manager'] = mot_wrapper.update(episode, request.session['seq_manager'])
        parameters = mot_wrapper.sample_task(request.session['seq_manager'], participant)
    # Add progress array to parameters:
    updated_success_array, updated_progress_array = get_sr_from_seq_manager(
        request.session['seq_manager'],
        participant.extra_json['condition'])
    # If the participant has alreay played, there is a "progress_array" in parameters and the update can be compute:
    if 'progress_array' in parameters:
        boolean_progress = [old == new for old, new in zip(updated_progress_array, parameters['progress_array'])]
    else:
        boolean_progress = [True]*len(updated_progress_array)
    # Otherwise there is no update array to provide:
    parameters['nb_success_array'], parameters['progress_array'], parameters[
        'update_boolean_progress'] = updated_success_array, updated_progress_array, boolean_progress
    return HttpResponse(json.dumps(parameters))


def save_last_episode(participant, request, params):
    # If "last_one_to_store" is true, it means that index evaluation has been removed and that last activity is
    # being stored
    if "last_one_to_store" in participant.extra_json:
        # Store the last evaluation activity
        episode = save_episode(request, params, is_training=False)
        del participant.extra_json["last_one_to_store"]
        participant.save()
        # Additionaly, the sequence manager has to be reset (and history has to be provided to the teacher):
        update_sequence_manager_from_history(request)
    else:
        # Either during training or during evaluation:
        episode = save_episode(request, params, is_training="index_evaluation" not in participant.extra_json)
    # In case of secondary task:
    if params['secondary_task'] != 'none' and params['gaming'] == 1:
        params['sec_task_results'] = eval(params['sec_task_results'])
        save_secondary_tasks_results(params, episode)
    return episode


def update_participant_extra_json_intra_training(participant, request, params):
    # To keep track to participant last update, remaining game time is updated each time:
    # participant = request.user.participantprofile
    participant.extra_json['game_time_to_end'] = params['game_time']
    participant.extra_json['participant_nb_progress_clicked'][-1] = \
        participant.extra_json['participant_nb_progress_clicked'][-1] + int(params['nb_prog_clicked'])
    participant.extra_json['nb_episodes'] += 1
    participant.save()


@login_required
def mot_close_task(request):
    participant = request.user.participantprofile
    params = request.POST.dict()
    game_end = False
    # Game is over:
    if params['game_end'] == 'true':
        if 'messages' in request.session:
            del request.session['messages']
        game_end = True
    if not game_end:
        if request.POST.dict()['game_time'] == 'undefined':
            min, sec = 30, 0
        else:
            min = int(request.POST.dict()['game_time']) // 60
            sec = int(request.POST.dict()['game_time']) - (min * 60)
            request.session['mot_wrapper'].set_parameter('game_time', request.POST.dict()['game_time'])
            # Store that participant just paused the game:
            participant.extra_json['paused_mot_start'] = str(datetime.datetime.now())
            participant.extra_json['game_time_to_end'] = request.POST.dict()['game_time']
            participant.save()
        add_message(request,
                    _('Il vous reste encore du temps de jeu: %(min)s minutes et %(sec)s secondes, continuez ') % {
                        'min': str(min), 'sec': str(sec)},
                    tag='WARNING')
        return redirect(reverse('home'))
    else:
        participant.extra_json['participant_nb_progress_clicked'].append(0)
        participant.save()
        # If mot close and time is over, just remove game_time_to_end:
        if 'game_time_to_end' in participant.extra_json:
            del participant.extra_json['game_time_to_end']
            participant.save()
        add_message(request, 'Vous avez terminé la session de jeu!', 'success')
        request.session['exit_view_done'] = True
        return redirect(reverse('end_task'))


def save_episode(request, params, is_training=True):
    # Save episode and results:
    episode = Episode()
    episode.participant = request.user
    for key, val in params.items():
        if key in episode.__dict__:
            episode.__dict__[key] = val
    episode.is_training = is_training
    episode.save()
    return episode


def save_secondary_tasks_results(params, episode):
    for res in params['sec_task_results']:
        sec_task = SecondaryTask()
        sec_task.episode = episode
        sec_task.type = params['secondary_task']
        sec_task.delta_orientation = res[0]
        sec_task.answer_duration = res[1]
        sec_task.success = res[2]
        sec_task.save()


# Other views for admin page (not super useful anymore):
@login_required
@csrf_exempt
def set_mot_params(request):
    participant = request.user.participantprofile
    # Case 1: user comes from home and has modified his screen params:
    if "screen_params_input" in request.POST.dict():
        try:
            float(request.POST['screen_params_input'])
            add_message(request, "Paramètres d'écran modifiés.")
            # use extra_json for prompt in view and save it:
            participant.extra_json['screen_params'] = request.POST['screen_params_input']
            participant.save()
            # also update answer:
            answers = Answer.objects.filter(participant=participant)
            answer = answers.get(question__handle='prof-mot-1')
            answer.value = request.POST['screen_params_input']
            answer.save()
            # update screen params and return home:
        except ValueError:
            add_message(request, "Fournir une valeur réelle svp (ex: 39.116).", tag="error")
        return redirect(reverse('home'))
    else:
        # Case 2: user has just applied and provide screen params for the first time:
        # Normaly current task should be retrieving screen_params:
        return questionnaire(request)


@login_required
@csrf_exempt
def restart_episode(request):
    parameters = request.POST.dict()
    # Save episode and results:
    episode = Episode()
    episode.participant = request.user
    # Same params parse correctly for python:
    for key, value in parameters.items():
        # Just parse everything:
        try:
            parameters[key] = float(value)
        except ValueError:
            parameters[key] = value
    return HttpResponse(json.dumps(parameters))


@login_required
def zpdes_admin_view(request):
    participant = ParticipantProfile.objects.get(user=request.user.id)
    participant.extra_json['condition'] = 'zpdes'
    participant.save()
    return mot_admin_task(request, group="zpdes")


@login_required
def baseline_admin_view(request):
    participant = ParticipantProfile.objects.get(user=request.user.id)
    participant.extra_json['condition'] = 'baseline'
    participant.save()
    return mot_admin_task(request, group="baseline")


def mot_admin_task(request, group):
    dir_path = "static/JSON/config_files"
    participant = ParticipantProfile.objects.get(user=request.user.id)
    participant.extra_json['group'] = group
    request.session['mot_wrapper'] = MotParamsWrapper(participant)
    if "participant_nb_progress_clicked" not in participant.extra_json:
        participant.extra_json['participant_nb_progress_clicked'] = [0]
        participant.save()
    if "nb_episodes" not in participant.extra_json:
        participant.extra_json['nb_episodes'] = 0
        participant.save()
    # Set new sequence_manager (erase the previous one if exists):
    if group == 'zpdes':
        zpdes_params = func.load_json(file_name='ZPDES_mot', dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.ZpdesHssbg(zpdes_params)
    else:
        mot_baseline_params = func.load_json(file_name="mot_baseline_params", dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.MotBaselineSequence(mot_baseline_params)
    parameters = sample_activity_based_on_history(request)
    return render(request, 'mot_app/app_MOT.html', {'CONTEXT': {'parameter_dict': json.dumps(parameters)}})


@login_required
def display_progression(request):
    participant = request.user.participantprofile
    # Retrieve all played episodes:
    history = Episode.objects.filter(participant=request.user)
    display_fields = ['n_targets', 'n_distractors', 'speed_max', 'tracking_time', 'probe_time']
    CONTEXT = defaultdict(list)
    for episode in history:
        for field in display_fields:
            CONTEXT[episode.id].append(episode.__dict__[field])
        CONTEXT[episode.id].append(episode.get_results)
    CONTEXT = dict(CONTEXT)
    participant.extra_json['history'] = CONTEXT
    return render(request, 'mot_app/display_progression.html',
                  {'CONTEXT': {'participant': participant}})


# #################### Views and utilities for pre-post-task #####################
NUMBER_OF_TASKS_PER_BATCH = 4


@login_required
@never_cache
def cognitive_assessment_home(request):
    """
    This view is the controller for the all activity. It checks the current status of the pre/post test.

    # Always store the timestamp when participant request this view (append to both cog_test_date and cog_test_hour
    of participant extra_json)
    # First check if it is the first activity for the participant:
        If so:
        - Create a task stack (random)
        - Update status (pre/post - phase1)
    # Then there is a task stack:
        - Retrieve current idx_task
    # From current idx_task:
        - Retrieve current task_object
    # 3 possible exit from the retrieved current task_object :
    1) This is a "normal" activity: -> launch_task() view is called
    2) It's time for break -> exit_for_break() is called
    3) No more activity on task stack: -> cognitive_assesment_end_task() is called
    """
    participant = ParticipantProfile.objects.get(user=request.user.id)
    # Check if participant is doing the test for the first time:
    if 'cognitive_tests_status' not in participant.extra_json:
        init_participant_extra_json(participant)
    add_participant_timestamp(participant)
    # task index is updated when the last task has been completed
    idx_task = participant.extra_json['cognitive_tests_current_task_idx']
    # Get current task context and name according to task idx:
    current_task_object = get_current_task_context(participant, idx_task)
    # 3 use cases: play / time for break / time to stop
    if current_task_object is not None and not participant.extra_json['cognitive_tests_break']:
        return launch_task(request, participant, current_task_object, idx_task)
    elif current_task_object is not None:
        return exit_for_break(participant)
    else:
        return cognitive_assesment_end_task(participant)


# Functions to manage the task stack:
def init_participant_extra_json(participant):
    participant.extra_json['cognitive_tests_task_stack'] = get_task_stack()
    restart_participant_extra_json(participant, test_title='PRE_TEST', task_index=0, task_to_store=False)


def get_task_stack():
    """
        When user pass the test for the first time, the task stack is defined randomly here
    """
    all_tasks = CognitiveTask.objects.all().values('name')
    task_stack = [task['name'] for task in all_tasks]
    # task_stack = ['moteval','workingmemory','memorability_1','memorability_2','taskswitch','enumeration',
    # 'loadblindness', 'gonogo']
    # task_stack = ['moteval' for i in range(8)]
    random.shuffle(task_stack)
    return task_stack


def add_participant_timestamp(participant):
    '''
        Utility function to add timestamp to participant extra_json
    '''
    if 'cog_test_date' in participant.extra_json:
        participant.extra_json['cog_test_date'] += f"/{datetime.date.today()}"
        hour = datetime.datetime.now().strftime("%H:%M:%S")
        participant.extra_json['cog_test_hour'] += f"/{hour}"
    else:
        participant.extra_json['cog_test_date'] = datetime.date.today()
        participant.extra_json['cog_test_hour'] = datetime.datetime.now().strftime("%H:%M:%S")
    participant.save()


def get_current_task_context(participant, idx_task):
    """
    Retrieve the current task object from participant and current idx_task
    # If idx_task > nb of activities in stack; then there is no more activity to propose, return None
    # Else,
        # If idx_task == half of the experiment, change status of cognitive_tests_break
        # Retrieve current task
    """
    task_stack = participant.extra_json['cognitive_tests_task_stack']
    if idx_task < len(task_stack):
        if participant.extra_json['cognitive_tests_first_half']:
            # It's still first half, check if it's time for break (if so exit_for_break() will be launch):
            participant.extra_json['cognitive_tests_break'] = idx_task == (NUMBER_OF_TASKS_PER_BATCH)
            participant.save()
        # Find corresponding task_object and return it:
        current_task_name = task_stack[idx_task]
        current_task_object = CognitiveTask.objects.values().get(name=current_task_name)
        return current_task_object
    return None


# Views used to exit the main controller (i.e views specified by manager_app):
def launch_task(request, participant, current_task_object, idx_task, show_progress=True):
    # No break + still tasks to play:
    # The task results will have to be stored right after coming back to this view
    participant.extra_json['task_to_store'] = True
    participant.save()
    screen_params = Answer.objects.get(participant=participant, question__handle='prof-mot-1').value
    # If participant has a session assigned, set request.session.active_session to True
    if participant.current_session:
        request.session['active_session'] = json.dumps(True)
    return render(request,
                  'pre-post-tasks/instructions/pre-post.html',
                  {'CONTEXT': {'participant': participant,
                               'current_task': current_task_object,
                               'screen_params': screen_params,
                               'index_task': idx_task,
                               'show_progress': show_progress}})


def exit_for_break(participant):
    '''
    A break but still tasks to play, i.e time to pass to second half of cognitive tests:
    set participant extra json to same status (POST/PRE) with task index
    When coming back after break, make sure the task to store is still set to False
    '''
    participant.extra_json['cognitive_tests_break'] = False
    participant.save()
    restart_participant_extra_json(participant,
                                   test_title=participant.extra_json['cognitive_tests_status'],
                                   task_index=NUMBER_OF_TASKS_PER_BATCH,
                                   is_first_half=False,
                                   task_to_store=False)
    return redirect(reverse('end_task'))


def cognitive_assesment_end_task(participant):
    # Ok task is over let's close the task by rendering the usual end_task
    restart_participant_extra_json(participant,
                                   test_title='POST_TEST',
                                   task_index=0,
                                   is_first_half=True,
                                   task_to_store=False)
    return redirect(reverse('end_task'))


# Views used to receive data from cognitive tasks and manage participant extra json:
@login_required
def exit_view_cognitive_task(request):
    """
        When participant finish an activity, the request is sent to this view.
    """
    participant = ParticipantProfile.objects.get(user=request.user.id)
    idx_task = participant.extra_json['cognitive_tests_current_task_idx']
    # If the participant has just played, store results of last tasks:
    if store_previous_task(request, participant, idx_task):
        # Update task index for next visit to the view
        update_task_index(participant)
    return redirect(reverse(cognitive_assessment_home))


def store_previous_task(request, participant, idx_task):
    data = request.POST.dict()
    if 'csrfmiddlewaretoken' in data:
        del data['csrfmiddlewaretoken']
    task_name = participant.extra_json['cognitive_tests_task_stack'][idx_task]
    task = CognitiveTask.objects.get(name=task_name)
    res = None
    if not cog_results_exists_in_db(task, participant, request, data):
        res = store_cog_results(task, participant, idx_task, data)
        participant.extra_json['last_cog_results'] = data
        participant.save()
    return res


def store_cog_results(task, participant, idx_task, data):
    res = CognitiveResult()
    res.cognitive_task = task
    res.participant = participant
    res.idx = idx_task
    res.results = data
    res.status = participant.extra_json["cognitive_tests_status"]
    res.save()
    return res


def cog_results_exists_in_db(task, participant, request, data):
    """
    Returns True if object doesn't exist in database OR if the last results stored for the participant is
    exactly the same
    """
    if 'last_cog_results' in participant.extra_json:
        # Always check if the data we want to store are not exactly similar as previous ones:
        if participant.extra_json['last_cog_results'] == data:
            # If it's exactly the same, just in case store it with error tag in data
            data['error'] = True
            _ = store_cog_results(task, participant, 10, data)
            return True
    sessions = ['PRE_TEST', 'POST_TEST']
    if participant.current_session.index == 0:
        current_session = sessions[participant.current_session.index]
    else:
        current_session = sessions[-1]
    return CognitiveResult.objects.filter(cognitive_task=task, participant=participant, status=current_session).exists()
    # status=participant.extra_json["cognitive_tests_status"]).exists()


def update_task_index(participant):
    """Objectives of this function are 2-folds:
        1) increment the current index of the cognitive_test that will be played
        2) Test if this index corresponds to the moment for a break
    """
    participant.extra_json['cognitive_tests_current_task_idx'] += 1
    participant.save()


def restart_participant_extra_json(participant, test_title, task_index=0, is_first_half=True, task_to_store=True):
    participant.extra_json['cognitive_tests_status'] = test_title
    participant.extra_json['cognitive_tests_current_task_idx'] = task_index
    participant.extra_json['cognitive_tests_first_half'] = is_first_half
    participant.extra_json['task_to_store'] = task_to_store
    participant.save()


@login_required
@never_cache
def cognitive_task(request):
    """
        View used to render all activities in the pre/post assessment
        Render a base html file that uses a custom filter django tag to include the correct js scripts
    """
    participant = ParticipantProfile.objects.get(user=request.user.id)
    screen_params = Answer.objects.get(participant=participant, question__handle='prof-mot-1').value
    current_task_idx = participant.extra_json["cognitive_tests_current_task_idx"]
    stack_tasks = participant.extra_json["cognitive_tests_task_stack"]
    current_task = f"{stack_tasks[current_task_idx]}"
    exit_view = "exit_view_cognitive_task"
    if participant.study.name == "ufov":
        exit_view = "exit_ufov_task"
    return render(request,
                  'pre-post-tasks/base_pre_post_app.html',
                  {"CONTEXT": {"screen_params": screen_params,
                               "task": current_task,
                               "exit_view": exit_view}})


# Only for the UFOV study:
@login_required
@never_cache
def ufov_home(request):
    """
    This view is the controller for the ufov_only activity.
    """
    participant = ParticipantProfile.objects.get(user=request.user.id)
    # Check if participant is doing the test for the first time:
    if 'cognitive_tests_status' not in participant.extra_json:
        participant.extra_json['cognitive_tests_task_stack'] = ['ufov']
        restart_participant_extra_json(participant, test_title='PRE_TEST', task_index=0, task_to_store=False)
    add_participant_timestamp(participant)
    # task index is updated when the last task has been completed
    idx_task = participant.extra_json['cognitive_tests_current_task_idx']
    # Get current task context:
    current_task_object = get_current_task_context(participant, idx_task)
    # 3 use cases: play / time for break / time to stop
    return launch_task(request, participant, current_task_object, idx_task, show_progress=False)


@login_required
def exit_ufov_task(request):
    participant = ParticipantProfile.objects.get(user=request.user.id)
    idx_task = participant.extra_json['cognitive_tests_current_task_idx']
    # If the participant has just played, store results of last tasks:
    if store_previous_task(request, participant, idx_task):
        # Update task index for next visit to the view
        update_task_index(participant)
    # Ok task is over let's close the task by rendering the usual end_task
    restart_participant_extra_json(participant,
                                   test_title='POST_TEST',
                                   task_index=0,
                                   is_first_half=True,
                                   task_to_store=False)
    return redirect(reverse('end_task'))


##################### Other views: #####################
@login_required
def tutorial(request, task_name):
    participant = ParticipantProfile.objects.get(user=request.user.id)
    screen_params = Answer.objects.get(participant=participant, question__handle='prof-mot-1').value
    return render(request, f"pre-post-tasks/instructions/includes/tutorials_{task_name}.html",
                  {"CONTEXT": {"screen_params": screen_params}})


@login_required
def completion_code(request):
    # Verification of the data:
    participant = ParticipantProfile.objects.get(user=request.user.id)
    dir_path = "static/JSON/config_files/completion.json"
    with open(dir_path) as json_file:
        data = json.load(json_file)
        code = data[f"{participant.study}.{participant.current_session.index}.{participant.current_session.id}"]
    return render(request, "tasks/end/completion_code.html",
                  {"CONTEXT": {"participant": participant, "completion_code": code}})


# ## OPEN LINKS ###
# Dashboards:
@login_required
def dashboard(request):
    study_name = "v1_ubx"
    if request.POST and "studies" in request.POST:
        study_name = request.POST.get("studies")
    nb_participants, nb_participants_in, nb_baseline, nb_zpdes, descriptive_dict, zpdes_participants, \
        baseline_participants, nb_sessions = get_exp_status(study_name)
    all_staircase_participants = get_staircase_episodes(baseline_participants)
    # hull_data = get_zpdes_hull_episodes(zpdes_participants)
    CONTEXT = {'sessions': [f"S{i}" for i in range(1, nb_sessions + 1)],
               'user_status': {**descriptive_dict['zpdes'], **descriptive_dict['baseline'],
                               **descriptive_dict['cog']},
               'nb_participants': nb_participants,
               'nb_participants_in': nb_participants_in,
               'nb_participants_zpdes': nb_zpdes,
               'nb_participants_baseline': nb_baseline,
               'baseline_participant_name': [participant for participant in all_staircase_participants.keys()],
               # 'zpdes_participant_name': [participant for participant in hull_data[0].keys()],
               'all_staircase_participant': all_staircase_participants,
               'studies': [study.name for study in Study.objects.all()],
               'selected': study_name
               # 'cumu_all_hull_points_per_participant': json.dumps(hull_data[0]),
               # 'cumu_true_hull_points_per_participant': json.dumps(hull_data[1]),
               # 'ps_all_hull_points_per_participant': json.dumps(hull_data[2]),
               # 'ps_true_hull_points_per_participant': json.dumps(hull_data[3])
               }
    return render(request, "tools/dashboard.html", CONTEXT)


def zpdes_app(request):
    # For local debug:
    # df = pd.read_csv('static/JSON/zpdes_states.csv')
    # df_baseline = pd.read_csv('static/JSON/baseline_states.csv')
    # participant_max = {participant: len(df[df['participant'] == participant]) // 6 for participant in
    #                          df.participant.unique()}
    # participant_max_baseline = {participant: len(df_baseline[df_baseline['participant'] == participant]) for
    #                             participant in df_baseline.participant.unique()}
    # participant_max.update(participant_max_baseline)
    # participant_list = {'zpdes': list(df.participant.unique()), 'baseline': list(df_baseline.participant.unique())}
    # For prod:
    participant_list = {'zpdes': ['nolan', 'kelly.vin', 'nadina', 'test'], 'baseline': ['Johanie', 'βen10']}
    participant_max = {'test': 1100, 'nolan': 1340, 'kelly.vin': 2286, 'Johanie': 2320, 'βen10': 2408, 'nadina': 750}
    CONTEXT = {'participant_dict': participant_list,
               'participant_max': json.dumps(participant_max)}
    return render(request, 'tools/zpdes_app.html', CONTEXT)


def flowers_demo(request):
    possible_context = ["alfred", "antic", "aztec", "bond", "egypt", "medieval", "singing", "space",
                        "spartacus", "spy", "western"]
    if not "context" in request.session:
        CONTEXT = {
            'tasks': ["moteval", "enumeration", "loadblindness", "gonogo", "memorability_1", "taskswitch",
                      "workingmemory", "ufov"],
            'zpdes_tasks': possible_context,
            'screen_params': 33
        }
        request.session['context'] = CONTEXT
    if request.method == "POST":
        if request_from_screen_paramas_input(request):
            request.session['context']['screen_params'] = int(request.POST.get("screen_params_input"))
        elif not request_from_demo_cog(request):
            if "task" in request.POST:
                task = request.POST.get("task")
                screen_params = request.POST.get("screen_params")
                return render(request,
                              'pre-post-tasks/base_pre_post_app.html',
                              {"CONTEXT": {"screen_params": screen_params, "task": task,
                                           "exit_view": "flowers_demo"}})
            if "cognitive_training_zpdes" in request.POST:
                task = request.POST.get("cognitive_training_zpdes")
                screen_params = request.POST.get("screen_params")
                act_parameters, request = get_training_context(task, request, screen_params)
                dist, targ, bg = "guard", "goblin", "arena"
                if task in possible_context:
                    dist = f"{task}_distractor"
                    targ = f"{task}_target"
                    bg = f"{task}_background"
                return render(request, 'mot_app/app_MOT.html',
                              {'CONTEXT': {'parameter_dict': json.dumps(act_parameters),
                                           'next_episode_function': 'next_episode_demo',
                                           'exit_function': 'flowers_demo',
                                           'restart_function': 'restart_episode_demo',
                                           'distractor_path': dist,
                                           'background_path': bg,
                                           'target_path': targ
                                           }})
    return render(request, 'tools/flowers_demo.html', request.session['context'])


def request_from_demo_cog(request):
    return len([elt for elt in request.POST.keys() if "results" in elt]) > 0


def request_from_screen_paramas_input(request):
    return 'screen_params_input' in request.POST


def get_training_context(task, request, screen_params):
    # First create a virtual useless participant:
    participant = ParticipantProfile(id=0, user=User(id=0), study=Study(name="zpdes_admin"))
    participant.extra_json['nb_episodes'] = 0
    # Then init the mot_wrapper
    request.session['mot_wrapper'] = MotParamsWrapper(participant)
    request.session['context']['screen_params'] = screen_params
    dir_path = "static/JSON/config_files"
    # Finally depending on the task, init algorithms
    if task == "zpdes":
        zpdes_params = func.load_json(file_name='ZPDES_mot', dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.ZpdesHssbg(zpdes_params)
        participant.extra_json['condition'] = "zpdes"
        request.session['mot_wrapper'].parameters['admin_pannel'] = False
    elif task == "baseline":
        mot_baseline_params = func.load_json(file_name="mot_baseline_params_all", dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.MotBaselineSequence(mot_baseline_params)
        participant.extra_json['condition'] = "baseline"
        request.session['mot_wrapper'].parameters['admin_pannel'] = False
    elif task == "baseline_circle":
        mot_baseline_params = func.load_json(file_name="mot_baseline_params", dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.MotBaselineSequence(mot_baseline_params)
        participant.extra_json['condition'] = "baseline"
        request.session['mot_wrapper'].parameters['admin_pannel'] = False
    elif task == "panel":
        zpdes_params = func.load_json(file_name='ZPDES_mot', dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.ZpdesHssbg(zpdes_params)
        participant.extra_json['condition'] = "zpdes"
    else:
        zpdes_params = func.load_json(file_name='ZPDES_mot', dir_path=dir_path)
        request.session['seq_manager'] = k_lib.seq_manager.ZpdesHssbg(zpdes_params)
        request.session['mot_wrapper'].parameters['admin_pannel'] = False
        participant.extra_json['condition'] = "zpdes"
    request.session['mot_wrapper'].parameters['screen_params'] = request.session['context']['screen_params']
    act_parameters = request.session['mot_wrapper'].sample_task(request.session['seq_manager'], participant)
    # Add progress_array to parameters dict:
    nb_success, max_lvl_array = get_sr_from_seq_manager(request.session['seq_manager'],
                                                        participant.extra_json['condition'])
    act_parameters['progress_array'] = max_lvl_array
    act_parameters['nb_success_array'] = nb_success
    request.session['participant'] = participant
    return act_parameters, request


@csrf_exempt
def next_episode_demo(request):
    mot_wrapper = request.session['mot_wrapper']
    params = request.POST.dict()
    episode = Episode()
    episode.participant = request.session['participant'].user
    for key, val in params.items():
        if key in episode.__dict__:
            episode.__dict__[key] = val
    request.session['participant'].extra_json['game_time_to_end'] = params['game_time']
    request.session['participant'].extra_json['nb_episodes'] += 1
    request.session['seq_manager'] = mot_wrapper.update(episode, request.session['seq_manager'])
    parameters = mot_wrapper.sample_task(request.session['seq_manager'], request.session['participant'])
    # Add progress array to parameters:
    nb_success, max_lvl_array = get_sr_from_seq_manager(request.session['seq_manager'],
                                                        request.session['participant'].extra_json['condition'])
    parameters['progress_array'] = max_lvl_array
    parameters['nb_success_array'] = nb_success
    return HttpResponse(json.dumps(parameters))


@csrf_exempt
def restart_episode_demo(request):
    parameters = request.POST.dict()
    # Save episode and results:
    episode = Episode()
    episode.participant = request.session['participant'].user
    # Same params parse correctly for python:
    for key, value in parameters.items():
        # Just parse everything:
        try:
            parameters[key] = float(value)
        except ValueError:
            parameters[key] = value
    return HttpResponse(json.dumps(parameters))
