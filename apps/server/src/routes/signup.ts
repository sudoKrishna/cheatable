import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {prisma} from "@repo/db";

const app = express();

const JWT_SECRET  = "secret";

function signToken(userId : string) {
    return jwt.sign(
        {sub : userId},
        JWT_SECRET,
        {expiresIn : "7d"}
    );
}

export async function signup(req : any  ,res : any) {
    try {
        const {email , password} = req.body;
    
        if(!email || !password) {
            return res.status(400).json({error :  "email and password is required"})
        }
    
        const existing = await prisma.user.findUnique({
            where : {email},
        });
    
        if(existing) {
            res.status(400).json({error : "user already exists"});
            return ;
        }
    
        const passwordHash = await bcrypt.hash(password , 10);
    
        const user  = await prisma.user.create({
            data : {
                email, 
                passwordHash,
            },
        });
    
        const token = signToken(user.id);
    
        res.json({
            token,
            user : {
                id : user.id, 
                email : user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({
            error : "internal server error"
        })
    }
}
