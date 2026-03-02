import { toFile } from "openai";
import { client } from "../utils/openai.js";
import { systemPrompt } from "../utils/systemPrompt.js";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export async function convertTextToSpeach(text) {
  const audioId = randomUUID();
  const outPath = path.join(process.cwd(), "tmp", "audio", `${audioId}.mp3`);

  const response = await client.audio.speech.create({
    model: `gpt-4o-mini-tts`,
    voice: "fable",
    input: text,
  });

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outPath, audioBuffer);

  return { audioId, outPath };
}

export async function convertSpeachToText(audioBuffer) {
  console.log(audioBuffer);
  try {
    const file = await toFile(audioBuffer, "caller.wav");

    const response = await client.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file,
    });

    return (response.text || "").trim();
  } catch (e) {
    console.log("STT error:", e?.message || e);
    throw e;
  }
}

export async function generateReplyFromResp({ history, appointmentContext }) {
  const system = {
    role: "system",
    content: [
      systemPrompt,
      `Appointment context: ${appointmentContext} || "No appointment context provided."`,
    ].join("\n"),
  };

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [system, ...history],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "{}";
  console.log(text);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { intent: "unknown", reply: "Sorry, can you say that again?" };
  }

  const intent = parsed.intent || "unknown";
  const reply = (parsed.reply || "Sorry, can you say that again?").trim();

  return { intent, reply };
}
