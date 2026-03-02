import OpenAI from "openai";
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function convertTextToSpeach(text) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  const audioId = randomUUID();
  const outPath = path.join(process.cwd(), "tmp", "audio", `${audioId}.mp3`);

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`ElevenLabs error: ${res.status} ${error}`);
  }

  const audioBuf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, audioBuf);

  return { audioId, outPath };
}
