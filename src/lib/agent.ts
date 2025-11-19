import { Agent } from "@openai/agents";
import { model } from "../model/model";
import { tools } from "../tools/tools";
import { agentSafetyGuardrail } from "../auth/guardrails";

export const agent = new Agent({
    name: "Assistant Agent",
    instructions: "You are an AI assistant that helps customer to answer questions and solve problems.",
    model: model,
    modelSettings: {
        temperature: 1.0,
        toolChoice: "auto"
    },
    inputGuardrails: [agentSafetyGuardrail],
    tools: Object.values(tools),
})