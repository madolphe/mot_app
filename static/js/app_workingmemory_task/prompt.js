let prompt_start, prompt_gratitude, prompt_button_end, prompt_button_restart, prompt_button_click;
let text_title_0, text_tutorial_0_0, text_tutorial_0_1, text_tutorial_0_2, text_tutorial_0_3;
let text_tutorial_1_0, text_tutorial_2_0, text_tutorial_3_0, text_tutorial_4_0, text_tutorial_5_0, text_tutorial_6_1, text_tutorial_6_2;
let text_start, text_end;
let text_button_next, text_button_previous, text_button_start;
let text_tutorial_6_3, text_tutorial_6_4;
let button_end_label;


if(language_code==='fr'){
    button_end_label = "Attendez...";
    prompt_start = "Cliquez sur la souris pour débuter l'activité";
    prompt_gratitude = "Merci d'avoir participé à l'expérience";
    prompt_button_end = "FIN";
    prompt_button_restart = "Redémarrer";
    prompt_button_click = "Cliquer dans l'ordre";
    // TUTORIAL
    text_title_0 = "INSTRUCTIONS" ;
    text_tutorial_0_0 = "Le but de cette expérience est de mesurer votre capacité de mémoire.";
    text_tutorial_0_1 = "A chaque essai, vous verrez d'abord la séquence de changements de couleur " ;
    text_tutorial_0_2 = "pour les 16 objets. Votre tâche est de vous souvenir de ces changements et " ;
    text_tutorial_0_3 = "de signaler leur ordre de présentation en cliquant sur les boutons." ;
    text_tutorial_1_0 = "Ceci est un exemple de présentation de stimulus." ;
    text_tutorial_2_0 = "Votre tâche consiste à cliquer sur les boutons dans l'ordre de présentation que vous avez vu" ;
    text_tutorial_3_0 = "Commençons les exercices." ;
    text_tutorial_4_0 = "Commençons l'expérience principale." ;
    text_tutorial_5_0 = "Temps de pause." ;
    text_tutorial_6_1 = "Merci pour votre effort. Lorsque vous êtes prêts, " ;
    text_tutorial_6_2 = "veuillez cliquer sur le bouton de démarrage pour redémarrer." ;
    text_tutorial_6_3 = "Complètez encore" ;
    text_tutorial_6_4 = " bloc(s) pour finir le jeu." ;
    // TASK
    text_start = "Veuillez cliquer sur la souris pour commencer cette expérience." ;
    text_end = "Merci de participer à l'expérience." ;
    text_button_next = "Suivant";
    text_button_previous = "Précédent";
    text_button_start = "Démarrer"
}else{
    button_end_label = "Wait...";
    prompt_start = "Please click the mouse to start this experiment";
    prompt_gratitude = "Thank you for joining the experiment.";
    prompt_button_end = "END";
    prompt_button_restart = "RESTART";
    prompt_button_click = "Click in order";
    // TUTORIAL
    text_title_0 = "INSTRUCTIONS";
    text_tutorial_0_0 = "The goal of this experiment is to measure your memory ability.";
    text_tutorial_0_1 = "On each trial, you will first see the sequence of color changes ";
    text_tutorial_0_2 = "for the 16 objects. Your task is to remember these changes and ";
    text_tutorial_0_3 = "report their presentation order by button clicking.";
    text_tutorial_1_0 = "This is an example of stimulus presentation.";
    text_tutorial_2_0 = "Your task is to click the buttons in the forward order you saw.";
    text_tutorial_3_0 = "Let's start the practices.";
    text_tutorial_4_0 = "Let's start the main experiment.";
    text_tutorial_5_0 = "Break time.";
    text_tutorial_6_1 = "Thank you for your effort. When you are ready,";
    text_tutorial_6_2 = "please click the start button to restart.";
    text_tutorial_6_3 = "Complete " ;
    text_tutorial_6_4 = " more block(s) to finish the game." ;
    // TASK
    text_start = "Please click the mouse to start this experiment";
    text_end = "Thank you for joining the experiment.";
    text_button_next = "Next";
    text_button_previous = "Previous";
    text_button_start = "Start";
}