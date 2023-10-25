=============================
Setting up Visual Studio Code
=============================

We recommend using Visual Studio Code (VSC) for Ordinos.

tasks.json
----------

To use the (predefined) tasks, add ``.vscode/tasks.json`` by copying
the content of right template you'll find in the ``.vscode`` folder.

keybindings.json
----------------

Add the following in keybindings.json:

.. code-block:: json

    {
        "key": "ctrl+f1",
        "command": "workbench.action.tasks.runTask",
        "args": "main"
    },
    {
        "key": "ctrl+f2",
        "command": "workbench.action.tasks.runTask",
        "args": "test"
    },
    {
        "key": "ctrl+f3",
        "command": "workbench.action.tasks.runTask",
        "args": "docs"
    }

The keybindings allow the following:

* ``Ctrl+F1``: Run main.py
* ``Ctrl+F2``: Run the test cases
* ``Ctrl+F3``: Build the docs
