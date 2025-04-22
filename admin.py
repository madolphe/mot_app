from django.contrib import admin
from .models import *
import csv
from django.http import HttpResponse, StreamingHttpResponse
import io 
from .admin_download_cog_results import process_cognitive_results

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
    actions = ["export_as_csv",  "cog4kids_download"]
    
    def cog4kids_download(self, request, queryset):
        study_to_process = 'cognitive_battery4kids'
        filtered_queryset = queryset.filter(participant__study__name=study_to_process)
        tasklist = ["moteval", "workingmemory", "memorability_1", "memorability_2", "ufov"]
        has_condition = False

        if filtered_queryset.exists():
            preprocessed_df = process_cognitive_results(filtered_queryset, tasklist, has_condition, study_to_process)
           # Use a generator to stream the CSV content
            def generate():
                csv_buffer = io.StringIO()
                preprocessed_df[0].to_csv(csv_buffer, index=False, chunksize=1000)  # Process in chunks
                yield csv_buffer.getvalue().encode('utf-8')

            response = StreamingHttpResponse(generate(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="processed_study_{study_to_process}.csv"'
            return response
        else:
            self.message_user(request, f"No entries found for Study '{study_to_process}'.", messages.WARNING)
            return None # Or redirect back to the changelist

    cog4kids_download.short_description = "Process and Download Study Cog4kids"



# Register your models here.
admin.site.register(Episode, EpisodeAdmin)
admin.site.register(CognitiveTask, CognitiveTaskAdmin)
admin.site.register(CognitiveResult, CognitiveResultsAdmin)
admin.site.register(SecondaryTask, SecondaryAdmin)
