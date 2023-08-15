//@ts-expect-error
import { wasm } from 'circom_tester';
import path from 'path';
import { Board, loadJSON } from "../../lib/utils/utils";
import * as tf from '@tensorflow/tfjs-node';
import { Rank, Tensor } from '@tensorflow/tfjs-node';
import { expect } from 'chai';
import { AgentNode } from '../../lib/utils/agent-node';

let modelCircuit: any;
let model: tf.LayersModel;
let weights: any;
let agent: AgentNode;

describe("Test model", () => {

    before("build", async () => {
        modelCircuit = await wasm(path.join(__dirname, 'circuits', 'test_model.circom'));
        const modelPath = path.join(__dirname, '..', 'connect4_tfjs', "model.json")
        model = await tf.loadLayersModel("file://" + modelPath);
        weights = loadJSON(path.join(__dirname, '..', 'circom', 'connect4_model', 'model.json'))
        agent = new AgentNode(modelPath);
        await agent.loadModel();
    });

    it("Should have same inference result as the JS model", async () => {
        const board = new Board();
        for (let i = 41; i >= 41; i--) {
            const agentMove = agent.getMove(board);
            const boardArray = [[board.getBoard()]];
            const input = {
                in: boardArray,
                ...weights
            }
            const inputModel = tf.tensor4d([boardArray])
            const pred = tf.argMax((model.predict(inputModel) as Tensor<Rank>).dataSync()).dataSync()[0];
            const wtns = await modelCircuit.calculateWitness(input);
            expect(Number(wtns[1])).to.equal(pred);
            board.play(i)
        }

    })
})