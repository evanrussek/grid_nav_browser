
jsPsych.plugins["grid-episode"] = (function() {
  // the name above is how we'll reference this

  var plugin = {};

  plugin.info = {
    // the name here should be the same
    name: "grid-episode",
    parameters: {
        // these are parameters that the plug_in takes in...
        grid_images: { //
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
        },
        start_pos: { //
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        state_rewards: { //
          type: jsPsych.plugins.parameterType.INT,
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


    var left_key = 'leftarrow';
    var right_key = 'rightarrow';
    var up_key = 'uparrow';
    var down_key = 'downarrow';




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


      // set current position
      var current_pos = trial.start_pos;

    ///////////////////////////////////////////////////////////////////////////
    ///////////////// PLACE THE SVG CANVAS AND BACKGROUND ON WHICH WE'll DRAW THINGS ////
    ///////////////////////////////////////////////////////////////////////////////

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

    // place a gray background rectangle over the whole svg
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
      // show the position (for debugging)
      show_pos = true;
      show_action_prompt = true;
      if (show_pos){
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
                      .text('Row: ' + current_pos[0] + ' Col: ' + current_pos[1])
      }

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
                      .text('Use arrow keys to move in grid')
      } // end if show action prompt...
      //display_choice_stim_wait_for_response();
      display_state();
    }, 2000); // this is where the ITI goes

    ///////////////////////////////////////////////////////////////////////////
    ///////////////// FUNCTIONS WHICH RUN the TRIAL ///////////////////////////
    //////////////////////////////////////////////////////////////////////////
    // The functions are:
    // display_state: displayes the image
    //       - if there's a reward it shows the reward and ends the trial
    //       - otherwise it sets up response handler                                 -
    // handle response: records response calls transition
    // transition: records data, updates the position, calls displaay state
    // end trial: this ends the trial


    ///////////////////////////////////////////////////////////////////
    //  DISPLAY THE STATE IMAGE AND EITHER COLLECT RESPONSE OR END TRIAL
    var display_state = function(){


      // UPDATE ROW / COL text on screen
      d3.select(".upper_prompt")
          .text('Row: ' + current_pos[0] + ' Col: ' + current_pos[1])

      // Place the state image
      this_image = trial.grid_images[current_pos[0]][current_pos[1]]; // global so that next trials can access
      d3.select("svg").append("svg:image").attr("class", "state image").attr("x", w/2 - choice_img_width/2)
          .attr("y", h/2 - choice_img_height/2).attr("width",choice_img_width).attr("height",choice_img_height)
          .attr("xlink:href", this_image).style("opacity",1);

      // check reward
      this_reward = trial.state_rewards[current_pos[0]][current_pos[1]];

      // end trial if reward > 0 encountered
      if (this_reward > 0){
        d3.select(".lower_prompt") // make sure this already exists
                      .attr("font-size",h/20)
                      .attr("fill", "Gold")
                      .text('Collected ' + this_reward + ' points!')

        // wait some time and then end trial
        jsPsych.pluginAPI.setTimeout(function() {
            end_trial();
          }, 2000); // show reward for 2000 then end trial

      }else{ // if reward <= 0

        // Set up response handler
         // define valid responses - these keys were defined above
        var valid_responses = [left_key, right_key, up_key, down_key];

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
        }
    }

    ////////////////////////////////
    // Function TO HANDLE RESPONSES
    ////////////////////////////
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

      // wait for some amount of time (from response being made) and then transition state
      jsPsych.pluginAPI.setTimeout(function() {
          transition_state(choice_char);
        }, 0); ///
    } // end handle response function


    ////////////////////////////////////
    // FUNCTION TO HANDLE SLOW RESPONSES
    ////////////////////////////////////
    var handle_slow_response = function(){
      // a timeout which calls this function is set up in display-stimuli-wait-for-response
      // the handle response function kills that time-out. but if that doesn't happen before
      // the set time, this function is called
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
      //// Transition the State
      ///////////////////////////
      var transition_state = function(choice_char){

        // this makes a "copy" of the current_pos so that updating it won't update current_pos
        next_pos = [...current_pos];

        // update position based on choice
        if (choice_char == up_key){ //
          next_pos[0] = next_pos[0] - 1;
        }else if (choice_char == down_key){ //
          next_pos[0] = next_pos[0] + 1;
        }else if (choice_char == right_key){
          next_pos[1] = next_pos[1] + 1;
        }else if (choice_char == left_key){
          next_pos[1] = next_pos[1] - 1;
        }else{console.log('SURPRISE');}

        // checck if the move was legal, and if so update the position
        var is_legal_move = ((next_pos[0] >=  0) & (next_pos[0] < grid_images.length) & (next_pos[1] >=  0) & (next_pos[1] < grid_images.length));
        if (is_legal_move){
          current_pos = next_pos;
        }

        // record some data
        var transition_data = {};
      //    start_state: trial.start_state,
      //    trial_number: trial.trial_number,
      //    state_number: state_number,
      //    reward_observed: reward_val,
      //    reward_collected: reward_collected,
      //    image_observed: this_image,
      //    state_color: state_colors[state_number],
      //    state_category: state_categories[state_number],
      //    trial_accept: response.accept,
      //    image_accept: image_accept,
      //    terminal: is_terminal,
      //    reward_category: current_reward_category,
      //    terminate_color: current_terminate_color,
      //    rt: rt
      //  }

        jsPsych.data.write(transition_data);

        // reset response variable so that it can be re-written
        response = {
            rt: null,
            key: null,
            key_press_num: null,
            accept: null,
          };

      // remove the picture
      d3.selectAll(".state").remove();
      // calL transition after some amount of time
      jsPsych.pluginAPI.setTimeout(function() {
        display_state();
      }, 0); // show slow response for 1000 milliseconds then end trial
    } // end transition function

    /////////////////////////////////////////
    /// FUNCTION to END TRIAL //////////////
    ///////////////////////////////////////
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
