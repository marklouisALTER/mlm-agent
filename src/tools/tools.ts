import { policiesFaqsTool } from "./policies-faqs";
import { programmerTool } from "./programmer";
import { fetchUserTool } from "./user";

export const tools = {
    programmerTool,
    policiesFaqsTool
}

export const createTools = (accessToken: string) => {
    return {
        ...tools,
        userTool: fetchUserTool(accessToken), 
    };
};