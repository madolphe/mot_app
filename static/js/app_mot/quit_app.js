function quit_game(){
        // put here current results !
        fullscreen(false);
        // Put game status in parameter_dict:
        parameter_dict['game_end'] = game_end;
        if(!game_end){
            // User left game:
            parameter_dict['game_time'] = game_time;
        }
        post(quit_game_func_name, parameter_dict, 'post')
}
