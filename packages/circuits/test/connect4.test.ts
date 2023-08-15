//@ts-expect-error
import { wasm } from 'circom_tester';
import path from 'path';
import { Board, formatProof, loadJSON } from "../../lib/utils/utils";
import * as tf from '@tensorflow/tfjs-node';
import { Rank, Tensor } from '@tensorflow/tfjs-node';
import { expect } from 'chai';
import { AgentNode } from '../../lib/utils/agent-node';

let connect4Circuit: any;
let modelPath: string;
let model: tf.LayersModel;
let weights: any;
let agent: AgentNode;

describe("Test Connect4 circuit", () => {

    before("build", async () => {
        connect4Circuit = await wasm(path.join(__dirname, 'circuits', 'test_connect4.circom'));
        modelPath = path.join(__dirname, '..', 'connect4_tfjs', "model.json")
        model = await tf.loadLayersModel("file://" + modelPath);
        weights = loadJSON(path.join(__dirname, '..', 'circom', 'connect4_model', 'model.json'))
        agent = new AgentNode(modelPath);
        await agent.loadModel();
    });

    it("Should play between player and agent", async () => {
        const board = new Board();
        board.play(41)
        // get move from agent
        const agentMove = agent.getMove(board);
        const boardArray = [[board.getBoard()]];
        if (agentMove == undefined) {}
        else {
            // we do not update the board for now
            const playProof = board.play(agentMove.prediction, false, 2); // currentPlayer == 2
            const playProofAgent = formatProof(playProof, 'agent');
            const playProofPlayer = formatProof(board.play(39, false, 1), 'player'); // force to generate a proof for player 1
            const input = {
                board: boardArray,
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
})