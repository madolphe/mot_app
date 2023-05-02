// p5.js functions to display the game:
function preload() {
    map_progress_image =  loadImage(map_progress_path)
    arena_background_init = loadImage(background_path, img => {arena_background = img.get()});
    guard_image = loadImage(distractor_path);
    goblin_image = loadImage(target_path);
    leaf_image = loadImage('/static/images/bavelier_lab/leaf.png');
    timer_image = loadImage('static/images/timer.png');
    trophy_image = loadImage('static/images/progress/trophy.png');
    trophy_disabled_image = loadImage('static/images/progress/trophy_disabled.png');
    for(let i=0; i<9; i++){
        progress_array.push(loadImage('static/images/progress/'+i+'.png'))
    }
    for(let i=0; i<8; i++){
        progress_array.push(loadImage('static/images/progress/'+i+'_'+(i+1)+'.png'))
    }
    for(let i=1; i<7; i++){
        swords_array.push(loadImage('static/images/progress/sword_'+i+'.png'))
    }
    success_image = loadImage('static/images/icons/success_mot_test.png');
    failure_image = loadImage('static/images/icons/failure_mot.png');
}

function setup(){
    let button_exit_width = windowWidth/20;
    let button_exit_height = windowHeight/20;
    let button_height = 60;
    let button_width = 120;

    set_screen_params();
    radius = Math.round(ppd*max_angle);

    gill_font_light = loadFont('/static/font/gillsansstd/GillSansStd-Light.otf');
    gill_font = loadFont('/static/font/gillsansstd/GillSansStd.otf');
    frameRate(fps);
    hover_color = color(255, 255, 255);
    hover_color.setAlpha(150);

    canvas = createCanvas(windowWidth, windowHeight);

    mode = 'start';
    canvas.parent('app_holder');
    canvas.style('position: absolute; z-index: -1000;');

    // Create all buttons, use of utils function create_button:
    // Button to answer after trial:
    center_x = (windowWidth/2)-(button_width/2);
    center_y =  (windowHeight/2) - (button_height/2);
    bottom_y =  0.93*windowHeight - (button_height/2);
    button_answer = create_button(button_answer_label, center_x, bottom_y,button_width,button_height,answer_button_clicked);
    // Button to start playing:
    y_button_play = (windowHeight/2) + windowHeight/5;
    button_play = create_button(button_play_label, center_x, y_button_play,button_width,button_height,launch_app, true);
    // Exit button:
    x_exit = windowWidth-(100*1.3);
    y_exit = 50 - (45/2);
    button_exit = create_button(button_exit_label, x_exit, y_exit,button_exit_width,button_exit_height,quit_game, true);
    // Next episode button
    button_next_episode = create_button(button_next_episode_label, center_x, bottom_y,button_width,button_height,next_episode);
    // Button to restart an episode, displayed during transition with participant last score:
    y_keep_progress = windowHeight/2 + windowHeight/9;
    x_keep = center_x - button_width;
    button_keep = create_button(button_keep_label, center_x , y_keep_progress,button_width,button_height,start_episode);
    // Button for progress:
    x_progress = center_x + button_width;
    button_progress = create_button(button_progress_label, center_x, y_keep_progress,button_width,button_height,progress_button_clicked);
    // Button back to quit progress tab
    y_back_button = y_keep_progress+(2*ppd)
    button_back = create_button(button_back_label, center_x, y_back_button,button_width,button_height,back_button_clicked);
    textAlign(CENTER, CENTER);
}

function create_button(label, x, y, width, height, method, show=false){
    let button = createButton(label);
    button.position(x, y);
    button.size(width,height);
    button.mousePressed(method);
    button.hide();
    if(show){button.show()}
    return button
}
function draw(){
    push();
    background(0);
    arena_background.resize(1.1*radius,0);
    if(parameter_dict['gaming']==1){
        imageMode(CENTER);
        image(arena_background, windowWidth/2, windowHeight/2);
    }
    // There is a global variable "mode" that launch different display functions
    switch (mode){
        case 'start':
            start_mode();
            break;
        case 'play':
            // There are 30 frames per sec, every 30 framecount there is 1 sec elapsed
            if(frameCount % fps == 0){game_time --}
            play(parameter_dict['debug']);
            break;
    }
    pop();
}
function mousePressed(event) {
    if((mouseX > canvas.width-40)&&(mouseY<40)){quit_game()}
   // First test if objects are in "clickable mode"
    if (typeof app !== 'undefined') {
        if(app.phase=='answer'){
            app.check_mouse_pressed(mouseX, mouseY);
        }
    }
}
function windowResized(){
    canvas = createCanvas(windowWidth, windowHeight);
    if(parameter_dict['admin_pannel']){
        position_inputs();
        size_inputs();
    }
    // Positions:
    center_x = (windowWidth/2)-(button_width/2);
    center_y =  (windowHeight/2) - (button_height/2);
    y_button_play = (windowHeight/2) + windowHeight/5;
    bottom_y =  0.93*windowHeight - (button_height/2);
    x_exit = windowWidth-(100*1.3);
    y_exit = 50 - (45/2);
    y_keep_progress = windowHeight/2 + windowHeight/9;
    y_back_button = y_keep_progress+(2*ppd)
    x_keep = center_x - button_width;
    x_progress = center_x + button_width;
    // Apply :
    button_next_episode.position(center_x, bottom_y);
    button_answer.position(center_x, bottom_y);
    button_play.position(center_x, y_button_play);
    button_exit.position(x_exit, y_exit);
    button_keep.position(x_keep,y_keep_progress);
    button_progress.position(x_progress, y_keep_progress);
    button_back.position(center_x, y_back_button);
    set_screen_params();
}
function keyPressed(){
    if(sec_task instanceof Secondary_Task){
        sec_task.keyboard_pressed(keyCode);
    }
}
function mouseReleased() {
    update_input_from_slider_value();
}


