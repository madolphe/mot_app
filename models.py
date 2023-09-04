from django.db import models
import datetime
from django.contrib.auth.models import User
from manager_app.models import ParticipantProfile
import jsonfield


class Episode(models.Model):
    # Foreign key to user :
    participant = models.ForeignKey(User, on_delete=models.CASCADE)

    # Description of the task
    date = models.DateTimeField(auto_now_add=True)
    secondary_task = models.CharField(max_length=20, default='none')
    episode_number = models.IntegerField(default=0)
    is_training = models.BooleanField(default=True)

    # Task parameters:
    n_distractors = models.IntegerField(default=0)
    n_targets = models.IntegerField(default=0)
    angle_max = models.IntegerField(default=0)
    angle_min = models.IntegerField(default=0)
    radius = models.FloatField(default=0)
    speed_min = models.FloatField(default=0)
    speed_max = models.FloatField(default=0)
    SRI_max = models.FloatField(default=0)
    presentation_time = models.FloatField(default=0)
    fixation_time = models.FloatField(default=0)
    tracking_time = models.FloatField(default=0)
    probe_time = models.FloatField(default=0)
    idle_time = models.FloatField(default=0)

    # User Score:
    nb_target_retrieved = models.IntegerField(default=0)
    nb_distract_retrieved = models.IntegerField(default=0)

    # To avoid creating session model but to be able to make joint queries:
    id_session = models.IntegerField(default=0)
    finished_session = models.BooleanField(default=False)

    @property
    def get_results(self):
        if self.nb_target_retrieved == self.n_targets and \
                self.nb_distract_retrieved == self.n_distractors:
            return 1
        return 0

    def __unicode__(self):
        return str(self.episode_number)

    def __str__(self):
        return self.__unicode__()

    @property
    def get_F1_score(self):
        nb_missed_targets = int(self.n_targets) - int(self.nb_target_retrieved)
        nb_missed_distrac = 16 - int(self.n_targets) - int(self.nb_distract_retrieved)
        # Within everything that has been predicted as a positive, precision counts the percentage that is correct:
        # TP / (TP + FP)
        if (int(self.nb_target_retrieved) + nb_missed_distrac) == 0:
            precision = 0
        else:
            precision = int(self.nb_target_retrieved) / (int(self.nb_target_retrieved) + nb_missed_distrac)
        # Within everything that actually is positive, how many did the model succeed to find:
        # TP / (TP + FN)
        if (int(self.nb_target_retrieved) + nb_missed_targets) == 0:
            recall = 0
        else:
            recall = int(self.nb_target_retrieved) / (int(self.nb_target_retrieved) + nb_missed_targets)
        if precision + recall == 0:
            f1_score = 0
        else:
            f1_score = 2 * (precision * recall) / (precision + recall)
        return f1_score

    @property
    def get_F1_score_dual(self):
        nb_total = 12
        nb_missed_targets = int(self.n_targets) - int(self.nb_target_retrieved)
        nb_missed_distrac = nb_total - int(self.n_targets) - int(self.nb_distract_retrieved)
        # Within everything that has been predicted as a positive, precision counts the percentage that is correct:
        # TP / (TP + FP)
        if (int(self.nb_target_retrieved) + nb_missed_distrac) == 0:
            precision = 0
        else:
            precision = int(self.nb_target_retrieved) / (int(self.nb_target_retrieved) + nb_missed_distrac)
        # Within everything that actually is positive, how many did the model succeed to find:
        # TP / (TP + FN)
        if (int(self.nb_target_retrieved) + nb_missed_targets) == 0:
            recall = 0
        else:
            recall = int(self.nb_target_retrieved) / (int(self.nb_target_retrieved) + nb_missed_targets)
        if precision + recall == 0:
            f1_score = 0
        else:
            f1_score = 2 * (precision * recall) / (precision + recall)
        return f1_score



class SecondaryTask(models.Model):
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE)
    # Some fields are the same for the whole trial:
    type = models.CharField(max_length=20, default='detection')
    delta_orientation = models.FloatField(default=0)
    nbanners = models.IntegerField(default=0)
    response_window = models.FloatField(default=1)
    # success = models.BooleanField(default=False)
    # Other need to be arrays (stimulus related):
    answers = models.CharField(default='[]', max_length=100)
    start_times = models.CharField(default='[]', max_length=150)
    RTs = models.CharField(default='[]', max_length=100)
    episode_date = models.DateField(auto_now=True)
    episode_time = models.DateTimeField(auto_now=True)

    @property
    def get_results(self):
        """Property to easily parse all the strings into arrays of floats"""
        ans = list(map(lambda x: int(x), self.answers[1:-1].split(',')))
        return sum(ans) / len(ans)

    @property
    def participant(self):
        return self.episode.participant


class CognitiveTask(models.Model):
    name = models.TextField(blank=True)
    view_name = models.TextField(blank=True)
    instructions_prompt_label = models.TextField(blank=True)
    template_instruction_path = models.TextField(blank=True)
    template_tutorials_path = models.TextField(blank=True)


class CognitiveResult(models.Model):
    participant = models.ForeignKey(ParticipantProfile, on_delete=models.CASCADE)
    cognitive_task = models.ForeignKey(CognitiveTask, on_delete=models.CASCADE)
    idx = models.IntegerField()
    results = jsonfield.JSONField(blank=True)
    status = models.TextField(blank=True, default="pre_test")
