import express from "express";
import { callStart } from "../controller/callController.js";

const router = express.Router();

router.post("/start", callStart);

export default router;
