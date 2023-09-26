pragma circom 2.1.2;

include "../../circom/connect4_iswinningline.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";

component main = CheckRLDiagonals(2); 