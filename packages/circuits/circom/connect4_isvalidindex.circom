pragma circom 2.1.2;

template IsValidIndex() {
    // use to check that `in` being played is correct
    // valid in: 0 <= in <= 41
    signal input in;

    component lessEqualThan = LessEqThan(6);
    component greaterEqualThan = GreaterEqThan(6);

    lessEqualThan.in[0] <== in;
    lessEqualThan.in[1] <== 41;

    greaterEqualThan.in[0] <== in;
    greaterEqualThan.in[1] <== 0;

    lessEqualThan.out === 1;
    greaterEqualThan.out === 1;

}