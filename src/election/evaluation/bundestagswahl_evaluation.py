import logging
import numpy as np
from src.crypto.paillier_abb import PaillierCiphertext

from src.election.evaluation.evaluation_protocol import EvaluationProtocol
from src.election.evaluation.sainte_lague import SainteLagueEvaluation
from src.election.evaluation.simple_winner_evaluation import SimpleWinnerEvaluation
from src.crypto.abb import ABB
from src.election.votes.one_candidate_vote import VoteType

log = logging.getLogger(__name__)

class BundestagswahlEvaluation(EvaluationProtocol):
    abb = None

    def __init__(self, abb: ABB, n_valid_votes: list, parties: list, constituency_names: list, state_names: list, const_state_mapping: dict, min_seats_contingent: int, population_distribution: list, minority_parties: list):
        self.abb = abb
        self.min_seats_contingent = min_seats_contingent
        self.population_distribution = population_distribution
        self.minority_parties = minority_parties
        self.constituency_names = constituency_names
        self.state_names = state_names
        self.const_state_mapping = const_state_mapping
        self.parties = parties
        self.n_valid_primary_votes = n_valid_votes[0]
        self.n_valid_secondary_votes = n_valid_votes[1]
        self.total_valid_primary_votes = sum(self.n_valid_primary_votes)
        self.total_valid_secondary_votes = sum(self.n_valid_secondary_votes)
        self.n_valid_votes = self.total_valid_primary_votes + self.total_valid_secondary_votes

        # variables to save encrypted interim results
        self.primary_votes = None
        self.secondary_votes = None
        self.direct_mandates_constituency = None
        self.direct_mandates_state = None
        self.direct_mandates_party = None
        self.large_parties = None
        self.relevant_secondary_votes = {}
        super().__init__()
        

    def run(self, votes):
        log.info("Bundestagswahl Evaluation")
     
        
        # deserialize votes
        for vote_type in votes:
            for const in votes[vote_type]:
                for party in votes[vote_type][const]:
                    #votes[vote_type][const][party] = PaillierCiphertext.deserialize(self.abb, votes[vote_type][const][party])
                    votes[vote_type][const][party] = self.abb.deserialize_cipher(votes[vote_type][const][party])
        self.primary_votes = votes[0]
        self.secondary_votes = votes[1]
        log.info("primary----------------------------------\n" + str(self.primary_votes)+ "\n--------------------------------")
        log.info("secondary----------------------------------\n" + str(self.secondary_votes)+ "\n--------------------------------")
        self.evaluate_first_votes()
       # a = self.abb.enc_no_r(5)
     #   b = self.abb.randomize(a)
     #   log.info("aaabbb: " + str(self.abb.dec(a)))
            
        
        # commented to test rest
        self.evaluate_secondary_votes()
   #     self.calc_min_seats(votes, secondary_votes)

        """
        # Test determine_min_seats
        max_con = 35
        max_dir = 33
        con = [5, 2, 2, 15,1,3,4,4,35,6,11,3,8,21,2]
        dir = [2, 0,0,8,0,0,3,3,30,4,7,1,7,33,0]
        for i in range(len(con)):
            con_i = self.abb.enc_no_r(con[i])
            dir_i = self.abb.enc_no_r(dir[i])
            
            res = self.determine_min_seats(con_i, dir_i, max_con, max_dir)
            res_dec = self.abb.dec(res)
            log.info(str(i) + ": " + str(res_dec))
        """


        # return value, so that everything works
        return [1]

    def evaluate_first_votes(self):
        """
        Calculates direct mandates and sum of direct mandates per state.
        """
        self.calc_direct_mandates()
        self.add_direct_mandates()

    def evaluate_secondary_votes(self):
        #TODO
        log.info("secondary")
        # 5%-clause
        large_parties = self.get_large_parties(self.get_secondary_votes_per_party(self.secondary_votes))
        for const in self.constituency_names:
            arr = []
            for party in large_parties:
                arr.append(self.secondary_votes[const][party])
            self.relevant_secondary_votes[const] = arr
        self.calc_min_seats(self.relevant_secondary_votes)

    def add_direct_mandates(self):
        """
        Adds the direct mandates both by state and by party.
        """
        direct_mandates_state = {}
        direct_mandates_party = {}

        # initialize with zero
        for state in self.state_names:
            direct_mandates_state[state] = {}
            for party in self.parties:
                direct_mandates_state[state][party] = self.abb.enc_zero
        for party in self.parties:
            direct_mandates_party[party] = self.abb.enc_zero

        for const in self.constituency_names:       
            corresponding_state = self.const_state_mapping[str(const)]
            for party in self.parties:
                direct_mandates_state[corresponding_state][party] = self.abb.eval_add_protocol(direct_mandates_state[corresponding_state][party], self.direct_mandates_constituency[const][party])
        self.direct_mandates_state = direct_mandates_state

        for state in self.state_names:
            for party in self.parties:
                direct_mandates_party[party] = self.abb.eval_add_protocol(direct_mandates_party[party], direct_mandates_state[state][party])
        self.direct_mandates_party = direct_mandates_party

        # decrypt to test
        #for state in direct_mandates_state:
        #    for party in direct_mandates_state[state]:
        #        direct_mandates_state[state][party] = self.abb.dec(direct_mandates_state[state][party])
        #log.info("dec" + str(direct_mandates_state))
        #for party in direct_mandates_party:
        #    direct_mandates_party[party] = self.abb.dec(direct_mandates_party[party])
        #log.info("dec partyies: " + str(direct_mandates_party))
        

    def calc_direct_mandates(self):
        """
        Calculates the winner (= relative majority) of each constituency.
        """
        log.info("calc direct mandates")
        # TODO: figure out, what value bits actually has
        bits = self.abb.get_bits_for_size(max(self.n_valid_primary_votes))
        direct_mandates = {}
        for const in self.primary_votes:
            evaluation = SimpleWinnerEvaluation(bits, enc_result=True)
            evaluation.set_abb(self.abb)
            direct_mandates[const] = evaluation.run(self.cand_dict_to_array(self.primary_votes[const]))
        #log.info("direct mandates finished: " + str(direct_mandates))
        # TODO: exactly one winner has to be returned --> random (BWG §5)
        self.direct_mandates_constituency = direct_mandates
        return direct_mandates

    def cand_dict_to_array(self, cand_dict):
        array = []
        for party in self.parties:
            votes = cand_dict[party]
            array.append(votes)
        return array

    def get_secondary_votes_per_party(self, secondary_votes: dict):
        votes_per_party = {}
        for party in self.parties:
            votes_per_party[party] = self.abb.enc_zero

        for state in self.state_names:
            for party in self.parties:
                votes_per_party [party] = self.abb.eval_add_protocol(secondary_votes[state][party], votes_per_party[party])
        return votes_per_party
    
    def get_large_parties(self, secondary_votes_per_party): 
        """
        Returns a decrypted array containing all parties over 5%.
        """
        log.info("5percent: " + str(int(np.ceil(self.total_valid_secondary_votes * 0.05))))
        min_votes = self.abb.enc_no_r(int(np.ceil(self.total_valid_secondary_votes * 0.05)))
        bits1 = self.abb.get_bits_for_size(self.total_valid_secondary_votes)
        bits2 = len(self.constituency_names)
        three = self.abb.enc_no_r(3)
        large_parties = []
        for party in self.parties:
            if party in self.minority_parties:
                large_parties.apend(party)
            else:
                min_indicator_5 = self.abb.gt(secondary_votes_per_party[party], min_votes, bits1)
                min_indicator_direct = self.abb.gt(self.direct_mandates_party[party], three, bits2)
                min_indicator_added = self.abb.eval_add_protocol(min_indicator_5, min_indicator_direct)
                min_indicator = self.abb.gt(min_indicator_added, self.abb.enc_no_r(1), self.abb.get_bits_for_size(2))
                min_indicator_dec = self.abb.dec(min_indicator)
                if min_indicator_dec == 1:
                    large_parties.append(party)
        self.large_parties = large_parties
        return large_parties
        
    
    def calc_min_seats(self, votes: dict):
        """
        Calculates the minimal number of seats a party must get.
        Returns: dict with a number of seats for each party
        """
        log.info("function min_seats")
        
        # calculate how many seats a federal state gets
        # see https://bundeswahlleiter.de/dam/jcr/cbceef6c-19ec-437b-a894-3611be8ae886/btw21_heft3.pdf, "erste Oberverteilung"
        seats_states = SainteLagueEvaluation.hoechstzahlverfahren_unencrypted(self.min_seats_contingent, self.population_distribution)

        # calculate per federal state how many seats a party gets (of all seats for this federal state) 
        # accourding to the secondary votes in each federal state
        # see "1. Unterverteilung"
        seats_state = {}
        for state in self.state_names:
            # TODO: maybe get smaller number than n_valid_votes, maybe per state
            seats_array = SainteLagueEvaluation.hoechstzahlverfahren(self.abb, seats_states[state], votes[state], self.n_valid_votes)
            # convert to dict
            seats_state[state] = seats_array
        
        # calculate minimum seats per party 
        # see "Feststellung Mindestsitzanzahlen der Parteien"
     
        #seats_state = {}
        #state_0 = [0,1,1,1,0]
        #state_1 = [0,1,0,2,3]
        #for i in range(5):
        #    state_0[i] = self.abb.enc_no_r(state_0[i])
        #    state_1[i] = self.abb.enc_no_r(state_1[i])
        #seats_state[self.state_names[0]] = state_0
        #seats_state[self.state_names[1]] = state_1
        # add seats per party TODO: falsch
        #cur_seats_party = [self.abb.enc_zero for i in range(len(self.large_parties))]
        #for state in self.state_names:
        #    for i in range(len(self.large_parties)):
        #        cur_seats_party[i] = self.abb.eval_add_protocol(cur_seats_party[i], (seats_state[state])[i])
        
        min_claim_party = [self.abb.enc_zero for i in range(len(self.large_parties))]
        for i in range(len(self.large_parties)):
            for state in self.state_names:
                tmp = self.determine_min_seats((seats_state[state])[i], self.direct_mandates_state[state][self.large_parties[i]], self.min_seats_contingent, 5 *len(self.constituency_names)) #TODO: remove 5
                min_claim_party[i] = self.abb.eval_add_protocol(min_claim_party[i], tmp)

        # decrypt to test
        tmp = []
        for i in range(len(min_claim_party)):
            tmp.append(self.abb.dec(min_claim_party[i]))
        log.info("mindestanspruch" + str(tmp))
        # end test

        return min_claim_party
    
    def determine_min_seats(self, seat_kontingent: PaillierCiphertext, n_direct_seats: PaillierCiphertext, max_contingent: int, max_direct_seats: int):
        """
        Calculates the minimal number of seats for a party in a federal state. 
        See "Feststellung Mindestsitzanzahlen der Parteien"
        seat_kontingent: number of seats a party gets in a state according to the prior calculation with the secondary votes.
        n_direct_seats: number of direct mandates a party gets in a state
        max_contingent: maximum possible seat_kontingent
        max_direct_seats: maximum possible number of n_direct_seats
        returns: n_direct_seats, if seat_kontingent <= n_direct_seats
                or ceil((seat_kontingent + n_direct_seats)/2) , if seat_kontingent > n_direct_seats
        """
        max_number = max(max_contingent, max_direct_seats)
        max_diff = max_contingent
        bits = self.abb.get_bits_for_size(max_number)

        direct_greater = self.abb.gt(n_direct_seats, seat_kontingent, bits)
        direct_smaller = self.abb.eval_sub_protocol(1, direct_greater)
        mean = self.calc_rounded_mean(seat_kontingent, n_direct_seats, max_diff)
        prod1 = self.abb.eval_mul_protocol(direct_greater, n_direct_seats)
        prod2 = self.abb.eval_mul_protocol(direct_smaller, mean)
        return self.abb.eval_add_protocol(prod1, prod2)
        
    def calc_rounded_mean(self, a: PaillierCiphertext, b: PaillierCiphertext, max_a: int):
        """
        Calculates the round up arithmetic mean between the two numbers if a > b
        max_a: upper bound for a
        return ceil((a+b)/2), if a > b, else probably rubbish 
        """
        log.info("calc_mean")
        diff = self.abb.eval_sub_protocol(a, b)
        diff_one = self.abb.eval_add_protocol(diff, 1)
        r = [None]

        # starts with 1 because a > b >= 0
        for i in range(1, max_a + 2):
            enc = self.abb.enc_no_r(2*i)
            bits = self.abb.get_bits_for_size(max(max_a+1, 2*i))
            gt = self.abb.gt(diff_one, enc, bits)
            r.append(gt)               

        indicators = [None for i in range(len(r)-1)]
        for i in range(1, max_a + 1):
            indicators[i] = self.abb.eval_sub_protocol(r[i], r[i+1])
        
        index = self.abb.enc_zero
        for i in range(1, max_a + 1):
            prod = self.abb.eval_mul_protocol(i, indicators[i])
            index = self.abb.eval_add_protocol(index, prod)
        return self.abb.eval_add_protocol(index, b)

