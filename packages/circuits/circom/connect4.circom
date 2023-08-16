pragma circom 2.1.2;

include "connect4_model/model.circom";
include "./connect4_isvalidboard.circom";
include "./connect4_update.circom";
include "./connect4_iswinningline.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux2.circom";

template Connect4() {

    signal input step_in; // board root, public

    signal input board[1][1][42];
    signal input pathElements[42][6];
    signal input pathIndices[42][6];

    signal input turn; // whose player's turn it is, public

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

    // 1. Check board array <--> merkle tree
    IsValidBoard()(board[0][0], step_in, pathElements, pathIndices);

    // 2. Model inference
    signal agentColumn[1] <== Model()(board, dense_weights, dense_bias, 
                            dense_1_weights, dense_1_bias, dense_2_weights, 
                            dense_2_bias, dense_3_weights, dense_3_bias, 
                            dense_4_weights, dense_4_bias);

    signal agentPlayedIndex <== agentColumn[0] + agentMoveRowHelper * 7;
    
    // 3. Check the updated board from the agent's play
    Connect4Update()(step_in, agentPlayedIndex, 2, 
                    pathElementsCurrentLeafAgent, pathIndicesCurrentLeafAgent, 
                    belowLeafAgent, pathElementsBelowLeafAgent, pathIndicesBelowLeafAgent,
                    updatedRootFromAgentPlay, pathElementsUpdatedRootFromAgent);

    // 4. Check the updated board from the player's play
    Connect4Update()(step_in, playerPlayedIndex, 1, 
                    pathElementsCurrentLeafPlayer, pathIndicesCurrentLeafPlayer, 
                    belowLeafPlayer, pathElementsBelowLeafPlayer, pathIndicesBelowLeafPlayer,
                    updatedRootFromPlayerPlay, pathElementsUpdatedRootFromPlayer);

    // 5. Check if there is a winning line for player 1
    signal player1WinningRow <== CheckRows(1)(board[0][0]);
    signal player1WinningColumn <== CheckColumns(1)(board[0][0]);
    signal player1WinningDiag <== CheckDiagonals(1)(board[0][0]);

    // 6. Check if there is a winning line for player 2
    signal player2WinningRow <== CheckRows(2)(board[0][0]);
    signal player2WinningColumn <== CheckColumns(2)(board[0][0]);
    signal player2WinningDiag <== CheckDiagonals(2)(board[0][0]);

    // 7. Output the correct root following whether it is the agent or the player's turn
    signal agentBoardRoot <== turn * updatedRootFromAgentPlay;
    signal playerBoardRoot <==  (1 - turn) * updatedRootFromPlayerPlay;

    // 8. Output whether there is a winner or not
    signal output step_out <==  agentBoardRoot + playerBoardRoot;
}