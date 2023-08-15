pragma circom 2.1.2;

template IsEmptyLeaf() {
    // checks whether the leaf is empty
    signal input in;
    signal input leaf;
    signal input root;
    signal input pathElements[6];
    signal input pathIndices[6];
    signal output out;
    component emptyHash = Poseidon(2);

    emptyHash.inputs[0] <== in;
    emptyHash.inputs[1] <== 0; // hash([index, 0])

    // for this in, ensure that the leaf is not equal to empty hash 
    component leafNotEqualEmptyHash = IsEqual();
    
    leafNotEqualEmptyHash.in[0] <== emptyHash.out;
    leafNotEqualEmptyHash.in[1] <== leaf;
    leafNotEqualEmptyHash.out ==> out; 
    
    // prove that this non-empty leaf is within the tree
    component leafInTree = MerkleTreeChecker(6);

    leafInTree.root <== root;
    leafInTree.leaf <== leaf;

    for (var i = 0; i < 6; i++) {
        leafInTree.pathElements[i] <== pathElements[i];
        leafInTree.pathIndices[i] <== pathIndices[i];
    }

}