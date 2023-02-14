// scene 6
function scene_tutorial1() {
    draw_character(researcher_3, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y, size_bubble_x, size_bubble_y);
    //Title
    push();
    fill(col_titletext);
    textSize(size_titletext);
    textAlign(CENTER);
    text(text_title_0, pos_title_x, pos_title_y);
    pop();

    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext);
    textAlign(CENTER);
    textFont(text_font);
    text(text_tutorial_0_0, pos_tutorialtext_x, pos_tutorialtext_y);
    text(text_tutorial_0_1, pos_tutorialtext_x, pos_tutorialtext_y + shift_text);
    text(text_tutorial_0_2, pos_tutorialtext_x, pos_tutorialtext_y);
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
        button_previous.hide();
        Time.previous();
    });
}


// scene 7
function scene_tutorial2() {
    //image
    draw_character(researcher_2, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);
    draw_background_bubble(Pos.center_x, pos_bubble_y, size_bubble_x, size_bubble_y);
    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext);
    textAlign(CENTER);
    text(text_tutorial_1_0, pos_tutorialtext_x1, pos_tutorialtext_y1 - shift_text);
    text(text_tutorial_1_1, pos_tutorialtext_x1, pos_tutorialtext_y1);
    pop();

    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext_stimulus);
    textAlign(CENTER);
    text("N", pos_tutorialtext_x1 - 3 * ppd, pos_tutorialtext_y1 - 3 * shift_text);
    text("M", pos_tutorialtext_x1 + 3 * ppd, pos_tutorialtext_y1 - 3 * shift_text);
    pop();
}

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
    text(text_tutorial_2_0, pos_tutorialtext_x1, pos_tutorialtext_y2 - 2 * shift_text_y2);
    text(text_tutorial_2_1, pos_tutorialtext_x1, pos_tutorialtext_y2 - shift_text_y2);
    text(text_tutorial_2_2, pos_tutorialtext_x1, pos_tutorialtext_y2);
    pop();
    scene_practice_tutorial_3_1();
}

function scene_practice_tutorial_3_1() {
    Time.count();
    if (Time.practice_in_tutorial === 0) {
        // bar instruction
        display_press_space_bar_instructions(pos_practice_scene_y2);
    } else {
        switch (Time.practice_in_tutorial) {
            case 1:
                if (Time.frame_count < practice_tuto_stimulus_duration_2) {
                    // stimulus presentation
                    display_central_stimulus(Params.current_practice_stimulus, pos_practice_scene_y2)
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
                if (!Params.last_pressed_answer || Time.frame_count < nb_frames_answer_presentation) {
                    display_ellipse_background(pos_practice_scene_y2);
                    display_pressed_answer(Params.last_pressed_answer, Params.activity_answer, pos_practice_scene_y2);
                    pop();
                } else {
                    // Set clicked answer to correct:
                    Params.activity_answer[1] = true;
                    Time.update_tutorial();
                }
                break;
            case 4:
                push();
                textSize(size_text);
                textAlign(CENTER);
                fill(col_text);
                noStroke();
                text("You have completed the practice", Pos.center_x, pos_practice_scene_y2);
                pop();
                display_ellipse_background(pos_practice_scene_y2);
                break;
        }
    }
}

function create_start_button() {
    button_start = createButton(text_button_start);
    button_start.size(size_start_w, size_start_h);
    button_start.style('font-size', size_start_text + 'px');
    button_start.position(x_start, y_start);
    button_start.hide();
}

function scene_tutorial5() {
    draw_character(researcher_2, pos_researcher_x, pos_researcher_y, researcher_width, researcher_width);

    //text
    push();
    fill(col_tutorialtext);
    textSize(size_tutorialtext3);
    textAlign(CENTER);
    text(text_tutorial_4_0, pos_tutorialtext_x3, pos_tutorialtext_y3);
    pop();

    //buttons
    button_start.mousePressed(() => {
        button_start.hide();
        // add_hide_cursor_class();
        Params = new ParameterManager();
        Params.num_rep = num_rep_main;
        flag_practice = false;
        flag_break = true;
        Time.start();
    });
}