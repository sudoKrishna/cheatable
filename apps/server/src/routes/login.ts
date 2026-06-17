import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {prisma} from "@repo/db"

const app = express();

const JWT_SECRET = "secret";

app.use(express.json());

function signToken(userId : string) {
    return jwt.sign({sub : userId} , JWT_SECRET, {expiresIn : "7d"})
}



export async function signin(req : any , res : any ) {
   try {
     const {email  , password} = req.body;
 
     if(!email || !password) {
         return res.status(400).json({error : "email and password required"})
         return;
     }
     const user = await prisma.user.findUnique({
         where : {email},
     });
 
     if(!user) {
         res.status(401).json({error : "incalid creadentilas"});
         return ;
     }
 
     const isValid = await bcrypt.compare(password, user.passwordHash);
      
     if(!isValid) {
         res.status(401).json({error : "invalid creadentials"});
         return ;
     }
 
     const token = signToken(user.id);
 
     res.json({
         token,
         user : {
             id : user.id ,
             emaild : user.email,
         
         }
     })
   } catch (error) {
    return res.status(400).json({error : " internal server error"})
   }
}





