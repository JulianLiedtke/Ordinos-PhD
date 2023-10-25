from src.election.aggregation.simple_addition import SimpleAdditionVoteAggregation
from src.election.election_properties import ElectionProperties
from src.util.point_vote import IllegalVoteException
from src.election.parliamentary_ballot.parliamentary_evaluation import ParliamentaryEvaluation


class ParliamentaryBallotProperties(ElectionProperties):
    aggregator = SimpleAdditionVoteAggregation

    def __init__(self, candidates, n_seats, secret_residual, clause,**base_settings):
        """
        :param num_seats: number of seats in parliament
        :param secret_residual: pass true iff secred version is required
        :param clause: number of required votes for a party to obtain seats
        """
        super().__init__(candidates, logger_name_extension=str(n_seats)+str(secret_residual)+str(clause),**base_settings)
        self.n_seats = n_seats
        self.secret_residual = secret_residual
        self.clause = clause

    def get_evaluator(self, n_votes, abb):
        return ParliamentaryEvaluation(n_votes, self.n_seats, self.secret_residual, self.clause)

    def generate_valid_vote(self, generic_vote, abb):
        """ inits a dictionary containing each candidate with zero votes """
        vote = {}

        # set every cand to 0 and find cand with biggest points, prefer lower numbers if equals
        for cand in range(self.n_cand):
            vote[cand] = abb.enc(0)

        # set index with highest points to 1
        winners = generic_vote.get_ranking_map()[1]
        if len(winners) != 1:
            raise IllegalVoteException("More or less than one winner")
        vote[winners[0]] = abb.enc(1)
        return vote

    def serialize(self):
        parliament_specific_settings = {
            "n_seats": self.n_seats,
            "secret_residual": self.secret_residual,
            "clause": self.clause,

        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(parliament_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        borda_specific_args = {
            "n_seats": serialized["evaluation"]["settings"].get("n_seats"),
            "secret_residual": serialized["evaluation"]["settings"].get("secret_residual"),
            "clause": serialized["evaluation"]["settings"].get("clause"),
        }
        args = super().serialized_to_args(serialized)
        args.update(borda_specific_args)
        return args

    def serialize_vote(self, valid_vote):
        serialized_vote = {"choices": [
            vote.serialize() for cand, vote in valid_vote.items()
        ]}
        return serialized_vote

    def deserialize_vote(self, serialized_vote, abb):
        deserialized_vote = [
            abb.deserialize_cipher(vote) for vote in serialized_vote["choices"]
        ]
        return deserialized_vote
