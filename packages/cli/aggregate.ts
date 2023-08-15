import fs from "fs";

const main = () => {
    const aggregated: any = {
        board: [],
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
        turn: [],
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
        pathElementsUpdatedRootFromAgent: []
    };
    const files = fs.readdirSync('out');
    const moves = files.filter((f) => f.includes('move_')).map((f) => parseInt(f.split('_')[1].split('.')[0]));
    moves.sort((a, b) => a - b);
    // actually we don't have to repeat the weights
    moves.forEach((move, i) => {
        const file = fs.readFileSync(`out/move_${move}.json`, 'utf8');
        const json = JSON.parse(file);
        aggregated.board.push(json.board);
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
        aggregated.step_in.push(json.step_in);
        aggregated.turn.push(json.turn);
        aggregated.pathElementsCurrentLeafPlayer.push(json.pathElementsCurrentLeafPlayer);
        aggregated.pathIndicesCurrentLeafPlayer.push(json.pathIndicesCurrentLeafPlayer);
        aggregated.belowLeafPlayer.push(json.belowLeafPlayer);
        aggregated.pathElementsBelowLeafPlayer.push(json.pathElementsBelowLeafPlayer);
        aggregated.pathIndicesBelowLeafPlayer.push(json.pathIndicesBelowLeafPlayer);
        aggregated.updatedRootFromPlayerPlay.push(json.updatedRootFromPlayerPlay);
        aggregated.pathElementsUpdatedRootFromPlayer.push(json.pathElementsUpdatedRootFromPlayer);
        aggregated.agentMoveRowHelper.push(json.agentMoveRowHelper);
        aggregated.playerPlayedIndex.push(json.playerPlayedIndex);
        aggregated.pathElementsCurrentLeafAgent.push(json.pathElementsCurrentLeafAgent);
        aggregated.pathIndicesCurrentLeafAgent.push(json.pathIndicesCurrentLeafAgent);
        aggregated.belowLeafAgent.push(json.belowLeafAgent);
        aggregated.pathElementsBelowLeafAgent.push(json.pathElementsBelowLeafAgent);
        aggregated.pathIndicesBelowLeafAgent.push(json.pathIndicesBelowLeafAgent);
        aggregated.updatedRootFromAgentPlay.push(json.updatedRootFromAgentPlay);
        aggregated.pathElementsUpdatedRootFromAgent.push(json.pathElementsUpdatedRootFromAgent);
    });
    fs.writeFileSync(
        `out/aggregate.json`, JSON.stringify(aggregated)
    )
}

main()