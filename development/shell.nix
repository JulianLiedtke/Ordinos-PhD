with (import <nixpkgs> {});
let
  my-python-packages = python-packages: with python-packages; [
    sphinx
    sphinx_rtd_theme
    numpy
    gmpy2
    pyyaml
  ];
  python-with-my-packages = python3.withPackages my-python-packages;
in
mkShell {
  buildInputs = [
    nodejs-16_x
    python-with-my-packages
    libressl
    lsof
  ];
}
