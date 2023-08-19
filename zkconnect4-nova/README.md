#### Notes 

Leverages [nova-scotia](https://github.com/nalinbhardwaj/Nova-Scotia) for computing a proof of a valid connect4 game.

`data/` holds r1cs and wasm files for the connect4 circuit. 

`data/game/` is where the aggregated game should be stored to generate a proof. An aggregated game can be generated using the cli, located in `packages/cli`. At the end of each game, the cli will output an aggregated history of it in `packages/cli/out`. 