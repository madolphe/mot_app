import pandas as pd 
from pathlib import Path
import copy 

def process_cognitive_results(queryset: object, task_list: list, has_condition: bool, study_name: str) -> list:
    completed_session, half_completed_session = get_dataset(queryset=queryset, task_list=task_list, has_condition=has_condition, study_name=study_name)
    list_of_dfs = get_csv_for_each_task(completed_session,task_list=task_list,study=study_name)
    return list_of_dfs

def get_dataset(queryset, task_list, study_name, nb_cog_tasks=5, has_condition=False):
    """Run of all functions needed for exporting the data"""
    # Create a dictionnary with participant_id as key and a list of CognitiveResults objects as values
    dataset = connect_db_python_dict(queryset)
    # Just sort the participant according to their progression and keep just completed_sessions
    completed_session, half_completed_session, other = count_number_of_completed_session(dataset, nb_cog_tasks=nb_cog_tasks)
    # Reformat this dictionnary to get {"participant_id":[{'task_name':[idx, {results}, status], ...., }]}
    completed_session = format_dictionnary(completed_session, has_condition=has_condition)
    return completed_session, half_completed_session

def get_csv_for_each_task(completed_session,task_list, study="default"):
    all_dfs = []
    for task_name in task_list:
        dataset = retrieve_all_results_for_one_task(completed_session, task_name)
        all_dfs.append(transform_to_df_for_task(dataset, task_name, has_condition=False, study=study))
    return all_dfs

def connect_db_python_dict(all_cognitive_results):
    """ Create a dictionnary with participant_id as key and a list of CognitiveResults objects as values """
    dataset = {}
    for result in all_cognitive_results:
        if result.participant.user_id not in dataset:
            dataset[result.participant.user_id] = [result]
        else:
            dataset[result.participant.user_id].append(result)
    return dataset

def count_number_of_completed_session(dataset, nb_cog_tasks, single_assessment=True):
    completed_session = {}
    half_completed_session = {}
    other = {}
    if single_assessment:
        completed_session = {key: value for key, value in dataset.items()}
    else:
        for key, value in dataset.items():
            if len(value) == nb_cog_tasks:
                # print(f"{key} has completed both sessions, ({len(value)} sessions in total)")
                completed_session[key] = value
            elif len(value) >= 8 and len(value) < 16:
                print(f"{key} has not finished session 2, ({len(value)} sessions in total)")
                half_completed_session[key] = value
            else:
                # print(f"{key} has not finished session 1, ({len(value)} sessions in total)")
                other[key] = value
    return completed_session, half_completed_session, other

def format_dictionnary(dataset, has_condition=True):
    for participant, results in dataset.items():
        new_results = []
        for result in results:
            new_result = {}
            if has_condition:
                new_result[result.cognitive_task.name] = [result.idx, result.results, result.status,
                                                          result.participant.user,
                                                          result.participant.extra_json['condition']]
            else:
                new_result[result.cognitive_task.name] = [result.idx, result.results, result.status,
                                                          result.participant.user]
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

def transform_to_df_for_task(dataset, task_name, has_condition=True, study='default_study'):
    """
    From dataset specific to a task with format:
    [ [[participant_id, [idx_task, dict_results, status_task] ], [same for POST-test]] , [same for other participant],]
    Returns None BUT export the dict as a csv
    """
    dict_to_export = {'participant_id': [], 'task_idx': [], 'task_status': [], 'participant_name': [], 'condition': []}
    # dict_to_export = {'participant_id': [], 'task_idx': [], 'task_status': []}
    # First create columns for results based on participant 1, pre-test results
    for elt in dataset:
        if len(elt) > 0:
            dict_to_look = elt[0][1][1]
            columns_to_add = dict_to_look.keys()
            continue
    for columns in columns_to_add:
        dict_to_export[columns] = []
    # Then fill the dict with data:
    for participant, results in enumerate(dataset):
        # results is supposed to be a 2-items array (result to PRE and POST-test)
        for result in results:
            dict_results = copy.deepcopy(result[1][1])
            problem = False
            # Check
            if len(dict_results.keys()) == (len(dict_to_export.keys()) - 5):
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
                if has_condition:
                    dict_to_export['condition'].append(result[1][4])
                else:
                    dict_to_export['condition'].append("no_condition")
                for column, value in dict_results.items():
                    try:
                        dict_to_export[column].append(value)
                        if not column in dict_to_export:
                            print(column)
                    except KeyError:
                        print(f"First participants results keys for this activty are: {dict_to_export.keys()}")
                        print(f"This participant presents keys: {dict_results.keys()}")
                        print(f"Problem with column \"{column}\"")
            else:
                print(f"Problem with participant {result[1][3]}")
                print(f"First participants results keys for this activy are: {dict_to_export.keys()}")
                print(f"This participant presents keys: {dict_results.keys()}")
    path = f"outputs/{study}/results_{study}/"
    csv_file = path + f"{task_name}.csv"
    try:
        df = pd.DataFrame(dict_to_export)
    except:
        print(dict_to_export)
    return df
    # Path(path).mkdir(parents=True, exist_ok=True)
    # df.to_csv(csv_file)