import dotenv from "dotenv";
import { twilioClient, voiceWebhookUrl } from "../services/twilio.js";

dotenv.config();

export const callStart = async (req, res) => {
  try {
    const to = req.body.to;

    if (!to) return res.status(400).json({ error: "Missing to" });

    const call = await twilioClient.calls.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: voiceWebhookUrl("/voice/start"),
      method: "POST",
    });

    res.json({ ok: true, callSid: call.sid });
  } catch (e) {
    console.log("callStart error full:", e);
    return res.status(500).json({
      ok: false,
      error: e?.message || String(e),
      twilioCode: e?.code,
      moreInfo: e?.moreInfo,
    });
  }
};
