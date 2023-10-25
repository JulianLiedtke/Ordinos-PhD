from src.crypto.plain_abb import PlainABB
from src.election.condorcet.condorcet_election_system import Condorcet
from src.election.election_authority import ElectionAuthority
from src.election.trustee import trustee
from src.protocols.protocol_suite import EmptyProtocolSuite
from src.util.point_vote import PointVote
from src.crypto.paillier_abb import PaillierABB
from src.protocols.sublinear import SubLinearProtocolSuite


def run_example_condorcet():
    # abbs = PlainABB.gen_trustee_abbs(64, 5, 3, EmptyProtocolSuite)
    abbs = PaillierABB.gen_trustee_abbs(64, 2, 2, SubLinearProtocolSuite)
    key_generator = lambda bulletin_board: trustee.init_trustees(bulletin_board, abbs, [i for i, _ in enumerate(abbs)])

    condorcet_system = ElectionAuthority(key_generator, Condorcet(4), local_bulletin_board=True)
    condorcet_system.add_generic_vote(PointVote([4, 3, 2, 1]), count=1)
    result = condorcet_system.trigger_evaluation()
    print(result)
