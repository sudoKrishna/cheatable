import express from "express";
import { signup } from "../signup";
import { signin } from "../login";


const router = express.Router();

router.post("/signup" , signup);
router.post("/login", signin)

export default router;