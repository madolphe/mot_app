// p5.js functions to display the game:
let canvas_holder, goblin, guard, button_next_mot, button_previous_mot, display_mode;

function preload() {
    arena_background_init = loadImage('/static/images/bavelier_lab/arena.png', img => {
        arena_background = img.get()
    });
    guard_image = loadImage('/static/images/bavelier_lab/guard.png');
    goblin_image = loadImage('/static/images/bavelier_lab/goblin.png');
}

function setup() {
    set_screen_params_tutorial();
    // radius = Math.round(ppd*max_angle);
    mode = 'moving_presentation';
    display_mode = 'move';
    gill_font_light = loadFont('/static/font/gillsansstd/GillSansStd-Light.otf');
    gill_font = loadFont('/static/font/gillsansstd/GillSansStd.otf');
    frameRate(fps);
    hover_color = color(255, 255, 255);
    hover_color.setAlpha(150);
    canvasHolder = document.getElementById('canvas_holder_tutorial')
    // canvas = createCanvas(canvasHolder.offsetWidth, canvasHolder.offsetHeight);
    canvas = createCanvas(400, 400);
    canvas.parent('canvas_holder_tutorial');
    goblin = new Button_object(-50,50, goblin_image);
    guard = new Button_object(50,-50, guard_image);
    button_previous_mot = createButton('<<');
    button_previous_mot.position(0, canvas.height/2);
    button_previous_mot.hide();
    button_previous_mot.parent('canvas_holder_tutorial');
    button_previous_mot.mousePressed(previous_button_tuto);
    button_next_mot = createButton('>>');
    button_next_mot.position(canvas.width - button_next_mot.width, canvas.height/2);
    button_next_mot.hide();
    button_next_mot.parent('canvas_holder_tutorial');
    button_next_mot.mousePressed(next_button_tuto);
}

function switch_guideline_state(guideline_name, new_state){
    guideline = document.getElementById(guideline_name);
    guideline.style.display = new_state;
}

function next_button_tuto(){
    switch (mode){
        case 'moving_presentation':
            button_previous_mot.show();
            switch_guideline_state('guideline_2', 'block')
            display_mode = 'freeze';
            mode = 'freeze_presentation';
            break;
        case 'freeze_presentation':
            goblin.img = guard_image;
            switch_guideline_state('guideline_3', 'block')
            mode = 'freeze_same_aspect';
            break;
        case 'freeze_same_aspect':
            mode = 'tracking';
            switch_guideline_state('guideline_4', 'block')
            display_mode = 'move';
            break;
        case 'tracking':
            mode = 'freeze_response';
            switch_guideline_state('guideline_5', 'block')
            display_mode = 'freeze';
            guard.hoverable = true;
            goblin.hoverable = true;
            break;
        case 'freeze_response':
            mode = 'give_answers';
            switch_guideline_state('guideline_6', 'block')
            guard.hoverable = false;
            goblin.hoverable = false;
            goblin.img = goblin_image;
            display_mode = 'freeze';
            button_next_mot.hide();
            break;
    }
}
function previous_button_tuto(){
        switch (mode){
            case 'give_answers':
                button_next_mot.show();
                switch_guideline_state('guideline_6', 'none')
                guard.hoverable = true;
                goblin.hoverable = true;
                goblin.img = guard_image;
                display_mode = 'freeze';
                mode = 'freeze_response';
                break;
            case 'freeze_response':
                display_mode = 'move';
                switch_guideline_state('guideline_5', 'none')
                mode = 'tracking';
                break;
            case 'tracking':
                mode = 'freeze_same_aspect';
                switch_guideline_state('guideline_4', 'none')
                display_mode = 'freeze';
                break;
            case 'freeze_same_aspect':
                mode = 'freeze_presentation';
                switch_guideline_state('guideline_3', 'none');
                goblin.img = goblin_image;
                break;
            case 'freeze_presentation':
                mode = 'moving_presentation';
                switch_guideline_state('guideline_2', 'none');
                display_mode = 'move';
                button_previous_mot.hide();
                break;
        }
}

function draw() {
    if (step_nb === 2) {
        push();
        background(0);
        arena_background.resize(400, 400);
        image(arena_background, 0, 0);
        imageMode(CENTER);
        pop();
        switch (display_mode) {
            case 'freeze':
                goblin.display();
                guard.display();
                break;
            case 'move':
                goblin.display_and_move();
                guard.display_and_move();
                break;
        }
    }
}
class Button_object {
  constructor(inX, inY, inImg) {
    this.x = canvas.width/2 + inX;
    this.y = canvas.height/2 + inY;
    this.img = inImg;
    this.overable = false;
  }
  display() {
    stroke(0);
    // tint the image on mouse hover
    if (this.over()) {
      tint(204, 0, 128);
    }
    image(this.img, this.x, this.y);
  }
  // over automatically matches the width & height of the image read from the file
  // see this.img.width and this.img.height below
  over() {
      if(this.overable){
            if(mouseX > this.x && mouseX < this.x + this.img.width && mouseY > this.y && mouseY < this.y + this.img.height) {
                return true;
            } else {
                return false;
            }
      }
  }

  display_and_move(){
      this.display();
      this.move();
  }
  move(){
      this.x += this.getRandomFloat(-1,1)
      this.y += this.getRandomFloat(-1,1)
  }
  getRandomFloat(min, max, decimals) {
      const str = (Math.random() * (max - min) + min).toFixed(decimals);
      return parseFloat(str);
  }
}


function mousePressed(event) {
    // First test if objects are in "clickable mode"
    if (typeof app !== 'undefined') {
        if (app.phase == 'answer') {
            app.check_mouse_pressed(mouseX, mouseY);
        }
    }
}

function keyPressed() {
    if (sec_task instanceof Secondary_Task) {
        sec_task.keyboard_pressed(keyCode);
    }
}


