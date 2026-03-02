import express from "express";
import { initiateCall, voiceRecorder } from "../controller/voiceController.js";

const router = express.Router();

router.post("/start", initiateCall);
router.post("/recorded", voiceRecorder);

export default router;
