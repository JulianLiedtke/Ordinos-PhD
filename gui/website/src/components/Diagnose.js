/**
 * Library for gathering diagnostic information
 */
const axios = require("axios");

var sectionTitle = "";

var timeStart = 0;
var times = [];

var introBoxClicks = 0;

/**
 * Start a timer with a certain title
 *
 * @param {String} title
 */
function startTimer(title) {
  timeStart = performance.now();
  sectionTitle = title;
}

/**
 * Ends the current running timer
 */
function endTimer() {
  if (timeStart != 0) {
    var timeEnd = performance.now();
    var diff = timeEnd - timeStart; // Time difference between start and end
    timeStart = 0;
    times.push({
      title: sectionTitle,
      time: diff / 1000
    }); // Save timer in seconds
  }
}

/**
 * returns diagnose data
 */
function getData() {
  return times;
}

/**
 * prints diagnose data
 */
function print() {
  console.log("### Printing Data ###");
  console.log(times);
  console.log("IntroBoxClicks: " + introBoxClicks);
}

/**
 * increase introBoxClicks
 */
function addIntroBoxClick() {
  introBoxClicks++;
}

/**
 * Submit diagnostic data to AS
 *
 * @param {String} voterId
 */
function submit(voterId) {
  /**
   * @disabled
   */
  // axios({
  //   method: "POST",
  //   url: "https://lauercloud.de:9001",
  //   headers: { "Content-Type": "text/html" },
  //   data: {
  //     diagnose: true,
  //     payload: {
  //       voterId: voterId,
  //       times: times,
  //       introBoxClicks: introBoxClicks
  //     }
  //   }
  // })
  //   .then(response => {})
  //   .catch(function(error) {
  //     console.log(error);
  //   });
}

/**
 * resets diagnose data
 */
function reset() {
  times = [];
  introBoxClicks = 0;
  timeStart = 0;
}

export default {
  startTimer,
  endTimer,
  getData,
  print,
  addIntroBoxClick,
  submit,
  reset
};
