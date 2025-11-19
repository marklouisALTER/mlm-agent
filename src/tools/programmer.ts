import { tool } from "@openai/agents";
import { z } from "zod";

export const programmerTool = tool({
    name: "Programmer Tool",
    description: "A tool that helps to write, debug, and explain code in various programming languages.",
    parameters: z.object({
        task: z.string().describe("The programming task to be performed, such as writing code, debugging, or explaining code."),
    }),
    async execute({ task }: { task: string }){
        return `Hello, Here is the result of your programming task: ${task}`;
    }
})