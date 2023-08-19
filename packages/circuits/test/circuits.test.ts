import { Board } from "../../lib";

//@ts-expect-error
import { wasm } from 'circom_tester';
import path from 'path';
import { expect } from "chai";

let updateCircuit: any;
let isValidBoardCircuit: any;
let checkRowsPlayer1: any;
let checkRowsPlayer2: any;
let checkColumnsPlayer1: any;
let checkColumnsPlayer2: any;
let checkDiagonalsPlayer1: any;
let checkDiagonalsPlayer2: any;
let winningPlayer: any;

describe("Test circuit components", () => {

    before("build", async () => {
        updateCircuit = await wasm(path.join(__dirname, 'circuits', 'test_update.circom'));
        isValidBoardCircuit = await wasm(path.join(__dirname, 'circuits', 'test_valid_board.circom'));
        checkRowsPlayer1 = await wasm(path.join(__dirname, 'circuits', 'test_checkrows_player1.circom'));
        checkRowsPlayer2 = await wasm(path.join(__dirname, 'circuits', 'test_checkrows_player2.circom'));
        checkColumnsPlayer1 = await wasm(path.join(__dirname, 'circuits', 'test_checkcolumns_player1.circom'));
        checkColumnsPlayer2 = await wasm(path.join(__dirname, 'circuits', 'test_checkcolumns_player2.circom'));
        checkDiagonalsPlayer1 = await wasm(path.join(__dirname, 'circuits', 'test_checkdiagonals_player1.circom'));
        checkDiagonalsPlayer2 = await wasm(path.join(__dirname, 'circuits', 'test_checkdiagonals_player2.circom'));
        winningPlayer = await wasm(path.join(__dirname, 'circuits', 'test_winningplayer.circom'));
    });

    it("Should accept valid play proofs", async () => {
        // generate proof for valid moves, until board is filled up
        const board = new Board()
        for (let i = 41; i >= 0; i--) {
            const playProof = board.play(i);
            await updateCircuit.calculateWitness(playProof);
        }
    })

    it("Should not accept invalid move values", () => { })

    it("Should not accept a move on a non-empty leaf/cell", () => { })

    it("Should not accept a move on a cell with an empty cell below", () => { })

    it("Should detect winning row for player 1", async () => {
        // generate board with winning row
        const board = new Board();
        board.play(35);
        board.play(28);
        board.play(36);
        board.play(21);
        board.play(37);
        board.play(14);
        board.play(38);
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkRowsPlayer1.calculateWitness(input);
        expect(wtns[1]).to.equal(1n);
    })

    it("Should detect winning row for player 2", async () => {
        // generate board with winning row
        const board = new Board();
        board.play(35);
        board.play(36);
        board.play(28);
        board.play(37);
        board.play(21);
        board.play(38);
        board.play(29);
        board.play(39);
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkRowsPlayer2.calculateWitness(input);
        expect(wtns[1]).to.equal(1n);
    })

    it("Should not detect a winning row when board has no winning row", async () => {
        // start from fresh board
        const board = new Board();
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkRowsPlayer1.calculateWitness(input);
        expect(wtns[1]).to.equal(0n);
    })

    it("Should detect winning column for player 1", async () => {
        // generate board with winning column
        const board = new Board();
        board.play(35);
        board.play(36);
        board.play(28);
        board.play(37);
        board.play(21);
        board.play(38);
        board.play(14);
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkColumnsPlayer1.calculateWitness(input);

        expect(wtns[1]).to.equal(1n);
    });

    it("Should detect winning column for player 2", async () => {
        // generate board with winning column
        const board = new Board();
        board.play(36);
        board.play(35);
        board.play(37);
        board.play(28);
        board.play(38);
        board.play(21);
        board.play(40);
        board.play(14);
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkColumnsPlayer2.calculateWitness(input);
        expect(wtns[1]).to.equal(1n);
    });

    it("Should not detect a winning column when board has no winning column", async () => {
        // start from fresh board
        const board = new Board();
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkColumnsPlayer1.calculateWitness(input);
        expect(wtns[1]).to.equal(0n);
    })

    it("Should detect winning diagonal for player 1", async () => {
        const board = new Board();
        board.play(35); //
        board.play(36);
        board.play(29); //
        board.play(37);
        board.play(30);
        board.play(38);
        board.play(23); // 
        board.play(31);
        board.play(24);
        board.play(28);
        board.play(17); //
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkDiagonalsPlayer1.calculateWitness(input);
        expect(wtns[1]).to.equal(1n);
    });

    it("Should detect winning diagonal for player 2", async () => {
        const board = new Board();
        board.currentPlayer = 2;
        board.play(35); //
        board.play(36);
        board.play(29); //
        board.play(37);
        board.play(30);
        board.play(38);
        board.play(23); // 
        board.play(31);
        board.play(24);
        board.play(28);
        board.play(17); //
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkDiagonalsPlayer2.calculateWitness(input);
        expect(wtns[1]).to.equal(1n);
    });

    it("Should not detect a winning diagonal when board has no winning diagonal", async () => {
        // start from fresh board
        const board = new Board();
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkDiagonalsPlayer1.calculateWitness(input);
        expect(wtns[1]).to.equal(0n);
    });

    it("Should accept valid board proofs", async () => {
        // generate proofs for the board state, until board is filled up
        const board = new Board();
        for (let i = 41; i >= 0; i--) {
            const proof = board.getBoardProof();
            await isValidBoardCircuit.calculateWitness(proof);
            board.play(i);
        }
    })

    it("Should detect when player 1 has won", async () => {
        const board = new Board();
        board.play(41)
        board.play(34)
        board.play(40)
        board.play(27)
        board.play(39)
        board.play(20)
        board.play(38)

        const input = {
            board: board.getBoard(),
            turn: 0
        }

        const wtns = await winningPlayer.calculateWitness(input);
        expect(wtns[1]).to.equal(1n);
    })

    it("Should detect when player 2 has won", async () => {
        const board = new Board();
        board.currentPlayer = 2;
        board.play(41)
        board.play(34)
        board.play(40)
        board.play(27)
        board.play(39)
        board.play(20)
        board.play(38)

        const input = {
            board: board.getBoard(),
            turn: 1
        }

        const wtns = await winningPlayer.calculateWitness(input);
        expect(wtns[1]).to.equal(2n);
    })

    it("Should detect a valid winning player based on turn when both have winning lines", async () => {
        let board = new Board();
        board.play(41)
        board.play(34)
        board.play(40)
        board.play(27)
        board.play(39)
        board.play(20)
        board.play(38)
        board.play(13)

        let input = {
            board: board.getBoard(),
            turn: 0
        }

        let wtns = await winningPlayer.calculateWitness(input);
        expect(wtns[1]).to.equal(1n); 

        board = new Board();
        board.currentPlayer = 2;
        board.play(41)
        board.play(34)
        board.play(40)
        board.play(27)
        board.play(39)
        board.play(20)
        board.play(38)
        board.play(13)

        input = {
            board: board.getBoard(),
            turn: 1
        }

        wtns = await winningPlayer.calculateWitness(input);
        expect(wtns[1]).to.equal(2n);

    }) 

});