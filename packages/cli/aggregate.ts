import fs from "fs";

export const aggregate = () => {
    const aggregated: any = {
        board: [],
        pathElements: [],
        pathIndices: [],
        dense_weights: [],
        dense_bias: [],
        dense_1_weights: [],
        dense_1_bias: [],
        dense_2_weights: [],
        dense_2_bias: [],
        dense_3_weights: [],
        dense_3_bias: [],
        dense_4_weights: [],
        dense_4_bias: [],
        step_in: [],
        pathElementsCurrentLeafPlayer: [],
        pathIndicesCurrentLeafPlayer: [],
        belowLeafPlayer: [],
        pathElementsBelowLeafPlayer: [],
        pathIndicesBelowLeafPlayer: [],
        updatedRootFromPlayerPlay: [],
        pathElementsUpdatedRootFromPlayer: [],
        agentMoveRowHelper: [],
        playerPlayedIndex: [],
        pathElementsCurrentLeafAgent: [],
        pathIndicesCurrentLeafAgent: [],
        belowLeafAgent: [],
        pathElementsBelowLeafAgent: [],
        pathIndicesBelowLeafAgent: [],
        updatedRootFromAgentPlay: [],
        pathElementsUpdatedRootFromAgent: [],
        updatedBoard: [],
        updatedBoardPathElements: [],
        updatedBoardPathIndices: [],
    };
    const files = fs.readdirSync('out');
    const moves = files.filter((f) => f.includes('move_')).map((f) => parseInt(f.split('_')[1].split('.')[0]));
    moves.sort((a, b) => a - b);
    // actually we don't have to repeat the weights
    moves.forEach((move, i) => {
        const file = fs.readFileSync(`out/move_${move}.json`, 'utf8');
        const json = JSON.parse(file);
        aggregated.dense_weights.push(json.dense_weights);
        aggregated.dense_bias.push(json.dense_bias);
        aggregated.dense_1_weights.push(json.dense_1_weights);
        aggregated.dense_1_bias.push(json.dense_1_bias);
        aggregated.dense_2_weights.push(json.dense_2_weights);
        aggregated.dense_2_bias.push(json.dense_2_bias);
        aggregated.dense_3_weights.push(json.dense_3_weights);
        aggregated.dense_3_bias.push(json.dense_3_bias);
        aggregated.dense_4_weights.push(json.dense_4_weights);
        aggregated.dense_4_bias.push(json.dense_4_bias);
        aggregated.playerPlayedIndex.push(json.playerPlayedIndex);
        if (i == 0) {
            const initialStepIn = BigInt(json.step_in[0]).toString(16);
            const hexSplit = [
                initialStepIn.slice(48, 64),
                initialStepIn.slice(32, 48),
                initialStepIn.slice(16, 32),
                initialStepIn.slice(0, 16)
            ]

            aggregated.initialStepIn = [hexSplit, json.step_in[1], json.step_in[2]];
        }

        aggregated.step_in.push(json.step_in);
        aggregated.board.push(json.board);
        aggregated.pathElements.push(json.pathElements);
        aggregated.pathIndices.push(json.pathIndices);
        aggregated.pathElementsCurrentLeafPlayer.push(json.pathElementsCurrentLeafPlayer);
        aggregated.pathIndicesCurrentLeafPlayer.push(json.pathIndicesCurrentLeafPlayer);
        aggregated.belowLeafPlayer.push(json.belowLeafPlayer);
        aggregated.pathElementsBelowLeafPlayer.push(json.pathElementsBelowLeafPlayer);
        aggregated.pathIndicesBelowLeafPlayer.push(json.pathIndicesBelowLeafPlayer);
        aggregated.updatedRootFromPlayerPlay.push(json.updatedRootFromPlayerPlay);
        aggregated.pathElementsUpdatedRootFromPlayer.push(json.pathElementsUpdatedRootFromPlayer);
        aggregated.pathElementsCurrentLeafAgent.push(json.pathElementsCurrentLeafAgent);
        aggregated.pathIndicesCurrentLeafAgent.push(json.pathIndicesCurrentLeafAgent);
        aggregated.belowLeafAgent.push(json.belowLeafAgent);
        aggregated.pathElementsBelowLeafAgent.push(json.pathElementsBelowLeafAgent);
        aggregated.pathIndicesBelowLeafAgent.push(json.pathIndicesBelowLeafAgent);
        aggregated.updatedRootFromAgentPlay.push(json.updatedRootFromAgentPlay);
        aggregated.pathElementsUpdatedRootFromAgent.push(json.pathElementsUpdatedRootFromAgent);
        aggregated.agentMoveRowHelper.push(json.agentMoveRowHelper);
        aggregated.updatedBoard.push(json.updatedBoard);
        aggregated.updatedBoardPathElements.push(json.updatedBoardPathElements);
        aggregated.updatedBoardPathIndices.push(json.updatedBoardPathIndices);
    });
    fs.writeFileSync(
        `out/aggregate.json`, JSON.stringify(aggregated)
    )
}

aggregate()