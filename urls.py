from django.urls import path, re_path
from . import views

urlpatterns = [
    # ZPDES urls
    path('app_MOT', views.mot_task, name='app_MOT'),
    path('zpdes_admin_view', views.zpdes_admin_view, name='zpdes_admin_view'),
    path('baseline_admin_view', views.baseline_admin_view, name='baseline_admin_view'),
    path('next_episode', views.next_episode, name='next_episode'),
    path('next_episode_demo', views.next_episode_demo, name='next_episode_demo'),
    path('restart_episode', views.restart_episode, name='restart_episode'),
    path('restart_episode_demo', views.restart_episode_demo, name='restart_episode_demo'),
    path('set_mot_params', views.set_mot_params, name='set_mot_params'),
    path('display_progression', views.display_progression, name="display_progression"),
    path('mot_close_task', views.mot_close_task, name='mot_close_task'),
    path('cognitive_assessment_home', views.cognitive_assessment_home, name='cognitive_assessment_home'),
    path('ufov_home', views.ufov_home, name='ufov_home'),
    path('cognitive_task', views.cognitive_task, name='cognitive_task'),
    path('exit_view_cognitive_task', views.exit_view_cognitive_task, name='exit_view_cognitive_task'),
    path('exit_ufov_task', views.exit_ufov_task, name='exit_ufov_task'),
    path('tutorial/<str:task_name>', views.tutorial, name="tutorial"),
    path('mot_consent_page', views.mot_consent_page, name="mot_consent_page"),
    path('general_tutorial', views.general_tutorial, name="general_tutorial"),
    path('completion_code', views.completion_code, name="completion_code"),
    path('dashboard', views.dashboard, name="dashboard"),
    path('zpdes_app', views.zpdes_app, name="zpdes_app"),
    path('mot_tutorial', views.mot_tutorial, name="mot_tutorial"),
    path('flowers_demo', views.flowers_demo, name="flowers_demo")
]
