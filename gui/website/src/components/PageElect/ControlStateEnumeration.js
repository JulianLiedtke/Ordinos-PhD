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
  LOAD_FILE: 0,
  START_PEER: 1,
  SHOW_QR_CODE: 2,
  WAIT_FOR_NONCE: 3,
  VOTE: 4,
  COMPUTE_BALLOT_ENCRYPTION: 5,
  CHOICE_AUDIT_OR_SUBMIT: 6,
  AUDIT: 7,
  SUBMIT_WAIT_FOR_REPLY_FROM_AS: 8,
  SUBMIT_SUCCESSFUL: 9,
  VVD_DISCONNECTED: 10,
  AUDIT_FAILED: 11,
  //USER_HAD_ALREADY_VOTED: 12, DEPRECATED
  ERROR: 20,
  properties: {
    0: { description: "Load the config file", value: 0 },
    1: {
      description:
        "Start connection to peer-broker-server and wait for confirmation",
      value: 1
    },
    2: {
      description: "Show QR code and wait for connection with VVD",
      value: 2
    },
    3: {
      description: "Wait for message from VVD containing the secret nonce",
      value: 3
    },
    4: { description: "User is voting", value: 4 },
    5: {
      description: "Compute the Paillier-encryption of the ballot",
      value: 5
    },
    6: { description: "User has to choose between audit and submit", value: 6 },
    7: { description: "Audit is going on. User has to use VVD", value: 7 },
    8: { description: "Vote has been submitted to AS, wait for ACK", value: 8 },
    9: { description: "Submit was successful", value: 9 },
    10: { description: "VVD has disconnected. Abort.", value: 10 },
    11: {
      description: "Audit failed (VVD said something is wrong). Abort.",
      vaalule: 11
    },
    /* DEPRECATED!! 12: {
      description: "User has submitted a vote at some point before. Abort.",
      value: 12
    },*/ 
    20: { description: "Error", value: 20 }
  }
};

export default { ControlState };
