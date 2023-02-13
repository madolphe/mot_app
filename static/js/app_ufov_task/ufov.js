//p5.js preload images
function preload() {
  img_bkg = loadImage(fname_bkg);
  img_obj = loadImage(fname_obj);
  success = loadImage(fname_success);
  researcher_1 = loadImage(researcher_1_path);
  researcher_2 = loadImage(researcher_2_path);
  researcher_3 = loadImage(researcher_3_path);
  bubble_img = loadImage(bubble_path);
  mask_img= loadImage(fname_noise);
}

//p5.js initializing.
function setup() {
  createCanvas(Pos.canvas_width,Pos.canvas_height);
  Params = new ParameterManager();
  Time = new TimeManager();
  frameRate(50);
  // create_end_button();
  create_next_button();
  create_previous_button();
  create_start_button();
}

//p5.js frame animation.
function draw() {
  background(col_bkg); //bkg color
  image(img_bkg,Pos.center_x-(Pos.size_bkg_x/2),0,Pos.size_bkg_x,Pos.size_bkg_y);
  //Main experiment schedule
  Time.show();
}

function keyPressed(){
  if(keyCode===32 && Time.current_index_scene !== 1){
    fullscreen(true);
  }
  if(keyCode===32 && Time.current_index_scene === 1){
      Time.update();
  }
  if(Time.current_index_scene === 4){
    if(keyCode===70 || keyCode===71){
      if(!Params.last_pressed_answer){
        Params.get_pressed_key_response(keyCode);
      }
    }
  }
}
function mousePressed(){
  // If participant
  if(Time.current_index_scene === 4 && !Params.last_clicked_answer[0]){
    Params.get_clicked_response(mouseX, mouseY);
  }
}