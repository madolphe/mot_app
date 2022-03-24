import os
import django
import copy
import pandas as pd
import importlib
import argparse

# Connection to flowers-DB:
flowers_ol = importlib.import_module("flowers-ol.settings")

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "flowers-ol.settings"
)
django.setup()

from mot_app.models import CognitiveResult, CognitiveTask
from manager_app.models import ParticipantProfile
from survey_app.models import Answer

p = argparse.ArgumentParser("Connector to django DB for cognitive assessment",
                            formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument('-a', '--export_all', action='store_true', help='Boolean flag to export all the cog assessments to CSV')
args = p.parse_args()


def connect_db_python_dict(all_cognitive_results):
    """ Create a dictionnary with participant_id as key and a list of CognitiveResults objects as values """
    dataset = {}
    for result in all_cognitive_results:
            if result.participant.user_id not in dataset:
                dataset[result.participant.user_id] = [result]
            else:
                dataset[result.participant.user_id].append(result)
    return dataset


def count_number_of_completed_session(dataset):
    completed_session = {}
    half_completed_session = {}
    other = {}
    for key, value in dataset.items():
        if len(value) == 16:
            # print(f"{key} has completed both sessions, ({len(value)} sessions in total)")
            completed_session[key] = value
        elif len(value) >= 8 and len(value) < 16:
            print(f"{key} has not finished session 2, ({len(value)} sessions in total)")
            half_completed_session[key] = value
        else:
            # print(f"{key} has not finished session 1, ({len(value)} sessions in total)")
            other[key] = value
    return completed_session, half_completed_session, other


def format_dictionnary(dataset):
    for participant, results in dataset.items():
        new_results = []
        for result in results:
            new_result = {}
            new_result[result.cognitive_task.name] = [result.idx, result.results, result.status,
                                                      result.participant.user, result.participant.extra_json['condition']]
            # new_result[result.cognitive_task.name] = [result.idx, result.status]
            new_results.append(new_result)
        dataset[participant] = new_results
    return dataset


def retrieve_all_results_for_one_task(dataset, task_name):
    return_list = []
    for participant, results in dataset.items():
        tmp = []
        for result in results:
            if task_name in result:
                tmp.append([participant, result[task_name]])
        return_list.append(tmp)
    return return_list


def export_to_csv_for_task(dataset, task_name):
    """
    From dataset specific to a task with format:
    [ [[participant_id, [idx_task, dict_results, status_task] ], [same for POST-test]] , [same for other participant],]
    Returns None BUT export the dict as a csv
    """
    dict_to_export = {'participant_id': [], 'task_idx': [], 'task_status': [], 'participant_name': [], 'condition': []}
    # dict_to_export = {'participant_id': [], 'task_idx': [], 'task_status': []}
    # First create columns for results based on participant 1, pre-test results
    for columns in dataset[0][0][1][1].keys():
        dict_to_export[columns] = []
    # Then fill the dict with data:
    for participant, results in enumerate(dataset):
        # results is supposed to be a 2-items array (result to PRE and POST-test)
        for result in results:
            dict_results = copy.deepcopy(result[1][1])
            problem = False
            # Check
            if len(dict_results.keys()) == (len(dict_to_export.keys())-5):
                for key in dict_results.keys():
                    if not key in dict_to_export:
                        problem = True
                        break
            else:
                problem = True
            if not problem:
                # result[0] is participant id
                # result[1] is participant result for the task, a 3-items vector [task idx, dict of results, task_status]
                dict_to_export['participant_id'].append(result[0])
                dict_to_export['task_idx'].append(result[1][0])
                dict_to_export['task_status'].append(result[1][2])
                dict_to_export['participant_name'].append(result[1][3])
                dict_to_export['condition'].append(result[1][4])
                for column, value in dict_results.items():
                    try:
                        dict_to_export[column].append(value)
                        if not column in dict_to_export:
                            print(column)
                    except KeyError:
                        print(f"First participants results keys for this activy are: {dict_to_export.keys()}")
                        print(f"This participant presents keys: {dict_results.keys()}")
                        print(f"Problem with column \"{column}\"")
            else:
                print(f"Problem with participant {result[1][3]}")
                print(f"First participants results keys for this activy are: {dict_to_export.keys()}")
                print(f"This participant presents keys: {dict_results.keys()}")
    csv_file = f"results/{task_name}.csv"
    try:
        df = pd.DataFrame(dict_to_export)
    except:
        print(dict_to_export)
    if not os.path.isdir("results/"):
        os.mkdir("results")
    df.to_csv(csv_file)
    print(f"Export to CSV {task_name}: success!")


def delete_uncomplete_participants(dataframe: pd.DataFrame) -> pd.DataFrame:
    """

    """
    mask = pd.DataFrame(dataframe.participant_id.value_counts() < 2)
    participants_to_delete = mask[mask['participant_id'] == True].index.tolist()
    for id in participants_to_delete:
        dataframe = dataframe[dataframe['participant_id'] != id]
    return dataframe


def get_mean_time(df):
    id = []
    pre = []
    post = []
    delta_days = []
    delta_hours = []
    for key in df.keys():
        id.append(key)
        participant = ParticipantProfile.objects.get(user__id=key)
        pre.append(participant.origin_timestamp)
        post.append(participant.last_session_timestamp)
        delta = participant.last_session_timestamp - participant.origin_timestamp
        delta_days.append(delta.days)
        delta_hours.append((delta.seconds // 3600) + 24 * delta.days)
    df = pd.DataFrame({'id': id, 'pre': pre, 'post': post, 'delta_days': delta_days, 'delta_hours': delta_hours})
    delta_hours.sort()
    print(f"Median period: {sum(delta_hours[14:16]) / 2}")
    df.to_csv('mean_time.csv')


def get_age_gender(df):
    age = []
    gender = []
    id = []
    for key in df.keys():
        id.append(key)
        participant = ParticipantProfile.objects.get(user__id=key)
        if participant.study.name == 'v0_ubx':
            age.append(2021 - int(Answer.objects.get(participant=participant, question__handle='prof-mot-12').value))
            gender.append(int(Answer.objects.get(participant=participant, question__handle='prof-mot-2').value))
    # 1 is male - 0 female
    age.sort()
    print(age[int(len(age) / 2)])
    print(f"Mean age: {int(sum(age) / len(age))}, nb male: {sum(gender)}")


def get_psychometrics():
    study = "v1_ubx"
    all_participant = ParticipantProfile.objects.all().filter(study__name=study)
    participants_all_answers = []
    for participant in all_participant:
        participant_answers_list = []
        if 'condition' in participant.extra_json:
            participant_answers = Answer.objects.all().filter(participant=participant)
            participant_answers_list = create_df_from_participant(participant_answers)
        participants_all_answers += participant_answers_list
    df = pd.DataFrame(participants_all_answers)
    df.to_csv("all_answers.csv")


def create_df_from_participant(participant_answers):
    all_answers = []
    for answer in participant_answers:
        all_answers.append(
            [answer.participant.id, answer.participant.extra_json['condition'], answer.question.component,
             answer.question.instrument, answer.question.handle,
             answer.session.index, answer.value])
    return all_answers


def get_dataset():
    """Run of all functions needed for exporting the data"""
    all_cognitive_results = CognitiveResult.objects.filter(participant__study__name="v1_ubx")
    # Create a dictionnary with participant_id as key and a list of CognitiveResults objects as values
    dataset = connect_db_python_dict(all_cognitive_results)
    # Just sort the participant according to their progression and keep just completed_sessions
    completed_session, half_completed_session, other = count_number_of_completed_session(dataset)
    # Reformat this dictionnary to get {"participant_id":[{'task_name':[idx, {results}, status], ...., }]}
    completed_session = format_dictionnary(completed_session)
    return completed_session


if __name__ == '__main__':
    get_psychometrics()
    # print(f"Complete: {len(completed_session)}, Half:{len(half_completed_session)}, Other:{len(other)}")
    # Get multiple tables for each task
    # The format used for one task is: participant_id, [idx, {results}, status], ...., }]
    # (==> better to have separate columns for csv export)
    # print(retrieve_all_results_for_one_task(completed_session, 'workingmemory')[0])
    # if args.export_all:
    # get_mean_time(completed_session)
    # get_age_gender(completed_session)
    cog_assess = False
    if cog_assess:
        completed_session = get_dataset()
        task_list = ['moteval', 'workingmemory', 'memorability_1', 'memorability_2', 'taskswitch', 'enumeration',
                     'loadblindness', 'gonogo']
        for task_name in task_list:
            dataset = retrieve_all_results_for_one_task(completed_session, task_name)
            export_to_csv_for_task(dataset, task_name)
