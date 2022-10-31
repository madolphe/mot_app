class ParameterManager {
    constructor() {
      // Stimulus parameters
      this.repetition = 0;
      this.ind_stimcond = 0;
      this.flag_block = false;
      this.flag_load = false;

      //save
      this.results_responses = [];
      this.results_rt = [];
      this.results_targetvalue_stim = [];
      this.results_speed_stim = [];
      this.results_num_target = [];
      this.results_ind_condition = [];
      this.results_correct = [];
      this.list_cond = []; //[num_target, speed_target]
      this.trial_stimcond = [];
      this.initialize();
    }

    initialize() {
        this.num_rep = num_rep_main;
        this.flag_buttoncheck = Array(num_totaldot).fill(0);

        //ConditionManager
        let num_cond = 0;
        for (let i=0; i < array_target_main.length; ++i) {
          for (let k=0; k < array_speed_main.length;++k){
            this.list_cond.push([array_target_main[i],array_speed_main[k]]);
            this.trial_stimcond.push(num_cond);
            num_cond = num_cond + 1;
          }
        }
          this.trial_stimcond = shuffle(this.trial_stimcond);
          this.num_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][0];
          this.speed_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][1];

          this.tmp_res_ob = [];
          this.tmp_rt = null;
    }

      pra_initialize(){
        this.list_cond = [];
        this.trial_stimcond = [];
        this.num_rep = num_rep_practice;
        //ConditionManager
        let num_cond = 0;
        for (let i=0; i < array_target_practice.length; ++i) {
          for (let k=0; k < array_speed_practice.length;++k){
            this.list_cond.push([array_target_practice[i],array_speed_practice[k]]);
            this.trial_stimcond.push(num_cond);
            num_cond = num_cond + 1;
          }
        }
        this.trial_stimcond = shuffle(this.trial_stimcond);
        this.num_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][0];
        this.speed_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][1];
      };
    next_trial() {
        this.save();
        //set the next trial parameters
        this.ind_stimcond ++;
        this.flag_load = false;
        this.tmp_res_ob = [];
        this.tmp_rt = null;
        this.flag_buttoncheck = Array(num_totaldot).fill(0);
        this.num_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][0];
        this.speed_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][1];
        if (this.ind_stimcond==this.list_cond.length-1){
          this.flag_block = true;
        }
    }

    next_block() {
        this.save();
        //set the next block parameters
        this.flag_load = false;
        this.tmp_res_ob = [];
        this.tmp_rt = null;
        this.flag_buttoncheck = Array(num_totaldot).fill(0);

        this.flag_block = false;
        this.repetition ++;
        this.trial_stimcond = shuffle(this.trial_stimcond);

        this.ind_stimcond = 0;
        this.num_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][0];
        this.speed_target = this.list_cond[this.trial_stimcond[this.ind_stimcond]][1];
      }

    save() {
        // save the current result.
        let tmp_ordercheck = 0;
        for (let i=0;i<this.tmp_res_ob.length;i++){
          if (this.tmp_res_ob[i]>this.num_target-1){
          } else{
            tmp_ordercheck ++;
          }
        }
        this.results_correct.push(tmp_ordercheck/this.tmp_res_ob.length);

        //console.log(this.results_correct)
        //console.log(tmp_ordercheck)

        this.results_responses.push(this.tmp_res_ob);
        this.results_rt.push(this.tmp_rt);
        this.results_speed_stim.push(this.speed_target);
        this.results_num_target.push(this.num_target);
        this.results_ind_condition.push(this.trial_stimcond[this.ind_stimcond]);
    }
}