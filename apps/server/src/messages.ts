import{Router} from "express";
import {prisma} from "@repo/db";

const router = Router();

router.post("/" , async (req , res) => {
try {
        const {projectId, content} = req.body;
    
        if(!projectId || !content) {
            return res.status(400).json({
                message : "projectId aand  content are required"
            })
        }
    
        const project = await prisma.project.findUnique({
            where : {
                id : projectId
            },
        });
    
        if(!project) {
            return res.status(404).json({
                message : "project not found"
            })
        }
    
        const userMessage = await prisma.message.create({
              data : {
                projectId,
                role :"user",
                content
              }
        })
    
        // fake ai 
    
        const assistantReply = `Echo: ${content}`
    
        const assistantMessage = await prisma.message.create({
            data : {
                projectId,
                role : "assistant",
                content : assistantReply
            },
        });
    
        return res.status(201).json({
            userMessage,
            assistantMessage
        });
} catch (error) {
    return res.status(500).json({error : "internal server error"})
}
})

router.get("/:projectId", async (req , res) => {
    try {
        const {projectId} = req.params;
    
        const message = await prisma.message.findMany({
            where : {
                projectId
            },
            orderBy : {
                createdAt : "asc"
            }
    
        })
    
       res.json(message)
    } catch (error) {
        return res.json({error: "internal server error"})
    }
}) 

export default router;