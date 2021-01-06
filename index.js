
// this script constructs a 'timeline' - an array of structures where each
// structure references a 'plugin' that will be run, in that order

// which plugins we can call were loaded on the index.html page
// jspsych has lots of pre-defined plugins
// for this one, i made one called 'grid-episode-plugin', in the evan plugins folder

var timeline = [];

var full_screen = { // this plugin will prompt the full screen
  type: 'fullscreen',
  fullscreen_mode: true
};
timeline.push(full_screen)

/* define instructions trial */
// var instructions = {
  // there's multiple plugins for displaying instructions, for my task i use one where i show powerpoint slides
  //  it uses the jspsych instruction plugin
//  type: "html-keyboard-response",
//  stimulus: "<p>In this experiment, you'll choose between which of two slot machines " +
//      "to play.</p><p> Both slot machines have some chance at providing a reward. " +
//      "<p>Try to learn which slot machine is the most rewarding so you can get as many rewards as you can. </p> " +
//      "<div style='width: 700px;'>"+
//      "</div>"+
//      "<p>Press any key to begin.</p>",
//  post_trial_gap: 1000
//};
//timeline.push(instructions)

// WILL BE USEFUL LATER
// split these pictures to
// function splitArray(array, part) {
//    var tmp = [];
//    for(var i = 0; i < array.length; i += part) {
//        tmp.push(array.slice(i, i + part));
//    }
//    return tmp;
// }


// state images
// var state_images = ["Stimuli/Image_Stimuli/ball.png",
//                   "Stimuli/Image_Stimuli/barrel.png",
//                   "Stimuli/Image_Stimuli/binoculars.png",
//                   "Stimuli/Image_Stimuli/butterfly.png",
//                   "Stimuli/Image_Stimuli/car.png",
//                   "Stimuli/Image_Stimuli/fence.png",
//                   "Stimuli/Image_Stimuli/girl.png",
//                   "Stimuli/Image_Stimuli/house.png",
//                   "Stimuli/Image_Stimuli/key.png",
//                   "Stimuli/Image_Stimuli/marbles.png",
//                   "Stimuli/Image_Stimuli/pepper.png",
//                   "Stimuli/Image_Stimuli/scissors.png",
//                   "Stimuli/Image_Stimuli/suitcase.png",
//                   "Stimuli/Image_Stimuli/wallet.png",
//                   "Stimuli/Image_Stimuli/wire.png",
//                   "Stimuli/Image_Stimuli/zebra.png"
//                 ];

// GRID IMAGES FOR EACH POSITION -- CODE AS 2D matrix
// row / column
grid_images = [
  ["Stimuli/Image_Stimuli/ball.png", "Stimuli/Image_Stimuli/barrel.png", "Stimuli/Image_Stimuli/binoculars.png", "Stimuli/Image_Stimuli/butterfly.png"],
  ["Stimuli/Image_Stimuli/car.png", "Stimuli/Image_Stimuli/fence.png", "Stimuli/Image_Stimuli/girl.png", "Stimuli/Image_Stimuli/house.png"],
  ["Stimuli/Image_Stimuli/key.png","Stimuli/Image_Stimuli/marbles.png","Stimuli/Image_Stimuli/pepper.png","Stimuli/Image_Stimuli/scissors.png"],
  ["Stimuli/Image_Stimuli/suitcase.png", "Stimuli/Image_Stimuli/wallet.png", "Stimuli/Image_Stimuli/wire.png", "Stimuli/Image_Stimuli/zebra.png"]
];

// CODE REWARDS as 2D matrix
rewards = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 1, 0]
];

 // define 3
var n_choice_trials = 3;
// loop through each choice trial and push it to the array
for (var i = 0; i < n_choice_trials; i++){
  var choice_trial = { // this calls the plugin that i made in - jspsych-evan-explugin.js
    type: 'grid-episode',
    grid_images: grid_images,
    start_pos: [0 , 0], // start in top left
    state_rewards: rewards,
    trial_number: i+1
  }
  timeline.push(choice_trial);
}

//  run the exmperiment, do a local save of the results.
jsPsych.init({
    timeline: timeline,
    show_preload_progress_bar: false,
    on_finish: function() {
      jsPsych.data.get().localSave('csv','results.csv');
  }
});
