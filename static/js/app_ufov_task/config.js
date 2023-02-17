//// parameters

//////////////////////////Monitor 
// number of pixels per degres:
let viewer_dist = 50;
function get_ppd(viewer_dist, screen_params){
    return (viewer_dist*Math.tan(Math.PI/180)) * screen_params;
}
let window_availw = window.screen.availWidth;
let window_availh = window.screen.availHeight;
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
let bubble_img, mask_img;
let bbox, bbox1, bbox2;
let col_bkg_grey = "#808080";
let fname_success = 'static/images/icons/success.png';
let fname_bkg = 'static/images/pre-post-imgs/bkg_largewindow.png';
let fname_obj = 'static/images/pre-post-imgs/obj_mot.png';
let fname_noise = 'static/images/pre-post-imgs/noise.png';

// image sizes
let size_bkg_width_orig = 1440; //original in pix
let size_bkg_height_orig = 1080; //original in pix
let ratio_center =  0; 
let ratio_monitor = 0.9296;
Pos = new PositionManager(window_availw,window_availh);
Pos.adjust_to_bkg(size_bkg_width_orig,size_bkg_height_orig,ratio_center);
let img_bkg;
let size_img = [ratio_monitor*Pos.size_bkg_y,ratio_monitor*Pos.size_bkg_y];

let col_bkg = 0;
// let col_text = "#FEFEE2";
let col_text = "white";
let size_text = 20;
let len_feedback = 0.4*ppd;
let size_correct_feedback = 1*ppd;
let col_wrong = 'red';
let col_correct = 'blue';
let width_feedback = 5;
let pi = Math.PI
let rotation_star = 3*pi/10;
let stroke_weight = 3;
// let col_object = "#FEFEE2";
let col_object = "white";
let area_line_selection = 5*pi/180;
let col_line_selected = "yellow";
let stroke_weight_line_selected = 4;

// conditions
const directions = [0, pi/4, 2*pi/4, 3*pi/4, pi, 5*pi/4, 6*pi/4, 7*pi/4];
const directions_closest = [0, pi/4, 2*pi/4, 3*pi/4, pi, 5*pi/4, 6*pi/4, 7*pi/4, 2*pi]
let real_distances = [3, 5, 7];
let distances = [2, 4];
let tuto_ecc_target = 4;
let real_max_eccentricity = 8*ppd;
let max_eccentricity = 6*ppd;
let target_size = 1*ppd;
let nb_frames_mask = 19;
let nb_frames_answer_presentation = 50;

let nb_trials = 72;
let tmp_eccentricity_trials = Array.apply(null, Array(nb_trials)).map(_ => [7])
let tmp_central_stimulus = Array.apply(null, Array(nb_trials / 2)).map(_ => ["N", "M"])
let tmp_direction = Array.apply(null, Array(nb_trials / 8)).map(_ => directions)

//buttons
let button_next, button_previous, button_start;
let size_end_w = Math.round(2.5*ppd); //in pixel
let size_end_h = Math.round(1.5*ppd); //in pixel
let x_end = Pos.center_x- (size_end_w/2); //in pixel
let y_end = Pos.center_y+Math.round(2*ppd)-(size_end_h/2); //in pixel
let size_end_text = Math.round(0.5*ppd);

let debug = false;
// exit task
let exit_view = "exit_view_cognitive_task"
if(debug){
    nb_trials = 5;
}