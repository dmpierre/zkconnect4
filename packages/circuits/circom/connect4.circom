pragma circom 2.1.2;

include "../connect4_agent/circuit.circom";
include "./connect4_isvalidboard.circom";
include "./connect4_update.circom";
include "./connect4_iswinningline.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux2.circom";

template Connect4() {

    signal input step_in[3]; // board root, turn \in {0, 1} (expected), player won \in {0, 1, 2}

    step_in[2] === 0;

    signal input board[1][1][42];
    signal input updatedBoard[1][1][42];

    signal input pathElements[42][6];
    signal input pathIndices[42][6];
    signal input updatedBoardPathElements[42][6];
    signal input updatedBoardPathIndices[42][6];

    signal turn <== step_in[1];

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

    // 1. Check board array <--> merkle tree for current board
    IsValidBoard()(board[0][0], step_in[0], pathElements, pathIndices);

    // 2. Calculate correct updated root following whether it is the agent or the player's turn
    // This root will be in the output once we have checked that the update is correct.
    signal agentBoardRoot <== turn * updatedRootFromAgentPlay;
    signal playerBoardRoot <==  (1 - turn) * updatedRootFromPlayerPlay;
    signal updatedRoot <== agentBoardRoot + playerBoardRoot;

    // 3. Check updated board array <--> merkle tree for the updated board
    IsValidBoard()(updatedBoard[0][0], updatedRoot, updatedBoardPathElements, updatedBoardPathIndices);

    // 4. Model inference
    signal agentColumn[1] <== Model()(board, dense_weights, dense_bias, 
                            dense_1_weights, dense_1_bias, dense_2_weights, 
                            dense_2_bias, dense_3_weights, dense_3_bias, 
                            dense_4_weights, dense_4_bias);

    signal agentPlayedIndex <== agentColumn[0] + agentMoveRowHelper * 7;
    
    // 5. Check the updated board from the agent's play
    Connect4Update()(step_in[0], agentPlayedIndex, 2, 
                    pathElementsCurrentLeafAgent, pathIndicesCurrentLeafAgent, 
                    belowLeafAgent, pathElementsBelowLeafAgent, pathIndicesBelowLeafAgent,
                    updatedRootFromAgentPlay, pathElementsUpdatedRootFromAgent);

    // 6. Check the updated board from the player's play
    Connect4Update()(step_in[0], playerPlayedIndex, 1, 
                    pathElementsCurrentLeafPlayer, pathIndicesCurrentLeafPlayer, 
                    belowLeafPlayer, pathElementsBelowLeafPlayer, pathIndicesBelowLeafPlayer,
                    updatedRootFromPlayerPlay, pathElementsUpdatedRootFromPlayer);

    // 7. Check if there is a winner
    signal winner <== WinningPlayer()(turn, updatedBoard[0][0]);

    // 8. Outputs
    signal output step_out[3];

    step_out[0] <== updatedRoot;
    step_out[1] <== 1 - turn;
    step_out[2] <== winner;
}