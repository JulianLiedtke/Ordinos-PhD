============
Requirements
============

Ordinos requires the following:

* Python3 3.7 or superior
* Python2
* Node.js 12.22.1 or superior
* npm
* quasar

.. code-block:: bash

    sudo apt install python3 npm
    sudo npm install -g @quasar/cli

Installing python Requirements
------------------------------

Install the requirements via

.. code-block:: bash

    python3 -m pip install -r requirements.txt --user 

.. note::

    If you are using windows, the installation of the gmpy2 module
    might cause errors. You can download a wheel file of gmpy2 that
    matches your python3 version from the `Unofficial Windows Binaries
    for Python Extension Packages
    <https://www.lfd.uci.edu/~gohlke/pythonlibs/>`_ page. You have to
    take care of the following:

    * The cp number should match your python version (i.e., cp37 for
      python 3.7).
    * Use the correct 32-bit or 64-bit version of the wheel file.

    The wheel file can be installed via

    .. code-block:: bash

        pip install <file>.whl --user 

Installing Dependencies for the Node.js projects
------------------------------------------------

The Ordinos software provides three Node.js projects:

* The peer server (PS) is located at ``peerserver/``
* The GUI for the android application is located at ``gui/app/``
* The GUI for the website is located at ``gui/website/``

Each Node.js project comes with custom dependencies. Go to each GUI
directory and install the dependencies via

.. code-block:: bash

  npm install
