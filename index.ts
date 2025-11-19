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

import express, { Request, Response } from "express";
const app = express(); 
import { Runner } from "@openai/agents";
import { agent } from "./src/lib/agent";
import { ErrorConstant } from "./src/common/constant/error";
import config from "./src/config/config";
 

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

app.post('/api/v1/agent', async (req: Request, res: Response) => {
    try{
        const { message } = req.body;
        const runner = new Runner();
        if(!message){
            return res.status(400).json({ error: ErrorConstant.BAD_REQUEST_ERROR });
        }

        const response = await runner.run(agent, message);

        res.status(200).json({ response: response.finalOutput });

    }catch(error){
        res.status(500).json({ error: ErrorConstant.INTERNAL_SERVER_ERROR });
    }
})

app.listen(config.port || 3002, () => {
    console.log(`Server is running on port ${config.port || 3002}`);
});