import Paillier from "src/components/Paillier";
import CheckboxZKP from "src/components/ZKP/CheckboxZKP";
import help from "src/components/HelpFunctions";
import random from 'crypto-random-bigint';

var bigInt = require("big-integer");

//computes data.maxVotes - data.minVotes trash values which are either 0 or 1. 
//the trash values are choosen in a way, that when combined with the real votes the sum will equal data.maxVotes
self.addEventListener("message", ({ data }) => {
    var data = JSON.parse(data);
    var trashValues = { ciphers: [], proofs: [] }; // encrypted values and proofs for trash values
    var secretRandomNumbers = { paillier: [], proofs: [] }; // zero knowledge proofs TODO: figure out why the random numbers are saved and if it is even necessary
    var plainTrashValues = [];

    var numberOfVotedCandidates = 0;
    data.choices.forEach(choice => {
        numberOfVotedCandidates += choice;
    });

    //value inveriant checking
    if (numberOfVotedCandidates < data.minVotes || numberOfVotedCandidates > data.maxVotes) {
        console.log("Ballot invalid!");
    }

    var bits = 2048;
    var publicKey = data.paillier.publicKey;

    //iterate over all trash values
    for(var i = 0; i < data.maxVotes - data.minVotes; i++) {
        var randomPaillierNumber = help.getRandomNumber(publicKey); //TODO: this has to be n^2?

        //choose the trash values so that when combined with the real votes it will exactly reach data.maxVotes
        var trashValue = 0;
        if(i < data.maxVotes - numberOfVotedCandidates) {
            trashValue = 1;
        }
        plainTrashValues.push(trashValue);
        
        //encrypt trash value
        var cipher = Paillier.encrypt(publicKey, trashValue, randomPaillierNumber);

        //compute ZKP for the trash value
        var randomProofNumbers = [help.getRandomNumber(data.paillier.publicKey), help.getRandomNumber(data.paillier.publicKey), bigInt(random(bits)).toString()]; //r1, z, e
        var proof = CheckboxZKP.generateProof(0, 1, cipher, publicKey, randomPaillierNumber, randomProofNumbers, data.voterSecret);

        trashValues.ciphers.push(cipher.toString());
        trashValues.proofs.push(proof);
        secretRandomNumbers.paillier.push(randomPaillierNumber);
        secretRandomNumbers.proofs.push(randomProofNumbers);

        self.postMessage({done: false}); // Post status update
    }

    self.postMessage({done: true, worker: "trashValues", trashValues: trashValues, plainTrashValues: plainTrashValues, secretRandomNumbers: secretRandomNumbers}); // Post 'done' update with payload
});