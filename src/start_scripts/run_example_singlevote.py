from src.crypto.plain_abb import PlainABB
from src.election.election_authority import ElectionAuthority
from src.election.single_vote.single_vote_election_system import \
    SingleVoteElection
from src.election.trustee.trustee import init_trustees
from src.protocols.protocol_suite import EmptyProtocolSuite
from src.util.point_vote import PointVote


def run_example_singlevote():
    abbs = PlainABB.gen_trustee_abbs(64, 5, 3, EmptyProtocolSuite)
    trustee_gen = lambda bulletin_board: init_trustees(bulletin_board, abbs, [i for i, _ in enumerate(abbs)])
    e = ElectionAuthority(trustee_gen, SingleVoteElection(4), local_bulletin_board=True)
    e.add_generic_vote(PointVote([1, 0, 0, 0]), count=0)
    e.add_generic_vote(PointVote([0, 1, 0, 0]), count=1)
    e.add_generic_vote(PointVote([0, 0, 1, 0]), count=2)
    e.add_generic_vote(PointVote([0, 0, 0, 1]), count=3)
    result = e.trigger_evaluation()
    print(result)
