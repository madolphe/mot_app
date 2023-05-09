let prompt_start, prompt_gratitude, prompt_button_end, prompt_button_restart, prompt_button_click;
let text_title_0, text_tutorial_0_0, text_tutorial_0_1, text_tutorial_0_2, text_tutorial_0_3;
let text_tutorial_1_0,text_tutorial_1_2, text_tutorial_2_0, text_tutorial_3_0, text_tutorial_3_1, text_tutorial_3_2,
    text_tutorial_4_0,text_tutorial_4_1,text_tutorial_4_2,text_tutorial_4_3,text_tutorial_4_4, text_tutorial_start_0, text_tutorial_start_1, text_tutorial_start_2,
    text_tutorial_5_0, text_tutorial_5_1, text_tutorial_5_2, text_tutorial_6_0, text_tutorial_6_1, text_tutorial_6_2;
let text_start, text_end, text_completed_practice, text_completed_practice_2;
let text_button_next, text_button_previous, text_button_start;
let text_tutorial_6_3, text_tutorial_6_4, text_press_bar;
let button_end_label;


if (language_code === 'fr') {
    button_end_label = "Attendez...";
    prompt_start = "Cliquez sur la souris pour débuter l'activité";
    prompt_gratitude = "Merci d'avoir participé à l'expérience";
    prompt_button_end = "FIN";
    // TASK
    text_start = "Veuillez cliquer sur la souris pour commencer cette expérience";
    text_end = "Merci de participer à l'expérience";
    text_button_next = "Suivant";
    text_button_previous = "Précédent";
    text_button_start = "Démarrer";
    text_press_bar = "Appuyez sur la barre espace pour débuter la tâche";

    // TUTORIAL
    text_title_0 = "INSTRUCTIONS";
    text_completed_practice = "Vous avez terminé cet exercice!";
    text_completed_practice_2 = "Appuyez sur suivant pour continuer.";

    text_tutorial_0_0 = "Cette tâche vous demande de vous concentrer sur des objets";
    text_tutorial_0_1 = "affichés à l'écran. Nous allons vous expliquer les règles pas à pas.";

    text_tutorial_1_0 = "Au milieu de l'écran, un visage sera affiché rapidement.";
    text_tutorial_1_1 = "Ce visage aura soit des cheveux courts (gauche) ou longs (droite).";
    text_tutorial_1_2 = "Vous devez retrouver celui qui présenté.";

    text_tutorial_2_0 = "Positionnez vos doigts sur les touches G et H du clavier.";
    text_tutorial_2_1 = "Cheveux courts = cliquez sur la touche G.";
    text_tutorial_2_2 = "Cheveux longs = cliquez sur la touche H.";

    text_tutorial_3_0 = "Une étoile apparaîtra sur l'une des 8 directions possibles.";
    text_tutorial_3_1 = "Il vous est demandé de vous rappeler la direction dans laquelle l'objet est apparu.";
    text_tutorial_3_2 = "Les 8 directions possibles sont numérotées le long des lignes ci-dessus.";

    text_tutorial_4_0 = "Après que l'étoile soit apparue, cliquez sur la ligne correspondante.";
    text_tutorial_4_1 = "Un cercle bleu (correct) ou une croix rouge (incorrect) apparaît à l'endroit ou vous cliquez.";
    text_tutorial_4_2 = "Si rien n'apparaît, la position cliquée n'appartient pas à la zone de jeu.";
    text_tutorial_4_3 = "Pratiquez quelques essais!";

    text_tutorial_5_0 = "Dans la tâche réel, l'étoile et le visage apparaîssent en même temps.";
    text_tutorial_5_1 = "Essayez de les observer ensemble!";
    text_tutorial_5_2 = "Pratiquez quelques essais avant de continuer.";

    text_tutorial_6_0 = "Augmentons une dernière fois la difficulté en ajoutant des carrés blancs.";
    text_tutorial_6_1 = "Votre mission est de les ignorer!";
    text_tutorial_6_2 = "Retrouvez l'emplacement de l'étoile.";
    text_tutorial_6_3 = "Pratiquez quelques essais avant de continuer.";

    text_tutorial_start_0 = "Vous avez suivi l'ensemble des consignes";
    text_tutorial_start_1 = "C'est maintenant le moment de jouer!";
    text_tutorial_start_2 = "Quand vous êtes prêts appuyez sur le bouton démarrer!";
} else {
    button_end_label = "Wait...";
    prompt_start = "Please click the mouse to start this experiment";
    prompt_gratitude = "Thank you for joining the experiment.";
    prompt_button_end = "END";
    text_start = "Please click the mouse to start this experiment";
    text_end = "Thank you for joining the experiment.";
    text_button_next = "Next";
    text_button_previous = "Previous";
    text_button_start = "Start";
    text_press_bar = "Press the space bar to start";
    // TUTORIAL
    text_title_0 = "INSTRUCTIONS";
    text_completed_practice = "You have completed the practice!";
    text_completed_practice_2 = "Click on next to continue.";
    text_tutorial_0_0 = "This task requires you to attend to objects on the screen.";
    text_tutorial_0_1 = "We will explain the process step by step.";
    text_tutorial_1_0 = "In the center of the screen, a smiley face will be quickly shown.";
    text_tutorial_1_1 = "It will either have short (left) or long (right) hair.";
    text_tutorial_1_2 = "You must determine which one is presented.";

    text_tutorial_2_0 = "Position your fingers on the key G and H of your keyboard. If the smiley with ";
    text_tutorial_2_1 = "- Short hair appears click on G.";
    text_tutorial_2_2 = "- Long hair appears click on H.";

    text_tutorial_3_0 = "There will also be a star that appears at one of 8 locations around the center.";
    text_tutorial_3_1 = "You will need to remember along which line it was displayed.";
    text_tutorial_3_2 = "All 8 locations are displayed below along with the corresponding line.";

    text_tutorial_4_0 = "After the star flashes, click on the line where it appeared.";
    text_tutorial_4_1 = "A blue circle or a red cross will appear where you clicked.";
    text_tutorial_4_2 = "If nothing appears, it is unclear which line you selected.";
    text_tutorial_4_3 = "Try a few practice trials before continuing.";

    text_tutorial_5_0 = "In the real task, both the face and the star will be shown simultaneously.";
    text_tutorial_5_1 = "Make sure you can get both right!";
    text_tutorial_5_2 = "Try a few practice trials before continuing.";

    text_tutorial_6_0 = "For one last increase in difficulty, squares will also apear around the center.";
    text_tutorial_6_1 = "You will need to ignore them!";
    text_tutorial_6_2 = "Pick out the location of the star.";
    text_tutorial_6_3 = "Try a few practice trials before continuing.";

    text_tutorial_start_0 = "You went through all the instructions";
    text_tutorial_start_1 = "It is now time to play!";
    text_tutorial_start_2 = "Once you are ready, click the Start button!";
}