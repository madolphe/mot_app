import numpy as np
from survey_app.models import Answer
import copy


class MotParamsWrapper:
    """
        Wrapper class for kidlearn algorithms to produce correct parameterized tasks dict
    """

    def __init__(self, participant, admin_pannel=False, game_time=30 * 60, screen_params=33, total_nb_objects=16):
        # For tests only:
        # game_time = 2 * 60
        # Check participant study to determine
        self.participant = participant
        if participant.study.name == 'zpdes_admin':
            admin_pannel = True
            game_time = 10 * 60 * 60
        if len(Answer.objects.filter(participant=participant, question__handle='prof-mot-1')) > 0:
            screen_params = Answer.objects.get(participant=participant, question__handle='prof-mot-1').value
        else:
            screen_params = screen_params
        # Just init "fixed parameters":
        self.parameters = {'angle_max': 9, 'angle_min': 3, 'radius': 1.3, 'speed_min': 4, 'speed_max': 4,
                           'screen_params': float(screen_params), 'episode_number': 0, 'nb_target_retrieved': 0,
                           'nb_distract_retrieved': 0, 'id_session': 0, 'presentation_time': 1, 'fixation_time': 1,
                           'debug': 0, 'secondary_task': 'none', 'SRI_max': 2, 'response_window': 1,
                           'delta_orientation': 45,
                           'gaming': 1, 'game_time': game_time, 'admin_pannel': admin_pannel,
                           'total_nb_objects': total_nb_objects,
                           'is_training': True}
        if 'score' in participant.extra_json:
            # if the participant has already a score:
            self.parameters['score'] = participant.extra_json['score']
        else:
            self.parameters['score'] = 0
        # Could be obtained through reading graph (to be automated!):
        self.values = {'n_targets': np.array([2, 3, 4, 5, 6, 7], dtype=float),
                       'speed_max': np.array([2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0], dtype=float),
                       'tracking_time': np.array([3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0], dtype=float),
                       'probe_time': np.array([12.0, 11.0, 10.0, 9.0, 8.0, 7.0, 6.0], dtype=float),
                       'n_distractors': np.linspace(14, 7, 8, dtype=float),
                       'radius': np.array([1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6], dtype=float)}
        self.lvls = ["nb2", "nb3", "nb4", "nb5", "nb6", "nb7"]
        self.generate_evaluation_grid()

    def update_episode_nb(self, participant):
        self.parameters['episode_number'] = participant.extra_json['nb_episodes']

    def sample_task(self, seq, participant):
        """
        Convert a node in ZPD graph to exploitable value for MOT_task
        :return:
        """
        act = seq.sample()
        parameters = {
            'n_targets': self.values['n_targets'][act['MAIN'][0]],
            'speed_max': self.values['speed_max'][act[self.lvls[act['MAIN'][0]]][0]],
            'speed_min': self.values['speed_max'][act[self.lvls[act['MAIN'][0]]][0]],
            'tracking_time': self.values['tracking_time'][act[self.lvls[act['MAIN'][0]]][1]],
            'probe_time': self.values['probe_time'][act[self.lvls[act['MAIN'][0]]][2]],
            'radius': self.values['radius'][act[self.lvls[act['MAIN'][0]]][3]],
            'n_distractors': self.parameters['total_nb_objects'] - self.values['n_targets'][act['MAIN'][0]],
            'is_training': True
        }
        self.update_episode_nb(participant)
        for key, value in parameters.items():
            self.parameters[key] = value
        return self.parameters

    def generate_evaluation_grid(self):
        np.random.seed(self.participant.id)
        nb_trials = 4
        # Starting activity:
        begginer_act = [2, 2, 1.2]
        nb_starting_activity = 2
        n_targets_values = [2, 4, 6]
        speed_values = [2, 4.5]
        radius_values = [1.2, 0.8]
        self.evaluation_grid = []
        for trial in range(nb_trials):
            for n_targets in n_targets_values:
                for speed in speed_values:
                    for radius in radius_values:
                        self.evaluation_grid.append([n_targets, speed, radius])
        # Randomization of self.evaluation_grid:
        np.random.shuffle(self.evaluation_grid)
        # Add 2 easy activity at the beggining of each evaluation:
        for i in range(nb_starting_activity):
            self.evaluation_grid = np.insert(self.evaluation_grid, 0, begginer_act, axis=0)
        # For tests only:
        # self.evaluation_grid = [[1, 2, 1], [1, 2, 1], [1, 2, 1]]

    def sample_evaluation_task(self, index, participant):
        act = self.evaluation_grid[index]
        self.parameters['n_targets'] = act[0]
        self.parameters['speed_max'] = self.parameters['speed_min'] = act[1]
        self.parameters['radius'] = act[2]
        self.parameters['tracking_time'] = 4.5
        self.parameters['probe_time'] = 9
        self.parameters['n_distractors'] = 16 - act[0]
        self.update_episode_nb(participant)
        return copy.deepcopy(self.parameters), index + 1 >= len(self.evaluation_grid)

    def update(self, episode, seq):
        """
        Given one episode update and return the seq manager.
        Also store last episode results (i.e ep_number, nb_targets_retrieved, nb distract_retrieved) in parameters dict
        :param episode:
        :param seq:
        :return:
        """
        parsed_episode = self.parse_activity(episode)
        seq.update(parsed_episode['act'], parsed_episode['ans'])
        # Store in mot_wrapper result of last episode (useful for sampling new task)
        self.parameters['nb_target_retrieved'] = episode.nb_target_retrieved
        self.parameters['nb_distract_retrieved'] = episode.n_distractors
        # Count how many episodes were played for this init of MOT-wrapper e.g for a session
        # This is now down outside the update function
        # self.increase_episode_number()
        return seq

    def increase_episode_number(self):
        self.parameters['episode_number'] += 1
        return self

    def parse_activity(self, episode):
        """
        Format episode to dict exploitable by kidlearn_lib. If episode passed in args doesn't fit with space
        discretization, returns easiest exercice possible.
        :param episode:
        :return:
        """
        # First check if this act was successful:
        # answer = episode.get_results
        answer = episode.get_F1_score

        # Adjust values in 'n_distractors' (always add n_targets):
        # n_d_values = np.array(list(map(lambda x: x + float(episode.n_targets), self.values['n_distractors'])))

        # Check that episode values are present in graph (ZPDES formalism):
        episode_status = True
        for key, value in episode.__dict__.items():
            if key in self.values:
                if float(value) not in self.values[key]:
                    episode_status = False
                    # break
        if episode_status:
            speed_i = np.where(self.values['speed_max'] == float(episode.speed_max))[0][0]
            n_targets_i = np.where(self.values['n_targets'] == float(episode.n_targets))[0][0]
            # n_distractors_i = np.where(n_d_values == float(episode.n_distractors))[0][0]
            track_i = np.where(self.values['tracking_time'] == float(episode.tracking_time))[0][0]
            probe_i = np.where(self.values['probe_time'] == float(episode.probe_time))[0][0]
            radius_i = np.where(self.values['radius'] == float(episode.radius))[0][0]
            episode_parse = {'MAIN': [n_targets_i],
                             str(self.lvls[n_targets_i]): [speed_i, track_i, probe_i, radius_i]}
        else:
            # It means that this episode isn't a correct one:
            for key, value in self.values.items():
                episode.__dict__[key] = value[0]
            episode_parse = {'MAIN': [0], str(self.lvls[0]): [0, 0, 0, 0]}
        return {'act': episode_parse, 'ans': answer}

    def set_parameter(self, name, new_value):
        """ Update parameter value. If the value doesn't exist, it automatically creates on.
        Otherwise write new value.
        :param name: string
        :param new_value: new object to add
        """
        # print("UPDATE {} parameter, with new val {}".format(name, str(new_value)))
        self.parameters[name] = new_value


class DiscrimMotParamsWrapper(MotParamsWrapper):
    def __init__(self, participant, admin_pannel=False, game_time=30 * 60, screen_params=33, total_nb_objects=16):
        super().__init__(participant, admin_pannel, game_time, screen_params, total_nb_objects)
        self.parameters['fixation_time'] = 0
        self.parameters['presentation_time'] = 2
        self.parameters['total_nb_objects'] = 12
        self.parameters['tracking_time'] = 6
        self.parameters['probe_time'] = 5
        self.parameters['radius'] = 1.3
        self.parameters['secondary_task'] = "discrimination"
        self.values = {'n_targets': np.array([1, 2, 3, 3, 4, 5, 6], dtype=float),
                       'speed_max': np.array([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0], dtype=float),
                       'n_distractors': np.linspace(14, 7, 8, dtype=float),
                       'SRI_max': np.array([1.3, 1.2, 1.1, 1.0, 0.9]),
                       'delta_orientation': np.array([30.0, 27.0, 25.0, 23.0, 20.0, 17.0, 15.0])
                       }
        self.lvls = ["nb1", "nb2", "nb3", "nb4", "nb5", "nb6"]

    def sample_task(self, seq, participant):
        """
        Override base class, convert a node in ZPD graph to exploitable value for MOT_task
        :return:
        """
        act = seq.sample()
        parameters = {
            'n_targets': self.values['n_targets'][act['MAIN'][0]],
            'speed_max': self.values['speed_max'][act[self.lvls[act['MAIN'][0]]][0]],
            'speed_min': self.values['speed_max'][act[self.lvls[act['MAIN'][0]]][0]],
            'n_distractors': self.parameters['total_nb_objects'] - self.values['n_targets'][act['MAIN'][0]],
            'is_training': False
        }
        self.update_episode_nb(participant)
        for key, value in parameters.items():
            self.parameters[key] = value
        return self.parameters


class DetectMotParamsWrapper(MotParamsWrapper):
    def __init__(self, participant, admin_pannel=False, game_time=30 * 60, screen_params=33, total_nb_objects=12):
        super().__init__(participant, admin_pannel, game_time, screen_params, total_nb_objects)
        self.parameters['fixation_time'] = 0
        self.parameters['presentation_time'] = 2
        self.parameters['total_nb_objects'] = 12
        self.parameters['tracking_time'] = 6
        self.parameters['probe_time'] = 20
        self.parameters['radius'] = 1
        self.parameters['secondary_task'] = "detection"
        self.values = {'n_targets': np.array([1, 2, 3, 4, 5, 6], dtype=float),
                       'speed_max': np.array([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0], dtype=float),
                       'n_distractors': np.linspace(14, 5, 10, dtype=float),
                       'delta_orientation': np.array([30.0, 27.0, 25.0, 23.0, 20.0, 17.0, 15.0]),
                       # Add 1 banner;
                       'n_banners': np.array([1, 2, 3, 4, 5], dtype=float),
                       'response_window': np.array([1.3, 1.04, 0.832, 0.666, 0.532, 0.426], dtype=float)
                       }
        self.nbT_lvls = ["nbT1", "nbT2", "nbT3", "nbT4", "nbT5", "nbT6"]
        self.nbB_lvls = ["nbB2", "nbB3", "nbB4", "nbB5"]

    def sample_task(self, seq, participant):
        """
        Override base class, convert a node in ZPD graph to exploitable value for MOT_task
        :return:
        """
        act = seq.sample()
        nbT_lvl = self.nbT_lvls[act['MAIN'][0]]
        nbB_lvl = self.nbB_lvls[act[nbT_lvl][1]]
        nbT_nbB_lvl = f"{nbT_lvl}_{nbB_lvl}"
        parameters = {
            'n_targets': self.values['n_targets'][act['MAIN'][0]],
            'speed_max': self.values['speed_max'][act[nbT_lvl][0]],
            'speed_min': self.values['speed_max'][act[nbT_lvl][0]],
            'n_distractors': self.parameters['total_nb_objects'] - self.values['n_targets'][act['MAIN'][0]],
            'n_banners': self.values['n_banners'][act[nbT_lvl][1]],
            'response_window': self.values['response_window'][act[nbT_nbB_lvl][0]],
            'is_training': False
        }
        self.update_episode_nb(participant)
        for key, value in parameters.items():
            self.parameters[key] = value
        return self.parameters

    def parse_activity(self, episode):

        """
        Format episode to dict exploitable by kidlearn_lib. If episode passed in args doesn't fit with space
        discretization, returns easiest exercice possible.
        :param episode:
        :return:
        """
        secondary_task = episode.secondarytask_set.get()
        # delete 500 to response window and divide it by 1000
        rw = (secondary_task.response_window - 500) / 1000
        # First check if this act was successful:
        # answer = episode.get_results
        answer = episode.get_F1_score_dual
        # Here add success function for secondary task
        sec_task_answers = secondary_task.get_results
        answer = (answer + sec_task_answers) / 2

        # Check that episode values are present in graph (ZPDES formalism):
        episode_status = True
        for key, value in episode.__dict__.items():
            if key in self.values:
                if float(value) not in self.values[key]:
                    episode_status = False
                    # break
        if episode_status:
            n_targets_i = np.where(self.values['n_targets'] == float(episode.n_targets))[0][0]
            speed_i = np.where(self.values['speed_max'] == float(episode.speed_max))[0][0]
            n_banners_i = np.where(self.values['n_banners'] == float(secondary_task.nbanners))[0][0]
            response_window_i = np.where(self.values['response_window'] == float(rw))[0][0]
            episode_parse = {'MAIN': [n_targets_i],
                             f"{self.nbT_lvls[n_targets_i]}": [speed_i, n_banners_i],
                             f"{self.nbT_lvls[n_targets_i]}_{self.nbB_lvls[n_banners_i]}": [response_window_i]
                             }
        # else:
        #     # It means that this episode isn't a correct one:
        #     for key, value in self.values.items():
        #         episode.__dict__[key] = value[0]
        #     episode_parse = {'MAIN': [0], str(self.lvls[0]): [0, 0, 0, 0]}
        return {'act': episode_parse, 'ans': answer}


class DetectMotParamsWrapperH2(DetectMotParamsWrapper):
    def __init__(self, participant, admin_pannel=False, game_time=30 * 60, screen_params=33, total_nb_objects=12):
        super().__init__(participant, admin_pannel, game_time, screen_params, total_nb_objects)
        self.parameters['fixation_time'] = 0
        self.parameters['presentation_time'] = 2
        self.parameters['total_nb_objects'] = 12
        self.parameters['tracking_time'] = 6
        self.parameters['probe_time'] = 20
        self.parameters['radius'] = 1
        self.parameters['secondary_task'] = "detection"
        self.values = {'n_targets': np.array([1, 2, 3, 4, 5, 6], dtype=float),
                       'speed_max': np.array([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0], dtype=float),
                       'n_distractors': np.linspace(14, 5, 10, dtype=float),
                       'delta_orientation': np.array([30.0, 27.0, 25.0, 23.0, 20.0, 17.0, 15.0]),
                       'n_banners': np.array([1, 2, 3, 4, 5], dtype=float),
                       'response_window': np.array([1.3, 1.04, 0.832, 0.666, 0.532, 0.426], dtype=float)
                       }
        self.nbT_lvls = ["nbT1", "nbT2", "nbT3", "nbT4", "nbT5", "nbT6"]
        self.nbB_lvls = ["nbB2", "nbB3", "nbB4", "nbB5"]

    def sample_task(self, seq, participant):
        """
        Override base class, convert a node in ZPD graph to exploitable value for MOT_task
        :return:
        """
        act = seq.sample()
        nbT_lvl = self.nbT_lvls[act['MAIN'][0]]
        parameters = {
            'n_targets': self.values['n_targets'][act['MAIN'][0]],
            'speed_max': self.values['speed_max'][act[nbT_lvl][0]],
            'speed_min': self.values['speed_max'][act[nbT_lvl][0]],
            'n_banners': self.values['n_banners'][act[nbT_lvl][1]],
            'response_window': self.values['response_window'][act[nbT_lvl][2]],
            'n_distractors': self.parameters['total_nb_objects'] - self.values['n_targets'][act['MAIN'][0]],
            'is_training': False
        }
        self.update_episode_nb(participant)
        for key, value in parameters.items():
            self.parameters[key] = value
        return self.parameters

    def parse_activity(self, episode):

        """
        Format episode to dict exploitable by kidlearn_lib. If episode passed in args doesn't fit with space
        discretization, returns easiest exercice possible.
        :param episode:
        :return:
        """
        secondary_task = episode.secondarytask_set.get()
        # delete 500 to response window and divide it by 1000
        rw = (secondary_task.response_window) / 1000
        # First check if this act was successful:
        # answer = episode.get_results
        answer = episode.get_F1_score_dual
        # Here add success function for secondary task
        sec_task_answers = secondary_task.get_results
        answer = (answer + sec_task_answers) / 2

        # Check that episode values are present in graph (ZPDES formalism):
        episode_status = True
        for key, value in episode.__dict__.items():
            if key in self.values:
                if float(value) not in self.values[key]:
                    episode_status = False
                    # break
        if episode_status:
            n_targets_i = np.where(self.values['n_targets'] == float(episode.n_targets))[0][0]
            speed_i = np.where(self.values['speed_max'] == float(episode.speed_max))[0][0]
            n_banners_i = np.where(self.values['n_banners'] == float(secondary_task.nbanners))[0][0]
            response_window_i = np.where(self.values['response_window'] == float(rw))[0][0]
            episode_parse = {'MAIN': [n_targets_i],
                             str(self.nbT_lvls[n_targets_i]): [speed_i, n_banners_i, response_window_i]}
        return {'act': episode_parse, 'ans': answer}
