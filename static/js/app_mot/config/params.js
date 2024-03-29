// Screen params:
let diagcm;
//let diagcm = 39.116;
let res = 16/10;
let viewer_dist = 50;
// All params will be set up thx 2 "set_screen_params";
// size of diag, width, height in pixels:
let diagpx, screen_width_px, screen_height_px;
// size of screen in cm:
let screen_height, screen_width;
// nbr of pixels per cm:
let pixpcm;
// cm per deg:
let cmpd;
// pixels per deg:
let ppd;

// framerate:
let fps = 30;

// Params of MOT task (to display debug mode):
let max_angle = 18;
let min_angle = 6;
let window_progress_display = 30;


// Variables needed for object in canvas:
let canvas, hover_color, app;
let answer_phase = false;
let parameter_dict = {};
let results = {};
let numbers = [];
let exit;
let mode;
let arena_background,arena_background_init, button_play, button_tuto, button_exit, button_pause, button_keep,
    button_answer, button_next_episode, button_progress, button_back, map_progress_image, correct_sound, error_sound;
let background_size;
let button_exit_width = 100;
let button_exit_height = 45;
let button_height = 60;
let button_width = 120;
let center_x, center_y, x_exit, y_exit, y_keep_progress, x_keep, x_progress, bottom_y, y_back_button;
let y_button_play;

let guard_image, goblin_image, leaf_image,
    sec_task, gill_font_light, gill_font, timer_image, trophy_image;
let screen_params = false;
let pres_timer, tracking_timer, answer_timer, probe_timer, time_step, game_time, game_start_date, flag_end_time;
let IG_mode = 'mot_trial';
let forced_display = false;
let nb_prog_cliked = 0;
let display_progress_map = true;

// inputs for params pannel:
let screen_params_input, angle_max_input, angle_min_input,debug_input, activity_type_input,
    n_targets_input, n_distractors_input, speed_max_input, speed_min_input, radius_input,
    presentation_time_input, fixation_time_input, tracking_time_input, SRI_max_input, response_window_input,
    delta_orientation_input, step, labels_inputs, inputs_map, key_val, button_params, n_targets_slider,
    dict_pannel, angle_max_slider, angle_min_slider, n_distractors_slider, speed_max_slider,
    speed_min_slider, radius_slider, secondary_task_input, gaming_input, gaming_description,
    presentation_time_slider, fixation_time_slider, tracking_time_slider, SRI_max_slider, response_window_slider,
    delta_orientation_slider, screen_params_description, angle_max_description
    ,angle_min_description, debug_description, secondary_task_description, n_targets_description,
    n_distractors_description,speed_max_description,speed_min_description,radius_description,
    presentation_time_description, fixation_time_description, tracking_time_description, SRI_max_description,
    response_window_description, delta_orientation_description, button_hide_params, hidden_pannel, button_raz_params,game_timer,
    sword_1,sword_2,sword_3,sword_4,sword_5,sword_6, trophy_disabled_image, success_image, failure_image, response_image;

let swords_array = [];
let progress_array = [];

let default_params = {
        n_targets: 1, n_distractors: 2, angle_max: 9, angle_min: 3,
        radius: 1, speed_min: 4, speed_max: 4, nb_target_retrieved: 0, nb_distract_retrieved: 0,
        presentation_time: 1, fixation_time: 1, tracking_time: 7,
        debug: 0, secondary_task: 'none', SRI_max: 2, response_window: 1,
        delta_orientation: 45, gaming: 1, probe_time: 3 };

let banner_size_x;
let banner_size_y;
let banner_stroke_weight;
let proportion_banner_line_height;

// When the participant starts; no progress to display:
let possible_update_dim = -1

let idle_start_1 = new Date().getTime();
let idle_start_2 = new Date().getTime();
let idle_duration_1, idle_duration_2;

if(!Boolean(next_episode_func_name)){
        let next_episode_func_name = 'next_episode';
}
if(!Boolean(quit_game_func_name)){
        let quit_game_func_name = 'mot_close_task';
}
if(!Boolean(restart_func_name)){
        let restart_func_name = 'restart_episode';
}
// clear session storage:
sessionStorage.clear();

