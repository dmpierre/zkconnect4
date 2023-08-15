pragma circom 2.1.2;

include "connect4_model/model.circom";
include "./connect4_update.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux2.circom";

template Connect4() {

    signal input step_in; // board root

    signal input board[1][1][42];
    signal input turn;

    // inputs for model inference
    signal input dense_weights[42][50];
    signal input dense_bias[50];
    signal input dense_1_weights[50][50];
    signal input dense_1_bias[50];
    signal input dense_2_weights[50][50];
    signal input dense_2_bias[50];
    signal input dense_3_weights[50][50];
    signal input dense_3_bias[50];
    signal input dense_4_weights[50][7];
    signal input dense_4_bias[7];

    // indicates which row the agent's prediction will be at
    // the model outputs a colum. for this column there is only a single position available
    // we take the column and add the row to it to get the index of the agent's move in the board array
    signal input agentMoveRowHelper;
    signal input playerPlayedIndex;

    // inputs for updating the board using agent's play. 
    signal input pathElementsCurrentLeafAgent[6];
    signal input pathIndicesCurrentLeafAgent[6]; 
    signal input belowLeafAgent;
    signal input pathElementsBelowLeafAgent[6];
    signal input pathIndicesBelowLeafAgent[6];
    signal input updatedRootFromAgentPlay;
    signal input pathElementsUpdatedRootFromAgent[6];

    // inputs for updating the board using player's play.
    signal input pathElementsCurrentLeafPlayer[6];
    signal input pathIndicesCurrentLeafPlayer[6];
    signal input belowLeafPlayer;
    signal input pathElementsBelowLeafPlayer[6];
    signal input pathIndicesBelowLeafPlayer[6];
    signal input updatedRootFromPlayerPlay;
    signal input pathElementsUpdatedRootFromPlayer[6];

    // 1. Model inference
    signal agentColumn[1] <== Model()(board, dense_weights, dense_bias, 
                            dense_1_weights, dense_1_bias, dense_2_weights, 
                            dense_2_bias, dense_3_weights, dense_3_bias, 
                            dense_4_weights, dense_4_bias);

    signal agentPlayedIndex <== agentColumn[0] + agentMoveRowHelper * 7;
    
    // 2. Check the updated board from the agent's play
    Connect4Update()(step_in, agentPlayedIndex, 2, 
                    pathElementsCurrentLeafAgent, pathIndicesCurrentLeafAgent, 
                    belowLeafAgent, pathElementsBelowLeafAgent, pathIndicesBelowLeafAgent,
                    updatedRootFromAgentPlay, pathElementsUpdatedRootFromAgent);

    // 3. Check the updated board from the player's play
    Connect4Update()(step_in, playerPlayedIndex, 1, 
                    pathElementsCurrentLeafPlayer, pathIndicesCurrentLeafPlayer, 
                    belowLeafPlayer, pathElementsBelowLeafPlayer, pathIndicesBelowLeafPlayer,
                    updatedRootFromPlayerPlay, pathElementsUpdatedRootFromPlayer);

    // 4. Check if there is a winning line

    // 5. Output the correct root following whether it is the agent or the player's turn
    signal agentBoardRoot <== turn * updatedRootFromAgentPlay;
    signal playerBoardRoot <==  (1 - turn) * updatedRootFromPlayerPlay;

    signal output step_out <==  agentBoardRoot + playerBoardRoot;
}