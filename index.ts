// import { InputGuardrailTripwireTriggered, Runner } from "@openai/agents";
// import { agent } from "./src/lib/agent";
// import dotenv from "dotenv";

// dotenv.config({ quiet: true });

// async function run(){
//     const runner = new Runner();
//     try{

//         const response = await runner.run(
//             agent,
//             "Can I have multiple accounts?", {
//                 stream: true
//             }
//         );
        
//         response.toTextStream({
//             compatibleWithNodeStreams: true
//         }).pipe(process.stdout);

//     } catch (error){
//         if(error instanceof InputGuardrailTripwireTriggered){
//             console.log("❌ Blocked by guardrail");
//             console.log("\n💬 User sees: I cannot help with that request as it violates our safety guidelines.")
//         } else {
//             console.error("Error:", error)
//         };
//     }  
// }

// run();

import express, { NextFunction, Request, Response } from "express";
const app = express(); 
import { OpenAIConversationsSession, Runner } from "@openai/agents";
import { agent, createAgentWithAuth } from "./src/lib/agent";
import { ErrorConstant } from "./src/common/constant/error";
import config from "./src/config/config";
import { validateUser } from "./src/auth/validation";
import { ErrorHandler } from "./src/lib/ErrorHandler";
import { UserPayload } from "./src/lib/types";
 

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
})

app.get('/', (req: Request, res: Response) => {
    res.send('Hello! The AI Assistant is running.');
})
const session = new OpenAIConversationsSession();

app.post('/api/v1/agent', async (req: Request, res: Response, next: NextFunction) => {
    try{

        const { message } = req.body;
        
        const isAuthenticated = validateUser(req) as UserPayload | null;
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader?.replace("Bearer ", "").trim();

        if(!isAuthenticated){
            return res.status(401).json({ error: ErrorConstant.UNAUTHORIZED_ERROR });
        }

        const { name, role } = isAuthenticated;

        const messageWithContext = `User Name: ${name}\nUser Role: ${role}\nMessage: ${message}`;

        const agentWithAuth = createAgentWithAuth(accessToken ?? "", name, role);

        const runner = new Runner();
        if(!message){
            return res.status(400).json({ error: ErrorConstant.BAD_REQUEST_ERROR });
        }

        const response = await runner.run(agentWithAuth, messageWithContext, {
            session: session
        });

        res.status(200).json({ response: response.finalOutput });

    }catch(error){
       next(error);
    }
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof ErrorHandler){
        return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: ErrorConstant.GENERIC_ERROR });
});

app.listen(config.port || 3002, () => {
    console.log(`Server is running on port ${config.port || 3002}`);
});