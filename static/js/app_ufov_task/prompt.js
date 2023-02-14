let prompt_start, prompt_gratitude, prompt_button_end, prompt_button_restart, prompt_button_click;
let text_title_0, text_tutorial_0_0, text_tutorial_0_1, text_tutorial_0_2, text_tutorial_0_3;
let text_tutorial_1_0, text_tutorial_2_0, text_tutorial_3_0, text_tutorial_3_1, text_tutorial_3_2,
    text_tutorial_4_0,text_tutorial_4_1,text_tutorial_4_2,text_tutorial_4_3,
    text_tutorial_5_0, text_tutorial_5_1, text_tutorial_5_2, text_tutorial_6_1, text_tutorial_6_2;
let text_start, text_end;
let text_button_next, text_button_previous, text_button_start;
let text_tutorial_6_3, text_tutorial_6_4, text_press_bar;


if (language_code === 'fr') {
    prompt_start = "Cliquez sur la souris pour débuter l'activité";
    prompt_gratitude = "Merci d'avoir participé à l'expérience";
    prompt_button_end = "FIN";
    prompt_button_restart = "Redémarrer";
    prompt_button_click = "Cliquer dans l'ordre";
    // TUTORIAL
    text_title_0 = "INSTRUCTIONS";
    text_tutorial_0_0 = "This task requires you to attend to objects on the screen.";
    text_tutorial_0_1 = "We will explain the process step by step.";
    text_tutorial_1_0 = "In the center of the screen, a letter will be quickly shown.";
    text_tutorial_1_1 = "It will either be N or M.";

    text_tutorial_2_0 = "Position your fingers on the key F and G of your keyboard.";
    text_tutorial_2_1 = "If the letter N appears click on F.";
    text_tutorial_2_2 = "If the letter M appears click on G.";

    text_tutorial_3_0 = "There will also be a star that appears at one of 8 locations around the center.";
    text_tutorial_3_1 = "You will need to remember along which line it was displayed.";
    text_tutorial_3_2 = "All 8 locations are displayed below along with the corresponding line.";

    text_tutorial_4_0 = "After the star flashes, click on the line where it appeared.";
    text_tutorial_4_1 = "A blue circle or a red cross will appear where you clicked.";
    text_tutorial_4_2 = "If nothing appears, it is unclear which line you selected.";
    text_tutorial_4_3 = "Re-click somewhere else along the line until your choice accepted.";

    text_tutorial_5_0 = "In the real task, both the face and star will be shown simultaneously.";
    text_tutorial_5_1 = "Make sure you can get both right!.";
    text_tutorial_5_2 = "Try a few practice trials before continuing.";

    text_tutorial_6_1 = "Merci pour votre effort. Lorsque vous êtes prêts, ";
    text_tutorial_6_2 = "veuillez cliquer sur le bouton de \"Démarrer\" pour redémarrer";
    text_tutorial_6_3 = "Complètez encore";
    text_tutorial_6_4 = " bloc(s) pour finir le jeu.";
    // TASK
    text_start = "Veuillez cliquer sur la souris pour commencer cette expérience";
    text_end = "Merci de participer à l'expérience";
    text_button_next = "Suivant";
    text_button_previous = "Précédent";
    text_button_start = "Démarrer";
    text_press_bar = "Appuyez sur la barre espace pour débuter la tâche";
} else {
    prompt_start = "Please click the mouse to start this experiment";
    prompt_gratitude = "Thank you for joining the experiment.";
    prompt_button_end = "END";
    prompt_button_restart = "RESTART";
    prompt_button_click = "Click in order";
    // TUTORIAL
    text_title_0 = "INSTRUCTIONS";
    text_tutorial_0_0 = "This task requires you to attend to objects on the screen.";
    text_tutorial_0_1 = "We will explain the process step by step.";
    text_tutorial_1_0 = "This is an example of stimulus presentation.";
    text_tutorial_2_0 = "Your task is to click the buttons placed on the target disc positions.";
    text_tutorial_3_0 = "Let's start the practices.";
    text_tutorial_4_0 = "Let's start the main experiment.";
    text_tutorial_5_0 = "Break time.";
    text_tutorial_6_1 = "Thank you for your effort. When you are ready,";
    text_tutorial_6_2 = "please click the start button to restart.";
    text_tutorial_6_3 = "Complete ";
    text_tutorial_6_4 = " more block(s) to finish the game.";
    // TASK
    text_start = "Please click the mouse to start this experiment";
    text_end = "Thank you for joining the experiment.";
    text_button_next = "Next";
    text_button_previous = "Previous";
    text_button_start = "Start";
    text_press_bar = "Press the space bar to start";
}