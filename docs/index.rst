.. Ordinos documentation master file, created by
   sphinx-quickstart on Wed Feb  2 10:32:00 2022.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Ordinos's documentation!
===================================

Ordinos framework for tally-hiding e-voting. Ordinos currently
supports the following voting methods:

* Single-Vote and Multi-Vote
    * Complete ranking
    * Most votes
    * Ranking/set of best/worst k candidates
* Borda
    * Various variants
* Instant-runoff-voting (IRV)
    * Public/secret elimination
* Condorcet Voting
    * Various variants and chaining
    * Plain
    * Weak
    * Copeland
    * MinMax
    * Smith
    * Schulze
* Majority Judgement
* Parliament Elections
    * Hare-Niemeyer

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   misc/setup
   misc/gitworkflow
   misc/testcases
   misc/development
   electionprocess/electionrunning
   misc/todos
   misc/troubleshooting

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
