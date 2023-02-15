// TODO:
// Add end practice page to start main experiment
// Add quit task
// Check all prompts / english - french

// scene tuto explanations 1
function scene_tutorial1() {
    draw_character(researcher_3, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y, size_bubble_x, size_bubble_y);
    //Title
    push();
    fill(col_titletext);
    noStroke();
    textSize(size_titletext);
    textAlign(CENTER);
    text(text_title_0, pos_title_x, pos_title_y);
    pop();

    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext);
    textAlign(CENTER);
    textFont(text_font);
    noStroke();
    text(text_tutorial_0_0, pos_tutorialtext_x, pos_tutorialtext_y);
    text(text_tutorial_0_1, pos_tutorialtext_x, pos_tutorialtext_y + shift_text);
    text(text_tutorial_0_2, pos_tutorialtext_x, pos_tutorialtext_y);
    pop();
}

// scene tuto explanations 2
function scene_tutorial2() {
    //image
    draw_character(researcher_2, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext);
    textAlign(CENTER);
    noStroke();
    text(text_tutorial_1_0, pos_tutorialtext_x1, pos_tutorialtext_y1 - shift_text);
    text(text_tutorial_1_1, pos_tutorialtext_x1, pos_tutorialtext_y1);
    pop();

    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_stimulus);
    textAlign(CENTER);
    noStroke();
    text("N", pos_tutorialtext_x1 - 3 * ppd, pos_tutorialtext_y1 - 3 * shift_text);
    text("M", pos_tutorialtext_x1 + 3 * ppd, pos_tutorialtext_y1 - 3 * shift_text);
    pop();
}

// Scene tuto STAGE 1:
function scene_tutorial3() {
    //image
    draw_character(researcher_2, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y2, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_y2);
    noStroke();
    textAlign(CENTER);
    text(text_tutorial_2_0, pos_tutorialtext_x1, pos_tutorialtext_y2 - 3 * shift_text_y2);
    text(text_tutorial_2_1, pos_tutorialtext_x1, pos_tutorialtext_y2 - 2 * shift_text_y2);
    text(text_tutorial_2_2, pos_tutorialtext_x1, pos_tutorialtext_y2 -  shift_text_y2);
    pop();
    scene_practice_tutorial();
}

function manage_practice_tutorial3() {
    if (!Params.last_pressed_answer || Time.frame_count < nb_frames_answer_presentation) {
        display_ellipse_background(pos_practice_scene_y2);
        display_pressed_answer(Params.last_pressed_answer, Params.activity_answer, pos_practice_scene_y2);
        pop();
    } else {
        // Set clicked answer to correct:
        Params.activity_answer[1] = true;
        Time.update_tutorial();
    }
}

// Scene tuto STAGE 2:
function scene_tutorial4() {
    //image
    draw_character(researcher_1, pos_researcher_x3, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y2, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_y2);
    noStroke();
    textAlign(CENTER);
    text(text_tutorial_3_0, pos_tutorialtext_x1, pos_tutorialtext_y2 - 3 * shift_text_y2);
    text(text_tutorial_3_1, pos_tutorialtext_x1, pos_tutorialtext_y2 - 2 * shift_text_y2);
    text(text_tutorial_3_2, pos_tutorialtext_x1, pos_tutorialtext_y2 - 1 * shift_text_y2);
    pop();
    display_ellipse_background(pos_practice_scene_y2);
    display_lines(pos_practice_scene_y2);
    display_target(tuto_target_position);
    draw_numbers(5, 1 * ppd, pos_practice_scene_y2)
}

function draw_numbers(eccentricity, slot_size, centery) {
    const eccentricity_ppd = eccentricity * ppd;
    rectMode(CENTER);
    let dir = 0;
    directions.forEach(elt => {
        dir++;
        noStroke();
        fill('black');
        text(dir, Pos.center_x + eccentricity_ppd * Math.cos(elt), centery - eccentricity_ppd * Math.sin(elt));
    })
}

function scene_tutorial5() {
    draw_character(researcher_1, pos_researcher_x3, pos_researcher_y, researcher_width, researcher_width);
    // draw_background_bubble(Pos.center_x, pos_bubble_y2, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_y2);
    noStroke();
    textAlign(CENTER);
    text(text_tutorial_4_0, pos_tutorialtext_x1, pos_bubble_y3 - 5 * shift_text_y2);
    text(text_tutorial_4_1, pos_tutorialtext_x1, pos_bubble_y3 - 4 * shift_text_y2);
    text(text_tutorial_4_2, pos_tutorialtext_x1, pos_bubble_y3 - 3 * shift_text_y2);
    text(text_tutorial_4_3, pos_tutorialtext_x1, pos_bubble_y3 - 2 * shift_text_y2);
    text(text_tutorial_4_4, pos_tutorialtext_x1, pos_bubble_y3 - 1 * shift_text_y2);
    pop();
    scene_practice_tutorial();
}

function manage_practice_tutorial5() {
    if (!Params.last_clicked_answer[0] || Time.frame_count < nb_frames_answer_presentation) {
        display_ellipse_background(pos_practice_scene_y2);
        display_lines(pos_practice_scene_y2);
        display_clicked_answer(Params.last_clicked_answer, Params.activity_answer);
    } else {
        // Set clicked answer to correct:
        Params.activity_answer[0] = true;
        Time.update_tutorial();
    }
}

// Scene tuto STAGE 3:
function scene_tutorial6() {
    draw_character(researcher_1, pos_researcher_x4, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y5, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_y2);
    noStroke();
    textAlign(CENTER);
    text(text_tutorial_5_0, pos_tutorialtext_x1, pos_tutorialtext_y4 - 3 * shift_text_y2);
    text(text_tutorial_5_1, pos_tutorialtext_x1, pos_tutorialtext_y4 - 2 * shift_text_y2);
    text(text_tutorial_5_2, pos_tutorialtext_x1, pos_tutorialtext_y4 - 1 * shift_text_y2);
    pop();
    scene_practice_tutorial();
}

function manage_practice_tutorial6() {
    if ((Params.last_pressed_answer && Params.last_clicked_answer[0]) && (Time.frame_count < nb_frames_answer_presentation) || !(Params.last_pressed_answer && Params.last_clicked_answer[0])) {
        display_ellipse_background(pos_practice_scene_y2);
        display_lines(pos_practice_scene_y2);
        display_clicked_answer(Params.last_clicked_answer, Params.activity_answer);
        display_pressed_answer(Params.last_pressed_answer, Params.activity_answer, pos_practice_scene_y2);
        pop();
    } else {
        // Set clicked answer to correct:
        Time.update_tutorial();
    }
}


// Stage 4:
function scene_tutorial7() {
    //image
    draw_character(researcher_1, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y2, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_y2);
    noStroke();
    textAlign(CENTER);
    text(text_tutorial_6_0, pos_tutorialtext_x1, pos_tutorialtext_y2 - 3 * shift_text_y2);
    text(text_tutorial_6_1, pos_tutorialtext_x1, pos_tutorialtext_y2 - 2 * shift_text_y2);
    text(text_tutorial_6_2, pos_tutorialtext_x1, pos_tutorialtext_y2 - 1 * shift_text_y2);
    pop();
    display_ellipse_background(pos_practice_scene_y2);
    display_lines(pos_practice_scene_y2);
    display_target(Params.current_practice_periph_stimulus);
    distances.forEach(elt => draw_distractors(elt, target_size, pos_practice_scene_y2, 7, Params.direction_tuto))
}

function scene_tutorial8() {
    draw_character(researcher_1, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y2, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_y2);
    noStroke();
    textAlign(CENTER);
    text(text_tutorial_6_0, pos_tutorialtext_x1, pos_tutorialtext_y2 - 3 * shift_text_y2);
    text(text_tutorial_6_1, pos_tutorialtext_x1, pos_tutorialtext_y2 - 2 * shift_text_y2);
    text(text_tutorial_6_3, pos_tutorialtext_x1, pos_tutorialtext_y2 - 1 * shift_text_y2);
    pop();
    scene_practice_tutorial();
}

function scene_practice_tutorial() {
    Time.count();
    if (Time.practice_in_tutorial === 0) {
        // bar instruction
        display_press_space_bar_instructions(pos_practice_scene_y2);
    } else {
        switch (Time.practice_in_tutorial) {
            case 1:
                if (Time.frame_count < practice_tuto_stimulus_duration_2) {
                    // stimulus presentation
                    display_ellipse_background(pos_practice_scene_y2);
                    switch (Time.tuto_stage) {
                        case 1:
                            // Stage 1 is central stimulus only
                            display_central_stimulus(Params.current_practice_stimulus, pos_practice_scene_y2);
                            break;
                        case 2:
                            // Stage 2 is peripheral stimulus only
                            display_target(Params.current_practice_periph_stimulus);
                            break;
                        case 3:
                            display_central_stimulus(Params.current_practice_stimulus, pos_practice_scene_y2);
                            display_target(Params.current_practice_periph_stimulus);
                            break;
                        case 4:
                            display_central_stimulus(Params.current_practice_stimulus, pos_practice_scene_y2);
                            display_target(Params.current_practice_periph_stimulus);
                            distances.forEach(elt => draw_distractors(elt, target_size, pos_practice_scene_y2, 7, Params.direction_tuto))
                            break;
                    }
                } else {
                    Time.update_tutorial();
                }
                break;
            case 2:
                if (Time.frame_count < practice_mask_tutorial_duration_2) {
                    // mask presentation
                    display_mask(pos_practice_scene_y2, [15 * ppd, 15 * ppd]);
                } else {
                    Time.update_tutorial();
                }
                break;
            case 3:
                Time.count();
                switch (Time.tuto_stage) {
                    case 1:
                        manage_practice_tutorial3();
                        break;
                    case 2:
                        manage_practice_tutorial5();
                        break;
                    case 3:
                        manage_practice_tutorial6();
                        break;
                    case 4:
                        manage_practice_tutorial6();
                        break;
                }
                break;
            case 4:
                display_completion_tutorial_practice();
                break;
        }
    }
}

function display_completion_tutorial_practice() {
    push();
    textSize(size_text*1.3);
    textAlign(CENTER);
    fill(col_completed_practice);
    noStroke();
    text(text_completed_practice, Pos.center_x, pos_practice_scene_y2);
    text(text_completed_practice_2, Pos.center_x, pos_practice_scene_y2 + shift_completed_practice_text);
    pop();
    display_ellipse_background(pos_practice_scene_y2);

}


// Last scene to start the game:
function scene_tutorial9(){
    button_start.show();
    draw_character(researcher_3, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y_start, size_bubble_x, size_bubble_y);
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext);
    textAlign(CENTER);
    textFont(text_font);
    noStroke();
    text(text_tutorial_start_0, pos_tutorialtext_x, pos_tutorialtext_y_start);
    text(text_tutorial_start_1, pos_tutorialtext_x, pos_tutorialtext_y_start + shift_text);
    text(text_tutorial_start_2, pos_tutorialtext_x, pos_tutorialtext_y_start + 2* shift_text);
    pop();
}

function create_next_button() {
    button_next = createButton(text_button_next);
    button_next.size(size_next_w, size_next_h);
    button_next.style('font-size', size_next_text + 'px');
    button_next.position(x_next, y_next);
    button_next.hide();
    //button
    button_next.mousePressed(() => {
        Params = new ParameterManager();
        button_previous.show();
        Time.update();
    });
}

function create_previous_button() {
    button_previous = createButton(text_button_previous);
    button_previous.size(size_previous_w, size_previous_h);
    button_previous.style('font-size', size_previous_text + 'px');
    button_previous.position(x_previous, y_previous);
    button_previous.hide();
    button_previous.mousePressed(() => {
        Time.previous();
    });
}

function create_start_button() {
    button_start = createButton(text_button_start);
    button_start.size(size_start_w, size_start_h);
    button_start.style('font-size', size_start_text + 'px');
    button_start.position(x_start, y_start);
    button_start.hide();
    //buttons
    button_start.mousePressed(() => {
        button_start.hide();
        // add_hide_cursor_class();
        Params = new ParameterManager();
        Time.update();
    });
}



