{
  description = "CSC-667 Term Project - Poker Webapp";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs @ {flake-parts, ...}:
    flake-parts.lib.mkFlake {inherit inputs;} {
      imports = [];

      systems = ["x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin"];

      perSystem = {pkgs, ...}: {
        devShells.default = pkgs.mkShell {
          name = "csc667-poker";
          buildInputs = with pkgs; [
            nodejs_18
            postgresql # PostgreSQL 15
          ];
          shellHook = ''
            root_dir="$(git rev-parse --show-toplevel)"

            export PGHOST="$root_dir/.postgres"
            export PGDATA="$PGHOST/data"
            export PGDATABASE="jvda-poker"
            export PGLOG="$PGHOST/postgres.log"
          '';
        };
      };
    };
}
