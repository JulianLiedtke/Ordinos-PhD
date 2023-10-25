/**
 * Library for gathering diagnostic information
 */
const axios = require("axios");

var sectionTitle = "";

var timeStart = 0;
var times = [];

/**
 * starts the timer and sets the sectionTitle
 * @param {*} title
 */
function startTimer(title) {
  timeStart = performance.now();
  sectionTitle = title;
}

/**
 * ends the timer
 */
function endTimer() {
  if (timeStart != 0) {
    var timeEnd = performance.now();
    var diff = timeEnd - timeStart;
    timeStart = 0;
    times.push({
      title: sectionTitle,
      time: diff / 1000
    });
  }
}

/**
 * @returns diagnose data
 */
function getData() {
  return times;
}

/**
 * Prints diagnose data
 */
function print() {
  console.log("### Printing Data ###");
  console.log(times);
}

/**
 *
 * @param {*} voterId
 */
function submit(voterId) {
  /**
   * @disabled
   */
  // axios({
  //   method: "POST",
  //   url: "URL HERE",
  //   headers: { "Content-Type": "text/html" },
  //   data: {
  //     diagnose: true,
  //     payload: {
  //       voterId: voterId,
  //       times: times
  //     }
  //   }
  // })
  //   .then(response => {})
  //   .catch(function(error) {
  //     console.log(error);
  //   });
}

/**
 * submits the data with associated voterId
 * @param {*} voterId
 * @param {*} data
 */
function submitData(voterId, data) {
  axios({
    method: "POST",
    url: "URL HERE",
    headers: { "Content-Type": "text/html" },
    data: {
      diagnose: true,
      payload: {
        voterId: voterId,
        data: data
      }
    }
  })
    .then(response => {})
    .catch(function(error) {
      console.log(error);
    });
}

/**
 * resets the data
 */
function reset() {
  times = [];
  timeStart = 0;
}

export default {
  startTimer,
  endTimer,
  getData,
  print,
  submit,
  reset,
  submitData
};
