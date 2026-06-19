import express from  "express";
import projectRouters from "./projects";

const app = express();

app.use(express.json());

app.use("/projects" , projectRouters);

app.listen(3000 , () => {
    console.log("server running...")
});

