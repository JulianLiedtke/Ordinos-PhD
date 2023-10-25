import random
from itertools import permutations

import numpy as np

from src.election.election_properties import ElectionProperties
from src.election.evaluation.irv_evaluation import IrvEvaluation
from src.util.point_vote import IllegalVoteException
from src.election.aggregation.vote_remember import VoteRememberVoteAggregation


class Instant_runoff(ElectionProperties):
    aggregator = VoteRememberVoteAggregation

    def __init__(self, candidates, bits_int, sys_id, **base_settings):
        """only usable with sys_id 0 - 3"""
        super().__init__(candidates, logger_name_extension=str(sys_id), **base_settings)
        self.bits_int = bits_int
        self.system_id = sys_id

    def serialize(self):
        irv_specific_settings = {
            "bitsInt": self.bits_int,
            "systemID": self.system_id,
        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(irv_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        irv_specific_args = {
            "bits_int": serialized["evaluation"]["settings"].get("bitsInt"),
            "sys_id": serialized["evaluation"]["settings"].get("systemID")
        }
        args = super().serialized_to_args(serialized)
        args.update(irv_specific_args)
        return args

    def generate_valid_vote(self, generic_vote, abb):
        """ inits a dictionary containing each candidate with zero votes """
        if generic_vote.get_number_of_ignored() > 0:
            raise IllegalVoteException("Candidates couldn't be ignored")
        if generic_vote.get_first_doubled_position() > 0:
            raise IllegalVoteException("Candidates couldn't be ranked on same position")

        positions = generic_vote.get_positions()

        # generate empty matrix and fill it
        matrix = np.matrix([[abb.enc(0) for i in range(self.n_cand)] for i in range(self.n_cand)])
        for cand in range(self.n_cand):
            matrix[positions[cand] - 1, cand] = abb.enc(1)

        return matrix

    def get_evaluator(self, n_votes, abb):
        return IrvEvaluation(self.bits_int, self.system_id)

    def serialize_vote(self, valid_vote):
        serialized_vote = {"choices": [
            [item.serialize() for item in np.array(row)[0]] for row in valid_vote
        ]}
        return serialized_vote

    def deserialize_vote(self, serialized_vote, abb):
        deserialized_vote = [[abb.deserialize_cipher(entry) for entry in matrix] for matrix in serialized_vote["choices"]]
        return deserialized_vote


class IRVElectionSystemNormal(Instant_runoff):
    aggregator = VoteRememberVoteAggregation

    def __init__(self, candidates, bits_int, sys_id):
        """only usable with sys_id 0 - 3"""
        super().__init__(candidates, bits_int, sys_id)
        self.bits_int = bits_int
        self.system_id = sys_id

    def serialize(self):
        irv_specific_settings = {
            "bitsInt": self.bits_int,
            "systemID": self.system_id,
        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(irv_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        irv_specific_args = {
            "bits_int": serialized["evaluation"]["settings"].get("bitsInt"),
            "sys_id": serialized["evaluation"]["settings"].get("systemID")
        }
        args = super().serialized_to_args(serialized)
        args.update(irv_specific_args)
        return args

    def generate_valid_vote(self, generic_vote, abb):
        """ inits a dictionary containing each candidate with zero votes """
        if generic_vote.get_number_of_ignored() > 0:
            raise IllegalVoteException("Candidates couldn't be ignored")
        if generic_vote.get_first_doubled_position() > 0:
            raise IllegalVoteException("Candidates couldn't be ranked on same position")

        positions = generic_vote.get_positions()

        # generate empty matrix and fill it
        matrix = np.matrix([[abb.enc(0) for i in range(self.n_cand)] for i in range(self.n_cand)])
        for cand in range(self.n_cand):
            matrix[positions[cand] - 1, cand] = abb.enc(1)

        return matrix

    def get_evaluator(self, n_votes, abb):
        return IrvEvaluation(self.bits_int, self.system_id)


class IRVElectionSystemAlternative(Instant_runoff):
    aggregator = VoteRememberVoteAggregation

    def __init__(self, candidates, bits_int, sys_id):
        """only usable with sys_id 4 or 5"""
        super().__init__(candidates, bits_int, sys_id)
        self.system_id = sys_id
        self.bits_int = bits_int
        self.tuples = list(permutations(list(range(1, self.n_cand + 1))))

    def serialize(self):
        irv_specific_settings = {
            "bitsInt": self.bits_int,
            "systemID": self.system_id,
        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(irv_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        irv_specific_args = {
            "bits_int": serialized["evaluation"]["settings"].get("bitsInt"),
            "sys_id": serialized["evaluation"]["settings"].get("systemID"),
        }
        args = super().serialized_to_args(serialized)
        args.update(irv_specific_args)
        return args

    def generate_valid_vote(self, generic_vote, abb):
        """!!!vote will not transformed into tupel, the tupel will be generated with random!!!"""
        # generate one random vote as dict: tuples -> Enc(0)/Enc(1)
        # exactly one tuple gets Enc(1)
        vote = dict()
        for tuple in self.tuples:
            vote[tuple] = abb.enc(0)
        index = random.randrange(len(self.tuples))
        rand_tuple = self.tuples[index]
        vote[rand_tuple] = abb.enc(1)

        return vote

    def get_evaluator(self, n_votes, abb):
        return IrvEvaluation(self.bits_int, self.system_id)
