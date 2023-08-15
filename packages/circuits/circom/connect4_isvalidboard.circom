pragma circom 2.1.2;

include "./connect4_merkle.circom";

template IsValidBoard() {
    // check that the current board resolves to the current root 
    // build merkle tree from the board
    // we will need to do 42 different merkle proofs to prove that the
    // board's content is correct
    signal input board[42]; 
    signal input root;
    signal input pathsElements[42][6];
    signal input pathsIndices[42][6];

    component merkleTreeCheckers[42];
    component hashers[42];

    var i;

    for (i = 0; i < 42; i++) {
        merkleTreeCheckers[i] = MerkleTreeChecker(6);
        
        // input root
        merkleTreeCheckers[i].root <== root;

        // compute leaf value
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== i;
        hashers[i].inputs[1] <== board[i];
        merkleTreeCheckers[i].leaf <== hashers[i].out;

        // input merkle paths for the leaf
        for (var j = 0; j < 6; j++) {
            merkleTreeCheckers[i].pathElements[j] <== pathsElements[i][j];
            merkleTreeCheckers[i].pathIndices[j] <== pathsIndices[i][j];
        }
    }

}
