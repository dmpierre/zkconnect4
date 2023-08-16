## Notes

Don't forget to add the `public` signal to the main template when using `nova-scotia`. Otherwise, the `step_in` signal will not be public, and it will complain along the lines of something regarding an index not matching some dimensions - have not dug in the weeds regarding why this specific error message. 

1. `eff_ecdsa.circom`. expects an efficient signature representation as an input.   
    - metamask integration? can we get an efficient signature representation out of it? not sure how heyanoun does it?
2. Not sure to understand why aggregation needs to nullify public keys that are in a merkle tree. Wouldn't requiring that each signature be different from the previous one along with a check on the nonce be enough? If we implement a merkle tree for that, then where is the merkle tree of public keys coming from? Also from where should those other public keys be coming from? --> Yes there is no need for any merkle tree. Simply aggregate signatures. 
3. Not sure with the best way to proceed w.r.t. how to integrate secp/secq? --> Implement the Group trait for it? Implement it for nova. Then should be seamless for nova-scotia.
4. Would it make sense to open a PR on the halo2curve repo for implementing secq? Yes! Would make sense. Poke Carlos?

### Spartan

Let's try to get:

1. Signature verification along with pubkey membership check. This requires to have circom with secq256k1 support. See: https://github.com/dmpierre/spartan-ecdsa#build
    a. Install circom with secq256k1 support
    b. Compile circuits to get their r1cs representations

2. Switch nova-scotia to support secp/secq cycle:
    a. Rust implementation of secp/secq curves: https://github.com/DanTehrani/secpq_curves/tree/main. Or use the halo2-curve repo?
    b. Nova-scotia update to support those curves: https://github.com/nalinbhardwaj/Nova-Scotia/compare/main...DanTehrani:Nova-Scotia:main
    c. Implement those updates in nova-scotia

3. Switch nova to support secp/secq cycle

### 22/06

- Installing circom fork that supports pasta curve. Actually, we need circom with secq256k1 support. 
- Reading Nova-Scotia README

I could be worth to do some readings/youtube vids on cycle of EC.

### 27/06 

- Implementing secq in the `halo2curves` repo. Recall that what you want will be to use the secp `fp.rs` file for implementing in secq `fq.rs` and conversely the `fq.rs` file of secp for implementing in secq `fp.rs`.
    1. Currently stuck at finding the `ROOT_OF_UNITY` within the `fp.rs` file.
    2. 
- Started to check how to get tests to work.

### 28/06

- Kinda went barbarian for implementing `fp.rs` and `fq.rs` for secq. Basically:
    1. inverted all constants `fp.rs` (secp) —> `fq.rs` (secq) and `fq.rs` (secp) —> `fp.rs` (secq)
    2. Re-implemented the squaring algorithm from secp `fq.rs` to secq `fp.rs` and conversely the squaring algorithm from secp `fp.rs` to secq `fq.rs`.
    3. Changed their respective `const S: u32`
    4. Took the `svdw_hash_to_curve` function from [bn256](https://vscode.dev/github/dmpierre/halo2curves/blob/main/src/bn256/curve.rs#L42-L43)

Seems like all tests are passing. Implement next files.

### 29/06

Resources used for implementing secq in `halo2curves`:
- [secq python implementation](https://github.com/jimmysong/secq/blob/master/ecc.py)
- [secpq_curves](https://github.com/DanTehrani/secpq_curves)

It seems like I need to implement the `Group` trait for it to work with Nova-scotia? Should I go for a hacky solution or not?

### 01/07

I need to find a way to implement `Point`, `Base` and `Scalar` for secp (and secq ?). As a non exhaustive example, see lines 55 to 57 of the `bn256_grumpkin.rs` file.

### 12/07

Seems like `circom-secq` does not compile correctly to `cpp`. I get the following error:

```
thread 'main' panicked at 'internal error: entered unreachable code', code_producers/src/c_elements/c_code_generator.rs:809:14
```

Added ability to compile to `cpp` by adding relevant branches in `c_code_generator.rs`.

### 14/07

- Which inputs should be public and/or private within the aggregation circuit?
- Why is there no `step_out` variable in `bitcoin_benchmark.circom`?


### 26/07

- Haven't been able to compile cpp file from circom on my macbook M2. Didn't spend too much time on it though, since nova-scotia also works with `wasm`. *Can setup an aws machine with tmux + vscode. Wont hurt productivity too much*
- Seems like proving time is much slower on my laptop. I guess the cause is threefold: using another curve, using wasm instead of cpp and using rosetta2 for simulating `x86_64`. *Mostly because using wasm*
- How do we chose the Field on which the circuit is defined? Why would I choose `secq256k1` instead of `secp256k1`? We choose secq because the secq field is the base field of secp 
- Why is there no `step_out` variable in `bitcoin_benchmark.circom`? Its normal, not following the naming convention here.
- Why is `src/circom/circuit.rs` specifying: `let pub_output_count = (self.r1cs.num_inputs - 1) / 2;`

### 27/07

- Aggregation seems to work. Now write a benchmark.
- Could be nice to try to compile to cpp, now that we have rosetta2 configured. Though I think it was still not working after installing it.
- I have to find how I am going to chain the computation 
- Seems like we can not have a vec of vec as the starting public input. Why is this? Could this be changed in the future?

### 03/08

When playing connect4, there are two things that I want to prove:
1. That the board content is correct. Considering each square as a leaf in a merkle tree, this means that given a path for each of those leaves, I can reconstruct the tree up to the given root.
2. That the board update is correct. This means that for a move that is done, I have updated the leaf value correctly, ending up in a new and correct merkle root.

Proving that there is a winning line or column is pretty trivial.

We actually don't care about which player plays. Indeed, we check whether there is a winner for both sides at each step. Similarly, the inference runs at each step, regardless of who is playing.

Since the board state is public, it is pretty trivial to check that the board's moves were done alternatively by each player. This is the only requirement that could be done on-chain or by any other agent interested into verifying the game.

In the context of a recursive circuit, the public inputs that we will have will then be:
- The board's content
- The board's merkle root

### 09/08

Maybe need some commitment to the model (?)

## Resources 

- [project page](https://www.notion.so/0xparc/ZK-Connect-4-183fb50f88ab41ac95fdfba89dd30c17)