//TODO:
//  - Tutorial


//scene 0
function scene_instruction() {
    if (mouseIsPressed) {
        fullscreen(true);
        Time.update();
    } else {
        fill(col_text);
        textSize(size_text);
        textAlign(CENTER);
        text(text_start, Pos.center_x, Pos.center_y);
    }
}

//scene 0
function scene_press_space_bar() {
    push();
    noFill();
    stroke(col_object);
    strokeWeight(stroke_weight);
    ellipse(Pos.center_x, Pos.center_y, 2 * max_eccentricity);
    pop();
    push();
    textSize(size_text);
    textAlign(CENTER);
    fill(col_text);
    noStroke();
    text(text_press_bar, Pos.center_x, Pos.center_y);
    pop();
}

//scene 1
function scene_stimuli_presentation() {
    Time.count();
    if (Time.frame_count <= Params.stimulus_duration_frame_count + Params.onset_stimulus_duration) {
        push();
        stroke(col_object);
        noFill();
        strokeWeight(stroke_weight);
        ellipse(Pos.center_x, Pos.center_y, 2 * max_eccentricity);
        if (Time.frame_count >= Params.onset_stimulus_duration) {
            ellipse(Params.peripherical_target_position()[0], Params.peripherical_target_position()[1], 1 * ppd);
            distances.forEach(elt => draw_distractors(elt, target_size))
            pop();

            push();
            fill(col_object);
            strokeWeight(1);
            stroke(col_object);
            star(Params.peripherical_target_position()[0], Params.peripherical_target_position()[1], 0.2 * ppd, 0.5 * ppd, 5);
            pop();

            push();
            fill(col_text);
            noStroke();
            textSize(size_text);
            textAlign(CENTER);
            text(Params.central_stimulus_trials[Params.trial_index], Pos.center_x, Pos.center_y);
            noStroke();
            pop();
        }
    } else {
        Time.update();
    }
}

function draw_distractors(eccentricity, slot_size) {
    const eccentricity_ppd = eccentricity * ppd;
    rectMode(CENTER)
    directions.forEach(elt => {
        stroke(col_object);
        if (!(eccentricity === Params.eccentricity_trials[Params.trial_index] &&
            elt === Params.directions_trials[Params.trial_index])) {
            square(Pos.center_x + eccentricity_ppd * Math.cos(elt), Pos.center_y - eccentricity_ppd * Math.sin(elt), slot_size)
        }
    })
}

// snippet taken from https://p5js.org/examples/form-star.html
function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a+rotation_star) * radius2;
        let sy = y + sin(a+rotation_star) * radius2;
        vertex(sx, sy);
        sx = x + cos(a+ rotation_star + halfAngle) * radius1;
        sy = y + sin(a+ rotation_star + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

//scene 2
function scene_mask() {
    Time.count();
    if (Time.frame_count <= nb_frames_mask) {
        push();
        textSize(size_text);
        textAlign(CENTER);
        fill(col_text);
        image(mask_img, (Pos.center_x) - (size_img[0] / 2), (Pos.center_y) - (size_img[1] / 2), size_img[0], size_img[1]);
        pop();
    } else {
        Time.update();
    }
}

//scene 3
function scene_answer() {
    Time.count();
    if ((Params.last_pressed_answer && Params.last_clicked_answer[0]) && (Time.frame_count < nb_frames_answer_presentation)
        || !(Params.last_pressed_answer && Params.last_clicked_answer[0])) {
        push();
        noFill();
        stroke(col_object);
        ellipse(Pos.center_x, Pos.center_y, 2 * max_eccentricity);
        let pointed_dir = turn_XY_into_direction();
        if(pointed_dir<0){
            pointed_dir = 2*pi + pointed_dir;
        }
        directions.forEach(elt => {
            if(pointed_dir+area_line_selection>elt && pointed_dir-area_line_selection<elt){
                console.log(elt);
                stroke(col_line_selected);
                strokeWeight(stroke_weight_line_selected);
            }else{
                stroke(col_object);
                strokeWeight(stroke_weight);
            }
            line(Pos.center_x, Pos.center_y, Pos.center_x + max_eccentricity * Math.cos(elt), Pos.center_y - max_eccentricity * Math.sin(elt))
        })
        // For debug purposes:
        if (debug) {
            distances.forEach(elt => draw_possible_answer(elt, target_size))
        }
        display_answers();
        pop();
    } else {
        Time.update();
    }
}

function display_answers() {
    // If there is a clicked answer
    if (Params.last_clicked_answer[0]) {
        if (!Params.activity_answer[1]) {
            stroke(col_wrong);
            strokeWeight(width_feedback);
            line(Params.last_clicked_answer[0] - len_feedback, Params.last_clicked_answer[1] + len_feedback,
                Params.last_clicked_answer[0] + len_feedback, Params.last_clicked_answer[1] - len_feedback);
            line(Params.last_clicked_answer[0] - len_feedback, Params.last_clicked_answer[1] - len_feedback,
                Params.last_clicked_answer[0] + len_feedback, Params.last_clicked_answer[1] + len_feedback);
        } else {
            stroke(col_correct);
            strokeWeight(width_feedback);
            ellipse(Params.last_clicked_answer[0], Params.last_clicked_answer[1], size_correct_feedback);
        }
    }
    // If there is a pressed ansxer
    if (Params.last_pressed_answer) {
        if (Params.activity_answer[0]) {
            stroke(col_correct);
            strokeWeight(width_feedback);
            ellipse(Pos.center_x, Pos.center_y, size_correct_feedback);
        } else {
            stroke(col_wrong);
            strokeWeight(width_feedback);
            line(Pos.center_x - len_feedback, Pos.center_y + len_feedback,
                Pos.center_x + len_feedback, Pos.center_y - len_feedback);
            line(Pos.center_x - len_feedback, Pos.center_y - len_feedback,
                Pos.center_x + len_feedback, Pos.center_y + len_feedback);
        }
    }
}

function draw_possible_answer(eccentricity, slot_size) {
    let eccentricity_ppd = eccentricity * ppd;
    ellipseMode(CENTER)
    directions.forEach(elt => {
        stroke(col_object);
        if (eccentricity === Params.eccentricity_trials[Params.trial_index] &&
            elt === Params.directions_trials[Params.trial_index]) {
            stroke("red");
        }
        ellipse(Pos.center_x + eccentricity_ppd * Math.cos(elt), Pos.center_y - eccentricity_ppd * Math.sin(elt), slot_size)
    })
    textSize(size_text);
    textAlign(CENTER);
    text(Params.central_stimulus_trials[Params.trial_index], Pos.center_x, Pos.center_y);
}

//scene 2


function quit_task() {
    button_end.attribute('disabled', '');
    button_end.html('Wait...');
    fullscreen(false);
    let parameters_to_save = {
        'results_responses': Params.results_responses,
        'results_correct': Params.results_correct,
        'results_speed_stim': Params.results_speed_stim,
        'results_num_target': Params.results_num_target,
        'results_ind_condition': Params.results_ind_condition,
        'results_rt': Params.results_rt
    }
    post(exit_view, parameters_to_save, 'post');
}
