import Vue from "vue";
//import { uid } from 'quasar'

const state = {
  peerServerIP: "",
  security: {
    nonce: "nonce1",
    key: "key1"
  },
  choices: [],
  plainTrashValues: [],
  candidates: [],
  ballot: {
    category: "",
    settings: {}
  },
  paillier: {
    bits: 1024,
    publicKey: ""
  },
  bullet: {
    choices: [],
    proofs: [],
    trashValues: {
      ciphers: [],
      proofs: []
    },
    proofOfSum: 0
  },
  secretRandomNumbers: {
    bullet: {
      paillier: [],
      proofs: []
    },
    trashValues: {
      paillier: [],
      proofs: [],
    },
    proofOfSum: []
  },
  // bullet: {
  //   choices: [],
  //   randomNumbers_Paillier: [],
  //   randomNumbers_Proof: []
  // },
  voterId: 0,
  voterSecret: 0
};

const mutations = {
  setSecurity(state, payload) {
    Object.assign(state.security, payload);
  },
  setPeerServerIP(state, payload) {
    state.peerServerIP = payload;
  },
  setBallot(state, payload) {
    Object.assign(state.ballot, payload);
  },
  setCandidates(state, payload) {
    Object.assign(state.candidates, payload);
  },
  setPaillier(state, payload) {
    Object.assign(state.paillier, payload);
  },
  setSecretRandomNumbers(state, numbers) {
    state.secretRandomNumbers = numbers;
  },
  setChoices(state, payload) {
    Object.assign(state.choices, payload);
  },
  setPlainTrashValues(state, payload) {
    Object.assign(state.plainTrashValues, payload);
  },
  setBullet(state, payload) {
    state.bullet = payload;
  },
  setVoterId(state, payload) {
    state.voterId = payload;
  },
  setVoterSecret(state, payload) {
    state.voterSecret = payload;
  },
  clearStore(state) {
    state.security.key = "";
    state.security.nonce = "";

    state.choices = [];

    state.bullet.choices = [];
    state.bullet.randomNumbers = [];
  }
};

const actions = {
  setSecurity({ commit }, payload) {
    commit("setSecurity", payload);
  },
  setPeerServerIP({ commit }, payload) {
    commit("setPeerServerIP", payload);
  },
  setPaillier({ commit }, payload) {
    commit("setPaillier", payload);
  },
  setBallot({ commit }, payload) {
    commit("setBallot", payload);
  },
  setCandidates({ commit }, payload) {
    commit("setCandidates", payload);
  },
  setChoices({ commit }, payload) {
    commit("setChoices", payload);
  },
  setPlainTrashValues({ commit }, payload) {
    commit("setPlainTrashValues", payload);
  },
  setBullet({ commit }, payload) {
    commit("setBullet", payload);
  },
  setSecretRandomNumbers({ commit }, numbers) {
    commit("setSecretRandomNumbers", numbers);
  },
  setVoterId({ commit }, payload) {
    commit("setVoterId", payload);
  },
  setVoterSecret({ commit }, payload) {
    commit("setVoterSecret", payload);
  },
  clearStore({ commit }) {
    commit("clearStore");
  }
};

const getters = {
  getSecurity: state => {
    return state.security;
  },
  getPeerServerIP: state => {
    return state.peerServerIP;
  },
  getBallot: state => {
    return state.ballot;
  },
  getCandidates: state => {
    return state.candidates;
  },
  getChoices: state => {
    return state.choices;
  },
  getPlainTrashValues: state => {
    return state.plainTrashValues;
  },
  getBullet: state => {
    return state.bullet;
  },
  getSecretRandomNumbers: state => {
    return state.secretRandomNumbers;
  },
  getPaillier: state => {
    return state.paillier;
  },
  getVoterId: state => {
    return state.voterId;
  },
  getVoterSecret: state => {
    return state.voterSecret;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
