//// parameters

//////////////////////////Monitor 
// number of pixels per degres:
let viewer_dist = 50;
/*
function get_ppd(viewer_dist, screen_params){
    return (viewer_dist*Math.tan(Math.PI/180)) * screen_params;
}
*/
let window_availw = window.screen.availWidth;
let window_availh = window.screen.availHeight;

//let window_availw = window.screen.width;
//let window_availh = window.screen.height;

//let size_screen_cm_w = 34.25; // width pixels/cm in sawayama's monitor
//let screen_params = 1920/34.25; // width pixels/cm in sawayama's monitor
//let screen_params = window_availw/size_screen_cm_w;
let ppd = get_ppd(viewer_dist, size_screen_cm_w);
//////////////////////////Monitor 

// Characters:
let researcher_1_path = 'static/images/researcher/researcher_1.png';
let researcher_2_path = 'static/images/researcher/researcher_2.png';
let researcher_3_path = 'static/images/researcher/researcher_3.png';
let bubble_path = 'static/images/pre-post-imgs/tutorial/bubble_line.png';
let researcher_1, researcher_2,researcher_3;
let researcher_width = window_availw/4;
let researcher_height = researcher_width;
let bubble_img;

let fname_success = 'static/images/icons/success.png';
let fname_bkg = 'static/images/pre-post-imgs/bkg_finger2.png';
let size_bkg_width_orig = 1440; //original in pix
let size_bkg_height_orig = 1080; //original in pix
let ratio_center = 0.1111; 
let ratio_monitor = 0.706;
Pos = new PositionManager(window_availw,window_availh);
Pos.adjust_to_bkg(size_bkg_width_orig,size_bkg_height_orig,ratio_center);
let img_bkg;


let fname_task1 = 'static/images/pre-post-imgs/task1.png';
let fname_task2 = 'static/images/pre-post-imgs/task2.png';
let fname_instruct1 = 'static/images/pre-post-imgs/instruction1.png';
let fname_instruct2 = 'static/images/pre-post-imgs/instruction2.png';

let flag_practice = true;
let flag_break = true;
let count_break = 0;
let max_break = 3;

let num_rep_main = 4;
// debug let num_rep_main = 1;
let num_rep_practice = 4;
// debug let num_rep_practice = 1;


let array_stimcond = [1,1,1,1,0,0,0,0];
// debug let array_stimcond = [1];
let array_target = [1,2,3,4,6,7,8,9];
// debug let array_target = [1];
let array_taskcond = [0,1];

let keyRes1 = 70; //f
let keyRes2 = 74; //j

let time_stimduration = 6000; //in ms
//let time_maskduration = 1000; //in ms
// debug let time_stimduration = 100; //in ms
let time_maskduration = 0; //in ms
let time_fixation = 650; // in millisecond
// debug let time_fixation = 100; // in millisecond

//object condition
let size_obj = Math.round(6*ppd); //in pix. in diameter
let size_instruct_x = Math.round(7*ppd); //in pix. in diameter
let size_instruct_y = Math.round(2*ppd); //in pix. in diameter
let x_instruct = Pos.center_x-(size_instruct_x/2);
let y_instruct = (Pos.canvas_height*ratio_monitor)-(size_instruct_y/2)-Math.round(1*ppd);
let size_instruct_txt = Math.round(0.6*ppd);
let x_instruct_text1 = Pos.center_x-(size_instruct_x/4);
let y_instruct_text = (Pos.canvas_height*ratio_monitor)+(size_instruct_txt/2)-Math.round(1*ppd);
let x_instruct_text2 = Pos.center_x+(size_instruct_x/4);

// fixation 
let col_instruction = 255;
let size_instruction = Math.round(1.5*ppd); //in pix


// text 
let col_text = 255;
let size_text = Math.round(0.7*ppd); //in pixel
////

let col_bkg = 0;

let x_ok = -Math.round(0*ppd);
let y_ok = Math.round(4*ppd);
let x_restart = -Math.round(5.5*ppd);; //in pixel
let y_restart = -Math.round(4*ppd);; //in pixel

//end button;
let size_end_w = Math.round(2.5*ppd); //in pixel
let size_end_h = Math.round(1.5*ppd); //in pixel
let x_end = Pos.center_x- (size_end_w/2); //in pixel
let y_end = Pos.center_y+Math.round(2*ppd)-(size_end_h/2); //in pixel
let size_end_text = Math.round(0.5*ppd);

let bar, success;
let debug = false;
// exit task
let exit_view = "exit_view_cognitive_task"
if(debug){
    time_fixation = 100; // in millisecond
    time_maskduration = 100; //in ms
    time_stimduration = 100; //in ms
    array_target = [1];
    array_stimcond = [1];
    num_rep_practice = 1;
    num_rep_main = 1;
}