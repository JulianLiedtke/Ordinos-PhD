import Paillier from "src/components/Paillier";
import CheckboxZKP from "src/components/ZKP/CheckboxZKP";
import {PedersenVectorCommitment} from "src/components/ZKP/PedersenVectorCommitment";
import RankingZKP from "src/components/ZKP/RankingZKP";
import help from "src/components/HelpFunctions";
import random from 'crypto-random-bigint';

var bigInt = require("big-integer");

self.addEventListener("message", ({data}) => {
    var data = JSON.parse(data);
    var bullet = {choices: [], proofs: []};
    var secretRandomNumbers = {paillier: [], proofs: []};

    /**
     * For each choice:
     * -Encrypt
     * -Compute ZKP
     */
    data.choices.forEach(choice => {
        var randomPaillierNumber = help.getRandomNumber(data.paillier.publicKey);
        secretRandomNumbers.paillier.push(randomPaillierNumber);

        //Encrypt plaintext
        if(data.evaluation.type === "Instant_runoff") {
            //instand runoff uses a matix instead of a simple list with all the choices
            var cipher = new Array(choice.length);
            for(var i = 0; i < choice.length; i++) {
                console.log("encrypting array: " + choice)
                var randomPaillierNumber = help.getRandomNumber(data.paillier.publicKey); //TODO: save all random numbers to verify the encryption in the app
                cipher[i] = Paillier.encrypt(data.paillier.publicKey, choice[i], randomPaillierNumber);
            }
            console.log("cipher = " + cipher);
            bullet.choices.push(cipher.toString());
        } else {
            var cipher = Paillier.encrypt(data.paillier.publicKey, choice, randomPaillierNumber);
            bullet.choices.push(cipher.toString());
        }

        //Compute corresponding ZKP for the Checkbox ballot
        if(data.category === "Checkbox") {
            var randomProofNumbers = [help.getRandomNumber(data.paillier.publicKey), help.getRandomNumber(data.paillier.publicKey), bigInt(random(data.paillier.bits)).toString()]; //r1, z, e
            secretRandomNumbers.proofs.push(randomProofNumbers);

            var proof = CheckboxZKP.generateProof(0, 1, cipher, data.paillier.publicKey, randomPaillierNumber, randomProofNumbers, data.voterSecret);
            bullet.proofs.push(proof);
        }

        self.postMessage({done: false}); // Post status update
    });
    
    //for Ranking only one ZKP is needed instead of a ZKP for each choice
    //only compute ZKP if only one candidate on each rank is allowed
    //TODO: if more than one candidate can be placed on the same rank another ZKP is needed
    //      also if the evaluation type is instant runoff a different zkp is needed, because instant runoff uses a matrix to represent the choices
    if(data.category === "Ranking" && data.ballot.settings.numberOfEqualRanks == 1 && data.evaluation.type !== "Instant_runoff") {
        var commitmentSetup = data.commitments.pedersenVectorCommitment;
        var pedersenVectorCommitment = new PedersenVectorCommitment(commitmentSetup.p, commitmentSetup.q, commitmentSetup.g, commitmentSetup.h);
        var commitmentSetupPermutationArgument = data.commitments.pedersenVectorCommitmentPermutationArgument;
        var pedersenVectorCommitmentPermutationArgument = new PedersenVectorCommitment(commitmentSetupPermutationArgument.p, commitmentSetupPermutationArgument.q, commitmentSetupPermutationArgument.g, commitmentSetupPermutationArgument.h);

        var maxVotes = Math.max(...data.ballot.settings.pointDistribution);

        //we need to compute a new cipher with the plaintext sum(i=0, numberOfCandidates-1)vote[i]*M^i for the zkp 
        //where vote[i] is the amount of votes candidate i recived and M is the max amount of votes a candidate can recive.
        //we need to do it in this way so that we can also compute a cipher with this plaintext in the backend
        //since we only send each vote encrypted by iteself to the backend
        var ciphers = bullet.choices;
        var randomNumbers = secretRandomNumbers.paillier;
        var publicKey = bigInt(data.paillier.publicKey);
        var publicKeySquared = bigInt(data.paillier.publicKey).pow(2);

        var newCiphers = new Array(ciphers.length);
        var newRandomNumbers = new Array(ciphers.length);
        for(var i = 0; i < ciphers.length; i++) {
            //new cipher now encrypts plaintext vote[i]*(M^i) where M = maxVotes
            newCiphers[i] = bigInt(ciphers[i]).modPow(bigInt(maxVotes).pow(i), publicKeySquared);
            //the random number used to encrypt newCiphers[i] changes to r^(M^i)
            newRandomNumbers[i] = bigInt(randomNumbers[i]).modPow(bigInt(maxVotes).pow(i), publicKey);
        }
        var cipher = bigInt(1);
        var randomPaillierNumber = bigInt(1);
        //we can get a cipher with plaintext sum(i=0, numberOfCandidates-1)vote[i]*M^i
        //by multipling all newCiphers and the randomNumbers used to encrypt cipher by multipling all newRandomNumbers
        for(var i = 0; i < ciphers.length; i++) {
            cipher = cipher.multiply(newCiphers[i]).mod(publicKeySquared);
            randomPaillierNumber = randomPaillierNumber.multiply(newRandomNumbers[i]).mod(publicKey);
        }

        var {proof, randomNumbers} = RankingZKP.generateProof(cipher.toString(), randomPaillierNumber.toString(), 
            data.choices, data.numberOfCandidates, maxVotes, data.voterSecret, data.paillier.publicKey,
            pedersenVectorCommitment, pedersenVectorCommitmentPermutationArgument);

        bullet.proofs = {};
        secretRandomNumbers.proofs = {};
        bullet.proofs.zkp = proof;
        bullet.proofs.commitmentSetup = commitmentSetup;
        bullet.proofs.commitmentSetupPermutationArgument = commitmentSetupPermutationArgument;
        secretRandomNumbers.proofs = randomNumbers;
    }

    //TODO: ZKPs for the Rating Ballot are not yet implemented
    //Possible ZKPs: algortihm 4.5 and algorithm 4.6 from https://elib.uni-stuttgart.de/bitstream/11682/11637/3/Bachelorarbeit.pdf

    self.postMessage({done: true, worker: "bullet", bullet: bullet, secretRandomNumbers: secretRandomNumbers}); // Post 'done' update with payload
});