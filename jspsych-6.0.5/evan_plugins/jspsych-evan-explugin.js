
jsPsych.plugins["evan-two-stim-choice"] = (function() {
  // the name above is how we'll reference this

  var plugin = {};

  plugin.info = {
    // the name here should be the same
    name: "evan-two-stim-choice",
    parameters: {
        // these are parameters that the plug_in takes in...
        c1_reward: { // c1 reward value
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        c2_reward: { // c2 reward value
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        c1_image: { // c1 image path (as a string)
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
        },
        c2_image: { // c2 image path (as a string)
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
      }
    }
 }

  plugin.trial = function(display_element, trial) {

    ///////////////////////////////////////////////////////////////////////////
    ///////////////// DEFINE SOME CONSTANTS ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////

    // keys for left and right
    // note that placing "var" defines the scope to be within this function
    // if we don't use var, the variable is global
    // then we can access it from functions "above" this one.
    var choose_left_key = '1';
    var choose_right_key = '2';

    // get the screen width and height size -
    // based on their window size
    var parentDiv = document.body;
    var w = parentDiv.clientWidth;
    var h = parentDiv.clientHeight;

    var choice_img_width = w/5;
    var choice_img_height = w/5;

    // define structures for variables we might record so that if the trial ends, but we haven't defined these yet, the task doesn't break
    var response = {
        rt: null,
        key: null,
        key_press_num: null,
        chosen_side: null,
      };
    // define a reward they got which we'll also record
    var reward_val = null;

    ///////////////////////////////////////////////////////////////////////////
    ///////////////// PLACE THE SVG CANVAS AND BACKGROUND ON WHICH WE'll DRAW THINGS ////
    //////////////////////////////////////////////////////////////////////////

    // place the svg -- this is like a canvas on which we'll draw things
    //  a bit on using d3 for this:
    // html webpages are split into "divs" that have class names
    // jspsych creates a webpage that has a "div" called the "content wrapper", which is where the content goes
    // in the html, it looks like this: <div class="jspsych-content-wrapper">
    // we reference class names by placing a "." in front of them
    // select that class and place the svg canvas within it
    d3.select(".jspsych-content-wrapper")   //  select the part of html in which to place it (.jspsych-content-wrapper is defined by jspsych )
                .append("svg") // append an svg element
                .attr("width", w) // specify width and height
                .attr("height", h)

    // place a black background rectangle over the whole svg
    // here's a link for all the things you can place with d3 (and a whole tutorial on using it)
    // https://www.dashingd3js.com/svg-basic-shapes-and-d3js
    d3.select("svg").append("rect")
          .attr("x", 0).attr("y", 0).attr("width", w) // 0, 0 is top left of the "svg" canvas
          .attr("height", h).style("fill", 'black').style("opacity",.7);

    ///////////////////////////////////////////////////////////////////////////
    ///////////////// START THE TRIAL ////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////

    // wait 1000 msec, and then call first part of trial (this is the first thing called after initial display)
    jsPsych.pluginAPI.setTimeout(function() {
      display_choice_stim_wait_for_response();
    }, 1000); // this is where the ITI goes


    ///////////////////////////////////////////////////////////////////////////
    ///////////////// FUNCTIONS WHICH RUN the TRIAL ///////////////////////////
    //////////////////////////////////////////////////////////////////////////


    // The functions are:
    // display_choice_stim_wait_for_response: this places choice stimuli and also sets up a "response handler", which calls the next fun when they respond
    // handle response: this just records some things about their response, runs some animations and then calls next function
    // display outcome: this displays the outcome (0 or 1)
    // end trial: this records the data and shuts down the SVG and ends the trial

    // function to place the choice stims and wait for a response (we call this at the bottom)
    var display_choice_stim_wait_for_response = function(){

      // place choice left image - note how we reference trial.c1_image - this is the image string that was passed in representing this image
      // note how we define the image class. this lets us reference it later so that we can animate it
      d3.select("svg").append("svg:image").attr("class", "cL").attr("x", w/3 - choice_img_width/2)
          .attr("y", h/2 - choice_img_height/2).attr("width",choice_img_width).attr("height",choice_img_height)
          .attr("xlink:href", trial.c1_image).style("opacity",1);

      // place choice right image
      d3.select("svg").append("svg:image").attr("class", "cR").attr("x", 2*w/3 - choice_img_width/2)
          .attr("y", h/2 - choice_img_height/2).attr("width",choice_img_width).attr("height",choice_img_height)
          .attr("xlink:href", trial.c2_image).style("opacity",1);

      // place text with choice instructions, "choice prompt": this is how you place text...
      d3.select("svg").append("text")
                    .attr("class", "choice text")
                    .attr("x", w/2)
                    .attr("y", 7*h/8)
                    .attr("font-family","Helvetica")
                    .attr("font-weight","light")
                    .attr("font-size",h/40)
                    .attr("text-anchor","middle")
                    .attr("fill", "white")
                    .style("opacity",1)
                    .text('Press 1 for LEFT machine or 2 for RIGHT machine')


      // define valid responses - these keys were defined above
      var valid_responses = [choose_left_key, choose_right_key];

      // jspsych function to listen for responses
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handle_response, // call handle_response if valid response is entered
          valid_responses: valid_responses, // defines which keys to accept
          rt_method: 'performance', //
          persist: false,
          allow_held_key: false
        });

      // define max response tiem - set timer to wait for that time (this will be turned off when they make a response)
      var max_response_time = 100000; // set to a very large value
        // wait some time and then end trial
      jsPsych.pluginAPI.setTimeout(function() {
          handle_slow_response();
        }, max_response_time);
    } // end display_choice_stim_wait for response

    // function to handle responses
    var handle_response = function(info){

      // clear timeout counting response time // relevant for if
      // a timer was set to limit the response time.
      jsPsych.pluginAPI.clearAllTimeouts();
      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // info is automatically passed into this and has response information
      if (response.key == null) {
          response = info;
      }

      // convert the choice key to a character
      var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);

      // this figures out which image was chosen and which wasn't
      // record the class name of the chosen image
      // CL is the left stimulus and CR is the right stimulus
      // we'll use this to move position of what they chose, and fade out what they ddn't choose
      if (choice_char == choose_left_key){ // if they chose left
        var chosen_class = '.cL'; // when we defined the images, we defined their class as "cL" and "cR"
        var unchosen_class = '.cR';
        // response is a global variable (no var in front of it)
        // this lets us reference it in the next function
        response.chosen_side = 1;
      }
      else if (choice_char == choose_right_key){ // if they chose right
        var chosen_class = '.cR';
        var unchosen_class = '.cL';
        response.chosen_side = 2;}
      else{console.log('SURPRISE');} // write to console...

      // change opacity of what they didn't choose over 350 msec
      // d3 function .transition causes image to change to whatever follows it, over duration time
      d3.select(unchosen_class).transition().style('opacity',0).duration(350)

      // for 500 msec and then transition the chosen one to center of screen
      // transition to top center
      // note that in javascript functions don't wait for previous functions to finish before running
      // so we time it to include previous time. we could also trigger it to run when last one finished,
      // but i find that more complicated
      d3.select(chosen_class).transition().attr('y',h/10)
            .attr('x', w/2 - choice_img_width/2).duration(500);

      // wait for some amount of time (from response being made) and then call display outcome
      jsPsych.pluginAPI.setTimeout(function() {
          display_outcome();
        }, 1000); /// 1000 milliseconds after choice key...
    } // end handle response function

    // define function to handle responses that are too slow
    // a timeout which calls this function is set up in display-stimuli-wait-for-response
    // the handle response function kills that time-out. but if that doesn't happen before
    // the set time, this function is called
    var handle_slow_response = function(){
        jsPsych.pluginAPI.clearAllTimeouts();

        // place text 'please respond faster' in red
        d3.select("svg").append("text")
                  .attr("class", "outcome")
                  .attr("x", w/2)
                  .attr("y", h/2 + w/12)
                  .attr("font-family","monospace")
                  .attr("font-weight","bold")
                  .attr("font-size",w/24)
                  .attr("text-anchor","middle")
                  .attr("fill", "red")
                  .style("opacity",1)
                  .text('Please response faster')


        // record choice as 'slow'
        response.chosen_side = "SLOW";

        // wait some time and then end trial
        jsPsych.pluginAPI.setTimeout(function() {
            end_trial();
          }, 1000); // show slow response for 1000 milliseconds then end trial
        } // end handle slow response

      // function to display choice outcome // called by handle_response
      var display_outcome = function(){

        // trial.c1_reward trial.c2_reward and are passed in to plugin
        // they have higher scope, so can be referenced here.
        var bandit_rewards = [trial.c1_reward, trial.c2_reward];
        // declare reward_val as a global variable (no var in front of it)
        // thus it alters the value of reward_val defined in above scope instead
        // of creating a new var that only exists within this function
        reward_val = bandit_rewards[response.chosen_side - 1];

        // wait for some amount of time and display reward
        jsPsych.pluginAPI.setTimeout(function() {
          // display reward value
          d3.select("svg").append("text")
                    .attr("class", "outcome")
                    .attr("x", w/2)
                    .attr("y", h/2 + w/12)
                    .attr("font-family","Helvetica")
                    .attr("font-weight","light")
                    .attr("font-size",w/8)
                    .attr("text-anchor","middle")
                    .attr("fill", "silver")
                    .text(reward_val)
                    .style("opacity",0)
                    .transition()
                    .style("opacity",1)
                    .duration(350) // fade reward in over 350 ms
          }, 500); // this runs wait 500 then show reward

          // wait some time and then end trial
          jsPsych.pluginAPI.setTimeout(function() {
              end_trial();
        }, 2500); // end trial 2500 msec after display_outcome is called
      } // end display outcome

    /// functon to end trial, save data,
    var end_trial = function(){

      // kill the keyboard listener, if you haven't yet
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // remove the canvas and everthing within it
      d3.select('svg').remove()

      // record trial data in json
      var trial_data = {
        "key_press_num": response.key,
        "chosen_side": response.chosen_side,
        "reward": reward_val,
        "rt": response.rt,
      };
      // print this to the browser console -- for debugging
      console.log(trial_data)

      // record data, end trial
      jsPsych.finishTrial(trial_data);
    } // end end_trial()
  }; // end plugin.trial

  return plugin;
})();
