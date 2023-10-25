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
  SCAN: 0,
  CONNECT: 1,
  WAIT_FOR_AUDIT_OR_SUBMIT: 2,
  AUDIT: 3,
  USER_VERIFICATION: 4,
  AUDIT_FAILED: 5,
  SUBMITTED: 6,
  //USER_HAD_ALREADY_VOTED: 7, DEPRECATED
  properties: {
    0: { description: "Scan QR-Code", value: 0 },
    1: {
      description: "Connect to peer-broker-server and wait for confirmation",
      value: 1
    },
    2: {
      description: "Wait for Audit or Submit from VSD",
      value: 2
    },
    3: {
      description: "Compute Audit",
      value: 3
    },
    4: { description: "Show user computed Ballot", value: 4 },
    5: {
      description: "Aduit computation or User Verification failed",
      value: 5
    },
    6: { description: "Submit from VSD has been processed", value: 6 },
    /* DEPRECATED 7: { description: "ACK already received", value: 7 }*/
  }
};

export default { ControlState };
