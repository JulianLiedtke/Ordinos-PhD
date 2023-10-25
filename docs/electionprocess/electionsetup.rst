=================
Setup an Election
=================

In order to start an election, all components involved in the voting
ceremony have to be started. This includes:

* The peer server (PS)
* The bulletin board (BB)
* The authentication server (AS)
* The trustees


Starting the Peer Server
~~~~~~~~~~~~~~~~~~~~~~~~

Run the following command in a terminal in ``peerserver`` directory of
the Ordinos software:

.. code-block:: bash

    node peers.js


Starting the Bulletin Board
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Run the following command in a terminal in the top directory of the
Ordinos software:

.. code-block:: bash

    python3 start_bb_server.py


Starting the Authentication Server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Run the following command in a terminal in the top directory of the
Ordinos software:

.. code-block:: bash

    python3 start_as_server.py


Starting the Trustees
~~~~~~~~~~~~~~~~~~~~~

Run the following command in a terminal in the top directory of the
Ordinos software:

.. code-block:: bash

    python3 start_trustee_server.py


Starting the GUI
~~~~~~~~~~~~~~~~

The Ordinos software provides two GUIs, one for the Android
application, and one for the webpage for the user:

* The GUI for the Android app is located at ``gui/app/``
* The GUI for the website is located at ``gui/website/``

To start one of the GUIs, enter the directory defined above with a
terminal.

You can start the GUI in **development mode** (hot-code reloading,
error reporting, etc.) with the following command:

.. code-block:: bash

    quasar dev

You can start the GUI in **production mode** with the following
command:

.. code-block:: bash

    quasar build

The configuration of the GUIs can be customized. For information, see
`this page <https://quasar.dev/quasar-cli/quasar-conf-js>`_.
