from src.crypto.paillier_abb import PaillierABB, PaillierCiphertext
from src.election.aggregation.aggregation_protocol import AggregationProtocol
from src.election.election_properties import ElectionProperties
from src.election.ballotformat import CheckboxBallotFormat, RankingBallotFormat
from src.election.evaluation.irv_evaluation import IrvEvaluation
from src.election.bulletin_board.bulletin_board_client import BulletinBoardClient
from src.election.real_world_elections.bundestagswahl import Bundestagswahl
from src.election.votes.one_candidate_vote import VoteType
from src.network.bulletin_board_connector import BulletinBoardChannel, BulletinBoardConnector
from src.network.local_connector import LocalConnector
from src.network.connection import Channel
from src.crypto.zkp.checkbox_zkp import verify_checkbox_proof
from src.crypto.zkp.checkbox_range_zkp import verify_checkbox_range
from src.crypto.zkp.ranking_zkp import verify_ranking_proof
import numpy as np
from threading import Thread
import logging

from src.network.retrieve_votes_protocol import RetrieveVotesProtocol
from src.util.protocol_chain import ChainedProtocol
from src.util.protocol_parallel import ParallelProtocol

log = logging.getLogger(__name__)


class Trustee():

    def __init__(self, abb, id, bulletin_board, channel):
        self.run_finished = False

        self.id = id
        self.abb = abb
        self.bulletin_board = bulletin_board
        self.channel = channel
        self.result = None

    def run_protocol(self, prot, *args):
        self.run_finished = False

        self.abb.prot_suite.set_connections(self.channel)
        prot.set_connection(self.channel)
        prot.set_abb(self.abb)
        prot.set_output_func(self.receive_prot_output)
        self.protocol = prot

        self.thread = Thread(target=prot.start, args=args)
        self.thread.start()

    def receive_prot_output(self, result):
        self.run_finished = True
        self.result = result
        self.bulletin_board.add_result(self.channel.id, result)

    def is_protocol_finished(self):
        if self.run_finished:
            return True
        if not self.thread.is_alive():
            if not self.result:
                self.result = "Abort."
            return True
        return False

    def get_protocol(self):
        return self.protocol

    def trigger_evaluation(self):
        """
        Begins the evaluation of the election in another thread.
        Would be more like the original trustee if we could use the chained protocol,
        and simply call run protocoll instead.
        """
        self.run_finished = False
        self.thread = Thread(target=self.evaluate)
        self.thread.start()

    def evaluate(self):
        """
        Actual evaluation of the election, is run in thread. It runs following steps:
        1. Retrieve votes: Get all the votes listed on the bulletin board.
        2. Filter votes: Filter out only those with valid ZKP, and only the newest per hash.
        3. Aggregate: Aggregate according to the vote structure.
        4. Evaluate: Run the actual evaluation algorithm specified by the election properties.
        """
        election_properties: ElectionProperties = self.bulletin_board.get_election_config()

        log.debug("Trustee [%s] begins evaluation on BB %s as id %s with partners %s",
                 self.id, self.bulletin_board.board_id, self.channel.id, self.channel.other_trustee_ids)

        # 1. Retrieve the votes
        votes = self.bulletin_board.get_votes()
        
        # more complex evaluation because two types of votes (primary votes and secondary votes) are used and each type has different constituencies etc.
        if type(election_properties) == Bundestagswahl:
            # 2. Filter the votes
            # TODO: primary and secondary votes do not necessary have the same constituencies
            valid_primary_votes = [{} for i in range(election_properties.n_constituencies)]
            valid_secondary_votes = [{} for i in range(election_properties.n_constituencies)]
            # n_votes are separated by constituencies
            n_valid_primary_votes = [0 for i in range(election_properties.n_constituencies)]
            n_valid_secondary_votes = [0 for i in range(election_properties.n_constituencies)]

            for vote in votes:
                if "hash" in vote and "constituency" in vote and "type" in vote:
                    if vote["type"] == VoteType.first_vote:
                        if (vote["hash"] not in valid_primary_votes or vote["timestamp"] > valid_primary_votes[vote["hash"]]["timestamp"]):
                            # sort valid votes per constituency
                            valid_primary_votes[vote["constituency"]][vote["hash"]] = vote
                            n_valid_primary_votes[vote["constituency"]] += 1
                    elif vote["type"] == VoteType.secondary_vote:
                        if (vote["hash"] not in valid_secondary_votes or vote["timestamp"] > valid_secondary_votes[vote["hash"]]["timestamp"]):
                            # sort valid votes per constituency
                            valid_secondary_votes[vote["constituency"]][vote["hash"]] = vote
                            n_valid_secondary_votes[vote["constituency"]] += 1
                
                
            valid_primary_votes = [list(valid_primary_votes[i].values()) for i in range(len(valid_primary_votes))]
            valid_secondary_votes = [list(valid_secondary_votes[i].values()) for i in range(len(valid_secondary_votes))]

            log.info("Found %s/%s primary votes with unique hash for the evaluation.", sum(n_valid_primary_votes), len(votes))
            log.info("Found %s/%s secondary votes with unique hash for the evaluation.", sum(n_valid_secondary_votes), len(votes))

            # TODO 2.1 Filter by passing and failing ZKP

            # Convert them to the votes used by the evaluation algorithms (no extra meta-data like hash, timestamp etc)
            for const_votes in range(len(valid_primary_votes)):
                valid_primary_votes[const_votes] = [election_properties.get_choices(vote, self.abb) for vote in valid_primary_votes[const_votes]]
            for const_votes in range(len(valid_secondary_votes)):
                valid_secondary_votes[const_votes] = [election_properties.get_choices(vote, self.abb) for vote in valid_secondary_votes[const_votes]]
            
            # 3+4. Aggregate and evaluate the votes
            single_aggregation_protocol = AggregationProtocol(election_properties.aggregator(), self.abb, election_properties.n_cand)
            aggregation_protocol = ParallelProtocol(ParallelProtocol(single_aggregation_protocol))
            # return n_valid_votes as a list with divided by vote type and constituency
            evaluation_protocol = ChainedProtocol([aggregation_protocol, election_properties.get_evaluator([n_valid_primary_votes, n_valid_secondary_votes], self.abb)])
            self.run_protocol(evaluation_protocol, [valid_primary_votes, valid_secondary_votes])

        # The following part of the evaluation depents whether constituencies are used
        elif(election_properties.use_constituencies):
            # 2. Filter the votes
            valid_votes = [{} for i in range(election_properties.n_constituencies)]
            n_valid_votes = 0
            for vote in votes:
                if "hash" in vote and "constituency" in vote:
                    if (vote["hash"] not in valid_votes or vote["timestamp"] > valid_votes[vote["hash"]]["timestamp"]):
                        # sort valid votes per constituency
                        valid_votes[vote["constituency"]][vote["hash"]] = vote
                        n_valid_votes += 1
                
                
            valid_votes = [list(valid_votes[i].values()) for i in range(len(valid_votes))]
            log.info("Found %s/%s votes with unique hash for the evaluation.", n_valid_votes, len(votes))

            # TODO 2.1 Filter by passing and failing ZKP

            # Convert them to the votes used by the evaluation algorithms (no extra meta-data like hash, timestamp etc)
            for const_votes in range(len(valid_votes)):
                valid_votes[const_votes] = [election_properties.get_choices(vote, self.abb) for vote in valid_votes[const_votes]]
            
            # 3+4. Aggregate and evaluate the votes
            single_aggregation_protocol = AggregationProtocol(election_properties.aggregator(), self.abb, election_properties.n_cand)
            aggregation_protocol = ParallelProtocol(single_aggregation_protocol)
            evaluation_protocol = ChainedProtocol([aggregation_protocol, election_properties.get_evaluator(n_valid_votes, self.abb)])
            self.run_protocol(evaluation_protocol, valid_votes)


        else:
            # evaluation without constituencies
            # 2. Filter the votes
            valid_votes = {}
            for vote in votes:
                if "hash" in vote:
                    if (vote["hash"] not in valid_votes or
                        vote["timestamp"] > valid_votes[vote["hash"]]["timestamp"]):
                        valid_votes[vote["hash"]] = vote
            
            valid_votes = list(valid_votes.values())
            log.info("Found %s/%s votes with unique hash for the evaluation.", len(valid_votes), len(votes))

            # TODO 2.1 Filter by passing and failing ZKP
            if type(election_properties.ballot_format) == CheckboxBallotFormat: #TODO: implement other ballot formats
                passed_zkp = []
                for vote in valid_votes:    
                    passed = True

                    #check if structure of recived vote is correct (if it has all necessary attributes)
                    if ("choices" not in vote or "proofs" not in vote or "trashValues" not in vote or "ciphers" 
                        not in vote["trashValues"] or "proofs" not in vote["trashValues"] or "proofOfSum" not in vote):
                        continue

                    #check if each choice either encrypts 0 or 1
                    hashed_voter_secret = vote["hash"]
                    choices = vote["choices"]
                    proofs = vote["proofs"]
                    ciphers = [PaillierCiphertext(self.abb, choice) for choice in choices]
                    bits = self.abb.pk.bits #TODO: may return 2047 instead of 2048, get bits instead from bb
                    if not len(choices) == len(proofs): #not the same number of zkps and choices
                        continue
                    for cipher, proof in zip(ciphers, proofs):
                        result = verify_checkbox_proof(0, 1, self.abb.pk, cipher, proof, bits, hashed_voter_secret)
                        log.debug("Result of Checkbox ZKP: " + str(result))
                        if not result:
                            passed = False

                    #check that all trash values encrypt either 0 or 1 and that all the submitted votes are in the range [min_votes, max_votes]
                    trash_ciphers = vote["trashValues"]["ciphers"]
                    trash_ciphers = [PaillierCiphertext(self.abb, cipher) for cipher in trash_ciphers]
                    trash_proofs = vote["trashValues"]["proofs"]
                    sum_proof = vote["proofOfSum"]
                    lower_bound = election_properties.ballot_format.minNumberOfChoices
                    upper_bound = election_properties.ballot_format.maxNumberOfChoices
                    result = verify_checkbox_range(self.abb, lower_bound, upper_bound, ciphers, trash_ciphers, trash_proofs, sum_proof, self.abb.pk, bits, hashed_voter_secret)
                    log.debug("Result of Checkbox Range ZKP: " + str(result))
                    if not result:
                        passed = False

                    if passed:
                        passed_zkp.append(vote)

                valid_votes = passed_zkp
            if type(election_properties.ballot_format) == RankingBallotFormat:
                #if the evaluator is IrvEvaluation we need to create a matrix from the encrypted votes
                #TODO: different ZKP for IrvEvaluation, becuase it ueses a matrix for evaluation
                #TODO: IrvEvaluation throws an error. We werent able to find out what exactly goes wrong but seems like an implementation error in IrvEvaluation?
                if(type(election_properties.get_evaluator(len(valid_votes), self.abb)) == IrvEvaluation):
                    matrix_list = []
                    for choice in vote["choices"]:
                        matrix_list.append(choice.split(","))
                    matrix = np.array(matrix_list)  
                    vote["choices"] = matrix
                else: #only check the zkp if we dont use IrvEvaluation, since IrvEvaluation uses a matrix instead of just encrypted votes
                    passed_zkp = []
                    for vote in valid_votes:
                        passed = True

                        #check if structure of recived vote is correct (if it has all necessary attributes)
                        if ("choices" not in vote or "proofs" not in vote or "zkp" not in vote["proofs"] or "commitmentSetup" 
                            not in vote["proofs"] or "commitmentSetupPermutationArgument" not in vote["proofs"]):
                            continue

                        ciphers = vote["choices"]
                        hashed_voter_secret = vote["hash"]
                        proof = vote["proofs"]["zkp"]
                        commitmentSetup = vote["proofs"]["commitmentSetup"]
                        commitmentSetupPermutationArgument = vote["proofs"]["commitmentSetupPermutationArgument"]
                        result = verify_ranking_proof(self.abb, election_properties.ballot_format.pointDistribution, election_properties.n_cand, hashed_voter_secret, commitmentSetup, commitmentSetupPermutationArgument, ciphers, proof)
                        log.debug("Result of Ranking ZKP: " + str(result))
                        if result:
                            passed_zkp.append(vote)
                    valid_votes = passed_zkp

            # Convert them to the votes used by the evaluation algorithms (no extra meta-data like hash, timestamp etc)
            deserialize_vote = lambda seralized_vote: election_properties.deserialize_vote(seralized_vote, self.abb)
            valid_votes = [deserialize_vote(vote) for vote in valid_votes]

            # 3+4. Aggregate and evaluate the votes
            evaluation_protocol = ChainedProtocol([AggregationProtocol(election_properties.aggregator, self.abb, election_properties.n_cand),
                                                election_properties.get_evaluator(len(valid_votes), self.abb)])
            self.run_protocol(evaluation_protocol, valid_votes)


def init_trustees(bulletin_board, abbs, ids):
    trustees = []
    n_trustees = len(ids)

    log.debug("Creating trustees with ids : '%s'", ids)

    # create trustees
    for i in range(n_trustees):
        other_ids = ids.copy()
        other_ids.pop(i)
        channel = BulletinBoardChannel(bulletin_board, ids[i], other_ids)
        trustee = Trustee(abbs[i], ids[i], bulletin_board, channel)
        trustees.append(trustee)

    return trustees
