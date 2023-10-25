/**
 * Enumeration for states
 *
 * ControlState.STATE is Integer
 *
 * Access properties via:
 *  var myState = ControlState.START
 *  var props = ControlState.properties[myState]
 */
var ControlState = {
  START: 0,
  NO_ELECTIONS: 0,
  SHOW_ELECTIONS: 1,
  SHOW_RESULTS: 2,
  SHOW_DEMO_RESULTS: 3,
  properties: {
    0: { description: "No Elections", value: 0 },
    1: {
      description: "Show all elections you have participated in",
      value: 1
    },
    2: {
      description: "Show status of one Election",
      value: 2
    },
    3: {
      description: "Show Demo Result",
      value: 3
    }
  }
};

export default { ControlState };
