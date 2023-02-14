class TimeManager {
    constructor() {
        this.starttime_exp = Date.now();
        this.starttime_block = null;
        this.activetime_block = null;
        this.current_index_scene = 0;
        // functions with all function to display scenes:
        this.display_scenes_functions = [
            scene_instruction,
            scene_tutorial1, scene_tutorial2, scene_tutorial3,
            scene_press_space_bar, scene_stimuli_presentation, scene_mask, scene_answer]
        this.frame_count = 0;
        this.nb_tutorial_scenes = 3;
        this.practice_in_tutorial = 0;
    }

    show() {
        this.display_scenes_functions[this.current_index_scene]();
    }

    update() {
        this.current_index_scene++;
        switch (this.current_index_scene) {
            case 1:
                button_next.show();
                break;
            case 3:
                button_next.hide();
                break;
            case 1 + this.nb_tutorial_scenes:
                this.reset_counters();
                break;
            case 2 + this.nb_tutorial_scenes:
                Params.idle_time_trial = Date.now() - Time.time_scene_start;
                this.reset_counters();
                break;
            case 3 + this.nb_tutorial_scenes:
                this.reset_counters();
                break;
            case 4 + this.nb_tutorial_scenes:
                Params.measured_difficulty_trial = Date.now() - Time.time_scene_start;
                Params.measured_frame_count = Time.frame_count;
                this.reset_counters();
                break;
            case 5 + this.nb_tutorial_scenes:
                this.current_index_scene = 1;
                Params.next_trial();
                if (Params.flag_end_game) {
                    // End participant session
                    this.current_index_scene = 6;
                }
                break;
        }
    }

    previous(){
        this.current_index_scene--;
        switch (this.current_index_scene){
            case 1:
                button_previous.hide();
                break;
        }
    }

    update_tutorial(){
        this.practice_in_tutorial++;
        switch( this.practice_in_tutorial ){
            case 1:
                this.reset_counters();
                break;
            case 2:
                this.reset_counters();
                break;
            case 3:
                this.reset_counters();
                break;
            case 4:
                this.reset_counters();
                if(Params.last_activity_correctness()){Params.nb_practice_success++}
                if(!(Params.nb_practice_success >= 3)){
                    Params.last_pressed_answer = null;
                    Params.activity_answer = [];
                    this.practice_in_tutorial = 0;
                }else{
                    button_next.show();
                }
                break;
        }
    }

    reset_counters() {
        this.frame_count = 0;
        this.time_scene_start = Date.now();
    }

    start() {
        this.scene = this.scene_mainstart;
        this.starttime_block = Date.now();
    }

    repeat() {
        if (Params.flag_block == true) {
            Params.next_block();
            if (Params.repetition == Params.num_rep) {
                if (flag_practice == true) {
                    this.scene = this.tutorial_end;
                    button_start.show();
                    remove_hide_cursor_class();
                } else {
                    if (flag_break == true) {
                        this.scene = this.scene_break;
                        button_start.show();
                        remove_hide_cursor_class();
                    } else {
                        this.scene = this.scene_end;
                        button_end.show();
                        remove_hide_cursor_class();
                    }
                }
            } else {
                this.scene = this.scene_back;
            }
        } else {
            Params.next_trial();
            this.scene = this.scene_back;
        }
    }

    count() {
        // Calculate the duration since the target scene (block) started
        // this.activetime_block = (Date.now() - this.starttime_block);
        this.frame_count++;
    }

    count_response() {
        // Calculate the reaction time of the participant
        Params.tmp_rt = (Date.now() - this.starttime_block);
    }

    blockstart() {
        this.starttime_block = Date.now();
    }
}
  