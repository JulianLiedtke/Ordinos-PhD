/**
 * This library provides Peer2Peer communication.
 * Handling connections as well as sending/receiving data.
 * Data can be encrypted using the Encryptor.
 */

import Peer from "peerjs";
import Encryptor from "./Encryptor";

/**
 * Interface for communication. Handles connections and peers.
 */
class CommunicationInterface {
  constructor() {
    this.peer = null; // Local Peer
    this.connection = null; // Active connection
    this.key = ""; // Key for encryption

    this.callbackMessageReceived = null; // Callback function: message received
    this.callbackConnectionClosed = null; // Callback function: connection closed
  }

  /**
   * If the key is set, all messages will be automatically
   * encrypted
   *
   * @param {String} key
   */
  setKey(key) {
    this.key = key;
  }

  /**
   * Delete the key, the messages will no longer be encrypted
   */
  deleteKey() {
    this.key = "";
  }

  /**
   * Starts a local peer and configures all handlers for incoming connections
   * @public
   * @param {String} peerServerIP
   * @param {function} callbackOpen Callback function when connected to PeerServer
   * @param {function} callbackConnection Callback function when connection established
   * @param {function} callbackConnectionClosed Callback function when connection has been closed
   * @param {function} callbackMessageReceived Callback function when message received
   */
  startPeer(
    peerServerIP,
    callbackOpen = null,
    callbackConnection = null,
    callbackConnectionClosed = null,
    callbackMessageReceived = null
  ) {
    this.callbackMessageReceived = callbackMessageReceived;
    this.callbackConnectionClosed = callbackConnectionClosed;

    const url = new URL(peerServerIP)

    // Register Peer
    this.peer = new Peer({
      host: url.hostname,
      port: url.port,
      path: url.pathname,
      secure: true
    });

    /**
     * Peer ready
     */
    this.peer.on("open", id => {
      if (callbackOpen != null) callbackOpen();
    });

    this.peer.on("connection", conn => {
      /**
       * New connection established
       */
      conn.on("open", () => {
        if (this.connection == null) {
          // Accept only if no current connection is active
          this.connection = conn;
          if (callbackConnection != null) callbackConnection();
        } else {
          conn.disconnect();
        }
      });

      /**
       * Data received
       */
      conn.on("data", data => {
        if (this.connection != null) {
          this.receive(data);
        }
      });

      /**
       * Connection closed
       */
      conn.on("close", () => {
        if (this.connection != null) {
          // Only executed if current connection is set
          // So no forbidden connection is calling callback
          if (callbackConnectionClosed != null) callbackConnectionClosed();
        }
      });

      conn.on("error", () => {
        console.log("Error in connection: ");
        console.log(error);
      });
    });
  }

  /**
   * Return PeerId of local Peer.
   *
   * @public
   * @return {string} id
   */
  getId() {
    // If peer is not initiated yet return accordingly
    return this.peer != null ? this.peer.id : "No ID";
  }

  /**
   * Receive data and parse it for JSON.
   * The data will be automatically decrypted if a key is specified.
   *
   * @private
   * @param {string} payload
   */
  receive(payload) {
    payload = JSON.parse(payload); // JSON parse incomming data
    if (payload.data) {
      var data = payload.data;
      if (this.key != "") {
        try {
          data = Encryptor.decrypt(this.key, data);
        } catch (error) {
          console.log(error);
        }
      }
      data = JSON.parse(data);

      this.callbackMessageReceived(data);
    } else {
      alert(
        $t('CommunictionInterface.connection_problem') 
      );
    }
  }

  /**
   * Send payload to connection.
   * The data will be automatically encrypted if a key is specified.
   *
   * @public
   * @param {object} payload
   */
  send(payload) {
    if (this.connection != null) {
      var data = JSON.stringify(payload);
      if (this.key != "") {
        data = Encryptor.encrypt(this.key, data);
      }
      var msg = { data: data };
      this.connection.send(JSON.stringify(msg));
    }
  }

  /**
   * Connect to other peer
   *
   * @public
   * @param {string} id
   * @param {function} callback
   */
  connectTo(id, callback) {
    this.connection = this.peer.connect(id);

    /**
     * Connection established
     */
    this.connection.on("open", () => {
      callback();
    });

    /**
     * Data received
     */
    this.connection.on("data", data => {
      this.receive(data);
    });

    /**
     * Connection closed
     */
    this.connection.on("close", () => {
      if (this.callbackConnectionClosed != null)
        this.callbackConnectionClosed();
    });

    this.connection.on("error", () => {
      console.log("Error in connection: ");
      console.log(error);
    });
  }

  /**
   * Close the connection and local peer
   */
  disconnect() {
    if (this.connection != null) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer != null) this.peer.disconnect();
  }
}

export default CommunicationInterface;
