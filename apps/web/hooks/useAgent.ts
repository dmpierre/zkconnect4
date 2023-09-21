import { Agent } from "lib";
import { useState, useEffect } from "react";

export enum AgentState {
    LOADING = "Agent loading...",
    LOADED = "Agent ready!",
    ERROR = "Error loading agent",
    THINKING = "Agent thinking...",
    STALLED = "Agent stalled :(",
}

export const useAgent = () => {
    const [agent, setagent] = useState(new Agent("/connect4_tfjs/model.json"));
    const [agentState, setagentState] = useState(AgentState.LOADING);

    useEffect(() => {
        (async () => {
            try {
                await agent.loadModel();
                setagentState(AgentState.LOADED);
            } catch (error) {
                setagentState(AgentState.ERROR);
            }
        })()
    }, [agent]);

    return {
        agent,
        agentState,
        setagentState
    }
}