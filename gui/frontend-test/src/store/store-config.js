import Vue from "vue";
//import { uid } from 'quasar'

const state = {
  election: {
    electionId: "",
    voterId: "",
    candidates: [
      // {
      //     "id": 0,
      //     "name": "Max Mustermann",
      //     "party": "CDU",
      //     "comment": "Ich mag Zuege",
      //     "image": "http://bw.de/mustermann.jpg"
      // }
    ],
    ballot: {
      categorie: "", // Checkbox, Ranking, Rating
      settings: {
        /**
         * Checkbox
         * min : int
         * max : int
         *
         * Rating
         * points : int
         * draw : boolean
         * min : int
         * perCandidate : boolean
         * spendAllPoints : boolean
         *
         * Ranking
         * numberOfEqualRanks : int
         * numberOfCountingRanks : int
         * pointDistribution : object {
         *    1 : int
         *    2 : int
         *    ...
         * }
         */
      }
    },
    choice: [0, 1, 1, 0, 0]
  },
  communication: {
    peerServerIP: "",
    authenticatedServer: "",
    bulletinBoard: ""
  },
  vvdSecurity: {
    key: "key1",
    nonce: "nonce1"
  },

  paillier: {
    bits: 1024,
    publicKey: null,
    randomNumbers: []
  },
  bullet: null
};

const mutations = {
  updateElection(state, payload) {
    Object.assign(state.election, payload);
  },
  setCommunication(state, payload) {
    Object.assign(state.communication, payload);
  },
  setVvdSecurity(state, payload) {
    Object.assign(state.vvdSecurity, payload);
  },
  setPaillierPublicKey(state, key) {
    state.paillier.publicKey = key;
  },
  setPaillierRandomNumbers(state, number) {
    state.paillier.randomNumbers = number;
  },
  setBullet(state, payload) {
    state.bullet = payload;
  },
  setBallot(state, payload) {
    Object.assign(state.election.ballot, payload);
  },
  setCandidates(state, payload) {
    Object.assign(state.election.candidates, payload);
  }
};

const actions = {
  updateElection({ commit }, payload) {
    commit("updateElection", payload);
  },
  setCommunication({ commit }, payload) {
    commit("setCommunication", payload);
  },
  setVvdSecurity({ commit }, payload) {
    commit("setVvdSecurity", payload);
  },
  setPaillierPublicKey({ commit }, key) {
    commit("setPaillierPublicKey", key);
  },
  setPaillierRandomNumbers({ commit }, number) {
    commit("setPaillierRandomNumbers", number);
  },
  setBullet({ commit }, payload) {
    commit("setBullet", payload);
  },
  setBallot({ commit }, payload) {
    commit("setBallot", payload);
  },
  setCandidates({ commit }, payload) {
    commit("setCandidates", payload);
  }
};

const getters = {
  getVvdSecurity: state => {
    return state.vvdSecurity;
  },
  getPaillier: state => {
    return state.paillier;
  },
  getCommunication: state => {
    return state.communication;
  },
  getElection: state => {
    return state.election;
  },
  getBullet: state => {
    return state.bullet;
  },
  getBallot: state => {
    return state.election.ballot;
  },
  getCandidates: state => {
    return state.election.candidates;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
