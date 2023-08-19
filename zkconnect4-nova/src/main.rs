use std::{collections::HashMap, env::current_dir, time::Instant};

use nova_scotia::{
    circom::reader::load_r1cs, create_public_params, create_recursive_circuit, FileLocation, F,
};
use nova_snark::{provider, PublicParams};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
struct Game {
    dense_weights: Vec<Vec<String>>,
    dense_bias: Vec<Vec<String>>,
    dense_1_weights: Vec<Vec<String>>,
    dense_1_bias: Vec<Vec<String>>,
    dense_2_weights: Vec<Vec<String>>,
    dense_2_bias: Vec<Vec<String>>,
    dense_3_weights: Vec<Vec<String>>,
    dense_3_bias: Vec<Vec<String>>,
    dense_4_weights: Vec<Vec<String>>,
    dense_4_bias: Vec<Vec<String>>,
    playerPlayedIndex: Vec<u8>,
    step_in: Vec<(String, u64, u64)>,
    board: Vec<Vec<Vec<Vec<u8>>>>,
    pathElements: Vec<Vec<Vec<String>>>,
    pathIndices: Vec<Vec<Vec<u8>>>,
    pathElementsCurrentLeafPlayer: Vec<Vec<String>>,
    pathIndicesCurrentLeafPlayer: Vec<Vec<u8>>,
    belowLeafPlayer: Vec<u8>,
    pathElementsBelowLeafPlayer: Vec<Vec<String>>,
    pathIndicesBelowLeafPlayer: Vec<Vec<u8>>,
    updatedRootFromPlayerPlay: Vec<String>,
    pathElementsUpdatedRootFromPlayer: Vec<Vec<String>>,
    pathElementsCurrentLeafAgent: Vec<Vec<String>>,
    pathIndicesCurrentLeafAgent: Vec<Vec<u8>>,
    belowLeafAgent: Vec<u8>,
    pathElementsBelowLeafAgent: Vec<Vec<String>>,
    pathIndicesBelowLeafAgent: Vec<Vec<u8>>,
    updatedRootFromAgentPlay: Vec<String>,
    pathElementsUpdatedRootFromAgent: Vec<Vec<String>>,
    agentMoveRowHelper: Vec<u8>,
    updatedBoard: Vec<Vec<Vec<Vec<u8>>>>,
    updatedBoardPathElements: Vec<Vec<Vec<String>>>,
    updatedBoardPathIndices: Vec<Vec<Vec<u8>>>,
    initialStepIn: (Vec<String>, u64, u64),
}

fn run(circuit_file_path: String, witness_gen_filepath: String) {
    type G1 = provider::bn256_grumpkin::bn256::Point;
    type G2 = provider::bn256_grumpkin::grumpkin::Point;
    let root = current_dir().unwrap();
    let circuit_file = root.join(circuit_file_path);
    let r1cs = load_r1cs::<G1, G2>(&FileLocation::PathBuf(circuit_file));
    let witness_generator_file = root.join(witness_gen_filepath);
    let game: Game = serde_json::from_str(include_str!("../data/game/aggregate.json")).unwrap();

    let initial_root = F::<G1>::from_raw([
        u64::from_str_radix(&game.initialStepIn.0[0], 16).unwrap(),
        u64::from_str_radix(&game.initialStepIn.0[1], 16).unwrap(),
        u64::from_str_radix(&game.initialStepIn.0[2], 16).unwrap(),
        u64::from_str_radix(&game.initialStepIn.0[3], 16).unwrap(),
    ]);

    let start_public_input = vec![
        initial_root,
        F::<G1>::from(game.initialStepIn.1),
        F::<G1>::from(game.initialStepIn.2),
    ];

    let mut private_inputs = Vec::new();
    let n_turns = game.board.len();
    println!("Generating proof for game with {} turns", n_turns);

    for i in 0..n_turns {
        let mut private_input = HashMap::new();
        if i > 0 {
            private_input.insert("step_in".to_string(), json!(game.step_in[i]));
        }
        private_input.insert("board".to_string(), json!(game.board[i]));
        // we start at one since the first was included in the public input
        private_input.insert("dense_weights".to_string(), json!(game.dense_weights[i]));
        private_input.insert("dense_bias".to_string(), json!(game.dense_bias[i]));
        private_input.insert(
            "dense_1_weights".to_string(),
            json!(game.dense_1_weights[i]),
        );
        private_input.insert("dense_1_bias".to_string(), json!(game.dense_1_bias[i]));
        private_input.insert(
            "dense_2_weights".to_string(),
            json!(game.dense_2_weights[i]),
        );
        private_input.insert("dense_2_bias".to_string(), json!(game.dense_2_bias[i]));
        private_input.insert(
            "dense_3_weights".to_string(),
            json!(game.dense_3_weights[i]),
        );
        private_input.insert("dense_3_bias".to_string(), json!(game.dense_3_bias[i]));
        private_input.insert(
            "dense_4_weights".to_string(),
            json!(game.dense_4_weights[i]),
        );
        private_input.insert("pathElements".to_string(), json!(game.pathElements[i]));
        private_input.insert("pathIndices".to_string(), json!(game.pathIndices[i]));
        private_input.insert("dense_4_bias".to_string(), json!(game.dense_4_bias[i]));
        private_input.insert(
            "pathElementsCurrentLeafPlayer".to_string(),
            json!(game.pathElementsCurrentLeafPlayer[i]),
        );
        private_input.insert(
            "pathIndicesCurrentLeafPlayer".to_string(),
            json!(game.pathIndicesCurrentLeafPlayer[i]),
        );
        private_input.insert(
            "belowLeafPlayer".to_string(),
            json!(game.belowLeafPlayer[i]),
        );
        private_input.insert(
            "pathElementsBelowLeafPlayer".to_string(),
            json!(game.pathElementsBelowLeafPlayer[i]),
        );
        private_input.insert(
            "pathIndicesBelowLeafPlayer".to_string(),
            json!(game.pathIndicesBelowLeafPlayer[i]),
        );
        private_input.insert(
            "updatedRootFromPlayerPlay".to_string(),
            json!(game.updatedRootFromPlayerPlay[i]),
        );
        private_input.insert(
            "pathElementsUpdatedRootFromPlayer".to_string(),
            json!(game.pathElementsUpdatedRootFromPlayer[i]),
        );
        private_input.insert(
            "agentMoveRowHelper".to_string(),
            json!(game.agentMoveRowHelper[i]),
        );
        private_input.insert(
            "playerPlayedIndex".to_string(),
            json!(game.playerPlayedIndex[i]),
        );
        private_input.insert(
            "pathElementsCurrentLeafAgent".to_string(),
            json!(game.pathElementsCurrentLeafAgent[i]),
        );
        private_input.insert(
            "pathIndicesCurrentLeafAgent".to_string(),
            json!(game.pathIndicesCurrentLeafAgent[i]),
        );
        private_input.insert("belowLeafAgent".to_string(), json!(game.belowLeafAgent[i]));
        private_input.insert(
            "pathElementsBelowLeafAgent".to_string(),
            json!(game.pathElementsBelowLeafAgent[i]),
        );
        private_input.insert(
            "pathIndicesBelowLeafAgent".to_string(),
            json!(game.pathIndicesBelowLeafAgent[i]),
        );
        private_input.insert(
            "updatedRootFromAgentPlay".to_string(),
            json!(game.updatedRootFromAgentPlay[i]),
        );
        private_input.insert(
            "pathElementsUpdatedRootFromAgent".to_string(),
            json!(game.pathElementsUpdatedRootFromAgent[i]),
        );
        private_input.insert("updatedBoard".to_string(), json!(game.updatedBoard[i]));
        private_input.insert(
            "updatedBoardPathElements".to_string(),
            json!(game.updatedBoardPathElements[i]),
        );
        private_input.insert(
            "updatedBoardPathIndices".to_string(),
            json!(game.updatedBoardPathIndices[i]),
        );
        private_inputs.push(private_input);
    }

    let pp: PublicParams<G1, G2, _, _> = create_public_params(r1cs.clone());

    println!(
        "Number of constraints per step (primary circuit): {}",
        pp.num_constraints().0
    );
    println!(
        "Number of constraints per step (secondary circuit): {}",
        pp.num_constraints().1
    );

    println!(
        "Number of variables per step (primary circuit): {}",
        pp.num_variables().0
    );
    println!(
        "Number of variables per step (secondary circuit): {}",
        pp.num_variables().1
    );

    println!("Creating a RecursiveSNARK...");
    let start = Instant::now();
    let recursive_snark = create_recursive_circuit(
        FileLocation::PathBuf(witness_generator_file),
        r1cs,
        private_inputs,
        start_public_input.to_vec(),
        &pp,
    )
    .unwrap();
    println!("RecursiveSNARK creation took {:?}", start.elapsed());

    let z0_secondary = [F::<G2>::from(0)];

    // verify the recursive SNARK
    println!("Verifying a RecursiveSNARK...");
    let start = Instant::now();
    let res = recursive_snark.verify(&pp, n_turns, &start_public_input, &z0_secondary);
    println!(
        "RecursiveSNARK::verify: {:?}, took {:?}",
        res,
        start.elapsed()
    );
    assert!(res.is_ok());
}

fn main() {
    let circuit_filepath = format!("data/connect4.r1cs");
    let witness_gen_filepath = format!("data/connect4.wasm");
    run(circuit_filepath, witness_gen_filepath);
}
