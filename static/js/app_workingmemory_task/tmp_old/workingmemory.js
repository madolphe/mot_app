//p5.js preload images
function preload() {
}

//p5.js initializing.
function setup() {
  if (flag_practice==true){
    CANVAS_WIDTH = canvas_w;
    CANVAS_HEIGHT = canvas_h;
    }else{
    CANVAS_WIDTH = displayWidth;
    CANVAS_HEIGHT = displayHeight;    
    }
  createCanvas(CANVAS_WIDTH,CANVAS_HEIGHT);
  
  CENTER_X = (CANVAS_WIDTH/2)-(size_target/2);
  CENTER_Y = (CANVAS_HEIGHT/2)-(size_target/2); 
  Params = new ParameterManager();
  Time = new TimeManager();

  create_answer_button();
  create_end_button();
  if (flag_practice==true){
    create_restart_button();
  }else{
    create_end_button();
  }
}

//p5.js frame animation.
function draw() {
  background(col_bkg); //bkg color
  //Main experiment schedule

  if(Time.scene==0){
    scene_instruction();
  }else if(Time.scene==1){
    scene_fixation();
  }else if(Time.scene==2){
    scene_stim(scene_targ);
  }else if(Time.scene==3){
    scene_response();
  }else if(Time.scene==4){
    scene_end();
  }
}

function keyPressed(){
  if(keyCode===32 && !flag_practice){
    fullscreen(true);
  }
}

//scene 0
function scene_instruction(){
  if (mouseIsPressed) {
    Time.update();
  } else{
    fill(col_text);
    textSize(size_text);
    textAlign(CENTER);
    text(prompt_start, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
  }
}

//scene 1
function scene_fixation(){
  Time.count();
  if (Time.activetime_block < time_fixation) {
    push();
    stroke(col_fixation); 
    strokeWeight(thick_fixation);
    line(CANVAS_WIDTH/2 - len_fixation, CANVAS_HEIGHT/2, CANVAS_WIDTH/2 + len_fixation, CANVAS_HEIGHT/2 );
    line(CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - len_fixation, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + len_fixation );
    pop();
  } else{
    Time.update();
  }
}


//scene 2
function scene_targ(){
  Time.count();
  if (Time.activetime_block < time_stimduration){
    
    for (let i=0; i < array_stimcond.length; ++i) {
      if (i==Params.count_color && i<num_memory[Params.ind_stimcond]){
        push();
        fill(col_target);
        Objs[i].display();
        pop();
      }else{
        push();
        fill(col_normal);
        Objs[i].display();
        pop();
      }
    }

  } else{
    Time.update();
  }

  if (Time.activetime_block > time_startblank+((Params.count_color+1)*time_onestimduration)){
    Params.count_color ++;
  }
}


function scene_stim(callback){
  if (Params.flag_load == false){   
    for (let i=0; i < array_stimcond.length; ++i) {
      Objs[i] = new DrawRect(size_target,Params.dict_pos[Params.trial_stimcond[i]][0],Params.dict_pos[Params.trial_stimcond[i]][1])
    };
  Time.blockstart();
  Params.flag_load = true;
  } else{
    callback();
  }
}

class DrawRect {
  constructor(size,x,y) {
    noStroke();
    this.size = size;
    this.x = x
    this.y = y
  }

  display() {
    rect(this.x, this.y, this.size, this.size);
  }
 }

// scene 4
function scene_response(){
  Time.count();
  // call function
  for (let i=0; i < array_stimcond.length; ++i) {
    Button[i].mousePressed(record_response);
  }

  if (Params.tmp_res_ob.length==num_memory[Params.ind_stimcond]){
    Time.update();
  }
}

function create_answer_button(){
  for (let i=0; i < array_stimcond.length; ++i) {
    Button[i] = createButton(prompt_button_click);
    Button[i].style('font-size', size_text_button + 'px');
    Button[i].size(size_target, size_target);
    Button[i].position(Params.dict_pos[Params.trial_stimcond[i]][0],Params.dict_pos[Params.trial_stimcond[i]][1]);
    Button[i].hide();
  }
}

function make_button(){
  for (let i=0; i < array_stimcond.length; ++i){
    Button[i].show(); 
    Button[i].position(Params.dict_pos[Params.trial_stimcond[i]][0],Params.dict_pos[Params.trial_stimcond[i]][1]);
  }  
}


function record_response(){
  Params.order++;
  Params.tmp_res_ob.push(Params.order);
}

// scene 5
function scene_end(){
  fill(col_text);
  noStroke();
  textSize(size_text);
  textAlign(CENTER);
  text(prompt_gratitude, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
}

function create_end_button(){
  button_end = createButton(prompt_button_end);
  button_end.position(x_ok+CANVAS_WIDTH/2, y_ok+CANVAS_HEIGHT/2);
  button_end.mousePressed(quit_task);
  button_end.hide();
}

function quit_task(){
  fullscreen(false);
  let parameters_to_save = {
      'results_responses': Params.results_responses,
      'results_rt': Params.results_rt,
      'results_targetvalue_stim': Params.results_targetvalue_stim
    }
  post('exit_view_cognitive_task', parameters_to_save, 'post');
}

function create_restart_button(){
  button_restart = createButton(prompt_button_restart);
  //button_restart.position(x_ok+CANVAS_WIDTH/2, y_ok+CANVAS_HEIGHT/2);
  button_restart.position(x_restart+CANVAS_WIDTH/2, y_restart+CANVAS_HEIGHT/2);
  button_restart.mousePressed(restart_task);
}

function restart_task(){
  Params = new ParameterManager();
  Time = new TimeManager();
}


class TimeManager{
  constructor() {
    this.scene = 0;
    this.starttime_exp = Date.now();
    this.starttime_block = null;
    this.activetime_block = null;

    this.scene_key1 = 3;
    this.scene_key2 = 2;
    this.scene_back = 1;
    this.end_scene = 4;
  }

  update(){
    if(this.scene==this.scene_key1){
      for (let i=0; i < array_stimcond.length; ++i) {
        Button[i].hide();
      }
      this.repeat();
      this.starttime_block = Date.now();      
    }else if (this.scene==this.scene_key2) {
      make_button();
      this.scene ++;
      this.starttime_block = Date.now();
    }else{
      this.scene ++;
      this.starttime_block = Date.now();
    }
  }

  repeat(){
    if (Params.flag_block ==true){
      Params.next_block();
      if (Params.repetition == num_rep){
        this.scene = this.end_scene;
        if (flag_practice==false){
          button_end.show();
        } 
      }else{
        this.scene = this.scene_back;
      }
    }else{
      Params.next_trial(); 
      this.scene = this.scene_back;
    }
  }
  
  count(){
    // Calculate the duration since the target scene (block) started
    this.activetime_block = (Date.now() - this.starttime_block);
  }

  count_response(){
    // Calculate the reaction time of the participant
    Params.tmp_rt = (Date.now() - this.starttime_block);
  }

  blockstart(){
    this.starttime_block = Date.now();
  }
 }

////////////////////////////////////////
class ParameterManager{
  constructor() {
    // Stimulus parameters
    this.repetition = 0;
    this.ind_stimcond = 0;
    this.flag_block = false;
    this.flag_load = false;
    this.count_color = -1;
    num_memory = shuffle(num_memory);
    //ConditionManager
    
    this.dict_pos = [[CENTER_X-shift_position,CENTER_Y-shift_position],
                      [CENTER_X,CENTER_Y-shift_position],
                      [CENTER_X+shift_position,CENTER_Y-shift_position],
                      [CENTER_X-shift_position,CENTER_Y],
                      [CENTER_X,CENTER_Y],
                      [CENTER_X+shift_position,CENTER_Y],
                      [CENTER_X-shift_position,CENTER_Y+shift_position],
                      [CENTER_X,CENTER_Y+shift_position],
                      [CENTER_X+shift_position,CENTER_Y+shift_position],];

    this.trial_stimcond = shuffle(array_stimcond); 
    this.tmp_res_ob = [];
    this.order = -1;

    //save
    this.results_responses = [];
    this.results_rt = [];
    this.results_targetvalue_stim = [];
    this.results_num_stim = [];

  }
    next_trial(){
      this.save();
      //set the next trial parameters 
      this.ind_stimcond ++;
      this.flag_load = false;
      this.tmp_res_ob = [];
      this.count_color = -1;
      this.order = -1;

      if (this.ind_stimcond==num_memory.length-1){
        this.flag_block = true;
      }
    }
  
    next_block(){
      this.save();
      //set the next block parameters
      this.flag_load = false;
      this.tmp_res_ob = [];
      this.count_color = -1;
      this.order = -1;


      this.flag_block = false;
      this.repetition ++;
      this.trial_stimcond = shuffle(array_stimcond); 
      this.ind_stimcond = 0;
      num_memory = shuffle(num_memory);
    }
  
    save(){
      // save the current result.
      this.results_responses.push(this.tmp_res_ob);
      this.results_rt.push(this.tmp_rt);
      this.results_targetvalue_stim.push(this.trial_stimcond);
      this.results_num_stim.push(num_memory[this.ind_stimcond])
      //console.log('response is');
      //console.log(this.tmp_res_ob);
    }
}


//To randomize the stimulus condition.
const shuffle = ([...array]) => {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

