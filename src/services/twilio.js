import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export function publicAudioUrl(audioId) {
  return `${process.env.PUBLIC_BASE_URL}/public/audio/${audioId}.mp3`;
}

export function voiceWebhookUrl(path) {
  return `${process.env.PUBLIC_BASE_URL}${path}`;
}

export function twilioRecordingAuthHeader() {
  const token = Buffer.from(
    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
  ).toString("base64");

  return `Basic ${token}`;
}
