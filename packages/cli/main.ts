import { Board, askMove, formatProof } from "../lib/utils/utils";
import fs from "fs";
import { art, loadConnect4 } from "./conf";
import assert from "assert";

export const main = async () => {
    const board = new Board();
    console.clear();
    let message = 'Loading board...';
    console.log(art);
    console.log(message);
    const { agent, weights, connect4Circuit } = await loadConnect4();
    message = '';
    let moves = 0;
    while (true) {
        console.clear();
        console.log(art);
        board.printBoard();
        console.log(message);
        const agentMove = agent.getMove(board);
        if (agentMove?.prediction == undefined) {
            message = "Error getting move from agent";
            continue;
        }
        let playerMove = agentMove?.prediction;
        if (board.currentPlayer == 1) {
            playerMove = parseInt(await askMove("Move: ") as string);
        }
        console.clear();
        try {
            const playProofPlayer = formatProof(board.play(playerMove, false, 1), 'player');
            const playProofAgent = formatProof(board.play(agentMove.prediction, false, 2), 'agent');
            const boardArray = [[board.getBoard()]];
            const input = {
                board: boardArray,
                ...weights,
                step_in: board.boardTree.root,
                turn: board.currentPlayer - 1,
                ...playProofPlayer,
                agentMoveRowHelper: agentMove.rowHelper,
                playerPlayedIndex: playerMove,
                ...playProofAgent
            }
            const move = board.currentPlayer == 1 ? playerMove : agentMove.prediction;
            const wtns = await connect4Circuit.calculateWitness(input);
            fs.writeFileSync(
                `out/move_${moves}.json`, JSON.stringify(input)
            )
            board.play(move);
            assert(wtns[1] == board.boardTree.root, "Root is not correct");
            message = '';
            moves++;
        } catch (e: any) {
            message = e.message;
        }
    }
}

main().then(() => { })
