pragma circom 2.1.2;

template IsWinningLine(player) {
    // checks whether a line is winning or not
    // out will be whether there is a winning line for player `player`
    signal input in[4];
    signal temp;
    signal temp2;
    signal output out;

    var i;

    component a = IsEqual();
    component b = IsEqual();
    component c = IsEqual();
    component d = IsEqual();

    a.in[0] <== in[0];
    b.in[0] <== in[1];
    c.in[0] <== in[2];
    d.in[0] <== in[3];

    a.in[1] <== player;
    b.in[1] <== player;
    c.in[1] <== player;
    d.in[1] <== player;

    temp <== a.out * b.out;
    temp2 <== c.out * d.out;
    out <== temp * temp2;
}

template CheckColumns(player) {
    // check if there is a winning line within the board columns
    signal input board[42];
    signal output out[21];
    var i;
    var j;
    component checkCols[21];
    for (i = 0; i < 7; i++) {
        for (j = i; j <= i + 14; j += 7) {
            checkCols[j] = IsWinningLine(player);
            checkCols[j].in[0] <== board[j];
            checkCols[j].in[1] <== board[j + 7];
            checkCols[j].in[2] <== board[j + 14];
            checkCols[j].in[3] <== board[j + 21];
            out[j] <== checkCols[j].out;
        }
    }
}

template CheckRows(player) {
    // check if there is a winning line within the board rows
    signal input board[42];
    signal output out[24];
    var i;
    var j;
    var k = 0;
    var idx;
    component checkRows[24];
    for (i = 0; i <= 35; i += 7) {
        for (j = 0; j < 4; j++) {
            idx = i + j - 3 * k;
            checkRows[idx] = IsWinningLine(player); 
            checkRows[idx].in[0] <== board[i + j + 0];
            checkRows[idx].in[1] <== board[i + j + 1];
            checkRows[idx].in[2] <== board[i + j + 2];
            checkRows[idx].in[3] <== board[i + j + 3]; 
            out[idx] <== checkRows[idx].out;
        }
        k += 1;
    }
}
