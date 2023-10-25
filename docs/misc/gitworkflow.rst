============
Git Workflow
============

This page describes the git workflow that is used for the development
of the Ordinos software.

The Main Concepts
~~~~~~~~~~~~~~~~~

At the core, the development model is greatly inspired by existing
models out there. The repository holds two main branches with an
infinite lifetime:

1. master
2. develop

We consider **origin/master** to be the main branch where the
source code of HEAD always reflects a *production-ready* state.

We consider **origin/develop** to be the main branch where the 
source code of HEAD always reflects a state with the latest
delivered development changes for the next release. Some would
call this the "integration branch".

.. warning::

    Direct push to **master** and **develop** branches is forbidden.

    .. Every push to **develop** branch will deploy to staging.

    .. Every push to master will create a new release and deploy to production.

.. warning::

    Pull requests of feature branches ONLY into develop branch.

.. Before merging a PR into **develop** branch the CI should pass (merge button disabled until it's done).

Feature Branch
~~~~~~~~~~~~~~

- May branch off from: **develop**
- Must merge back into: **develop**
- Branch naming convention: **feat/short_description**

Creation of a Feature Branch
----------------------------


When starting work on a new feature, branch off from the develop branch.

.. code-block:: bash

    git checkout -b feat/short_description
