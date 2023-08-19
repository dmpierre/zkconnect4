import { AgentNode } from "../utils/node/agent-node";
import path from 'path';
import { Board } from "../utils/utils";

describe('Test lib', () => {
    it('Should have a working node agent', async () => {
        const board = new Board();
        const modelPath = path.join(__dirname, '..', '..', 'circuits', 'connect4_tfjs', "model.json")
        const agent = new AgentNode(modelPath);
        await agent.loadModel();
        for (let i = 0; i < 6; i++) {
            const idx = agent.getMove(board)
            try {
                if (idx == undefined) {
                    throw new Error("Invalid move")
                }
                board.play(idx.prediction)
                board.printBoard();
            } catch (error) { 
                console.log(error)
            }

        }
    })
});