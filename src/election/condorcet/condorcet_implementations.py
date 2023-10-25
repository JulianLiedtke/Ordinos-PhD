from src.election.condorcet.condorcet_no_winner_evaluations import CopelandEvaluationFast, CopelandEvaluationSafe, MiniMaxMarginsEvaluation, MiniMaxWinningVotesEvaluation, SmithEvaluation, SmithFastEvaluation
from src.election.condorcet.condorcet_election_system import Condorcet
from src.election.election_properties import ElectionProperties


class MiniMaxMarginsSmith(Condorcet):
    def __init__(self, candidates, leak_better_half=False, smith_leak_min_copeland=False, **base_settings):
        base_settings.update({
            "leak_better_half": leak_better_half,
        })
        if smith_leak_min_copeland:
            base_settings["additional_evaluators"] = [SmithFastEvaluation, MiniMaxMarginsEvaluation]
        else:
            base_settings["additional_evaluators"] = [SmithEvaluation, MiniMaxMarginsEvaluation]
        super().__init__(candidates, **base_settings)
        self.smith_leak_min_copeland = smith_leak_min_copeland

    def serialize(self):
        margins_specific_settings = {
            "smith_leak_min_copeland": self.smith_leak_min_copeland,
        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(margins_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        args = ElectionProperties.serialized_to_args(serialized)
        args.update({
            "leak_better_half": serialized['evaluation']['settings']['leak_better_half'],
            "smith_leak_min_copeland": serialized['evaluation']['settings']['smith_leak_min_copeland']
        })
        return args


class MiniMaxWinningVotesSmith(Condorcet):
    def __init__(self, candidates, leak_better_half=False, smith_leak_min_copeland=False, **base_settings):
        base_settings.update({
            "leak_better_half": leak_better_half
        })
        if smith_leak_min_copeland:
            base_settings["additional_evaluators"] = [SmithFastEvaluation, MiniMaxWinningVotesEvaluation]
        else:
            base_settings["additional_evaluators"] = [SmithEvaluation, MiniMaxWinningVotesEvaluation]
        super().__init__(candidates, **base_settings)
        self.smith_leak_min_copeland = smith_leak_min_copeland

    def serialize(self):
        winning_votes_specific_settings = {
            "smith_leak_min_copeland": self.smith_leak_min_copeland,
        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(winning_votes_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        args = ElectionProperties.serialized_to_args(serialized)
        args.update({
            "leak_better_half": serialized['evaluation']['settings']['leak_better_half'],
            "smith_leak_min_copeland": serialized['evaluation']['settings']['smith_leak_min_copeland']
        })
        return args


class Copeland(Condorcet):
    def __init__(self, candidates, leak_better_half=False, leak_max_points=False,
                 evaluate_condorcet=False, **base_settings):
        base_settings.update({
            "leak_better_half": leak_better_half,
            "evaluate_condorcet": evaluate_condorcet
        })
        if leak_max_points:
            base_settings["additional_evaluators"] = [CopelandEvaluationFast]
        else:
            base_settings["additional_evaluators"] = [CopelandEvaluationSafe]
        super().__init__(candidates, **base_settings)
        self.leak_max_points = leak_max_points

    def serialize(self):
        winning_votes_specific_settings = {
            "leak_max_points": self.leak_max_points,
        }
        settings = super().serialize()
        settings["evaluation"].setdefault("settings", {}).update(winning_votes_specific_settings)
        return settings

    @classmethod
    def serialized_to_args(cls, serialized):
        args = ElectionProperties.serialized_to_args(serialized)
        args.update({
            "leak_better_half": serialized['evaluation']['settings']['leak_better_half'],
            "leak_max_points": serialized['evaluation']['settings']['leak_max_points'],
            "evaluate_condorcet": serialized['evaluation']['settings']['evaluate_condorcet']
        })
        return args
