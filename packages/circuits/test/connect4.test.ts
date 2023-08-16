//@ts-expect-error
import { wasm } from 'circom_tester';
import path from 'path';
import { Board, formatProof, loadJSON } from "../../lib/utils/utils";
import * as tf from '@tensorflow/tfjs-node';
import { Rank, Tensor } from '@tensorflow/tfjs-node';
import { assert, expect } from 'chai';
import { AgentNode } from '../../lib/utils/agent-node';

let connect4Circuit: any;
let modelPath: string;
let model: tf.LayersModel;
let weights: any;
let agent: AgentNode;

describe("Test Connect4 circuit", () => {

    before("build", async () => {
        modelPath = path.join(__dirname, '..', 'connect4_tfjs', "model.json")
        model = await tf.loadLayersModel("file://" + modelPath);
        weights = loadJSON(path.join(__dirname, '..', 'circom', 'connect4_model', 'model.json'))
        agent = new AgentNode(modelPath);
        await agent.loadModel();
    });
    
    beforeEach("reset", async () => {
        connect4Circuit = await wasm(path.join(__dirname, 'circuits', 'test_connect4.circom'));
    });

    it("Should play between player and agent", async () => {
        const board = new Board();
        board.play(41)
        // get move from agent
        const agentMove = agent.getMove(board);
        const boardArray = [[board.getBoard()]];
        if (agentMove == undefined) { }
        else {
            // we do not update the board for now
            const playProof = board.play(agentMove.prediction, false, 2); // currentPlayer == 2
            const playProofAgent = formatProof(playProof, 'agent');
            const playProofPlayer = formatProof(board.play(39, false, 1), 'player'); // force to generate a proof for player 1
            const boardProof = board.getBoardProof();
            const input = {
                board: boardArray,
                pathElements: boardProof.pathsElements, // proves array provided resolves to board
                pathIndices: boardProof.pathsIndices, // proves array provided resolves to board
                ...weights,
                step_in: playProof.root,
                turn: board.currentPlayer - 1, // 1 for agent, 0 for player
                ...playProofAgent,
                agentMoveRowHelper: agentMove.rowHelper,
                playerPlayedIndex: 39,
                ...playProofPlayer
            }
            const inputModel = tf.tensor4d([boardArray])
            const pred = tf.argMax((model.predict(inputModel) as Tensor<Rank>).dataSync()).dataSync()[0];
            const wtns = await connect4Circuit.calculateWitness(input);
            board.play(agentMove.prediction);
            expect(wtns[1]).to.equal(board.boardTree.root)
        }
    })
    it("Should catch on invalid board proofs", async () => {

        // With folding, the root will be passed between each folding step
        // If a player tries to cheat on the performed inference, he will still have 
        // to pass the correct board root.
        const correctBoard = new Board();
        const incorrectBoard = new Board();

        correctBoard.play(41) // board obtained from preceding move
        incorrectBoard.play(40) // "fake" board to cheat on model inference

        const incorrectAgentMove = agent.getMove(incorrectBoard);
        const correctAgentMove = agent.getMove(correctBoard);
        assert(correctAgentMove?.prediction != undefined);
        assert(incorrectAgentMove?.prediction != undefined);

        const incorrectBoardArray = [[incorrectBoard.getBoard()]];

        const playerPlayedIdx = 39;

        // Generate a play proof on the correct board
        const correctPlayProof = correctBoard.play(correctAgentMove.prediction, false, 2); // currentPlayer == 2
        const correctPlayProofAgent = formatProof(correctPlayProof, 'agent');
        const correctPlayProofPlayer = formatProof(correctBoard.play(playerPlayedIdx, false, 1), 'player') // force to generate a proof for player 1

        const baseInput = {
            ...weights,
            turn: correctBoard.currentPlayer - 1, // 1 for agent, 0 for player
            playerPlayedIndex: playerPlayedIdx,
            step_in: correctBoard.boardTree.root, // root is "fixed", it is passed between each folding step
        }

        // Player provides the incorrect board array, valid proofs for incorrect board and valid proofs of play for incorrect board
        // witness generation is not able to run since merkle proof for the board's content will be incorrect
        const incorrectBoardProof = incorrectBoard.getBoardProof(); // merkle proof for board's content
        const inputIncorrectBoardArray = {
            ...baseInput,
            board: incorrectBoardArray,
            agentMoveRowHelper: incorrectAgentMove.rowHelper,
            pathElements: incorrectBoardProof.pathsElements,
            pathIndices: incorrectBoardProof.pathsIndices,
            ...correctPlayProofAgent,
            ...correctPlayProofPlayer
        }

        try {
            const wtns = await connect4Circuit.calculateWitness(inputIncorrectBoardArray);
        } catch (error: any) {
            expect(error.message).to.contain("IsValidBoard");
        }

    })

    it("Should catch on invalid row helper values", async () => {
        const board = new Board();
        board.play(41)
        
        const agentMove = agent.getMove(board);
        assert(agentMove?.prediction != undefined);

        const boardArray = [[board.getBoard()]];
        const boardProof = board.getBoardProof();
        const playProof = board.play(agentMove.prediction, false, 2);
        const playProofAgent = formatProof(playProof, 'agent');
        const playProofPlayer = formatProof(board.play(39, false, 1), 'player');

        const baseInput = {
            ...weights,
            turn: board.currentPlayer - 1,
            playerPlayedIndex: 39,
            step_in: board.boardTree.root,
            board: boardArray,
            pathElements: boardProof.pathsElements,
            pathIndices: boardProof.pathsIndices,
            ...playProofAgent,
            ...playProofPlayer,
            agentMoveRowHelper: agentMove.rowHelper - 1 // invalid value. InvalidLeaf check won't pass
        }

        try {
            const wtns = await connect4Circuit.calculateWitness(baseInput);
        } catch (error: any) {
            expect(error.message).to.contain("IsEmptyLeaf");
        }
    })
})