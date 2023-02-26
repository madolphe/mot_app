class TimeManager {
    constructor() {
        this.starttime_exp = Date.now();
        this.starttime_block = null;
        // functions with all function to display scenes:
        this.current_index_scene = 0;
        this.display_scenes_functions = [
            scene_instruction,
            scene_tutorial1, scene_tutorial2, scene_tutorial3, scene_tutorial4, scene_tutorial5, scene_tutorial6,
            scene_tutorial7, scene_tutorial8, scene_tutorial9,
            scene_press_space_bar, scene_stimuli_presentation, scene_mask, scene_answer, scene_quit]
        this.frame_count = 0;
        this.nb_tutorial_scenes = 9;
        this.practice_in_tutorial = 0;
        this.tuto_stage = 1;
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
            case 4:
                button_previous.hide();
                break;
            case 5:
                button_next.hide();
                button_previous.show();
                this.tuto_stage++;
                this.practice_in_tutorial = 0;
                break;
            case 6:
                button_next.hide();
                button_previous.hide();
                this.tuto_stage++;
                this.practice_in_tutorial = 0;
                break;
            case 7:
                button_next.show();
                button_previous.hide();
                break;
            case 8:
                this.tuto_stage++;
                this.practice_in_tutorial = 0;
                button_next.hide();
                break;
            case 9:
                button_start.show();
                button_previous.hide();
                button_next.hide();
                break;
            case 1 + this.nb_tutorial_scenes:
                // Press Space Bar
                button_next.hide();
                button_previous.hide();
                this.reset_counters();
                break;
            case 2 + this.nb_tutorial_scenes:
                // Stimulus presentation - idle time is how long the participant stayed in previous screen
                Params.idle_time_trial = Date.now() - Time.time_scene_start;
                this.reset_counters();
                break;
            case 3 + this.nb_tutorial_scenes:
                // Mask scene
                Params.measured_difficulty_trial = Date.now() - Time.time_scene_start - Params.onset_stimulus_duration*(100/6) ;
                Params.measured_frame_count = Time.frame_count - Params.onset_stimulus_duration;
                this.reset_counters();
                break;
            case 4 + this.nb_tutorial_scenes:
                // Answer scene
                this.reset_counters();
                break;
            case 5 + this.nb_tutorial_scenes:
                // Loop -> get back to "press bar scene":
                this.current_index_scene = 1 + this.nb_tutorial_scenes;
                Params.next_trial();
                if (Params.flag_end_game) {
                    // End participant session
                    this.current_index_scene = 5 + this.nb_tutorial_scenes;
                    button_end.show();
                }
                break;
        }
    }

    previous() {
        this.current_index_scene--;
        switch (this.current_index_scene) {
            case 1:
                button_previous.hide();
                break;
            case 2:
                button_next.show();
                Time.tuto_stage = 1;
                break;
            case 4:
                button_previous.hide();
                button_next.show();
                this.practice_in_tutorial = 0;
                Time.tuto_stage --;
                break;
            case 5:
                this.practice_in_tutorial = 4;
                Time.tuto_stage --;
                button_next.show();
                break;
            case 7:
                Time.tuto_stage --;
                button_next.show();
                button_previous.hide();
                break;

        }
    }

    update_tutorial() {
        this.practice_in_tutorial++;
        switch (this.practice_in_tutorial) {
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
                if (Params.last_activity_correctness()) {
                    Params.nb_practice_success++
                }
                this.practice_in_tutorial = 0;
                switch (this.tuto_stage) {
                    case 1:
                        if (!(Params.nb_practice_success >= nb_success_tuto)) {
                            Params.last_pressed_answer = null;
                            Params.update_random_stimulus_practice();
                            Params.activity_answer = [];
                        } else {
                            button_next.show();
                            button_previous.hide();
                            // reset all useful parameters:
                            Params = new ParameterManager();
                            this.practice_in_tutorial = 4;
                        }
                        break;
                    case 2:
                        if (!(Params.nb_practice_success >= nb_success_tuto)) {
                            Params.last_clicked_answer = [null, null];
                            Params.activity_answer = [];
                            Params.update_random_stimulus_practice();
                        } else {
                            button_next.show();
                            button_previous.hide();
                            // reset all useful parameters:
                            Params = new ParameterManager();
                            this.practice_in_tutorial = 4;
                        }
                        break;
                    case 3:
                        if (!(Params.nb_practice_success >= nb_success_tuto)) {
                            Params.last_clicked_answer = [null, null];
                            Params.last_pressed_answer = null;
                            Params.update_random_stimulus_practice();
                            Params.activity_answer = [];
                        } else {
                            button_next.show();
                            button_previous.hide();
                            // reset all useful parameters:
                            Params = new ParameterManager();
                            this.practice_in_tutorial = 4;
                        }
                    case 4:
                        if (!(Params.nb_practice_success >= nb_success_tuto)) {
                            Params.last_clicked_answer = [null, null];
                            Params.last_pressed_answer = null;
                            Params.update_random_stimulus_practice();
                            Params.activity_answer = [];
                        } else {
                            button_next.show();
                            // reset all useful parameters:
                            Params = new ParameterManager();
                            this.practice_in_tutorial = 4;
                        }
                }
                break;
        }
    }

    reset_counters() {
        this.frame_count = 0;
        this.time_scene_start = Date.now();
    }

    start() {
        this.starttime_block = Date.now();
    }
    count() {
        this.frame_count++;
    }

    count_response() {
        // Calculate the reaction time of the participant
        Params.tmp_rt = (Date.now() - this.starttime_block);
    }
}
  