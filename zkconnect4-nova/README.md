#### Notes 

Leverages [nova-scotia](https://github.com/nalinbhardwaj/Nova-Scotia) for computing a proof of a valid connect4 game.

`data/` holds r1cs and wasm files for the connect4 circuit. 

`data/game/` is where the aggregated game should be stored to generate a proof. An aggregated game can be generated using the cli, located in `packages/cli`. At the end of each game, the cli will output an aggregated history of it in `packages/cli/out`. 

```rust
// read-write pp to file
let pp_generated: PublicParams<G1, G2, _, _> = create_public_params(r1cs.clone());
write_pp_file("data/pp.json", &pp_generated);
let pp_generated_read: PublicParams<G1, G2, _, _> = read_pp_file("data/pp.json");
```