# Ordinos

This repository contains the software of the tally-hiding Ordinos
e-voting framework.

To get started, build the docs with

```ssh
python3 -m sphinx.cmd.build -b html docs/ docs/build/
```

For building the docs python dependencies: `gmpy2, numpy, yaml,
sphinx, sphinx_rtd_theme` are required. These can be installed using
the following command:

```ssh
python3 -m pip install -r requirements.txt
```

You can now open the docs by opening the file
``docs/build/index.html`` in a browser.
