import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

import {
  confirmCallSession,
  addMessage,
  getHistory,
  endSession,
} from "../services/session.js";
import {
  convertSpeachToText,
  generateReplyFromResp,
  convertTextToSpeach,
} from "../services/openai.js";
import {
  publicAudioUrl,
  twilioRecordingAuthHeader,
} from "../services/twilio.js";

// const name = appointment.client_name || `Anita Cohman`;
// const time =
//   new Date(appointment.appointment_time).toLocaleTimeString("en-GB", {
//     hour: "numeric",
//     minute: "2-digit",
//   }) ||
//   Dat.now().toLocaleTimeString("en-GB", {
//     hour: "numeric",
//     minute: "2-digit",
//   });

export const initiateCall = async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  try {
    const callSid = req.body?.CallSid;
    const from = req.body?.From;
    const to = req.body?.To;

    if (!callSid) {
      console.log("Missing CallSid. Payload:", req.body);
      twiml.say("Sorry. I could not start this call.");
      twiml.hangup();
      return res.type("text/xml").send(twiml.toString());
    }

    await confirmCallSession({ callSid, from, to });

    const greeting = "Hello, may i confirm if i am speaking to Jared";

    await addMessage(callSid, "system", "Call started");
    await addMessage(callSid, "assistant", greeting);

    const { audioId } = await convertTextToSpeach(greeting);

    const audioUrl = `${process.env.PUBLIC_BASE_URL}/public/audio/${audioId}.mp3`;
    twiml.play(audioUrl);

    twiml.record({
      action: "/voice/recorded",
      method: "POST",
      maxLength: 8,
      playBeep: true,
    });

    return res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("initiateCall error:", error);

    twiml.say("Sorry, something went wrong.");
    twiml.hangup();

    return res.type("text/xml").send(twiml.toString());
  }
};
const VoiceResponse = twilio.twiml.VoiceResponse;

export const voiceRecorder = async (req, res) => {
  const callSid = req.body.CallSid;
  const recordingUrl = req.body.RecordingUrl;

  const twiml = new VoiceResponse();

  try {
    if (!callSid || !recordingUrl) {
      twiml.say("Sorry, I could not get your response. Goodbye.");
      twiml.hangup();
      return res.type("text/xml").send(twiml.toString());
    }

    console.log("Recording URL:", recordingUrl);
    console.log("Recording Duration:", req.body.RecordingDuration);

    const wavUrl = `${recordingUrl}.wav`;

    const audioRes = await fetch(wavUrl, {
      headers: { Authorization: twilioRecordingAuthHeader() },
    });

    console.log("AudioRes status:", audioRes.status);

    if (!audioRes.ok) {
      const err = await audioRes.text();
      throw new Error(
        `Twilio recording fetch failed: ${audioRes.status} ${err}`,
      );
    }

    const audioBuf = Buffer.from(await audioRes.arrayBuffer());

    const userText = await convertSpeachToText(audioBuf);
    console.log("STT text:", userText);

    await addMessage(callSid, "user", userText || "(no speech detected)");

    const history = await getHistory(callSid, 30);

    const appointmentContext =
      "Appointment reminder call. The appointment is tomorrow at 8 PM.";

    const { intent, reply } = await generateReplyFromResp({
      history,
      appointmentContext,
    });

    console.log("LLM intent:", intent);
    console.log("LLM reply:", reply);

    await addMessage(callSid, "assistant", reply);

    if (intent === "confirm") {
      const { audioId } = await convertTextToSpeach(reply);
      twiml.play(`${process.env.PUBLIC_BASE_URL}/public/audio/${audioId}.mp3`);
      await endSession(callSid, "confirm");
      twiml.hangup();
      return res.type("text/xml").send(twiml.toString());
    }

    if (intent === "cancel") {
      const { audioId } = await convertTextToSpeach(reply);
      twiml.play(`${process.env.PUBLIC_BASE_URL}/public/audio/${audioId}.mp3`);
      await endSession(callSid, "cancel");
      twiml.hangup();
      return res.type("text/xml").send(twiml.toString());
    }
    if (intent === "reschedule") {
      const { audioId } = await convertTextToSpeach(reply);
      twiml.play(`${process.env.PUBLIC_BASE_URL}/public/audio/${audioId}.mp3`);
      await endSession(callSid, "reschedule");
      twiml.hangup();
      return res.type("text/xml").send(twiml.toString());
    }

    const { audioId } = await convertTextToSpeach(
      reply || "Do you want to confirm, reschedule, or cancel?",
    );

    twiml.play(`${process.env.PUBLIC_BASE_URL}/public/audio/${audioId}.mp3`);

    twiml.record({
      action: "/voice/recorded",
      method: "POST",
      maxLength: 8,
      playBeep: true,
    });

    return res.type("text/xml").send(twiml.toString());
  } catch (e) {
    console.log("voiceRecorder error:", e);

    twiml.say("Sorry, I had a problem. Goodbye.");
    twiml.hangup();
    return res.type("text/xml").send(twiml.toString());
  }
};
