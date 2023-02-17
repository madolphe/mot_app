class ParameterManager {
    constructor() {
        // Block management
        this.flag_block = false;
        this.flag_end_game = false;
        // Stimuli parameters
        this.eccentricity_trials = shuffle([].concat(...tmp_eccentricity_trials));
        this.central_stimulus_trials = shuffle([].concat(...tmp_central_stimulus));
        this.directions_trials = shuffle([].concat(...tmp_direction));
        this.onset_stimulus_duration = 50;
        this.trial_index = 0;
        this.last_clicked_answer = [null, null];
        this.last_pressed_answer = null;
        this.idle_time_trial = null;
        this.measured_difficulty_trial = null;
        this.measured_frame_count = null;
        //save
        this.total_duration = null;
        this.activity_answer = [null, null];
        this.eccentricity_proposed = [];
        this.direction_proposed = [];
        this.screen_peripherical_target_proposed = [];
        this.central_target_proposed = [];
        this.difficulty_proposed = [];
        this.measured_difficulties_duration = [];
        this.measured_difficulties_frame_count = [];
        this.results = [];
        this.results_rt = [];
        this.instruction_scene_duration = [];
        this.idle_time = []
        // staircase
        this.step_staircase = 2;
        this.min_staircase = 1;
        this.max_staircase = 99;
        this.stimulus_duration_frame_count = 16;
        this.window_size = 1;
        this.nb_up = 3;
        this.nb_reversal = 0;
        this.nb_in_ceiling = 0;
        this.evolution_mode = null;
        this.stop_game_after_n_consecutive_ceiling_trials = 10;
        this.stop_game_after_n_reversals = 8;
        // tutorial
        this.nb_practice_success = 0;
        this.current_practice_stimulus = "N";
        this.direction_tuto = this.directions_trials[Math.floor(Math.random() * 10)];
        this.current_practice_periph_stimulus = this.random_peripheral_target_position(pos_practice_scene_y2);
    }

    next_trial() {
        // First push results in corresponding arrays:
        this.save();
        // Then update index trial and reset last_answers placeholders:
        this.trial_index++;
        this.last_clicked_answer = [null, null];
        this.last_pressed_answer = null;
        this.onset_stimulus_duration = Math.floor(Math.random() * 99);
        // Then update difficulty with staircase
        if (this.staircase_check()) {
            // staircase_check returns true if window_size counter has reached nb_up
            this.update_staircase(true);
            // reset counter of seq of true activities:
            this.window_size = 0;
        } else {
            // Otherwise it can lead to "do nothing" or "decrease staircase"
            if (this.window_size === 0) {
                // window_size = 0 means "last activity was a failure":
                this.update_staircase(false);
            }
            // else: "do nothing"
        }
        this.stop_conditions_check();
    }

    stop_conditions_check() {
        // Conditions to stop:
        // Check if trial index is above number of trials (i.e 72) then quit game:
        if (this.trial_index >= this.eccentricity_trials.length || this.trial_index >= nb_trials) {
            this.flag_end_game = true;
        }
        // Check if 10 consecutive trials at best:
        if (this.nb_in_ceiling > this.stop_game_after_n_consecutive_ceiling_trials) {
            this.flag_end_game = true;
        }
        if (this.nb_reversal > this.stop_game_after_n_reversals) {
            this.flag_end_game = true;
        }
    }

    staircase_check() {
        // 3up-1down algorithm
        // If 1 mistake directly decrese
        if (!this.last_activity_correctness()) {
            this.window_size = 0;
            return false
        } else {
            // This is not a mistake increment counter
            this.window_size++;
            return this.window_size === this.nb_up;
        }
    }

    update_staircase(increase_difficulty) {
        if (this.nb_reversal > 2) {
            this.step_staircase = 1;
        }
        if (!increase_difficulty) {
            // if this.evolution_mode is null, set to first reversal:
            if (!this.evolution_mode) {
                this.evolution_mode = "decreasing"
            } else {
                if (this.evolution_mode === "increasing") {
                    // This is a reversal, count it:
                    this.nb_reversal++;
                    this.evolution_mode = null;
                }
            }
            if (this.stimulus_duration_frame_count + this.step_staircase <= this.max_staircase) {
                this.stimulus_duration_frame_count += this.step_staircase;
                // as soon as you are not on a max, get back to 0 consecutive trials at max:
                this.nb_in_ceiling = 0;
            } else {
                this.stimulus_duration_frame_count = this.max_staircase;
                this.nb_in_ceiling++;
            }
        } else {
            // if this.evolution_mode is null, set to first reversal:
            if (!this.evolution_mode) {
                this.evolution_mode = "increasing"
            } else {
                // evolution_mode is already a string:
                if (this.evolution_mode === "decreasing") {
                    // This is a reversal, count it:
                    this.nb_reversal++;
                    this.evolution_mode = null;
                }
            }
            if (this.stimulus_duration_frame_count - this.step_staircase >= this.min_staircase) {
                this.stimulus_duration_frame_count -= this.step_staircase;
                this.nb_in_ceiling = 0;
            } else {
                this.stimulus_duration_frame_count = this.min_staircase;
                this.nb_in_ceiling++;
            }
        }
    }

    save() {
        // save the current result.
        // Current condition:
        this.eccentricity_proposed.push(this.eccentricity_trials[this.trial_index]);
        this.direction_proposed.push(this.directions_trials[this.trial_index]);
        this.screen_peripherical_target_proposed.push(this.peripherical_target_position());
        this.central_target_proposed.push(this.central_stimulus_trials[this.trial_index]);
        this.difficulty_proposed.push(this.stimulus_duration_frame_count);
        this.measured_difficulties_duration.push(this.measured_difficulty_trial);
        this.measured_difficulties_frame_count.push(this.measured_frame_count);
        this.idle_time.push(this.idle_time_trial);
        // Response:
        this.results.push([this.activity_answer[0], this.activity_answer[1]]);
        // Reaction time and idle time:
        this.instruction_scene_duration.push(this.idle_time_trial);
        this.results_rt.push(this.time_to_answer);
        console.log(this.activity_answer, this.results);
    }

    last_activity_correctness() {
        // returns true if both (central + peripheral task) answer are correct
        return this.activity_answer[0] && this.activity_answer[1]
    }

    peripherical_target_position() {
        const eccentricity_ppd = this.eccentricity_trials[this.trial_index] * ppd
        const direction = this.directions_trials[this.trial_index]
        const pos_x = Pos.center_x + eccentricity_ppd * Math.cos(direction);
        const pos_y = Pos.center_y - eccentricity_ppd * Math.sin(direction);
        return [pos_x, pos_y]
    }

    random_peripheral_target_position(centery) {
        // const eccentricity_ppd = 7 * ppd
        const eccentricity_ppd = tuto_ecc_target * ppd
        const pos_x = Pos.center_x + eccentricity_ppd * Math.cos(this.direction_tuto);
        const pos_y = centery - eccentricity_ppd * Math.sin(this.direction_tuto);
        return [pos_x, pos_y]
    }

    get_clicked_response(X, Y, centery, ecc_target, dir_target) {
        this.last_clicked_answer = [X, Y];
        X = X - Pos.center_x;
        Y = centery - Y;
        // first retrieve distance (in degrees):
        let distance = Math.sqrt(X ** 2 + Y ** 2) / ppd
        if (distance < 2 || distance > 9) {
            this.last_clicked_answer = [null, null];
        }
        const closest_distance = distances.reduce((a, b) => {
            return Math.abs(b - distance) < Math.abs(a - distance) ? b : a;
        });
        // Then direction:
        let angle = Math.atan2(Y, X)
        if (angle < 0) {
            angle = 2 * Math.PI + angle
        }
        let closest_direction = directions_closest.reduce((a, b) => {
            return Math.abs(b - angle) < Math.abs(a - angle) ? b : a;
        });
        if (closest_direction === 2 * pi) {
            closest_direction = 0
        }
        this.activity_answer[1] = closest_distance === ecc_target && closest_direction === dir_target;
        this.check_answer_status();
    }

    get_pressed_key_response(keycode, target) {
        this.last_pressed_answer = keycode
        this.activity_answer[0] = keycode === this.transform_into_key(target);
        console.log("KEYCODE:", keycode);
        console.log("ACTIVITY ANS", this.activity_answer);
        this.check_answer_status();
    }

    transform_into_key(letter) {
        if (letter === "N") {
            return 70
        }
        return 71
    }

    check_answer_status() {
        // When both responses are provided, reset timer
        if (this.last_pressed_answer && this.last_clicked_answer[0]) {
            this.time_to_answer = (Date.now() - Time.time_scene_start);
            Time.reset_counters();
        }
    }

    update_random_stimulus_practice(){
        this.direction_tuto = this.directions_trials[Math.floor(Math.random() * 10)];
        this.current_practice_periph_stimulus = this.random_peripheral_target_position(pos_practice_scene_y2);
        this.current_practice_stimulus = this.central_stimulus_trials[Math.floor(Math.random() * 10)];
    }
    save_and_quit() {
        this.total_duration = Date.now() - Time.starttime_block;
        let params = {
            'eccentricity_proposed': this.eccentricity_proposed,
            'direction_proposed': this.direction_proposed,
            'screen_peripherical_target_proposed': this.screen_peripherical_target_proposed,
            'central_target_proposed': this.central_target_proposed,
            'difficulty_proposed': this.difficulty_proposed,
            'measured_difficulties_duration': this.measured_difficulties_duration,
            'measured_difficulties_frame_count': this.measured_difficulties_frame_count,
            'results': this.results,
            'instruction_scene_duration': this.instruction_scene_duration,
            'results_rt': this.results_rt,
            'experiment_duration': this.total_duration
        }
        if (exit_view === "flowers_demo" || debug) {
            exportCSV(params, "; ", "ufov_data")
        }
        return params
    }
}