pragma circom 2.1.2;

include "./connect4_merkle.circom";
include "./connect4_isvalidindex.circom";
include "./connect4_isvalidmove.circom";
include "./connect4_isemptyleaf.circom";

template Connect4Update() {
    
    // - Ensure that the index being played is valid
    // - Ensure that the move being played is valid
    // - Prove that the index below is not empty -- IsNotEmpty
    // - Prove that the current index is empty -- IsNotEmpty
    // - Prove that the root of the board has been updated correctly

    signal input root; // current board state
    signal input playedIndex; // [0; 42)
    signal input playedMove; // {1, 2}
    signal input pathElementsCurrentLeaf[6];
    signal input pathIndicesCurrentLeaf[6];

    signal input belowLeafMove; // provide info about the move below
    signal input pathElementsBelowLeaf[6]; // provide path to move below to prove its content
    signal input pathIndicesBelowLeaf[6]; // provide path to move below to prove its content
    
    signal input newRoot; // new board state
    signal input pathElementsRootUpdate[6]; // provide path to root from the updated leaf

    // prove index being played is valid
    component isValidIndex = IsValidIndex();
    isValidIndex.in <== playedIndex;

    // prove move being played is valid
    component isValidMove = IsValidMove();
    isValidMove.in <== playedMove;

    // calculate index of leaf "below"
    signal belowIndex <== playedIndex + 7;

    // check whether the move below is correct
    component isValidMoveBelow = IsValidMove();
    isValidMoveBelow.in <== belowLeafMove;

    // ensure that the leaf below is not empty
    component belowLeafValue = Poseidon(2);
    belowLeafValue.inputs[0] <== belowIndex;
    belowLeafValue.inputs[1] <== belowLeafMove;

    component isEmptyBelow = IsEmptyLeaf();
    isEmptyBelow.in <== belowIndex;
    isEmptyBelow.leaf <== belowLeafValue.out;
    isEmptyBelow.root <== root;

    for (var i = 0; i < 6; i++) {
        isEmptyBelow.pathElements[i] <== pathElementsBelowLeaf[i];
        isEmptyBelow.pathIndices[i] <== pathIndicesBelowLeaf[i];
    }

    // should not be empty
    isEmptyBelow.out === 0;

    // ensure that the index being played is empty
    component currentLeafValue = Poseidon(2);
    currentLeafValue.inputs[0] <== playedIndex;
    currentLeafValue.inputs[1] <== 0;
    
    component isEmptyCurrent = IsEmptyLeaf();
    isEmptyCurrent.in <== playedIndex;
    isEmptyCurrent.leaf <== currentLeafValue.out;
    isEmptyCurrent.root <== root;

    for (var i = 0; i < 6; i++) {
        isEmptyCurrent.pathElements[i] <== pathElementsCurrentLeaf[i];
        isEmptyCurrent.pathIndices[i] <== pathIndicesCurrentLeaf[i];
    }

    // should be empty
    isEmptyCurrent.out === 1;

    // check root update
    component updatedLeafValue = Poseidon(2);
    updatedLeafValue.inputs[0] <== playedIndex;
    updatedLeafValue.inputs[1] <== playedMove;

    component merkleTreeChecker = MerkleTreeChecker(6);
    merkleTreeChecker.leaf <== updatedLeafValue.out;
    merkleTreeChecker.root <== newRoot;

    for (var i = 0; i < 6; i++) {
        merkleTreeChecker.pathElements[i] <== pathElementsRootUpdate[i];
        merkleTreeChecker.pathIndices[i] <== pathIndicesCurrentLeaf[i];
    }
}


// template Example () {

//     signal input board[42];
//     signal output checkColsPlayer1[21];
//     signal output checkRowsPlayer1[24];

//     var i;

//     component checkColsPlayer1 = CheckColumns(1);
//     component checkRowsPlayer1 = CheckRows(1);

//     for (i = 0; i < 42; i++) {
//         checkColsPlayer1.in[i] <== board[i];
//         checkRowsPlayer1.in[i] <== board[i];
//     }

//     for ( i= 0; i< 24; i++) {
//         checkRowsPlayer1[i] <== checkRowsPlayer1.out[i];
//     }

// }