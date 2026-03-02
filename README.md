# 📞 AI Voice Appointment Reminder Agent

> A production-shaped demonstration of a **Hybrid AI Voice Agent** built with Node.js, Twilio Voice, OpenAI (STT + LLM + TTS), and Supabase for persistence.

---

## Why This Matters

Voice AI systems often fail because they give full control to the language model.

Built as a **Founding Solutions Engineer** demonstration, this system emphasizes: Voice agents can be deterministic.

This project proves that:

- Voice agents **can** be deterministic
- Business logic **must** live in the backend
- LLMs should **assist**, not control
- Every call **must** be observable and auditable

> This is not just a chatbot with speech. It is a **structured orchestration system**.

---

## What This System Does

1. Initiates outbound calls via Twilio
2. Plays an AI-generated greeting
3. Records the caller's response
4. Converts speech to text using OpenAI STT
5. Uses an LLM to classify intent and generate a reply
6. Converts the reply to speech
7. Ends or continues the call based on backend business rules
8. Stores the full session history in Supabase

---

## Core Design Principles

| Principle                      | Description                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------- |
| **Backend as Source of Truth** | The LLM does not control hangups or business outcomes — the backend does         |
| **Hybrid Intent Detection**    | Rule-based overrides for `confirm`/`cancel`; LLM reasoning for flexible phrasing |
| **Observability First**        | Every call session stores transcript, intent, reply, and final status            |
| **Deterministic Demo Flow**    | Avoids unpredictable behaviour during live demonstrations                        |

---

## Tool-Agnostic Architecture

This project is designed to be tool-agnostic.

All major components are abstracted behind service layers, which means the system can be adapted to different providers with minimal refactoring.

The following components can be swapped:

**Speech-to-Text (STT)**
Currently uses OpenAI.
Can be replaced with AWS Transcribe, Google Speech-to-Text, Deepgram, or any other provider.

**Text-to-Speech (TTS)**
Currently uses OpenAI TTS.
Can be replaced with ElevenLabs, Amazon Polly, Google TTS, or Azure Speech.

**Language Model (Reasoning Layer)**
Currently uses OpenAI GPT models.
Can be replaced with Anthropic, Google Gemini, AWS Bedrock models, or local LLMs.

**Telephony Provider**
Currently uses Twilio.
Can be replaced with Retell, Vonage, AWS Connect, or any SIP-compatible system.

**Database Layer**
Currently uses Supabase (Postgres).
Can be replaced with DynamoDB, MongoDB, or any relational database.

Because each integration is encapsulated within service modules, migrating providers requires:

- Updating model calls

- Adjusting request formats

- Refactoring provider-specific logic

- Leaving orchestration and business rules untouched

The orchestration layer remains stable regardless of vendor choice.

## System Architecture

### 1. Voice Layer (Twilio)

- Outbound call placement, audio playback & recording capture, webhook callbacks

**Endpoints:** `/call/start` · `/voice/start` · `/voice/recorded`

### 2. Orchestration Layer (Node.js)

- Downloads recording → STT → LLM → TTS → applies hangup rules → maintains session state

### 3. Persistence Layer (Supabase)

- Stores call sessions, conversation history, intent classification, and final call outcome
- Acts as the **single source of conversational truth**

---

## Call Flow

```
Backend → /call/start
         → Twilio dials client
         → /voice/start → Greeting played
         → Caller responds (recorded)
         → /voice/recorded
            → STT → LLM → TTS
            → TwiML: hang up (confirm/cancel) OR continue loop
```

---

## Tech Stack

| Layer          | Technology               |
| -------------- | ------------------------ |
| Runtime        | Node.js                  |
| Telephony      | Twilio Voice API         |
| Speech-to-Text | `gpt-4o-mini-transcribe` |
| LLM            | `gpt-4o`                 |
| Text-to-Speech | `gpt-4o-mini-tts`        |
| Database       | Supabase (PostgreSQL)    |
| Local Tunnel   | ngrok                    |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd voice-agent-demo
npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
PORT=3009

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+44xxxxxxxx

OPENAI_API_KEY=your_key

SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

PUBLIC_BASE_URL=https://your-ngrok-url
```

### 3. Run Locally

```bash
node server.js       # Start the server
ngrok http 3009      # In a separate terminal
```

Then update `PUBLIC_BASE_URL` in `.env` to match your ngrok URL.

### 4. Trigger a Call

```bash
POST /call/start
Content-Type: application/json

{ "to": "+44xxxxxxxx" }
```

---

## Intent Handling

The LLM returns structured JSON:

```json
{
  "intent": "confirm",
  "reply": "Thanks. Your appointment is confirmed."
}
```

| Intent       | Behaviour                                 |
| ------------ | ----------------------------------------- |
| `confirm`    | Speak reply → **End call**                |
| `cancel`     | Speak reply → **End call**                |
| `reschedule` | Speak reply → **Continue loop**           |
| `unknown`    | Ask for clarification → **Continue loop** |

---

## Production Decisions

- SDK-based OpenAI integration
- Guarded JSON parsing
- Deterministic lifecycle control
- Explicit Twilio webhook validation
- Hybrid rule + LLM design — no uncontrolled AI-driven hangups

---

## Future Improvements

- [ ] Real-time streaming voice agent using WebSocket
- [ ] Multi Agent Orchastration using langGraph to automate rscheduling and database update
- [ ] Cloud storage for audio files
- [ ] Calendar API integration
- [ ] SMS / email confirmations
- [ ] Call analytics dashboard
- [ ] Multi-language support

---

## License

Demo project for professional assessment purposes. Built by **Izuchukwu Nduwuba**.
