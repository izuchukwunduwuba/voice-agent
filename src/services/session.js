import supabase from "./supabase.js";

export async function confirmCallSession({ callSid, from, to }) {
  const { data: existing, error: readError } = await supabase
    .from("call_sessions")
    .select("*")
    .eq("call_sid", callSid)
    .maybeSingle();

  if (readError) throw readError;

  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("call_sessions")
    .insert({
      call_sid: callSid,
      from_number: from,
      to_number: to,
      status: "active",
    })
    .select("*")
    .single();

  if (insertError) throw insertError;

  return created;
}

export async function addMessage(callSid, role, content) {
  const { error } = await supabase.from("call_messages").insert({
    call_sid: callSid,
    role,
    content,
  });

  if (error) throw error;
}

export async function getHistory(callSid, limit = 20) {
  const { data, error } = await supabase
    .from("call_messages")
    .select("role, content, created_at")
    .eq("call_sid", callSid)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((m) => ({ role: m.role, content: m.content }));
}

export async function endSession(callSid, lastIntent = null) {
  const { error } = await supabase
    .from("call_sessions")
    .update({
      status: "ended",
      last_intent: lastIntent,
      updated_at: new Date().toISOString(),
    })
    .eq("call_sid", callSid);

  if (error) throw error;
}

// Temporary: Fetch appointment details linked to a call session.
// In production, appointment data will likely be sourced from the call queue or event stream.

export async function getAppointData({ callSid, limit = 1 }) {
  const { data, error } = await supabase
    .from("appointments")
    .select("client_name, phone,appointment_time, status")
    .eq("call_sid", callSid)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data;
}
