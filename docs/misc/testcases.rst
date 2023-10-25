==========
Test Cases
==========

The Ordinos software provides several test cases. You can run all of
them by executing the following command in the root directory of the
Ordinos software:

.. code-block:: bash

    python3 -m unittest discover tests

.. note::

    If you are using Visual Studio Code and have configurated the
    ``tasks.json`` and ``keybinding.json`` files as described in the
    setup guide, you can run the test cases with the keyboard shortcut
    ``Ctrl+F3``.

In order to run the test cases, you need to set up servers (otherwise,
the server related test cases, like evaulation of voting methods,
fail) and possibly need to clean the data locations of the servers.

In order to clean the data locations of the servers, you can run the ``clean_data_dirs.py`` script as follows:

.. code-block:: bash

    python3 clean_data_dirs.py

Next, you have to start the servers. You can do so with the following
commands:

.. code-block:: bash

    python3 start_as_server.py

.. code-block:: bash

    python3 start_bb_server.py

.. code-block:: bash

    python3 start_trustee_server.py

.. toctree::
   :maxdepth: 2
   :caption: Test Cases:
   :glob:

   ../testdocs/*
