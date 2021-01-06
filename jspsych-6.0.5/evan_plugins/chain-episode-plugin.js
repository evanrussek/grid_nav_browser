
jsPsych.plugins["chain-episode"] = (function() {
  // the name above is how we'll reference this

  var plugin = {};

  plugin.info = {
    // the name here should be the same
    name: "chain-episode",
    parameters: {
        // these are parameters that the plug_in takes in...
        state_images: { //
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
        },
        start_state_number: { // c2 reward value
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        next_state: { //
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        current_reward_category: { //
          type: jsPsych.plugins.parameterType.STRING,
          default: undefined
        },
        current_terminate_color: { //
          type: jsPsych.plugins.parameterType.STRING,
          default: undefined
        },
        state_colors: { //
          type: jsPsych.plugins.parameterType.STRING,
          default: undefined
        },
        state_categories: { //
          type: jsPsych.plugins.parameterType.STRING,
          default: undefined
        },
        trial_number: { //
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        }
    }
 }

  plugin.trial = function(display_element, trial) {

    ///////////////////////////////////////////////////////////////////////////
    ///////////////// DEFINE SOME CONSTANTS ///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////

    // keys for accept and reject
    // note that placing "var" defines the scope to be within this function
    // if we don't use var, the variable is global
    // then we can access it from functions "above" this one.
    var accept_key = 'a';
    var reject_key = 'r';


    // get the screen width and height size -
    // based on their window size
    var parentDiv = document.body;
    var w = parentDiv.clientWidth;
    var h = parentDiv.clientHeight;

    // image sizes
    var choice_img_width = w/5;
    var choice_img_height = w/5;

    // define structures for variables we might record so that if the trial ends, but we haven't defined these yet, the task doesn't break
    var response = {
        rt: null,
        key: null,
        key_press_num: null,
        accept: null,
      };

    // default rewrad val (to record in case trial time lapses)
    var reward_val = 0;

    // current reward and terminal categories / colrs
    var current_reward_category = trial.current_reward_category;
    var current_terminate_color = trial.current_terminate_color;

    // list of all state colors and categories
    var state_colors = trial.state_colors;
    var state_categories = trial.state_categories;

    // set current state number
    var state_number = trial.start_state_number;
    // note that this is the first state in a sequence
    var first_state = true;

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
          .attr("height", h).style("fill", "gray").style("opacity",.435);

    ///////////////////////////////////////////////////////////////////////////
    ///////////////// START THE TRIAL ////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////

    // wait 2000 msec, and then call first part of trial (this is the first thing called after initial display)
    jsPsych.pluginAPI.setTimeout(function() {
      //display_choice_stim_wait_for_response();
      display_state(show_reward = false);
    }, 2000); // this is where the ITI goes


    ///////////////////////////////////////////////////////////////////////////
    ///////////////// FUNCTIONS WHICH RUN the TRIAL ///////////////////////////
    //////////////////////////////////////////////////////////////////////////


    // The functions are:
    // display_state: displayes the image - optional input for whether to collect response, show prompts,
    // handle response: records response, updates text and calls transition
    // transition: records data, updates state, either calls display next state or ends trial
    // end trial: this ends the trial

    // function to place the choice stims and wait for a response (we call this at the bottom)
    //this_image = trial.c1_image;
    // reward_val = 10;


    var display_state = function(show_reward = true, show_action_prompt = true, show_trial_prompt = true, collect_response = true){

      ///////////////////////////////////////
      // Place the state image
      var im_opacity = 1; // lower opacity for sequence after reject
      if (show_reward & !response.accept)
      {
        im_opacity = .5;
      }

      this_image = trial.state_images[state_number]; // global so that next trials can access

      d3.select("svg").append("svg:image").attr("class", "state image").attr("x", w/2 - choice_img_width/2)
          .attr("y", h/2 - choice_img_height/2).attr("width",choice_img_width).attr("height",choice_img_height)
          .attr("xlink:href", this_image).style("opacity",im_opacity);

      /////////////////////
      // Display the Reward
      if (show_reward){

        // figure out
        if (current_reward_category === state_categories[state_number] & !first_state){
          reward_val = 1;
        }
        else{
          reward_val = -.5
        };
        // figure out reward value...
        if (response.accept){
          if (reward_val > 0){
            var rew_color = "green";
          }else{
            var rew_color = "red";
          }
        }
        else{
          var rew_color = "grey";
        }


        jsPsych.pluginAPI.setTimeout(function() {
          d3.select("svg").append("text")
                    .attr("class", "state reward")
                    .attr("x", w/2)
                    .attr("y", h/2 + choice_img_height/2 + choice_img_height/6)
                    .attr("font-family","Helvetica")
                    .attr("font-weight","light")
                    .attr("font-size",choice_img_height/8)
                    .attr("text-anchor","middle")
                    .attr("fill", rew_color)
                    .text(reward_val)
          }, 600); // show reward 500 ms after image...
      } // end if show reward

      // Lower prompt with choice instructions
      if (show_action_prompt){
        // place text with choice instructions, "choice prompt": this is how you place text...
        d3.select("svg").append("text")
                      .attr("class", "lower_prompt")
                      .attr("x", w/2)
                      .attr("y", 7*h/8)
                      .attr("font-family","Helvetica")
                      .attr("font-weight","light")
                      .attr("font-size",h/40)
                      .attr("text-anchor","middle")
                      .attr("fill", "white")
                      .style("opacity",1)
                      .text('Press ' + accept_key + ' to accept or ' + reject_key + ' to reject')
      }

      // Upper prompt with trial context instructions
      if (show_trial_prompt){
        d3.select("svg").append("text")
                      .attr("class", "upper_prompt")
                      .attr("x", w/2)
                      .attr("y", 2*h/8)
                      .attr("font-family","Helvetica")
                      .attr("font-weight","light")
                      .attr("font-size",h/40)
                      .attr("text-anchor","middle")
                      .attr("fill", "white")
                      .style("opacity",1)
                      .text('Rewarded: ' + current_reward_category + '   Terminate: ' + current_terminate_color)
      }

      ///////////////////////
      // Set up response handler
      if (collect_response){
        // define valid responses - these keys were defined above
        var valid_responses = [accept_key, reject_key];

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
        } else{

          // wait some amount of time and then transition
          jsPsych.pluginAPI.setTimeout(function() {
              transition_state();
            }, 1200); // how long to wait (includes reward time)
        } // end collect response
    }

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
      if (choice_char == accept_key){ // if they chose left
        response.accept = true;
      }
      else if (choice_char == reject_key){ // if they chose right
        response.accept = false;}
      else{console.log('SURPRISE');}

      // alter the prompt...
      if (response.accept){
        d3.select(".lower_prompt").text("Gamble Accepted: Collecting Rewards!")
      }else{
        d3.select(".lower_prompt").text("Gamble Rejected: Showing Rewards You Could Have Collected")
      }


      // wait for some amount of time (from response being made) and then transition state
      jsPsych.pluginAPI.setTimeout(function() {
          transition_state();
        }, 300); /// 350 ms after response is made...
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
        response.accept = "SLOW";

        // wait some time and then end trial
        jsPsych.pluginAPI.setTimeout(function() {
            end_trial();
          }, 1000); // show slow response for 1000 milliseconds then end trial
        } // end handle slow response

      //////////////////////////
      // Transition the State
      var transition_state = function(){

        // record data...
        if (response.accept){
          var reward_collected = reward_val;
        }else{
          var reward_collected = 0;
        }

        if (first_state){
          var image_accept = response.accept;
          var rt = response.rt;
        }else{
          var image_accept = null;
          var rt = null;
        }

        var is_terminal = (current_terminate_color === state_colors[state_number] & !first_state);


        var transition_data = {
          start_state: trial.start_state,
          trial_number: trial.trial_number,
          state_number: state_number,
          reward_observed: reward_val,
          reward_collected: reward_collected,
          image_observed: this_image,
          state_color: state_colors[state_number],
          state_category: state_categories[state_number],
          trial_accept: response.accept,
          image_accept: image_accept,
          terminal: is_terminal,
          reward_category: current_reward_category,
          terminate_color: current_terminate_color,
          rt: rt
        }

        jsPsych.data.write(transition_data);

        // remove the picture
        d3.selectAll(".state").remove();

        // if this state is terminal end the trial
        if (is_terminal){
          console.log("Terminal State!")
          end_trial();
        }else{
          // otherwise update and show next state
          first_state = false;
          state_number = trial.next_state[state_number];
          console.log("new state: " + state_number)
          // wait a bit...
          jsPsych.pluginAPI.setTimeout(function() {

            display_state(show_reward = true, show_action_prompt = false, show_trial_prompt = true, collect_response = false);
          }, 600); // show slow response for 1000 milliseconds then end trial
        }
      }
    /// functon to end trial, save data,
    var end_trial = function(){

      // kill the keyboard listener, if you haven't yet
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // remove the canvas and everthing within it
      d3.select('svg').remove()
      jsPsych.finishTrial({});
    } // end end_trial()
  }; // end plugin.trial

  return plugin;
})();
