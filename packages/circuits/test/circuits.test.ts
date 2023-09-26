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
let checkRLDiagonalsPlayer1: any;
let checkLRDiagonalsPlayer1: any;
let checkRLDiagonalsPlayer2: any;
let checkLRDiagonalsPlayer2: any;
let winningPlayer: any;

describe("Test circuit components", () => {

    before("build", async () => {
        updateCircuit = await wasm(path.join(__dirname, 'circuits', 'test_update.circom'));
        isValidBoardCircuit = await wasm(path.join(__dirname, 'circuits', 'test_valid_board.circom'));
        checkRowsPlayer1 = await wasm(path.join(__dirname, 'circuits', 'test_checkrows_player1.circom'));
        checkRowsPlayer2 = await wasm(path.join(__dirname, 'circuits', 'test_checkrows_player2.circom'));
        checkColumnsPlayer1 = await wasm(path.join(__dirname, 'circuits', 'test_checkcolumns_player1.circom'));
        checkColumnsPlayer2 = await wasm(path.join(__dirname, 'circuits', 'test_checkcolumns_player2.circom'));
        checkRLDiagonalsPlayer1 = await wasm(path.join(__dirname, 'circuits', 'test_checkRLdiagonals_player1.circom'));
        checkLRDiagonalsPlayer1 = await wasm(path.join(__dirname, 'circuits', 'test_checkLRdiagonals_player1.circom'));
        checkRLDiagonalsPlayer2 = await wasm(path.join(__dirname, 'circuits', 'test_checkRLdiagonals_player2.circom'));
        checkLRDiagonalsPlayer2 = await wasm(path.join(__dirname, 'circuits', 'test_checkLRdiagonals_player2.circom'));
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

    it("Should detect all winning rows for player 1", async () => {
        const witnesses = [];
        for (let i = 0; i <= 35; i += 7) {
            for (let j = i; j < 4; j++) {
                const board = new Board();
                board.playNoCheck(i + j, 1);
                board.playNoCheck(i + j + 1, 1);
                board.playNoCheck(i + j + 2, 1);
                board.playNoCheck(i + j + 3, 1);
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkRowsPlayer1.calculateWitness(input);
                witnesses.push(wtns);
            }
        }
        
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });
    });

    it("Should detect all winning rows for player 2", async () => {
        const witnesses = [];
        for (let i = 0; i <= 35; i += 7) {
            for (let j = i; j < 4; j++) {
                const board = new Board();
                board.playNoCheck(i + j, 2);
                board.playNoCheck(i + j + 1, 2);
                board.playNoCheck(i + j + 2, 2);
                board.playNoCheck(i + j + 3, 2);
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkRowsPlayer2.calculateWitness(input);
                witnesses.push(wtns);
            }
        }
        
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });
    });

    it("Should not detect a winning row when board has no winning row", async () => {
        // start from fresh board
        const board = new Board();
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkRowsPlayer1.calculateWitness(input);
        expect(wtns[1]).to.equal(0n);
    })

    it("Should detect all winning columns for player 1", async () => {
        const witnesses = [];
        for (let i = 0; i < 7; i++) {
            for (let j = i; j <= i + 14; j += 7) {
                const board = new Board();
                board.playNoCheck(j, 1);
                board.playNoCheck(j + 7, 1);
                board.playNoCheck(j + 14, 1);
                board.playNoCheck(j + 21, 1);
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkColumnsPlayer1.calculateWitness(input);
                witnesses.push(wtns);
            }
        }
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });
    });

    it("Should detect all winning columns for player 2", async () => {
        const witnesses = [];
        for (let i = 0; i < 7; i++) {
            for (let j = i; j <= i + 14; j += 7) {
                const board = new Board();
                board.playNoCheck(j, 2);
                board.playNoCheck(j + 7, 2);
                board.playNoCheck(j + 14, 2);
                board.playNoCheck(j + 21, 2);
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkColumnsPlayer2.calculateWitness(input);
                witnesses.push(wtns);
            }
        }
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });
    });

    it("Should not detect a winning column when board has no winning column", async () => {
        const board = new Board();
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkColumnsPlayer1.calculateWitness(input);
        expect(wtns[1]).to.equal(0n);
    })

    it("Should detect all winning diagonals (RL) for player 1", async () => {
        // RL = right to left
        const witnesses = [];
        for (let i = 3; i <= 17; i += 7) {
            for (let j = 0; j < 4; j++) {
                const board = new Board();
                board.playNoCheck(i + j, 1);
                board.playNoCheck(i + j + 6, 1);
                board.playNoCheck(i + j + 12, 1); 
                board.playNoCheck(i + j + 18, 1); 
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkRLDiagonalsPlayer1.calculateWitness(input);
                witnesses.push(wtns);
            }
        }    
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });

    });

    it("Should detect all winning diagonals (RL) for player 2", async () => {
        const witnesses = [];
        for (let i = 3; i <= 17; i += 7) {
            for (let j = 0; j < 4; j++) {
                const board = new Board();
                board.playNoCheck(i + j, 2);
                board.playNoCheck(i + j + 6, 2);
                board.playNoCheck(i + j + 12, 2); 
                board.playNoCheck(i + j + 18, 2); 
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkRLDiagonalsPlayer2.calculateWitness(input);
                witnesses.push(wtns);
            }
        }    
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });

    });

    it("Should detect all winning diagonals (LR) for player 1", async () => {
        const witnesses = [];
        for (let i = 0; i <= 14; i += 7) {
            for (let j = 0; j < 4; j++) {
                const board = new Board();
                board.playNoCheck(i + j, 1);
                board.playNoCheck(i + j + 8, 1);
                board.playNoCheck(i + j + 16, 1); 
                board.playNoCheck(i + j + 24, 1); 
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkLRDiagonalsPlayer1.calculateWitness(input);
                witnesses.push(wtns);
            }
        }
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });

    });

    it("Should detect all winning diagonals (LR) for player 2", async () => {
        const witnesses = [];
        for (let i = 0; i <= 14; i += 7) {
            for (let j = 0; j < 4; j++) {
                const board = new Board();
                board.playNoCheck(i + j, 2);
                board.playNoCheck(i + j + 8, 2);
                board.playNoCheck(i + j + 16, 2); 
                board.playNoCheck(i + j + 24, 2); 
                const input = {
                    board: board.getBoard(),
                }
                const wtns = checkLRDiagonalsPlayer2.calculateWitness(input);
                witnesses.push(wtns);
            }
        }
        let results = await Promise.all(witnesses);
        results.map((wtns) => {
            expect(wtns[1]).to.equal(1n);
        });
    });

    it("Should not detect a winning diagonal when board has no winning diagonal", async () => {
        // start from fresh board
        const board = new Board();
        const input = {
            board: board.getBoard(),
        }
        const wtns = await checkRLDiagonalsPlayer1.calculateWitness(input);
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