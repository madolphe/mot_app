//scene INTRODUCTION
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

//scene PRESS BAR INSTRUCTIONS
function scene_press_space_bar() {
    display_press_space_bar_instructions(Pos.center_y);
}

function display_press_space_bar_instructions(centery) {
    push();
    noFill();
    stroke(col_object);
    strokeWeight(stroke_weight);
    ellipse(Pos.center_x, centery, 2 * max_eccentricity);
    pop();
    push();
    rectMode(CENTER);
    fill(col_bkg_grey);
    noStroke();
    bbox = font.textBounds(text_press_bar, Pos.center_x, centery + 1.5 * ppd, size_text*1.5);
    rect(Pos.center_x, centery + 1.3 * ppd, bbox.w, bbox.h);
    pop();
    push();
    textSize(size_text);
    textAlign(CENTER);
    fill(col_text);
    noStroke();
    text(text_press_bar, Pos.center_x, centery + 1.5 * ppd);
    pop();
    display_fixation_center(centery);
}


//scene STIMULUS PRESENTATION
function scene_stimuli_presentation() {
    Time.count();
    if (Time.frame_count <= Params.stimulus_duration_frame_count + Params.onset_stimulus_duration) {
        display_ellipse_background(Pos.center_y);
        if (Time.frame_count >= Params.onset_stimulus_duration) {
            display_target_and_distractor(Params.peripherical_target_position(), Pos.center_y);
            display_central_stimulus(Params.central_stimulus_trials[Params.trial_index], Pos.center_y)
        }
    } else {
        Time.update();
    }
}

function display_ellipse_background(centery) {
    push();
    stroke(col_object);
    noFill();
    strokeWeight(stroke_weight);
    // ellipse(Pos.center_x, Pos.center_y, 2 * max_eccentricity);
    ellipse(Pos.center_x, centery, 2 * max_eccentricity);
}

function display_fixation_center(centery) {
    push();
    fill("black");
    noStroke();
    square(Pos.center_x, centery, 0.1 * ppd)
    pop();
}

function display_target_and_distractor(target_position, centery) {
    distances.forEach(elt => draw_distractors(elt, target_size, centery,
        Params.eccentricity_trials[Params.trial_index], Params.directions_trials[Params.trial_index]))
    pop();
    display_target(target_position)
}

function display_target(target_position) {
    push();
    stroke(col_object);
    strokeWeight(stroke_weight);
    rectMode(CENTER);
    noFill();
    ellipse(target_position[0], target_position[1], 1 * ppd);
    pop();
    push();
    fill(col_object);
    strokeWeight(1);
    stroke(col_object);
    star(target_position[0], target_position[1], 0.2 * ppd, 0.5 * ppd, 5);
    pop();
}

function draw_distractors(eccentricity, slot_size, centery, ecc_target, dir_target) {
    const eccentricity_ppd = eccentricity * ppd;
    rectMode(CENTER);
    directions.forEach(elt => {
        stroke(col_object);
        if (!(eccentricity === ecc_target && elt === dir_target)) {
            noFill();
            square(Pos.center_x + eccentricity_ppd * Math.cos(elt), centery - eccentricity_ppd * Math.sin(elt), slot_size)
        }
    })
}

// snippet taken from https://p5js.org/examples/form-star.html
function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a + rotation_star) * radius2;
        let sy = y + sin(a + rotation_star) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + rotation_star + halfAngle) * radius1;
        sy = y + sin(a + rotation_star + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function display_central_stimulus(stimulus, centery) {
    push();
    imageMode(CENTER);
    if(stimulus==="V"){
        image(car_img, Pos.center_x, centery, size_central_img, (car_img.height/car_img.width)*size_central_img);
    }else{
        image(truck_img, Pos.center_x, centery, size_central_img, (truck_img.height/truck_img.width)*size_central_img);
    }
    pop();
}


//scene MASK
function scene_mask() {
    Time.count();
    if (Time.frame_count <= nb_frames_mask) {
        display_mask(Pos.center_y, size_img);
    } else {
        Time.update();
    }
}

function display_mask(centery, mask_size) {
    push();
    textSize(size_text);
    textAlign(CENTER);
    fill(col_text);
    image(mask_img, (Pos.center_x) - (mask_size[0] / 2), (centery) - (mask_size[1] / 2), mask_size[0], mask_size[1]);
    pop();
}


//scene ANSWER SCREEN
function scene_answer() {
    Time.count();
    if ((Params.last_pressed_answer && Params.last_clicked_answer[0]) && (Time.frame_count < nb_frames_answer_presentation)
        || !(Params.last_pressed_answer && Params.last_clicked_answer[0])) {
        display_ellipse_background(Pos.center_y);
        display_lines(Pos.center_y);
        // For debug purposes:
        if (debug) {
            distances.forEach(elt => draw_possible_answer(elt, target_size))
        }
        display_clicked_answer(Params.last_clicked_answer, Params.activity_answer);
        display_pressed_answer(Params.last_pressed_answer, Params.activity_answer, Pos.center_y);
        pop();
    } else {
        Time.update();
    }
}

function display_lines(centery) {
    let pointed_dir = turn_XY_into_direction(centery);
    if (pointed_dir < 0) {
        pointed_dir = 2 * pi + pointed_dir;
    }
    push();
    directions.forEach(elt => {
        if (pointed_dir + area_line_selection > elt && pointed_dir - area_line_selection < elt) {
            stroke(col_line_selected);
            strokeWeight(stroke_weight_line_selected);
        } else {
            stroke(col_object);
            strokeWeight(stroke_weight);
        }
        line(Pos.center_x, centery, Pos.center_x + max_eccentricity * Math.cos(elt), centery - max_eccentricity * Math.sin(elt))
    })
    pop();
}

function display_clicked_answer(clicked, answer) {
    // If there is a clicked answer
    if (clicked[0]) {
        if (!answer[1]) {
            push();
            stroke(col_wrong);
            strokeWeight(width_feedback);
            line(clicked[0] - len_feedback, clicked[1] + len_feedback,
                clicked[0] + len_feedback, clicked[1] - len_feedback);
            line(clicked[0] - len_feedback, clicked[1] - len_feedback,
                clicked[0] + len_feedback, clicked[1] + len_feedback);
            pop();
        } else {
            push();
            stroke(col_correct);
            strokeWeight(width_feedback);
            noFill();
            ellipse(clicked[0], clicked[1], size_correct_feedback);
            pop();
        }
    }
}

function display_pressed_answer(pressed, answer, centery) {
    // If there is a pressed answer
    if (pressed) {
        if (answer[0]) {
            stroke(col_correct);
            strokeWeight(width_feedback);
            ellipse(Pos.center_x, centery, size_correct_feedback);
        } else {
            stroke(col_wrong);
            strokeWeight(width_feedback);
            line(Pos.center_x - len_feedback, centery + len_feedback,
                Pos.center_x + len_feedback, centery - len_feedback);
            line(Pos.center_x - len_feedback, centery - len_feedback,
                Pos.center_x + len_feedback, centery + len_feedback);
        }
    } else {
        push();
        textSize(size_text * 2);
        textAlign(CENTER);
        fill("black");
        noStroke();
        text("?", Pos.center_x, centery);
        pop();
    }
}

// for debug purposes:
function draw_possible_answer(eccentricity, slot_size) {
    let eccentricity_ppd = eccentricity * ppd;
    push();
    ellipseMode(CENTER)
    directions.forEach(elt => {
        stroke(col_object);
        if (eccentricity === Params.eccentricity_trials[Params.trial_index] &&
            elt === Params.directions_trials[Params.trial_index]) {
            stroke("black");
        }
        ellipse(Pos.center_x + eccentricity_ppd * Math.cos(elt), Pos.center_y - eccentricity_ppd * Math.sin(elt), slot_size)
    })
    pop();
}

// END SCENE:
function scene_quit() {
    push();
    fill(col_text);
    noStroke();
    textSize(size_text);
    textAlign(CENTER);
    textFont(text_font);
    text(text_end, Pos.center_x, Pos.center_y);
    pop();
}

function quit_task() {
    button_end.attribute('disabled', '');
    button_end.html('Wait...');
    fullscreen(false);
    let parameters_to_save = Params.save_and_quit();
    post(exit_view, parameters_to_save, 'post');
}

function create_end_button() {
    button_end = createButton(prompt_button_end);
    button_end.size(size_end_w, size_end_h);
    button_end.style('font-size', size_end_text + 'px');
    button_end.position(x_end, y_end);
    button_end.mousePressed(quit_task);
    button_end.hide();
}
