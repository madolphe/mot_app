from django.contrib import admin
from .models import *
import csv
from django.http import HttpResponse, StreamingHttpResponse
import io 
from .admin_download_cog_results import process_cognitive_results
from django.contrib import admin, messages
from django.urls import path, reverse
from django.http import StreamingHttpResponse, HttpResponseRedirect, FileResponse
from django.utils.http import urlencode
import zipfile
from manager_app.models import Study


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

def bool_from_query(value, default=False):
    if value is None:
        return default
    return str(value).lower() in ("1", "true", "yes", "on")


class CognitiveResultsAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = ('participant', 'cognitive_task', 'idx', 'results')
    list_filter = ['participant', 'cognitive_task']
    actions = ["export_as_csv"]
    # --- 1) On branche une template personnalisée pour ajouter des boutons ---
    change_list_template = "admin/cognitive_results_changelist.html"

    # --- 2) On déclare des URLs supplémentaires sous ce modèle admin ---
    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                "export-all/",
                self.admin_site.admin_view(self.export_all_view),
                name=f"{self.model._meta.app_label}_{self.model._meta.model_name}_export_all",
            ),
            path(
                "export-full-completion/",
                self.admin_site.admin_view(self.export_full_completion_view),
                name=f"{self.model._meta.app_label}_{self.model._meta.model_name}_export_full_completion",
            ),
        ]
        # Important: nos URLs d’abord pour éviter d’être shadowed
        return custom + urls

    # --- 3) Vue export “normal” (respecte les filtres du changelist) ---
    def export_all_view(self, request):
        # Reconstituer le queryset tel qu’affiché avec filtres/recherche courants
        cl = self.get_changelist_instance(request)
        queryset = cl.get_queryset(request)
        if not queryset.exists():
            self.message_user(request, "Selectionner au moins une entrée.", level=messages.WARNING)
            return HttpResponseRedirect(self._changelist_url_with_current_query(request))
        # Paramètres métier optionnels passés via l’URL (ex: ?study=Kids&task=T1&task=T2)
        study_name   = "cognitive_battery4kids"
        tasklist     = ["moteval", "workingmemory", "memorability_1", "memorability_2", "ufov"]
        has_condition = False
        return_mode  = "all_participants"
        return self._download(request, queryset, study_name, tasklist, has_condition, return_mode)

    # --- 4) Vue export “full completion” (autre mode de retour) ---
    def export_full_completion_view(self, request):
        study_name   = "cognitive_battery4kids"
        study = Study.objects.get(name=study_name)
        queryset = CognitiveResult.objects.filter(participant__study=study)
        tasklist     = ["moteval", "workingmemory", "memorability_1", "memorability_2", "ufov"]
        has_condition = False 
        return_mode  = "full_completion"  # adapté à votre pipeline
        return self._download(request, queryset, study_name, tasklist, has_condition, return_mode)

    # --- 5) Votre logique de génération/stream du CSV, factorisée ---

    def _download(self, request, queryset, study_name, tasklist, has_condition, return_mode):
        if not queryset.exists():
            self.message_user(
                request,
                f"Aucune entrée trouvée pour l'étude « {study_name} ». ",
                level=messages.WARNING,
            )
            return HttpResponseRedirect(self._changelist_url_with_current_query(request))
        preprocessed = process_cognitive_results(
            queryset,
            tasklist,
            has_condition,
            study_name,
            return_mode=return_mode,
        )
        # --- préprocessed est un dict: { "nom_csv": DataFrame }
        if not isinstance(preprocessed, dict) or not preprocessed:
            self.message_user(request, "Aucune donnée à exporter.", level=messages.WARNING)
            return HttpResponseRedirect(self._changelist_url_with_current_query(request))

        named = _dfs_from_preprocessed_dict(preprocessed)
        if not named:
            self.message_user(request, "Aucune donnée tabulaire valide à exporter.", level=messages.WARNING)
            return HttpResponseRedirect(self._changelist_url_with_current_query(request))

        # Cas 1: un seul CSV -> réponse directe
        if len(named) == 1:
            name, df = named[0]
            buf = io.StringIO()
            df.to_csv(buf, index=False)
            resp = HttpResponse(buf.getvalue().encode("utf-8"), content_type="text/csv; charset=utf-8")
            resp["Content-Disposition"] = f'attachment; filename="{name}.csv"'
            return resp

        # Cas 2: plusieurs CSV -> ZIP en mémoire
        zip_bytes = io.BytesIO()
        with zipfile.ZipFile(zip_bytes, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for name, df in named:
                csv_buf = io.StringIO()
                df.to_csv(csv_buf, index=False)
                zf.writestr(f"{name}.csv", csv_buf.getvalue())
        zip_bytes.seek(0)

        zip_name = _safe_name(f"{study_name or 'exports'}_csvs") + ".zip"
        resp = HttpResponse(zip_bytes.getvalue(), content_type="application/zip")
        resp["Content-Disposition"] = f'attachment; filename="{zip_name}"'
        return resp

    # --- 6) Utilitaire: reconstruire l’URL du changelist en conservant les filtres GET ---
    def _changelist_url_with_current_query(self, request):
        base = reverse(f"admin:{self.model._meta.app_label}_{self.model._meta.model_name}_changelist")
        return f"{base}?{request.GET.urlencode()}" if request.GET else base

def _safe_name(name: str) -> str:
    name = (name or "part").strip().replace(" ", "_")
    return "".join(c for c in name if c.isalnum() or c in ("_", "-", ".")) or "part"

def _dfs_from_preprocessed_dict(preprocessed: dict):
    """
    Normalise le dict en liste [(name, df), ...] en filtrant ce qui n'est pas DataFrame.
    """
    items = []
    for k, v in preprocessed.items():
        if hasattr(v, "to_csv"):
            items.append((_safe_name(str(k)), v))
    return items

# class CognitiveResultsAdmin(admin.ModelAdmin, ExportCsvMixin):
#     list_display = ('participant', 'cognitive_task', 'idx', 'results')
#     list_filter = ['participant', 'cognitive_task']
#     actions = ["export_as_csv",  "cog4kids_download_all", "cog4kids_download_full_completion"]

#     def download(self, request, queryset, study_name, tasklist, has_condition, return_mode):
#         study_to_process = study_name
#         filtered_queryset = queryset.filter(participant__study__name=study_to_process)

#         if filtered_queryset.exists():
#             preprocessed_df = process_cognitive_results(filtered_queryset, 
#                                                         tasklist, 
#                                                         has_condition, 
#                                                         study_to_process, 
#                                                         return_mode=return_mode)
#            # Use a generator to stream the CSV content
#             def generate():
#                 csv_buffer = io.StringIO()
#                 preprocessed_df[0].to_csv(csv_buffer, index=False, chunksize=1000)  # Process in chunks
#                 yield csv_buffer.getvalue().encode('utf-8')

#             response = StreamingHttpResponse(generate(), content_type='text/csv')
#             response['Content-Disposition'] = f'attachment; filename="processed_study_{study_to_process}.csv"'
#             return response
#         else:
#             self.message_user(request, f"No entries found for Study '{study_to_process}'.", messages.WARNING)
#             return None # Or redirect back to the changelist


#     def cog4kids_download_all(self, request, queryset):
#         study_to_process = 'cognitive_battery4kids'
#         tasklist = ["moteval", "workingmemory", "memorability_1", "memorability_2", "ufov"]
#         has_condition = False
#         return self.download(request=request, 
#                              queryset=queryset, 
#                              study_name=study_to_process, 
#                              tasklist=tasklist, 
#                              has_condition=has_condition, 
#                              return_mode="all_participants")
#     cog4kids_download_all.short_description = "Cog4kids - Download selected results"


#     def cog4kids_download_full_completion(self, request, queryset):
#         study_to_process = 'cognitive_battery4kids'
#         tasklist = ["moteval", "workingmemory", "memorability_1", "memorability_2", "ufov"]
#         has_condition = False
#         return self.download(request=request, 
#                              queryset=queryset, 
#                              study_name=study_to_process, 
#                              tasklist=tasklist, 
#                              has_condition=has_condition, 
#                              return_mode="full_completion")
#     cog4kids_download_full_completion.short_description = "Cog4kids - Download all completed results"


# Register your models here.
admin.site.register(Episode, EpisodeAdmin)
admin.site.register(CognitiveTask, CognitiveTaskAdmin)
admin.site.register(CognitiveResult, CognitiveResultsAdmin)
admin.site.register(SecondaryTask, SecondaryAdmin)
