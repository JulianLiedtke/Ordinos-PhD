===============
Troubleshooting
===============

This page tries to solve common issues with the Ordinos software and
its setup.

npm and python version
======================

npm uses python2 to run and will use the command ``python`` by default
to find the python version. Check with ``python --version`` what
python version is executed using this command. If this leads to a
python3 version, the npm commands will fail with an error message
which looks similar to the following example:

.. code-block:: bash

    npm ERR! gyp verb check python checking for Python executable "python" in the PATH
    npm ERR! gyp verb `which` succeeded python python3
    npm ERR! gyp ERR! configure error
    npm ERR! gyp ERR! stack Error: Command failed: python3 -c import sys; print "%s.%s.%s" % sys.version_info[:3];
    npm ERR! gyp ERR! stack   File "<string>", line 1
    npm ERR! gyp ERR! stack     import sys; print "%s.%s.%s" % sys.version_info[:3];
    npm ERR! gyp ERR! stack                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    npm ERR! gyp ERR! stack SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...)?
    npm ERR! gyp ERR! stack
    npm ERR! gyp ERR! stack     at ChildProcess.exithandler (node:child_process:399:12)
    npm ERR! gyp ERR! stack     at ChildProcess.emit (node:events:520:28)
    npm ERR! gyp ERR! stack     at maybeClose (node:internal/child_process:1090:16)
    npm ERR! gyp ERR! stack     at Socket.<anonymous> (node:internal/child_process:449:11)
    npm ERR! gyp ERR! stack     at Socket.emit (node:events:520:28)
    npm ERR! gyp ERR! stack     at Pipe.<anonymous> (node:net:687:12)

To resolve this issue, you have to possible solutions, taken from
`here
<https://stackoverflow.com/questions/20454199/how-to-use-a-different-version-of-python-during-npm-install>`_.

1. You can update your path such that ``python`` leads to a python2
   version.
2. You can use the ``--python`` option of the npm command to select
   the version of python you want to use:

   .. code-block:: bash

       npm install --python=python2.7

  You can even set it to be used always:

  .. code-block:: bash

       npm config set python python2.7

Quasar frontend blank page and Vuex store not found
=======================================================

With some Linux distributions (``nixos``) a global Quasar install
might cause this issue. Global execution of quasar: ``quasar dev``.

Fixed by using: ``npx quasar dev`` instead.