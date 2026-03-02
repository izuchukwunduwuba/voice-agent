import express from "express";
import dotenv from "dotenv";
import path from "path";
import voiceRouter from "./src/routes/voiceRouter.js";
import callRouter from "./src/routes/callRouter.js";
import fs from "fs";

dotenv.config();

const app = express();

const audioDir = path.join(process.cwd(), "tmp", "audio");

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(path.join(process.cwd(), "tmp")));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/voice", voiceRouter);
app.use("/call", callRouter);

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
