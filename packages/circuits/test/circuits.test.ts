import { Board } from "../../lib/utils/utils";

//@ts-expect-error
import { wasm } from 'circom_tester';
import path from 'path';

let updateCircuit: any;
let isValidBoardCircuit: any;

describe("Test circuit components", () => {

    before("build", async () => {
        updateCircuit = await wasm(path.join(__dirname, 'circuits', 'test_update.circom'));
        isValidBoardCircuit = await wasm(path.join(__dirname, 'circuits', 'test_valid_board.circom'));
    });

    it("Should accept valid play proofs", async () => {
        // generate proof for valid moves, until board is filled up
        const board = new Board()
        for (let i = 41; i >= 0 ; i--) {
            const playProof = board.play(i);
            await updateCircuit.calculateWitness(playProof); 
        }
    })

    it("Should not accept invalid move values", () =>{})

    it("Should not accept a move on a non-empty leaf/cell", () => {})

    it("Should not accept a move on a cell with an empty cell below", () => {})

    it("Should accept valid board proofs", async () => {
        // generate proofs for the board state, until board is filled up
        const board = new Board();
        for (let i = 41; i >= 0 ; i--) {
            const proof = board.getBoardProof();
            await isValidBoardCircuit.calculateWitness(proof); 
            board.play(i);
        }
    })

});