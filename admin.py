from django.contrib import admin
from .models import *
import csv
from django.http import HttpResponse


class ExportCsvMixin:
    """
    Export model as csv
    (Snapshot found in https://readthedocs.org/projects/django-admin-cookbook/downloads/pdf/latest/)
    """
    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)
        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([getattr(obj, field) for field in field_names])
        return response
    export_as_csv.short_description = "Export Selected"


class EpisodeAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = ('__str__', 'participant', 'get_results', 'n_targets', 'nb_target_retrieved', 'nb_distract_retrieved',
    'n_distractors', 'get_F1_score', 'probe_time', 'tracking_time', 'speed_max', 'radius', 'idle_time', 'is_training')
    list_filter = ['participant']
    actions = ["export_as_csv"]



class SecondaryAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = (
        'participant', 'episode', 'type', 'nbanners', 'delta_orientation',
        'response_window', 'answers', 'start_times', 'RTs', 'episode_date', 'episode_time')
    # list_filter = ['participant']
    actions = ["export_as_csv"]


class CognitiveTaskAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = ('name', 'view_name')
    list_filter = ['name']
    actions = ["export_as_csv"]


class CognitiveResultsAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = ('participant', 'cognitive_task', 'idx', 'results')
    list_filter = ['participant', 'cognitive_task']
    actions = ["export_as_csv"]


# Register your models here.
admin.site.register(Episode, EpisodeAdmin)
admin.site.register(CognitiveTask, CognitiveTaskAdmin)
admin.site.register(CognitiveResult, CognitiveResultsAdmin)
admin.site.register(SecondaryTask, SecondaryAdmin)
