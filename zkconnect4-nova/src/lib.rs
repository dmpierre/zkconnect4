use std::collections::HashMap;

use nova_scotia::{C1, C2};
use nova_snark::{traits::Group, PublicParams};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct Game {
    pub dense_weights: Vec<Vec<String>>,
    pub dense_bias: Vec<Vec<String>>,
    pub dense_1_weights: Vec<Vec<String>>,
    pub dense_1_bias: Vec<Vec<String>>,
    pub dense_2_weights: Vec<Vec<String>>,
    pub dense_2_bias: Vec<Vec<String>>,
    pub dense_3_weights: Vec<Vec<String>>,
    pub dense_3_bias: Vec<Vec<String>>,
    pub dense_4_weights: Vec<Vec<String>>,
    pub dense_4_bias: Vec<Vec<String>>,
    pub playerPlayedIndex: Vec<u8>,
    pub step_in: Vec<(String, u64, u64)>,
    pub board: Vec<Vec<Vec<Vec<u8>>>>,
    pub pathElements: Vec<Vec<Vec<String>>>,
    pub pathIndices: Vec<Vec<Vec<u8>>>,
    pub pathElementsCurrentLeafPlayer: Vec<Vec<String>>,
    pub pathIndicesCurrentLeafPlayer: Vec<Vec<u8>>,
    pub belowLeafPlayer: Vec<u8>,
    pub pathElementsBelowLeafPlayer: Vec<Vec<String>>,
    pub pathIndicesBelowLeafPlayer: Vec<Vec<u8>>,
    pub updatedRootFromPlayerPlay: Vec<String>,
    pub pathElementsUpdatedRootFromPlayer: Vec<Vec<String>>,
    pub pathElementsCurrentLeafAgent: Vec<Vec<String>>,
    pub pathIndicesCurrentLeafAgent: Vec<Vec<u8>>,
    pub belowLeafAgent: Vec<u8>,
    pub pathElementsBelowLeafAgent: Vec<Vec<String>>,
    pub pathIndicesBelowLeafAgent: Vec<Vec<u8>>,
    pub updatedRootFromAgentPlay: Vec<String>,
    pub pathElementsUpdatedRootFromAgent: Vec<Vec<String>>,
    pub agentMoveRowHelper: Vec<u8>,
    pub updatedBoard: Vec<Vec<Vec<Vec<u8>>>>,
    pub updatedBoardPathElements: Vec<Vec<Vec<String>>>,
    pub updatedBoardPathIndices: Vec<Vec<Vec<u8>>>,
    pub initialStepIn: (Vec<String>, u64, u64),
}

pub fn get_initial_game_root(game: &Game) -> [u64; 4] {
    [
        u64::from_str_radix(&game.initialStepIn.0[0], 16).unwrap(),
        u64::from_str_radix(&game.initialStepIn.0[1], 16).unwrap(),
        u64::from_str_radix(&game.initialStepIn.0[2], 16).unwrap(),
        u64::from_str_radix(&game.initialStepIn.0[3], 16).unwrap(),
    ]
}

pub fn create_private_inputs(
    game: &Game,
    n_turns: usize,
) -> Vec<HashMap<std::string::String, Value>> {
    let mut private_inputs = Vec::new();
    println!("Generating inputs for game with {} turns", n_turns);

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
    private_inputs
}

pub fn println_pp<G1, G2>(pp: &PublicParams<G1, G2, C1<G1>, C2<G2>>)
where
    G1: Group<Base = <G2 as Group>::Scalar>,
    G2: Group<Base = <G1 as Group>::Scalar>,
{
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

}
