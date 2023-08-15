pragma circom 2.1.2;

template IsValidMove() {
    // valid in: 0 < in <= 2
    signal input in;

    component lessEqualThan = LessEqThan(2);
    component greaterEqualThan = GreaterEqThan(2);

    lessEqualThan.in[0] <== in;
    lessEqualThan.in[1] <== 2;

    greaterEqualThan.in[0] <== in;
    greaterEqualThan.in[1] <== 1;

    lessEqualThan.out === 1;
    greaterEqualThan.out === 1;
}