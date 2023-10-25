import logging

from src.election.election_properties import ElectionProperties
from src.election.evaluation.bundestagswahl_evaluation import BundestagswahlEvaluation
from src.election.aggregation.simple_addition import SimpleAdditionVoteAggregation
from src.election.votes.vote import ConstituencyVote
from src.election.votes.one_candidate_vote import VoteType
from src.util.point_vote import IllegalVoteException
from src.crypto.abb import ABB

log = logging.getLogger(__name__)


class Bundestagswahl(ElectionProperties):
    aggregator = SimpleAdditionVoteAggregation

    
    def __init__(self, candidates, constituencies=299, states = 16, const_state_mapping: dict = None,  min_seats=598, 
                 population_distribution=None, minority_parties: list = [], ballot_format=None, start_date=None, due_date=None, title="", expected_votes_n=None, use_constituencies = True,
                 logger_name_extension="", peer_server_address="", authentication_server_address="", bulletin_board_address=""):
        # TODO: set population_distribution and const_state_mapping a reasonable default value
        # TODO: check if other params are needed --> if yes, insert them in serialize / deserialize
        """candidates, constituencies and states could either be the amount of cands or a list of names
        min_seats: Minimal number of seats that has to be allocated
        population_distribution: number of citizens per constituency
        """
        super().__init__(candidates, ballot_format, start_date, due_date, title, expected_votes_n, use_constituencies,
                 logger_name_extension, peer_server_address, authentication_server_address, bulletin_board_address)
        if isinstance(constituencies, list):
            self.n_constituencies = len(constituencies)
            self.constituency_names = constituencies
        else:
            self.n_constituencies = constituencies
            self.constituency_names = [i for i in range(self.n_constituencies)]
        if isinstance(states, list):
            self.n_states = len(states)
            self.state_names = states
        else:
            self.n_states = states
            self.state_names = [i for i in range(self.n_states)]
        self.const_state_mapping = const_state_mapping
        self.min_seats = min_seats
        self.population_distribution = population_distribution
        self.minority_parties = minority_parties

    def serialize(self):
        bundestagswahl_specific_settings = {
            "constituencies": self.constituency_names,
            "states": self.state_names,
            "const_state_mapping": self.const_state_mapping, # TODO: maybe not serialized
            "min_seats": self.min_seats,
            "population_distribution": self.population_distribution,
            "minority_parties": self.minority_parties
        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(bundestagswahl_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        bundestagswahl_specific_args = {
            "constituencies": serialized["evaluation"]["settings"].get("constituencies"),
            "states": serialized["evaluation"]["settings"].get("states"),
            "const_state_mapping": serialized["evaluation"]["settings"].get("const_state_mapping"),
            "min_seats": serialized["evaluation"]["settings"].get("min_seats"),
            "population_distribution": serialized["evaluation"]["settings"].get("population_distribution"),
            "minority_parties": serialized["evaluation"]["settings"].get("minority_parties")
        }
        args = super().serialized_to_args(serialized)
        args.update(bundestagswahl_specific_args)
        return args

    
    def aggregator(self):
        return SimpleAdditionVoteAggregation()
 
    def get_evaluator(self, n_votes, abb):
        # n_votes is a list partitioning the votes by type and constituency
        return BundestagswahlEvaluation(abb, n_votes, self.candidate_names, self.constituency_names, self.state_names, self.const_state_mapping, self.min_seats, self.population_distribution, self.minority_parties)
    

    # generic vote is not encrypted
    #def generate_valid_vote(self, generic_vote : ConstituencyVote, abb: ABB):
    #    """
    #    Test if a generic vote is a valid vote for this election.
    #    """
    #    if not (len(generic_vote.getChoices()) == self.n_cand):
    #        raise IllegalVoteException("Wrong number of candidates used.")
    #    if not( 0 <= generic_vote.getConstitency() < self.n_constituencies):
    #        raise IllegalVoteException("Constituency does not exist.")
    #    count_zeros = abb.enc_no_r(0)
    #    count_ones = abb.enc_no_r(0)
    #    for enc_choice in generic_vote.getChoices():
    #        # TODO:  check how many bits needed
    #        bits = 64
    #        compare_zero = abb.gt(enc_choice, abb.enc_no_r(0), bits)
    #        compare_one = abb.eq(enc_choice, abb.enc_no_r(1), bits)
    #        count_zeros = abb.eval_add_protocol(count_zeros, compare_zero)
    #        count_ones = abb.eval_add_protocol(count_ones, compare_one)
    #    dec_zeros = abb.dec(count_zeros)
    #    dec_ones = abb.dec(count_ones)
    #    if not (dec_zeros == self.n_cand - 1 and dec_ones == 1):
    #        raise IllegalVoteException("The selected candidate must be marked with one and all others with zero.")
    #    return generic_vote

    def generate_valid_vote(self, generic_vote : ConstituencyVote, abb: ABB):
        """
        Test if a generic vote is a valid vote for this election.
        If yes, the vote is encrypted and returned
        """
        if not (len(generic_vote.getChoices()) == self.n_cand):
            raise IllegalVoteException("Wrong number of candidates used.")
        if not( 0 <= generic_vote.getConstitency() < self.n_constituencies):
            raise IllegalVoteException("Constituency does not exist.")
        count_zeros = 0
        count_ones = 0
        for choice in generic_vote.getChoices():
            if choice == 0:
                count_zeros += 1
            if choice == 1:
                count_ones +=1
        if not (count_zeros == self.n_cand - 1 and count_ones == 1):
            raise IllegalVoteException("The selected candidate must be marked with one and all others with zero.")
        
        if not generic_vote.getType() in [VoteType.first_vote, VoteType.secondary_vote, None]:
            raise IllegalVoteException("Vote type is not valid.")

        # encrypt votes
        choices = generic_vote.getChoices()
        for i in range(len(choices)):
            choices[i] = abb.enc_no_r(choices[i])
        generic_vote.setChoices(choices)
        return generic_vote

    
    def serialize_vote(self, valid_vote: ConstituencyVote):
        serialized_vote = {
            "choices": [
                choice.serialize() for choice in valid_vote.getChoices()
            ],
            "constituency": valid_vote.getConstitency(),
            "type": valid_vote.getType()
        }
        return serialized_vote

    def deserialize_vote(self, serialized_vote, abb: ABB):
        choices = [
            abb.deserialize_cipher(choice) for choice in serialized_vote["choices"]
        ]
        constituency = serialized_vote["constituency"]
        type = serialized_vote["type"]
        return ConstituencyVote(choices, constituency, type)
    
    def get_choices(self, serialized_vote, abb: ABB):
        return [abb.deserialize_cipher(choice) for choice in serialized_vote["choices"]]
