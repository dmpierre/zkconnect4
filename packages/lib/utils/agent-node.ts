import { Board } from "./utils";
import * as tf from '@tensorflow/tfjs-node';
import { Rank, Tensor } from '@tensorflow/tfjs-node';

export class AgentNode {
    /**
     * This is an agent that works within a nodejs environment.
     * @param modelPath path to the model.json file
     * 
     */
    model: tf.LayersModel | undefined;
    path: string;

    constructor(modelPath: string) {
        this.path = modelPath;
    }

    async loadModel() {
        this.model = await tf.loadLayersModel("file://" + this.path);
    }

    getMove(board: Board) {
        if (this.model == undefined) {
            throw new Error("Model not loaded. Call loadModel() first.");
        }
        const boardArray = [[board.getBoard()]];
        
        // prediction will be a column index, but should return an index between 0 and 41
        const columnPrediction = this.model.predict(tf.tensor4d([boardArray]));
        
        // we will check that this index is valid within the circuit
        const prediction = tf.argMax((this.model.predict(tf.tensor4d([boardArray])) as Tensor<Rank>).dataSync()).dataSync()[0];

        for (let i = 0; i < 6; i++) {
            try {
                
                const pred = board.isValidMove(prediction + 7 * i, 2)
                return {
                    prediction: prediction + 7 * i,
                    rowHelper: i
                }
            } catch (error) {
                
            }
        }
    }
}