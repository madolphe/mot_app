let button_answer_label, button_play_label, button_exit_label, button_progress_label, button_back_label,
    button_pause_label, button_next_episode_label, button_keep_label, end_game_label;
let prompt_remaining_time, prompt_msg_0_0, prompt_msg_0_1, prompt_msg_1_0, prompt_msg_congrats, prompt_msg_2_0,
    prompt_msg_2_1, prompt_final_msg, prompt_msg_3_0, prompt_msg_3_1, prompt_msg_progression_0, prompt_msg_recal_0,
    prompt_msg_recal_1,
    prompt_msg_progression_1, prompt_msg_progression_2, prompt_msg_progression_3, prompt_msg_progression_4,
    prompt_msg_progression_5, prompt_msg_2_2, button_continue_label, prompt_msg_failed;

if (language_code === 'fr') {
    button_continue_label = 'CONTINUER';
    button_answer_label = 'REPONSE';
    button_play_label = 'DEMARRER';
    button_exit_label = 'SORTIE';
    button_pause_label = 'PAUSE';
    button_next_episode_label = 'EPISODE SUIVANT';
    button_keep_label = 'JOUER';
    button_progress_label = 'PROGRESSION';
    button_back_label = 'RETOUR';
    end_game_label = 'Fin du jeu: '
    prompt_remaining_time = 'TEMPS RESTANT';
    prompt_msg_0_0 = 'Vous avez retrouvé ';
    prompt_msg_0_1 = ' cible(s).';
    // prompt_msg_1_0 = '\n Malheureusement, il en manque ';
    prompt_msg_congrats = 'Mission réussie. Bien joué!';
    prompt_msg_failed = 'Mission échouée. Continuez!';
    prompt_msg_recal_0 = ' gobelins.'
    prompt_msg_recal_1 = ' guardes.'

    prompt_msg_2_0 = '\n Vous avez oublié ';
    prompt_msg_2_1 = ' cible(s).'
    prompt_msg_2_2 = '\n Cette mission échoue, faîtes mieux la prochaine fois!'
    prompt_msg_3_0 = '\n Malheureusement, vous avez aussi sélectionné ';
    prompt_msg_3_1 = ' guarde(s)! \n La mission échoue... Évitez les la prochaine fois!';
    prompt_final_msg = ' épisode(s) consécutif(s) joués. Continuez !';
    prompt_msg_progression_0 = 'Suivez ici votre progression dans le jeu.'
    prompt_msg_progression_1 = '\n Pour chacun des niveaux de difficulté, vous pouvez consulter votre niveau de compétence estimé grâce aux jauges vertes.'
    prompt_msg_progression_2 = '\n De plus, vous pouvez suivre le nombre de victoires pour chacun des niveaux grâce aux trophés situés en dessous.'
    prompt_msg_progression_3 = '\n Normalement, c\'est ici que vous suivez votre progession dans le jeu.'
    prompt_msg_progression_4 = '\n Pour le moment, nous calculons votre niveau de compétence.'
    prompt_msg_progression_5 = '\n Jouez encore quelques temps et revenez pour découvrir vos résultats !'
} else {
    button_continue_label = 'CONTINUE';
    button_answer_label = 'ANSWER';
    button_play_label = 'START';
    button_exit_label = 'EXIT';
    button_pause_label = 'BREAK';
    button_next_episode_label = 'NEXT EPISODE';
    button_keep_label = 'PLAY';
    button_progress_label = 'PROGRESS';
    button_back_label = 'BACK';
    end_game_label = 'End game: '
    prompt_remaining_time = 'TIME';
    prompt_msg_0_0 = 'You have retrieved ';
    prompt_msg_0_1 = ' target(s).';
    // prompt_msg_1_0 = '\n Unfortunately, you missed '
    prompt_msg_congrats = 'Mission success, congratulations! ';
    prompt_msg_failed = 'Mission failed, keep playing!'
    prompt_msg_recal_0 = ' goblins.';
    prompt_msg_recal_1 = ' guardes.';
    prompt_msg_2_0 = '\n You have missed ';
    prompt_msg_2_1 = ' target(s).';
    prompt_msg_3_0 = 'This mission failed... Unfortunately, you have also selected ';
    prompt_msg_3_1 = ' guard(s)! Try to avoid them next time.';
    prompt_final_msg = ' played episodes. Keep practicing !';
    prompt_msg_progression_0 = 'Here, follow your progress in the game.'
    prompt_msg_progression_1 = '\n For each difficulty level, you can see your estimated skill with the green progress bar.'
    prompt_msg_progression_2 = '\n Additionnaly, with the number of trophies, you can check the number of successful missions for each difficulty level.'
    prompt_msg_progression_3 = '\n Here, you will be able to track your progress.'
    prompt_msg_progression_4 = '\n Unfortunately, this option is not available at the moment as we are currently calculating your skill level'
    prompt_msg_progression_5 = '\n Play a few more times and come back to see your results !'
}