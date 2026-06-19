import { Router } from "express";
import {prisma} from "@repo/db";

const router= Router()

router.post("/" , async(req, res) => {
   try {
     const {userId , name} = req.body;
 
    if(!name || !userId) {
     return res.status(400).json({error : "name and userid are required"})
    }
    const project = await prisma.project.create({
     data : {
        name , 
        ownerId : userId
     },
    });
 
    return res.status(201).json(project);
   } catch (error) {
    return res.status(500).json({message : "internal server error"})
   }
})

router.get("/" , async (req , res) => {
   try {
     const {userId} = req.query;
 
     if(!userId) {
         return res.json(400).json({
             message : "userId is required"
         })
     }
 
     const projects = await prisma.project.findMany({
         where : {
             ownerId : userId  as string
         },
         orderBy : {
             createAt : "desc"
         },
     });
 
     return res.json(projects)
   } catch (error) {
    return res.status(500).json({message : "internal server error"})
   }
})

router.get("/:projectId" , async (req , res) => {
    try {
        const {projectId} = req.params;
      
    
        const project = await prisma.project.findUnique({
            where : {
                id : projectId,
            },
            include : {
                message : true,
            }
        });
    
        if(!project) {
            return res.json(404).json({
                message : "project not found"
            })
        }
        return res.json(project);
    } catch (error) {
        return res.status(500).json({error : "internal server error"})
    }
})

export default router;