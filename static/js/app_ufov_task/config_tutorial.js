//general title text
let pos_title_x = Pos.center_x;
let pos_title_y = Pos.center_y - Math.round(0.24*Pos.canvas_height);
let size_titletext = Math.round(0.12*Pos.canvas_height);
//let col_titletext = [170,170,60];
let col_titletext = 'white';
let size_tutorialtext = Math.round(0.025*Pos.canvas_height);
let col_tutorialtext = 'white';
let shift_text = Math.round(0.04*Pos.canvas_height);
let size_start_w = Math.round(0.12*Pos.canvas_height); //in pixel
let size_start_h = Math.round(0.07*Pos.canvas_height); //in pixel
let x_start = Pos.center_x- (size_start_w/2); //in pixel
let y_start = Pos.center_y-Math.round(0.10*Pos.canvas_height)+(size_start_h/2); //in pixel
let size_start_text = Math.round(0.02*Pos.canvas_height);

//general button
let size_next_w = Math.round(0.12*Pos.canvas_height); //in pixel
let size_next_h = Math.round(0.07*Pos.canvas_height); //in pixel
let x_next = Pos.center_x+Math.round(0.14*Pos.canvas_height)-(size_next_w/2); //in pixel
let y_next = Pos.canvas_height-Math.round(0.14*Pos.canvas_height)-(size_next_h/2); //in pixel
let size_next_text = Math.round(0.02*Pos.canvas_height);

let size_previous_w = Math.round(0.12*Pos.canvas_height); //in pixel
let size_previous_h = Math.round(0.07*Pos.canvas_height); //in pixel
let x_previous = Pos.center_x-Math.round(0.14*Pos.canvas_height)-(size_previous_w/2); //in pixel
let y_previous = Pos.canvas_height-Math.round(0.14*Pos.canvas_height)-(size_previous_h/2); //in pixel
let size_previous_text = Math.round(0.02*Pos.canvas_height); //in pixel

let text_font = 'Helvetica';
let pos_researcher_x = window_availw/3.3;
let pos_researcher_y = 4*window_availh/5;
let size_bubble_x = Math.round(0.38*Pos.canvas_height);
let size_bubble_y = Math.round(0.08*Pos.canvas_height);
let pos_bubble_y = Pos.center_y + Math.round(0.119*Pos.canvas_height);

// scene tuto 1
let pos_tutorialtext_x = Pos.center_x;
let pos_tutorialtext_y = Pos.center_y+Math.round(0.04*Pos.canvas_height);
let nb_success_tuto = 3;

// scene tuto 2
let pos_tutorialtext_x1 = Pos.center_x;
let pos_tutorialtext_y1 = Pos.center_y+Math.round(0.08*Pos.canvas_height);
let pos_tutorialimage_y1 = Pos.center_y - Math.round(0.16*Pos.canvas_height);
let pos_tutorialslider_y1 = Pos.center_y - Math.round(0.14*Pos.canvas_height);
let size_tutorialtext_stimulus = 3*ppd;

// scene tuto 3
let pos_bubble_y2 = Pos.center_y + Math.round(0.28*Pos.canvas_height);
let pos_tutorialtext_y2 = pos_bubble_y2;
let pos_practice_scene_y2 = Pos.center_y - 3*ppd;
let size_tutorialtext_y2 = 0.6*ppd;
let shift_text_y2 = 0.8*ppd;
let practice_tuto_stimulus_duration_2 = 20;
let practice_mask_tutorial_duration_2 = 20;
let tuto_target_position = [Pos.center_x + 7*ppd, pos_practice_scene_y2]
let col_completed_practice = "white";
let shift_completed_practice_text = 1.2*ppd;

// scene tuto 4
let pos_researcher_x3 = window_availw/3.6;

// scene tuto 5
let pos_tutorialtext_y4 = Pos.center_y + 8.5*ppd;


// last scene
let pos_tutorialtext_y_start = Pos.center_y+2*ppd;
let pos_bubble_y_start = pos_tutorialtext_y_start + 3* shift_text;

if(debug){
    nb_success_tuto=1;
}
// scene x
