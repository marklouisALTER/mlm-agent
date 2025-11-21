import { Request } from "express";
import { ErrorHandler } from "../lib/ErrorHandler";
import config from "../config/config";
import { verify } from "jsonwebtoken";

export const validateUser = (req: Request) => {
    const authHeader = req.headers["authorization"];

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ErrorHandler("Unauthorized: Missing or invalid Authorization header", 401);
    }

    const token = authHeader.replace("Bearer ", "").trim();
 
    try{
        const payload = verify(token, config.jwtSecret as string);

        if(!payload){
            throw new ErrorHandler("Unauthorized: Invalid token", 401);
        }

        return payload;

    }catch(error){
        if(error instanceof Error){
            if(error.name === "TokenExpiredError"){
                throw new ErrorHandler("Unauthorized: Token has expired", 401);
            } 
        }else {

            throw new ErrorHandler("Unauthorized: Invalid token", 401);
        }
    }
}