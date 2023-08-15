pragma circom 2.1.2;
include "../../node_modules/circomlib-ml/circuits/Flatten2D.circom";
include "../../node_modules/circomlib-ml/circuits/ArgMax.circom";
include "../../node_modules/circomlib-ml/circuits/ReLU.circom";
include "../../node_modules/circomlib-ml/circuits/Dense.circom";

template Model() {
signal input in[1][1][42];

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
signal output out[1];

component flatten = Flatten2D(1, 1, 42);
component dense = Dense(42, 50);
component dense_re_lu[50];
for (var i0 = 0; i0 < 50; i0++) {
    dense_re_lu[i0] = ReLU();
}
component dense_1 = Dense(50, 50);
component dense_1_re_lu[50];
for (var i0 = 0; i0 < 50; i0++) {
    dense_1_re_lu[i0] = ReLU();
}
component dense_2 = Dense(50, 50);
component dense_2_re_lu[50];
for (var i0 = 0; i0 < 50; i0++) {
    dense_2_re_lu[i0] = ReLU();
}
component dense_3 = Dense(50, 50);
component dense_3_re_lu[50];
for (var i0 = 0; i0 < 50; i0++) {
    dense_3_re_lu[i0] = ReLU();
}
component dense_4 = Dense(50, 7);
component dense_4_softmax = ArgMax(7);

for (var i0 = 0; i0 < 1; i0++) {
    for (var i1 = 0; i1 < 1; i1++) {
        for (var i2 = 0; i2 < 42; i2++) {
            flatten.in[i0][i1][i2] <== in[i0][i1][i2];
}}}
for (var i0 = 0; i0 < 42; i0++) {
    dense.in[i0] <== flatten.out[i0];
}
for (var i0 = 0; i0 < 42; i0++) {
    for (var i1 = 0; i1 < 50; i1++) {
        dense.weights[i0][i1] <== dense_weights[i0][i1];
}}
for (var i0 = 0; i0 < 50; i0++) {
    dense.bias[i0] <== dense_bias[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_re_lu[i0].in <== dense.out[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_1.in[i0] <== dense_re_lu[i0].out;
}
for (var i0 = 0; i0 < 50; i0++) {
    for (var i1 = 0; i1 < 50; i1++) {
        dense_1.weights[i0][i1] <== dense_1_weights[i0][i1];
}}
for (var i0 = 0; i0 < 50; i0++) {
    dense_1.bias[i0] <== dense_1_bias[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_1_re_lu[i0].in <== dense_1.out[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_2.in[i0] <== dense_1_re_lu[i0].out;
}
for (var i0 = 0; i0 < 50; i0++) {
    for (var i1 = 0; i1 < 50; i1++) {
        dense_2.weights[i0][i1] <== dense_2_weights[i0][i1];
}}
for (var i0 = 0; i0 < 50; i0++) {
    dense_2.bias[i0] <== dense_2_bias[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_2_re_lu[i0].in <== dense_2.out[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_3.in[i0] <== dense_2_re_lu[i0].out;
}
for (var i0 = 0; i0 < 50; i0++) {
    for (var i1 = 0; i1 < 50; i1++) {
        dense_3.weights[i0][i1] <== dense_3_weights[i0][i1];
}}
for (var i0 = 0; i0 < 50; i0++) {
    dense_3.bias[i0] <== dense_3_bias[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_3_re_lu[i0].in <== dense_3.out[i0];
}
for (var i0 = 0; i0 < 50; i0++) {
    dense_4.in[i0] <== dense_3_re_lu[i0].out;
}
for (var i0 = 0; i0 < 50; i0++) {
    for (var i1 = 0; i1 < 7; i1++) {
        dense_4.weights[i0][i1] <== dense_4_weights[i0][i1];
}}
for (var i0 = 0; i0 < 7; i0++) {
    dense_4.bias[i0] <== dense_4_bias[i0];
}
for (var i0 = 0; i0 < 7; i0++) {
    dense_4_softmax.in[i0] <== dense_4.out[i0];
}
out[0] <== dense_4_softmax.out;
}