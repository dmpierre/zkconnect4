import { AgentNode } from "../lib/utils/node/agent-node";
import path from "path";
//@ts-expect-error
import { wasm } from 'circom_tester';
import { loadJSON } from "../lib/utils/utils";

export const CONF = {
    modelPath: path.join(__dirname, '..', 'circuits', 'connect4_tfjs', "model.json"),
    weightsPath: path.join(__dirname, '..', 'circuits', 'circom', 'connect4_model', 'model.json'),
    circuitPath: path.join(__dirname, '..', 'circuits', 'test', 'circuits', 'test_connect4.circom')
}

export const loadConnect4 = async () => {
    const modelPath = CONF.modelPath;
    const weightsPath = CONF.weightsPath;
    const connect4CircuitPath = CONF.circuitPath;
    const connect4Circuit = await wasm(connect4CircuitPath);
    const agent = new AgentNode(modelPath);
    await agent.loadModel();
    const weights = loadJSON(weightsPath)
    return { connect4Circuit, agent, weights };
}

export const art = `
███████╗██╗  ██╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗██╗  ██╗
╚══███╔╝██║ ██╔╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝██║  ██║
  ███╔╝ █████╔╝ ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   ███████║
 ███╔╝  ██╔═██╗ ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   ╚════██║
███████╗██║  ██╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║        ██║
╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝        ╚═╝
`