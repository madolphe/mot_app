let cross_length = 10;
let radius;
let message = '';
let fill_bar_size = 0;
let show_probe_timer = false;
let game_end = false;
let min, sec;

// main function used to display :
function play(disp_zone) {
    // Then display game dynamics:
    display_game_timer();
    display_fixation_cross(cross_length);
    if (disp_zone) {
        display_game_zone(3, 9);
    }
    if (bot_mode) {
        bot_answer(app);
    }
    switch (IG_mode) {
        case 'mot_trial':
            app.display_objects(mouseX, mouseY);
            app.check_collisions();
            app.move_objects();
            if (parameter_dict['gaming'] != 0) {
                if (parameter_dict['secondary_task'] != 'none') {
                    sec_task.display_task();
                }
            }
            if (parameter_dict['admin_pannel']) {
                display_pannel();
            }
            if (show_probe_timer) {
                display_probe_timer();
            }
            break;
        case 'transition_mode':
            display_transition();
            break;
        case 'progression_mode':
            display_progress();
            break;
    }
}

function display_game_zone() {
    push();
    ellipseMode(CENTER);
    stroke('red');
    noFill();
    strokeWeight(4);
    //radius = Math.round(ppd*max_angle);
    ellipse(windowWidth / 2, windowHeight / 2, Math.round(ppd * max_angle));
    pop();
    push();
    ellipseMode(CENTER);
    stroke('red');
    noFill();
    strokeWeight(2);
    //radius = Math.round(ppd*min_angle);
    ellipse(windowWidth / 2, windowHeight / 2, Math.round(ppd * min_angle));
    app.positions.forEach(function (item) {
        let r = item[1];
        let theta = Math.PI * item[0] / 180;
        let x = Math.round(r * Math.cos(theta));
        let y = Math.round(r * Math.sin(theta));
        push();
        noFill();
        stroke('red');
        strokeWeight(2);
        ellipse(x + windowWidth / 2, y + windowHeight / 2, 2 * app.radius, 2 * app.radius);
        pop();
    });
    pop();
}

function display_fixation_cross(cross_length) {
    push();
    stroke('black');
    strokeWeight(2);
    rectMode(CENTER);
    fill(10, 10, 10, 100);
    rect(windowWidth / 2, windowHeight / 2, cross_length, cross_length);
    pop();
}

function display_probe_timer() {
    if (fill_bar_size < 300) {
        fill_bar_size = fill_bar_size + (300 / (parameter_dict['probe_time'] * 30))
    }
    push();
    textFont(gill_font_light);
    textSize(25);
    textStyle(BOLD);
    fill('white');
    textAlign(CENTER, TOP);
    rectMode(CORNERS);
    text(prompt_remaining_time, 70, 70, 200, 200);
    color('white');
    stroke(255);
    strokeWeight(3);
    noFill();
    rect(270, 70, 570, 90);
    pop();
    push();
    fill('white');
    noStroke();
    rectMode(CORNERS);
    rect(270, 70, 270 + fill_bar_size, 90);
    pop();
}

function display_transition() {
    let width = 170;
    let height = 70;
    push();
    fill(250, 250, 250, 210);
    rectMode(CENTER);
    rect(windowWidth / 2, windowHeight / 2, windowWidth, 500);
    textFont(gill_font_light);
    textSize(25);
    textStyle(BOLD);
    fill('black');
    textAlign(CENTER, TOP);
    rectMode(CORNERS);
    text(message, 0, windowHeight / 2 - height, windowWidth, 2 * height);
    pop();
}

function display_progress() {
    let box_height = 4 * ppd;
    push();
    fill(250, 250, 250, 210);
    rectMode(CENTER);
    rect(windowWidth / 2, windowHeight / 2, windowWidth, 12 * ppd);
    textFont(gill_font_light);
    textSize(25);
    textStyle(BOLD);
    fill('black');
    textAlign(CENTER, TOP);
    rectMode(CORNERS);
    text(prompt_msg_progression_0 + prompt_msg_progression_1 + prompt_msg_progression_2, 0, center_y - box_height, windowWidth, 2 * box_height);
    pop();
    push();
    imageMode(CENTER);
    rectMode(CENTER);
    textFont(gill_font_light);
    textSize(25);
    textStyle(BOLD);
    for (let i = 0; i < swords_array.length; i++) {
        image(swords_array[i], (windowWidth / 12) + i * (windowWidth / 6), center_y, 4 * ppd, 4 * ppd);
        // image(trophy_image, (windowWidth / 12) + i * (windowWidth / 6), center_y + 2.3 * ppd, ppd, ppd);
        // text(parameter_dict['nb_success_array'][i], (windowWidth / 12) + i * (windowWidth / 6), center_y + 3.3 * ppd, ppd, ppd);
        // image(progress_array[parseInt(parameter_dict['progress_array'][i])], (windowWidth/12) + i*(windowWidth/6), center_y, 3.5*ppd, 3.5*ppd);
        if (parseInt(parameter_dict['progress_array'][i]) > 0) {
            image(progress_array[parseInt(parameter_dict['progress_array'][i])], (windowWidth / 12) + i * (windowWidth / 6), center_y, 4 * ppd, 4 * ppd);
            image(trophy_image, (windowWidth / 12) + i * (windowWidth / 6), center_y + 2.3 * ppd, ppd, ppd);
            text(parameter_dict['nb_success_array'][i], (windowWidth / 12) + i * (windowWidth / 6), center_y + 3.3 * ppd, ppd, ppd);
        } else if (parseInt(parameter_dict['progress_array'][i]) === -1) {
            image(progress_array[0], (windowWidth / 12) + i * (windowWidth / 6), center_y, 4 * ppd, 4 * ppd);
            image(trophy_disabled_image, (windowWidth / 12) + i * (windowWidth / 6), center_y + 2.3 * ppd, ppd, ppd);
            fill(0,0,0,50)
            text('x', (windowWidth / 12) + i * (windowWidth / 6), center_y + 3.3 * ppd, ppd, ppd);
        } else {
            image(trophy_image, (windowWidth / 12) + i * (windowWidth / 6), center_y + 2.3 * ppd, ppd, ppd);
            image(trophy_image, (windowWidth / 12) + i * (windowWidth / 6), center_y + 2.3 * ppd, ppd, ppd);
            text(parameter_dict['nb_success_array'][i], (windowWidth / 12) + i * (windowWidth / 6), center_y + 3.3 * ppd, ppd, ppd);
        }
    }
    pop();
}

function display_game_timer() {
    min = Math.floor(game_time / 60);
    // Game_time / 2 as update is made every 0.5s (ie 30 fps)
    sec = Math.floor(game_time - (min * 60));
    push();
    translate(windowWidth - 300, windowHeight - 80);
    imageMode(CENTER);
    scale(0.1);
    image(timer_image, 0, 0);
    pop();
    push();
    textFont(gill_font_light);
    textSize(25);
    textStyle(BOLD);
    fill('white');
    textAlign(CENTER, CENTER);
    rectMode(CORNER);
    text(end_game_label + str(min) + ':' + str(sec), windowWidth - 310, windowHeight - 150, 300, 150);
    pop();
}

// Functions to manage game time:
function timer_end_game() {
    game_timer = setTimeout(function () {
        game_end = true;
        quit_game();
    }, parameter_dict['game_time'] * 1000)
}

function timer(app, presentation_time, fixation_time, tracking_time, probe_time) {
    pres_timer = setTimeout(function () {
            // after presention_time ms
            // app.phase changes to fixation
            app.phase = 'fixation';
            app.frozen = true;
            // and stay in this frozen mode for fixation_time ms
            tracking_timer = setTimeout(function () {
                    // after fixation_time ms
                    // app.phase change to tracking mode
                    console.log(parameter_dict['gaming'], parameter_dict['secondary_task']);
                    if (parameter_dict['gaming'] != 0 && parameter_dict['secondary_task'] != 'none') {
                        sec_task.timer_pause();
                    }
                    app.phase = 'tracking';
                    app.frozen = false;
                    app.change_to_same_color();
                    // and stay in this mode for tracking_time ms
                    answer_timer = setTimeout(function () {
                            // after tracking_time ms, app changes to answer phase
                            app.phase = 'answer';
                            app.frozen = true;
                            app.enable_interact();
                            button_answer.show();
                            show_probe_timer = true;
                            probe_timer = setTimeout(function () {
                                    answer_button_clicked()
                                },
                                probe_time)
                        },
                        tracking_time)
                },
                fixation_time)
        },
        presentation_time);
}

// functions to parametrized game, timer and user interactions:
function start_episode() {
    // idle time
    var time_now = new Date().getTime();
    idle_duration_1 = time_now - idle_start_1;
    // Some variable for transition, probe_timer..:
    message = '';
    fill_bar_size = 0;
    show_probe_timer = false;
    IG_mode = 'mot_trial';
    button_keep.hide();
    button_progress.hide();
    // Init the proper app (gamin mode, with sec task etc)
    // console.log(parameter_dict);
    // delete app;
    if (parameter_dict['debug'] === 1) {
        app = new MOT(parameter_dict['n_targets'], parameter_dict['n_distractors'],
            Math.round(ppd * parameter_dict['angle_max']), Math.round(ppd * parameter_dict['angle_min']),
            parameter_dict['radius'], parameter_dict['speed_max'], parameter_dict['speed_max']);
    } else {
        if (parameter_dict['gaming'] === 0) {
            app = new MOT_Game_Light(parameter_dict['n_targets'], parameter_dict['n_distractors'],
                Math.round(ppd * parameter_dict['angle_max']), Math.round(ppd * parameter_dict['angle_min']),
                parameter_dict['radius'], parameter_dict['speed_max'], parameter_dict['speed_max'], 'green', 'red');
        } else if (parameter_dict['gaming'] === 1) {
            app = new MOT_Game(parameter_dict['n_targets'], parameter_dict['n_distractors'],
                Math.round(ppd * parameter_dict['angle_max']), Math.round(ppd * parameter_dict['angle_min']),
                parameter_dict['radius'], parameter_dict['speed_max'], parameter_dict['speed_max'], goblin_image, guard_image);
            if (parameter_dict['secondary_task'] !== 'none') {
                sec_task = new Secondary_Task(leaf_image, parameter_dict['secondary_task'], parameter_dict['SRI_max'] * 1000,
                    parameter_dict['RSI'] * 1000, parameter_dict['tracking_time'] * 1000, parameter_dict['delta_orientation'],
                    app.all_objects)
            }
        }
    }
    app.change_target_color();
    // Init timer, do not forget to parse it to ms
    timer(app, 1000 * parameter_dict['presentation_time'],
        1000 * parameter_dict['fixation_time'],
        1000 * parameter_dict['tracking_time'],
        1000 * parameter_dict['probe_time']);
    if (parameter_dict['admin_pannel']) {
        // Adjust pannel parameters to current parameter_dict:
        update_parameters_values();
        // Show hide-show parameters button:
        button_hide_params.show();
        // If current hidden variable is set to true, show inputs:
        if (!hidden_pannel) {
            button_hide_params.elt.innerHTML = 'HIDE <<';
            button_hide_params.position(7 * 150 / 4, windowHeight - 2.8 * step);
            show_inputs();
        }
    }
}

function answer_button_clicked() {
    // launch idle timer
    idle_start_2 = new Date().getTime();
    // reset few variables:
    fill_bar_size = 0;
    show_probe_timer = false;
    clearTimeout(probe_timer);
    button_answer.hide();
    parameter_dict['game_time'] = game_time;
    clearTimeout(game_timer);
    timer_end_game();
    let res = app.get_results();
    parameter_dict['nb_target_retrieved'] = res[0];
    parameter_dict['nb_distract_retrieved'] = res[1];
    if (parameter_dict['gaming'] == 1 && parameter_dict['secondary_task'] != 'none') {
        console.log("sec_task results", sec_task.results);
        parameter_dict['sec_task_results'] = JSON.stringify(sec_task.results);
    }
    app.phase = 'got_response';
    app.change_to_same_color();
    app.change_target_color();
    app.all_objects.forEach(function (item) {
        item.interact_phase = false;
    });
    button_next_episode.show();
}

function next_episode() {
    // Call to this function after 'next episode' btn clicked
    // First stop idle_timer from answer_button_clicked
    var time_now = new Date().getTime();
    idle_duration_2 = time_now - idle_start_2;
    // Then start idle_timer until start_episode function
    idle_start_1 = new Date().getTime();
    parameter_dict['idle_time'] = idle_duration_1 + idle_duration_2;
    // update score
    parameter_dict['score'] = parameter_dict['score'] + (parameter_dict['nb_target_retrieved'] * 10) - ((app.n_distractors - parameter_dict['nb_distract_retrieved']) * 10);
    if (parameter_dict['score'] < 0) {
        parameter_dict['score'] = 0
    }
    // console.log(parameter_dict['score']);
    // First set_up prompt of transition pannel:
    message = prompt_msg_0_0 + parameter_dict['nb_target_retrieved'] + '/' + app.n_targets + prompt_msg_0_1;
    let add_message = '';
    if (app.n_targets - parameter_dict['nb_target_retrieved'] !== 0) {
        // Case 1: Nb targets retrieved was not exact:
        add_message = prompt_msg_2_0 + str(app.n_targets - parameter_dict['nb_target_retrieved']) + prompt_msg_2_1 + prompt_msg_2_2;
    } else if ((parameter_dict['nb_distract_retrieved'] !== app.n_distractors)) {
        // Case 2: Nb targets retrieved exact but nb distractors is not
        var nb = str(app.n_distractors - parameter_dict['nb_distract_retrieved']);
        add_message += prompt_msg_3_0 + str(nb) + prompt_msg_3_1;
    } else {
        // Case 3: Targets + Distractors are ok:
        add_message += prompt_msg_congrats;
    }
    var final_message = '\n' + str(parameter_dict['episode_number'] + 1) + prompt_final_msg;
    message = message + add_message + final_message;
    // Then prepare to next phase:
    button_next_episode.hide();
    // Send ajax request to backend:
    $.ajax({
        async: false,
        type: "POST",
        url: "/next_episode",
        dataType: "json",
        traditional: true,
        data: parameter_dict,
        success: function (data) {
            parameter_dict = data;
        }
    });
    if(parameter_dict['episode_number'] % window_progress_display === 0){
        IG_mode = 'progression_mode';
        button_keep.hide();
        button_progress.hide();
        button_back.elt.innerHTML = button_continue_label;
        button_back.show();
    }else{
        IG_mode = 'transition_mode';
        button_keep.show();
        button_progress.show();
    }
    if (parameter_dict['admin_pannel']) {
        hide_inputs();
        button_hide_params.hide();
    }
}

function progress_button_clicked() {
    button_keep.hide();
    button_progress.hide();
    button_back.show();
    IG_mode = 'progression_mode';
}

function back_button_clicked() {
    button_back.elt.innerHTML = button_back_label;
    button_back.hide();
    button_keep.show();
    button_progress.show();
    IG_mode = 'transition_mode';
}