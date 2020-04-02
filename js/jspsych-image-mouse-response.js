/**
 * jspsych-image-mouse-response
 * Daniel Little
 *
 * plugin for displaying a stimulus and getting a mouse response
 *
 *
 **/

jsPsych.plugins["image-mouse-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('image-mouse-response', 'stimulus', 'image');

  plugin.info = {
    name: 'image-mouse-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      //choices: {
      //  type: jsPsych.plugins.parameterType.STRING,
      //  pretty_name: 'Choices',
      //  default: undefined,
      //  array: true,
      //  description: 'The labels for the buttons.'
      //},
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // change location where stimulus is displayed
    // display stimulus
    var html = '<img src="' + trial.stimulus + '" id="jspsych-image-mouse-response-stimulus"    draggable="false" style="';
    if(trial.stimulus_height !== null){
      html += 'height:'+trial.stimulus_height+'px; '
      if(trial.stimulus_width == null && trial.maintain_aspect_ratio){
        html += 'width: auto; ';
      }
    }
    if(trial.stimulus_width !== null){
      html += 'width:'+trial.stimulus_width+'px; '
      if(trial.stimulus_height == null && trial.maintain_aspect_ratio){
        html += 'height: auto; ';
      }
    }
    html +='"></img>';

    //show prompt if there is one
    if (trial.prompt !== null) {
      html += trial.prompt;
    }

    // render
    display_element.innerHTML = html;

    // start timing
    var start_time = performance.now();

    // function to get click location
    var get_click_location = function(event){
        var info = {
            xlocation: event.pageX,
            ylocation: event.pageY
        };
        after_response(info)
    };

    // get location at click and rt
    document.addEventListener('click', get_click_location, false);
    

    // store response
    var response = {
      rt: null,
      xlocation: null,
      ylocation: null
    };

    // function to handle responses by the subject
    function after_response(info) {

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.rt = rt;
      response.xlocation = info.xlocation;
      response.ylocation = info.ylocation;
       
      document.removeEventListener('click', get_click_location, false);

      if (trial.response_ends_trial){
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "xlocation": response.xlocation,
        "ylocation": response.ylocation
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };


    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-mouse-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  }; // end plugin.trial

  return plugin;
})();
