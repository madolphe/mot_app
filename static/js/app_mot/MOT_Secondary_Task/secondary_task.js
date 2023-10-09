// @TODO : get keyboard press for detection

class Secondary_Task {
    constructor(image, type, SRI_max, response_window, tracking_time, delta_orientation, other_objects, nbanners) {
        this.image = image;
        this.type = type;
        // number of banners to present
        this.nbanners = nbanners;
        // duration of interval between presentation of sec task:
        this.SRI_max = SRI_max;
        // duration of display of sec task is different of response window!
        this.display_time = 500;
        this.response_window = response_window + this.display_time;
        this.delta_orientation = delta_orientation;
        this.tracking_time = tracking_time;
        // total number of secondary task presentation:
        this.available_time = this.tracking_time;
        // number of already displayed secondary task:
        this.index_pres = 0;
        // mode
        this.display = false;
        this.in_response_window = false;
        this.other_objects = other_objects;
        this.in_img_scaling = 0.1;
        this.results = [];
        this.current_banner_id = 0;
        this.stimuli_times = [];
        this.create_event();
    }

    create_event() {
        this.window_size = this.available_time / this.nbanners;
        let margin_btw_stimuli = this.window_size * 0.05;
        let max_start_stimulus_display = this.window_size - margin_btw_stimuli - this.response_window;
        for (let i = 0; i < this.nbanners; i++) {
            let start = parseFloat((Math.random() * (max_start_stimulus_display - margin_btw_stimuli) + margin_btw_stimuli));
            // stimuli_times encompasses all time event to start display a stimulus
            this.stimuli_times.push(start);
        }
    }

    find_position() {
        if (this.type == 'discrimination') {
            console.log('change_or');
            this.delta_orientation = random(0, 80);
        }
        do {
            this.r = random(this.other_objects[0].area_min + this.other_objects[0].radius,
                this.other_objects[0].area_max - this.other_objects[0].radius);
            this.theta = random(0, 2 * Math.PI);
            this.x = Math.round(this.r * Math.cos(this.theta));
            this.y = Math.round(this.r * Math.sin(this.theta));
        } while (!this.is_free_position())
    }

    is_free_position() {
        // check for free location considering other objects
        this.other_objects.forEach(function (item) {
            if (Math.sqrt((this.x - item.pos.x) ** 2 + (this.y - item.pos.y) ** 2) < item.radius) {
                return false;
            }
        }, this);
        return true
    }

    display_task() {
        if (this.display) {
            push();
            imageMode(CENTER);
            translate(this.x + windowWidth / 2, this.y + windowHeight / 2);
            // scale(0.15);
            image(this.image, 0, 0, banner_size_x, banner_size_y);
            pop();

            push();
            stroke('gold');
            strokeWeight(banner_stroke_weight);
            translate(this.x + windowWidth / 2, this.y + windowHeight / 2);
            // scale(this.in_img_scaling);
            // line(0, -this.image.height / 2, 0, this.image.height / 2);
            line(0, banner_size_y * (proportion_banner_line_height / 2), 0, -banner_size_y * (proportion_banner_line_height / 2));
            pop();
            // space btween branch is set to 1/6 of the image
            // let space = this.in_img_scaling * this.image.height / 6;
            let space = banner_size_y / 6;
            let hypo = (0.7*banner_size_x / 4)  / Math.cos(radians(this.delta_orientation));
            let opp = hypo * (Math.sin(radians(this.delta_orientation)));
            for (let i = 0; i < 5; i++) {
                if ((2 - i) * space - opp < -banner_size_y / 2) {
                    opp = -(-banner_size_y/ 2 - (2 - i) * space);
                    hypo = opp / (Math.sin(radians(this.delta_orientation)));
                } else {
                    hypo = (0.7*banner_size_x / 4) * (1 / Math.cos(radians(this.delta_orientation)));
                    opp = hypo * (Math.sin(radians(this.delta_orientation)));
                }
                push();
                stroke('gold');
                strokeWeight(2);
                translate(this.x + windowWidth / 2, this.y + windowHeight / 2 + (2 - i) * space);
                rotate(-radians(this.delta_orientation));
                // scale(0.07);
                line(0, 0, hypo, 0);
                pop();

                push();
                stroke('gold');
                strokeWeight(2);
                translate(this.x + windowWidth / 2, this.y + windowHeight / 2 + (2 - i) * space);
                rotate(radians(this.delta_orientation));
                // scale(0.07);
                line(-hypo, 0, 0, 0);
                pop();
            }
        }
    }

    launch_sequence_of_windows_timer() {
        this.timer_pause();
        // start first window
        setTimeout(this.update_index_window.bind(this), this.window_size);
    }

    timer_display() {
        this.time_start_display = Date.now();
        // start display during response_window mseconds
        // If timer_disp is finished, just stop to display stimulus
        this.timer_disp_id = setTimeout(this.stop_display_stimulus.bind(this), this.display_time);
        // If timer_response finished, store results
        this.timer_response_window = setTimeout(this.pause_till_end_window.bind(this), this.response_window);
    }

    pause_till_end_window() {
        // Push results when no click:
        error_sound.play();
        this.save_last_trial(0);
        this.in_response_window = false;
    }

    stop_display_stimulus() {
        // This method is called to stop displaying stimulus
        // After display_time (500ms) or if participant has clicked
        this.display = false;
    }

    timer_pause() {
        setTimeout(this.start_display.bind(this), this.stimuli_times[this.current_banner_id]);
    }

    update_index_window() {
        this.current_time = Date.now();
        // Method called when window time is over
        // Pass to next window banner:
        this.current_banner_id++;
        if (this.current_banner_id < this.nbanners) {
            // launch a new timer for window if there is still banners to present
            setTimeout(this.update_index_window.bind(this), this.window_size);
            // launch a new timer for pause before start displaying the stimulus
            this.timer_pause();
        }
    }

    keyboard_pressed(key_value) {
        // if keyboard_press and the banner is displayed ->
        if (this.in_response_window) {
            if (this.type == "detection") {
                if (key_value == 32) {
                    // Participant has answered, stop response window and display timer
                    clearTimeout(this.timer_disp_id);
                    clearTimeout(this.timer_response_window)
                    correct_sound.play();
                    // store results
                    this.save_last_trial(1)
                    // this.display might already been set to false
                    this.display = false;
                    this.in_response_window = false;
                }
            } else if (this.type == "discrimination") {
                // DISCRIMININATION IS NOT WORKING !!
                // if key == 'S':
                if (key_value == 83) {
                    this.display = false;
                    if (this.delta_orientation > 30) {
                        // wrong key pressed:
                        error_sound.play();
                        this.results.push([this.delta_orientation, Date.now() - this.time_start_display, 0]);
                    } else {
                        // Correct key pressed:
                        correct_sound.play();
                        this.results.push([this.delta_orientation, Date.now() - this.time_start_display, 1]);
                    }
                    clearTimeout(this.timer_disp_id);
                    this.available_time -= (Date.now() - this.time_start_display);
                    this.timer_pause();
                    // else if key == 'f':
                } else if (key_value == 70) {
                    this.display = false;
                    if (this.delta_orientation > 30) {
                        // correct key pressed:
                        correct_sound.play();
                        this.results.push([this.delta_orientation, Date.now() - this.time_start_display, 0]);
                    } else {
                        // wrong key pressed:
                        error_sound.play();
                        this.results.push([this.delta_orientation, Date.now() - this.time_start_display, 1]);
                    }
                    clearTimeout(this.timer_disp_id);
                    this.pause_till_end_window();
                }
            }
        }
    }

    save_last_trial(ans) {
        // For detection: ans can be 1 (hit correct), 0 (no hit)
        // For discrimination: ans can be 1 (hit correct), 0 (hit false), -1 (no hit)
        let RT = Date.now() - this.time_start_display;
        this.results.push([this.nbanners,
            this.response_window,
            this.delta_orientation,
            this.stimuli_times,
            RT,
            ans]);
    }

    start_display() {
        // if available time left:
        this.find_position();
        this.display = true;
        this.in_response_window = true;
        // launch timer for display:
        this.timer_display();
    }

    get_nb_correct_answers(){
        let nb_correct = 0;
        this.results.forEach(
            (ans_array) => {
                if(ans_array.slice(-1)[0]===1){
                    nb_correct ++;
                }
            }
        )
        return nb_correct
    }
}


// start_pause() {
//     // function used to start pause
//     if (!this.display) {
//         // user has found object so it's not displayed anymore:
//         console.log("problem, timer hasn't been really reset")
//     } else {
//         this.results.push([this.delta_orientation, this.response_window, 0]);
//         this.display = false;
//         this.available_time -= this.response_window;
//         this.timer_pause();
//     }
// }


