import axios from "axios";
import Paillier from "src/components/Paillier";
import Vue from "vue";

const state = {
  election: {
    id: "",
    voterId: "",
    title: "",
    start: "",
    due: [2020, 6, 29, 17, 0],
    secret: ""
  },
  choices: [],
  plainTrashValues: [],
  candidates: [],
  ballot: {
    category: "",
    settings: {}
  },
  communication: {
    peerServerIP: "",
    authenticatedServer: "",
    bulletinBoardServerIP: ""
  },
  vvdSecurity: {
    key: "key1",
    nonce: "nonce1"
  },
  evaluation: {
    type: "",
  },
  paillier: {
    bits: 2048,
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
      proofs: []
    },
    proofOfSum: []
  },
  step: "",
  demoMode: false,
  firstVisit: true,
  bulletinBoards: [],
  electionTemplates: [],
};

const mutations = {
  updateElection(state, payload) {
    Object.assign(state.election, payload);
  },
  setCommunication(state, payload) {
    Object.assign(state.communication, payload);
  },
  setEvaluation(state, payload) {
    Object.assign(state.evaluation, payload);
  },
  setVvdSecurity(state, payload) {
    Object.assign(state.vvdSecurity, payload);
  },
  setPaillierBits(state, bits) {
    state.paillier.bits = bits;
  },
  setPaillierPublicKey(state, key) {
    state.paillier.publicKey = key;
  },
  setBulletSecretRandomNumbers(state, numbers) {
    state.secretRandomNumbers.bullet = numbers;
  },
  setTrashSecretRandomNumbers(state, numbers) {
    state.secretRandomNumbers.trashValues = numbers;
  },
  setProofOfSumSecretRandomNumbers(state, numbers) {
    state.secretRandomNumbers.proofOfSum = numbers;
  },
  setBullet(state, payload) {
    Object.assign(state.bullet, payload);
  },
  setBallot(state, payload) {
    Object.assign(state.ballot, payload);
  },
  setCandidates(state, payload) {
    Object.assign(state.candidates, payload);
  },
  setChoices(state, payload) {
    Object.assign(state.choices, payload);
  },
  setPlainTrashValues(state, payload) {
    Object.assign(state.plainTrashValues, payload);
  },
  clearStore(state) {
    state.election.id = "";
    state.election.voterId = "";
    state.election.title = "";
    state.choices = [];

    state.vvdSecurity.key = "";
    state.vvdSecurity.nonce = "";

    state.bullet.choices = [];
    state.bullet.randomNumbers = [];
  },
  setStep(state, step) {
    state.step = step;
  },
  setDemoMode(state, demoModeOn) {
    state.demoMode = demoModeOn;
  },
  setFirstVisit(state, boolFirstVisit) {
    state.firstVisit = boolFirstVisit;
  },
  addBulletinBoard(state, bulletinBoardAndId) {
    var bulletinBoard = bulletinBoardAndId[0];
    var boardId = bulletinBoardAndId[1];
    var duplicateBulletinBoards = state.bulletinBoards.filter((element) => {
      return (element[0] == bulletinBoardAndId[0] && element[1] == bulletinBoardAndId[1]);
    });
    if (duplicateBulletinBoards.length === 0) {
      state.bulletinBoards.push(bulletinBoardAndId);
    }
    else {
      console.log("Board was already added.");
    }
  },
  deleteBulletinBoard(state, bulletinBoardAndId) {
    state.bulletinBoards = state.bulletinBoards.filter((element) => {
      return !(element[0] == bulletinBoardAndId[0] && element[1] == bulletinBoardAndId[1]);
    });
  },
  clearBulletinBoards(state) {
    state.bulletinBoards = [];
  },
  addElectionTemplate(state, electionTemplate) {
    state.electionTemplates.push(electionTemplate);
  },
  deleteElectionTemplate(state, electionTemplate) {
    state.electionTemplates = state.electionTemplates.filter((element) => {
      return !(element.election_settings.election.title == electionTemplate.election_settings.election.title && element.election_settings.election.id == electionTemplate.election_settings.election.id);
    });
  },
  clearElectionTemplates(state) {
    state.electionTemplates = [];
  }
};

const actions = {
  updateElection({ commit }, payload) {
    commit("updateElection", payload);
  },
  setCommunication({ commit }, payload) {
    commit("setCommunication", payload);
  },
  setEvaluation({ commit }, payload) {
    commit("setEvaluation", payload);
  },
  setVvdSecurity({ commit }, payload) {
    commit("setVvdSecurity", payload);
  },
  setPaillierBits({ commit }, payload) {
    commit("setPaillierBits", payload);
  },
  setPaillierPublicKey({ commit }, key) {
    commit("setPaillierPublicKey", key);
  },
  setBulletSecretRandomNumbers({ commit }, numbers) {
    commit("setBulletSecretRandomNumbers", numbers);
  },
  setTrashSecretRandomNumbers({ commit }, numbers) {
    commit("setTrashSecretRandomNumbers", numbers);
  },
  setProofOfSumSecretRandomNumbers({ commit }, numbers) {
    commit("setProofOfSumSecretRandomNumbers", numbers);
  },
  setBullet({ commit }, payload) {
    commit("setBullet", payload);
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
  clearStore({ commit }) {
    commit("clearStore");
  },
  setStep({ commit }, step) {
    commit("setStep", step);
  },
  setDemoMode({ commit }, demoModeOn) {
    commit("setDemoMode", demoModeOn);
  },
  setFirstVisit({ commit }, boolFirstVisit) {
    commit("setFirstVisit", boolFirstVisit);
  },
  addBulletinBoard({ commit }, bulletinBoardAndId) {
    commit("addBulletinBoard", bulletinBoardAndId);
  },
  deleteBulletinBoard({ commit }, bulletinBoardAndId) {
    commit("deleteBulletinBoard", bulletinBoardAndId);
  },
  clearBulletinBoards({ commit }) {
    commit("clearBulletinBoards");
  },
  addElectionTemplate({ commit }, electionTemplate) {
    commit("addElectionTemplate", electionTemplate);
  },
  deleteElectionTemplate({ commit }, electionTemplate) {
    commit("deleteElectionTemplate", electionTemplate);
  },
  clearElectionTemplates({ commit }) {
    commit("clearElectionTemplates");
  },
};

const getters = {
  getVvdSecurity: state => {
    return state.vvdSecurity;
  },
  getPaillier: state => {
    return state.paillier;
  },
  getEvaluation: state => {
    return state.evaluation;
  },
  getCommunication: state => {
    return state.communication;
  },
  getElection: state => {
    return state.election;
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
  getBallot: state => {
    return state.ballot;
  },
  getCandidates: state => {
    return state.candidates;
  },
  getStep: state => {
    return state.step;
  },
  getDemoMode: state => {
    return state.demoMode;
  },
  getFirstVisit: state => {
    return state.firstVisit;
  },
  getBulletinBoards: state => {
    return state.bulletinBoards;
  },
  getElectionTemplates: state => {
    return state.electionTemplates;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
