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
    signal output out;
    var i;
    var j;
    component checkCols[21];
    component num = Bits2Num(21); // will be different from 0 if there is a winning line
    component isequal = IsEqual();

    for (i = 0; i < 7; i++) {
        for (j = i; j <= i + 14; j += 7) {
            checkCols[j] = IsWinningLine(player);
            checkCols[j].in[0] <== board[j];
            checkCols[j].in[1] <== board[j + 7];
            checkCols[j].in[2] <== board[j + 14];
            checkCols[j].in[3] <== board[j + 21];
            num.in[j] <== checkCols[j].out;
        }
    }
    isequal.in[0] <== num.out;
    isequal.in[1] <== 0;
    out <== 1 - isequal.out; // signal is 1 when there is a winning col, 0 else
}

template CheckRows(player) {
    // check if there is a winning line within the board rows
    signal input board[42];
    signal output out;
    var i;
    var j;
    var k = 0;
    var idx;
    component checkRows[24];
    component num = Bits2Num(24); // will be different from 0 if there is a winning line
    component isequal = IsEqual();

    for (i = 0; i <= 35; i += 7) {
        for (j = 0; j < 4; j++) {
            // convoluted, should be changed
            idx = i + j - 3 * k;
            checkRows[idx] = IsWinningLine(player); 
            checkRows[idx].in[0] <== board[i + j + 0];
            checkRows[idx].in[1] <== board[i + j + 1];
            checkRows[idx].in[2] <== board[i + j + 2];
            checkRows[idx].in[3] <== board[i + j + 3]; 
            num.in[idx] <== checkRows[idx].out;
        }
        k += 1;
    }
    isequal.in[0] <== num.out;
    isequal.in[1] <== 0;

    out <== 1 - isequal.out; // signal is 1 when there is a winning row, 0 else
}

template CheckRLDiagonals(player) {
    // check if there is a winning line within the board diagonals
    // right to left diagonals
    signal input board[42];
    signal output out;
    var i;
    var j;
    var k = 0;
    component checkDiags[12];
    component num = Bits2Num(12); // will be different from 0 if there is a winning line
    component isequal = IsEqual();

    for (i = 3; i <= 17; i += 7) {
        for (j = 0; j < 4; j++) {
            checkDiags[k] = IsWinningLine(player);
            checkDiags[k].in[0] <== board[i + j];
            checkDiags[k].in[1] <== board[i + j + 6];
            checkDiags[k].in[2] <== board[i + j + 12];
            checkDiags[k].in[3] <== board[i + j + 18];
            num.in[k] <== checkDiags[k].out;
            k += 1;
        }
    }
    
    isequal.in[0] <== num.out;
    isequal.in[1] <== 0;
    out <== 1 - isequal.out; // signal is 1 when there is a winning diagonal, 0 else
}

template CheckLRDiagonals(player) {
    // check if there is a winning line within the board diagonals
    // left to right diagonals
    signal input board[42];
    signal output out;
    var i;
    var j;
    var k = 0;
    component checkDiags[12];
    component num = Bits2Num(12); // will be different from 0 if there is a winning line
    component isequal = IsEqual();

    for (i = 0; i <= 14; i += 7) {
        for (j = 0; j < 4; j++) {
            checkDiags[k] = IsWinningLine(player);
            checkDiags[k].in[0] <== board[i + j];
            checkDiags[k].in[1] <== board[i + j + 8];
            checkDiags[k].in[2] <== board[i + j + 16];
            checkDiags[k].in[3] <== board[i + j + 24];
            num.in[k] <== checkDiags[k].out;
            k += 1;
        }
    }
    
    isequal.in[0] <== num.out;
    isequal.in[1] <== 0;
    out <== 1 - isequal.out; // signal is 1 when there is a winning diagonal, 0 else
}

template WinningPlayer() {
    signal input turn;
    signal input board[42];

    signal player1WinningRow <== CheckRows(1)(board);
    signal player1WinningColumn <== CheckColumns(1)(board);
    signal player1WinningDiag <== CheckRLDiagonals(1)(board);
    signal player1WinningLRDiag <== CheckLRDiagonals(1)(board);

    signal player1WonTemp <== player1WinningRow + player1WinningColumn + player1WinningDiag + player1WinningLRDiag;
    signal isZeroPlayer1 <== IsZero()(player1WonTemp); // 1 if no winning line
    signal player1Won <== (1 - isZeroPlayer1) * (1 - turn);

    signal player2WinningRow <== CheckRows(2)(board);
    signal player2WinningColumn <== CheckColumns(2)(board);
    signal player2WinningDiag <== CheckRLDiagonals(2)(board);
    signal player2WinningLRDiag <== CheckLRDiagonals(2)(board);

    signal player2WonTemp <== player2WinningRow + player2WinningColumn + player2WinningDiag + player2WinningLRDiag;
    signal isZeroPlayer2 <== IsZero()(player2WonTemp); // 1 if no winning line
    signal player2Won <== (2 - 2 * isZeroPlayer2) * (turn);

    signal output out <== player1Won + player2Won;
}