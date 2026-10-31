"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowDown, Bot, CalendarPlus, Check, HeartPulse, PhoneCall, RotateCcw, Send, ShieldCheck, UserRound } from "lucide-react";

type Message = { id: number; role: "assistant" | "user"; text: string; pending?: boolean; bookingHref?: string; emergency?: boolean };
type AssessmentResponse = { assessment: string; urgency_rating?: number | null; emergency_recommended?: boolean; sources?: { filename: string; department: string; distance: number }[] };
type Step = { key: string; question: string };

function buildAdaptiveSteps(concern: string): Step[] {
  const specific = /eye|vision|sight|blurry|blurred/i.test(concern)
    ? { key: "specific_details", question: "Is this affecting one eye or both, and have you noticed any change in your vision?" }
    : /rash|skin|itch|spot|mole|acne/i.test(concern)
      ? { key: "specific_details", question: "Where on your body is it, and what does the affected area look or feel like?" }
      : /joint|bone|back|muscle|knee|shoulder|ankle|wrist|fracture/i.test(concern)
        ? { key: "specific_details", question: "Where exactly is the discomfort, and did an injury happen before it began?" }
        : /stomach|abdominal|nausea|vomit|bowel|diarrh|constipat/i.test(concern)
          ? { key: "specific_details", question: "Where do you feel it, and have you noticed any changes in eating or digestion?" }
          : { key: "specific_details", question: "Where do you feel the symptom, and what does it feel like?" };
  const remaining = steps.filter((step) =>
    !(step.key === "duration_and_change" && /today|yesterday|last night|\d+\s*(hour|day|week|month)/i.test(concern)) &&
    !(step.key === "severity_and_impact" && /\b(mild|moderate|severe|getting worse)\b/i.test(concern))
  );
  return [specific, ...remaining];
}

const steps: Step[] = [
  { key: "duration_and_change", question: "When did it start, and has it been getting better, worse, or staying about the same?" },
  { key: "severity_and_impact", question: "How severe or uncomfortable is it, and how is it affecting your usual activities?" },
  { key: "other_symptoms", question: "Have you noticed anything else along with it? Please mention any other symptoms." },
  { key: "what_tried", question: "Have you tried anything so far, and did it help? You can also say ‘not applicable’." },
];
const quickReplies: Record<string, string[]> = {
  duration_and_change: ["Today", "A few days ago", "More than a week ago", "Getting worse", "Staying about the same"],
  severity_and_impact: ["Mild", "Moderate", "Severe", "Affecting daily activities"],
  other_symptoms: ["No other symptoms", "Yes, I have other symptoms"],
  what_tried: ["Nothing yet", "Yes, and it helped", "Yes, but it didn’t help", "Not applicable"],
};
const welcomeMessage = "I can help organize what you’re experiencing and suggest what kind of care to consider. What symptom or health concern would you like to discuss? Please don’t include your name or other identifying details.";
const emergencyPattern = /chest pain|chest pressure|difficulty breathing|trouble breathing|can't breathe|cannot breathe|severe shortness of breath|unconscious|passed out|fainting|severe bleeding|won't stop bleeding|stroke|face droop|one.side weakness|sudden confusion|seizure|overdose|suicid(e|al)/i;
const urgentReply = "Your message may describe a medical emergency. Please contact your local emergency number or go to the nearest emergency department now. Don’t wait for this chat to assess it. If possible, ask someone nearby to help.";

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "assistant", text: welcomeMessage }]);
  const [input, setInput] = useState("");
  const [messageId, setMessageId] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(-1);
  const [activeSteps, setActiveSteps] = useState<Step[]>(steps);
  const [isSending, setIsSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentStepKey = stepIndex >= 0 && !complete ? activeSteps[stepIndex]?.key : undefined;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  function appendPair(userText: string, assistantText: string, emergency = false) {
    setMessages((current) => [...current,
      { id: messageId, role: "user", text: userText },
      { id: messageId + 1, role: "assistant", text: assistantText, emergency },
    ]);
    setMessageId((current) => current + 2);
  }

  async function finishAssessment(finalAnswers: Record<string, string>, userText: string) {
    const pendingId = messageId + 1;
    setMessages((current) => [...current,
      { id: messageId, role: "user", text: userText },
      { id: pendingId, role: "assistant", text: "", pending: true },
    ]);
    setMessageId((current) => current + 2);
    setIsSending(true);
    setComplete(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/assess`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "The assessment request failed.");
      }
      const data: AssessmentResponse = await response.json();
      const emergencyRecommended = Boolean(data.emergency_recommended || (data.urgency_rating ?? 0) >= 4 || emergencyPattern.test(Object.values(finalAnswers).join(" ")));
      const assessment = data.assessment || "I couldn’t prepare a summary. Please contact a healthcare professional for advice.";
      const departmentSection = assessment.split(/RECOMMENDED DEPARTMENT/i)[1]?.split(/\n\s*(?:3\.|URGENCY RATING)/i)[0] ?? "";
      const specialty = ["Cardiology", "Dermatology", "Ophthalmology", "Orthopaedics"].find((department) => new RegExp(department, "i").test(departmentSection)) ?? "General Medicine";
      const notes = Object.entries(finalAnswers).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`).join("; ").slice(0, 500);
      try { window.sessionStorage.setItem("aayu_appointment_notes", notes); } catch { /* Continue to booking without the draft if storage is unavailable. */ }
      const bookingParams = new URLSearchParams({ specialty: emergencyRecommended ? "Emergency" : specialty });
      const bookingHref = `/appointments?${bookingParams.toString()}`;
      const sourceList = data.sources?.length
        ? `\n\nInformation sources: ${Array.from(new Set(data.sources.map((source) => source.filename))).join(", ")}`
        : "";
      setMessages((current) => current.map((message) => message.id === pendingId
        ? { ...message, text: `${data.assessment || "I couldn’t prepare a summary. Please contact a healthcare professional for advice."}${sourceList}\n\nThis is not a diagnosis. The 1–5 rating is only a preliminary urgency estimate, not a validated measure of disease severity.${emergencyPattern.test(Object.values(finalAnswers).join(" ")) ? `\n\n${urgentReply}` : ""}`, pending: false }
        : message));
      setMessages((current) => current.map((message) => message.id === pendingId ? { ...message, ...(emergencyRecommended ? { emergency: true } : {}), bookingHref } : message));
    } catch (error) {
      console.error("Aayu Hub assessment error:", error);
      setMessages((current) => current.map((message) => message.id === pendingId
        ? { ...message, text: "I couldn’t prepare the summary because the assessment service is unavailable. Please try again later or contact a healthcare professional.", pending: false }
        : message));
      setComplete(false);
    } finally {
      setIsSending(false);
    }
  }

  function askQuestion(rawText: string) {
    const text = rawText.trim();
    if (!text || isSending || complete) return;
    setInput("");

    if (emergencyPattern.test(text)) {
      appendPair(text, urgentReply, true);
      try { window.sessionStorage.setItem("aayu_appointment_notes", `Main concern: ${text}`); } catch { /* Continue to the appointment page without prefilled notes. */ }
      setMessages((current) => current.map((message) => message.id === messageId + 1 ? { ...message, bookingHref: "/appointments?specialty=Emergency" } : message));
      setComplete(true);
      return;
    }

    if (stepIndex === -1) {
      const nextAnswers = { main_concern: text };
      const nextSteps = buildAdaptiveSteps(text);
      setAnswers(nextAnswers);
      setActiveSteps(nextSteps);
      setStepIndex(0);
      appendPair(text, nextSteps[0].question);
      return;
    }

    const currentStep = activeSteps[stepIndex];
    const nextAnswers = { ...answers, [currentStep.key]: text };
    setAnswers(nextAnswers);
    const otherSymptomsMentioned = currentStep.key === "other_symptoms" && !/\b(no|none|not really)\b/i.test(text) && /\b(yes|yeah|yep|i do|i have|other symptoms)\b/i.test(text);
    const nextSteps = otherSymptomsMentioned
      ? [...activeSteps.slice(0, stepIndex + 1), { key: "other_symptoms_detail", question: "Please tell me what other symptoms you’re noticing." }, ...activeSteps.slice(stepIndex + 1)]
      : activeSteps;
    if (otherSymptomsMentioned) setActiveSteps(nextSteps);
    if (stepIndex + 1 < nextSteps.length) {
      setStepIndex(stepIndex + 1);
      appendPair(text, nextSteps[stepIndex + 1].question);
    } else {
      void finishAssessment(nextAnswers, text);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); askQuestion(input); }

  function resetChat() {
    if (isSending) return;
    setMessages([{ id: messageId, role: "assistant", text: welcomeMessage }]);
    setMessageId((current) => current + 1);
    setInput(""); setAnswers({}); setStepIndex(-1); setActiveSteps(steps); setComplete(false);
    inputRef.current?.focus();
  }

  return (
    <section className="mx-auto grid max-w-4xl overflow-hidden rounded-[30px] border border-[#e0e8dd] bg-white shadow-[0_30px_90px_rgba(39,72,56,.12)] lg:grid-cols-1" aria-label="Aayu Hub symptom check-in">
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-[#edf0e9] bg-[#f4f8f2] px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center gap-3.5"><span className="relative grid size-12 place-items-center rounded-[18px] bg-[#eaf3e9] text-[#39765f]"><Bot size={23} /><span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#65a47a]" /></span><div><h2 className="font-semibold tracking-[-.02em] text-[#263e32]">Aayu symptom guide</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-[#77847a]"><span className="size-1.5 rounded-full bg-[#65a47a]" /> One question at a time</p></div></div>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#66766a] transition hover:bg-[#f4f7f1] focus:outline-none focus:ring-2 focus:ring-[#39806d] disabled:opacity-50" onClick={resetChat} type="button" aria-label="Start a new check-in" disabled={isSending}><RotateCcw size={15} /><span className="hidden sm:inline">Start over</span></button>
        </header>

        {stepIndex >= 0 && !complete && <div className="border-b border-[#edf0e9] px-5 py-3 sm:px-8"><div className="flex items-center justify-between text-xs text-[#738472]"><span>Question {stepIndex + 1} of {activeSteps.length}</span><span>{Math.round(((stepIndex + 1) / activeSteps.length) * 100)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf1e9]"><div className="h-full rounded-full bg-[#6e9b76] transition-all" style={{ width: `${((stepIndex + 1) / activeSteps.length) * 100}%` }} /></div></div>}

        <div className="min-h-[400px] flex-1 space-y-7 overflow-y-auto bg-[#fafbf8] px-4 py-6 sm:min-h-[470px] sm:px-8 sm:py-8" aria-live="polite" aria-relevant="additions text">
          <div className="mx-auto flex max-w-xl items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[.13em] text-[#9aa59a]"><span className="h-px flex-1 bg-[#e7ece4]" /> Aayu guided check-in <span className="h-px flex-1 bg-[#e7ece4]" /></div>
          {messages.length === 1 && !complete && <div className="mx-auto max-w-2xl rounded-[24px] border border-[#e4ebe1] bg-white p-5 shadow-[0_8px_28px_rgba(39,72,56,.05)] sm:p-7"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.1em] text-[#5d8668]"><HeartPulse size={15} /> Your health check-in</div><h3 className="mt-3 text-xl font-semibold tracking-[-.02em] text-[#2c433a] sm:text-2xl">Let’s start with what’s bothering you.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#718077]">Share your main symptom in your own words. I’ll ask a few relevant questions, then summarize what you shared and where you could seek care.</p><div className="mt-5 grid gap-2 sm:grid-cols-3"><div className="rounded-2xl bg-[#f5f8f2] p-3"><span className="text-xs font-bold text-[#659072]">01</span><p className="mt-1 text-xs font-medium text-[#52665a]">Describe your symptom</p></div><div className="rounded-2xl bg-[#f5f8f2] p-3"><span className="text-xs font-bold text-[#659072]">02</span><p className="mt-1 text-xs font-medium text-[#52665a]">Answer a few questions</p></div><div className="rounded-2xl bg-[#f5f8f2] p-3"><span className="text-xs font-bold text-[#659072]">03</span><p className="mt-1 text-xs font-medium text-[#52665a]">Review your summary</p></div></div><button className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#eaf3e9] px-4 text-sm font-semibold text-[#39765f] transition hover:bg-[#dfeddf] focus:outline-none focus:ring-2 focus:ring-[#39806d]" type="button" onClick={() => inputRef.current?.focus()}>Start check-in <ArrowDown size={15} /></button></div>}
          {messages.filter((message) => !(messages.length === 1 && message.id === 0)).map((message) => <div className={`mx-auto flex max-w-2xl items-end gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}>
            {message.role === "assistant" && <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-[#e3ebe0] bg-white text-[#56836b] shadow-sm" aria-hidden="true"><Bot size={17} /></span>}
            <div className={`flex max-w-[88%] flex-col ${message.role === "user" ? "items-end" : "items-start"}`}><span className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-[#89958a]">{message.role === "user" ? "YOU" : "AAYU ASSISTANT"}</span>
              {message.pending ? <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-[#e4ebe2] bg-white px-4 py-3.5 text-sm text-[#65766a]" role="status"><span className="flex gap-1"><i className="size-1.5 animate-bounce rounded-full bg-[#78a384]" /><i className="size-1.5 animate-bounce rounded-full bg-[#78a384] [animation-delay:.1s]" /><i className="size-1.5 animate-bounce rounded-full bg-[#78a384] [animation-delay:.2s]" /></span>Preparing your summary…</div> : <p className={`whitespace-pre-wrap rounded-2xl px-4 py-3.5 text-[15px] leading-7 sm:px-5 ${message.role === "user" ? "rounded-br-md bg-[#286d5c] text-white" : "rounded-bl-md border border-[#e4ebe2] bg-white text-[#41574a] shadow-sm"}`}>{message.text}</p>}
              {message.role === "assistant" && !message.pending && <span className="mt-2 inline-flex items-center gap-1.5 px-1 text-[11px] text-[#8b988d]"><Check size={12} className="text-[#57916d]" /> Aayu Hub guide</span>}
              {message.emergency && <div className="mt-3 max-w-lg rounded-2xl border border-[#efc6bd] bg-[#fff5f2] p-4 text-sm leading-6 text-[#713b32]" role="alert"><p className="flex items-center gap-2 font-semibold"><AlertTriangle size={17} /> Emergency care recommended</p><p className="mt-2">Call <strong>112 in India</strong> or your local emergency number and ask for an ambulance. Don’t drive yourself or wait for a routine appointment. Stay with someone if possible, share your location and symptoms with the dispatcher, and follow their instructions.</p><a className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#a53f32] px-4 font-semibold text-white hover:bg-[#87372c] focus:outline-none focus:ring-2 focus:ring-[#a53f32] focus:ring-offset-2" href="tel:112"><PhoneCall size={16} /> Call 112</a></div>}
              {message.bookingHref && <div className="mt-3"><a href={message.bookingHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#286d5c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2"><CalendarPlus size={17} /> {message.emergency ? "Request emergency department appointment" : "Book an appointment"}</a>{message.emergency && <p className="mt-2 max-w-lg text-xs leading-5 text-[#8d5c52]">This request does not dispatch an ambulance. Call emergency services first and don’t wait for the hospital to confirm.</p>}</div>}
            </div>
            {message.role === "user" && <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#edf0e9] text-[#69796d]" aria-hidden="true"><UserRound size={16} /></span>}
          </div>)}<div ref={bottomRef} />
        </div>

        <div className="border-t border-[#edf0e9] bg-white px-4 py-4 sm:px-7 sm:py-5">
          {!complete && !isSending && <div className="mx-auto mb-4 max-w-2xl" aria-label="Quick answers">
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#718171]"><ArrowDown size={13} />{stepIndex === -1 ? "To get started" : "Quick answers"}<span className="font-normal text-[#929c91]">· or type your own below</span></p>
            <div className="flex flex-wrap gap-2">{(currentStepKey ? quickReplies[currentStepKey] ?? [] : ["Describe my symptom"]).map((reply) => <button key={reply} type="button" onClick={() => currentStepKey ? askQuestion(reply) : inputRef.current?.focus()} className="min-h-10 rounded-xl border border-[#dce8dc] bg-[#f9fbf7] px-3.5 py-2 text-sm font-medium text-[#42664f] transition hover:border-[#8db49a] hover:bg-[#eef6ee] focus:outline-none focus:ring-2 focus:ring-[#39806d] disabled:opacity-50" disabled={isSending}>{reply}</button>)}</div>
          </div>}
          <form className="mx-auto flex max-w-2xl items-center gap-2 rounded-[18px] border border-[#dce5dc] bg-[#fcfdfa] p-1.5 pl-4 transition focus-within:border-[#8bb49a] focus-within:ring-4 focus-within:ring-[#39806d]/10 sm:pl-5" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="chat-question">Describe your symptom or answer the question</label><input ref={inputRef} className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[15px] text-[#263b33] outline-none placeholder:text-[#9aa49b]" id="chat-question" maxLength={500} onChange={(event) => setInput(event.target.value)} placeholder={complete ? "Start over to begin another check-in" : "Type your answer…"} value={input} disabled={isSending || complete} />
          <button className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-[#286d5c] px-4 text-white transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#aabdb0]" disabled={!input.trim() || isSending || complete} type="submit" aria-label="Send answer"><span className="hidden text-sm font-semibold sm:inline">Send</span><Send size={17} /></button></form>
          <p className="mx-auto mt-2.5 flex max-w-2xl items-center justify-center gap-1.5 text-center text-[11px] leading-5 text-[#89958b]"><ShieldCheck size={13} className="shrink-0" /> Don’t share identifying details. This check-in does not diagnose.</p></div>
      </div>
      <aside className="border-t border-[#edf0e9] bg-[#f7f9f4] px-5 py-5 lg:border-l lg:border-t-0 lg:px-5 lg:py-7"><div className="flex items-start gap-3 lg:block"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#67906e] shadow-sm lg:mb-5"><HeartPulse size={19} /></span><div><p className="text-sm font-semibold text-[#354d3d]">What to expect</p><p className="mt-1 text-xs leading-5 text-[#7e897c]">I’ll ask a few short questions, then summarize possible next steps and an indicative urgency rating.</p></div></div><div className="mt-5 rounded-2xl border border-[#e5ebe0] bg-white/75 p-4"><p className="text-xs font-semibold text-[#536b57]">Need urgent help?</p><p className="mt-1.5 text-xs leading-5 text-[#7f8b7e]">For severe chest pain, trouble breathing, sudden weakness, unconsciousness, or other immediate danger, contact local emergency services now.</p></div></aside>
    </section>
  );
}
