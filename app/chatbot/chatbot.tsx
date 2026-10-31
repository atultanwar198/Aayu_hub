"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  HeartPulse,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import questionData from "@/data/questions.json";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  pending?: boolean;
};

type ChatApiResponse = {
  question: string;
  answer: string;
  sources: { filename: string; department: string; distance: number }[];
};

const starterQuestions = questionData.filter((question) => question.id !== "emergency");
const welcomeMessage =
  "Hi, I’m your Aayu Hub guide. I can help you find information about care, appointments, and getting support. What would you like to know?";

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", text: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [messageId, setMessageId] = useState(1);
  const [expandedQuestions, setExpandedQuestions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function askQuestion(question: string) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSending) return;

    const userMessageId = messageId;
    const assistantMessageId = messageId + 1;
    setMessages((current) => [
      ...current,
      { id: userMessageId, role: "user", text: trimmedQuestion },
      { id: assistantMessageId, role: "assistant", text: "", pending: true },
    ]);
    setMessageId((current) => current + 2);
    setInput("");
    setIsSending(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "The chatbot API request failed.");
      }

      const data: ChatApiResponse = await response.json();
      const reply =
        data.answer?.trim() ||
        "I couldn’t find an answer just now. Please try asking another way, or contact your care team.";
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? { ...message, text: reply, pending: false }
            : message,
        ),
      );
    } catch (error) {
      console.error("Aayu Hub chatbot error:", error);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                text: "I’m having trouble connecting right now. Please try again in a moment.",
                pending: false,
              }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    askQuestion(input);
  }

  function resetChat() {
    if (isSending) return;
    setMessages([{ id: messageId, role: "assistant", text: welcomeMessage }]);
    setMessageId((current) => current + 1);
    setInput("");
    setExpandedQuestions(false);
    inputRef.current?.focus();
  }

  return (
    <section
      className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-[#e3e9df] bg-white shadow-[0_26px_80px_rgba(39,72,56,.10)] lg:grid-cols-[minmax(0,1fr)_280px]"
      aria-label="Aayu Hub question chatbot"
    >
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-[#edf0e9] px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex items-center gap-3.5">
            <span className="relative grid size-12 place-items-center rounded-[18px] bg-[#eaf3e9] text-[#39765f]">
              <Bot size={23} strokeWidth={1.8} />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#65a47a]" />
            </span>
            <div>
              <h2 className="font-semibold tracking-[-.02em] text-[#263e32]">Aayu assistant</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#77847a]">
                <span className="size-1.5 rounded-full bg-[#65a47a]" /> Here to help you find your way
              </p>
            </div>
          </div>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#66766a] transition hover:bg-[#f4f7f1] hover:text-[#286d5c] focus:outline-none focus:ring-2 focus:ring-[#39806d] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={resetChat}
            type="button"
            aria-label="Start a new chat"
            disabled={isSending}
          >
            <RotateCcw size={15} /> <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        <div
          className="min-h-[360px] flex-1 space-y-7 overflow-y-auto bg-[radial-gradient(ellipse_at_top,#f6faf4_0%,#fbfcf9_58%)] px-4 py-7 sm:min-h-[430px] sm:px-8 sm:py-9"
          aria-live="polite"
          aria-relevant="additions text"
        >
          <div className="mx-auto flex max-w-xl items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[.13em] text-[#9aa59a]">
            <span className="h-px flex-1 bg-[#e7ece4]" /> Aayu Hub guide <span className="h-px flex-1 bg-[#e7ece4]" />
          </div>
          {messages.map((message) => (
            <div
              className={`mx-auto flex max-w-2xl items-end gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              key={message.id}
            >
              {message.role === "assistant" && (
                <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-[#e3ebe0] bg-white text-[#56836b] shadow-[0_2px_8px_rgba(34,63,46,.05)]" aria-hidden="true">
                  <Bot size={17} />
                </span>
              )}
              <div className={`flex max-w-[88%] flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                <span className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-[#89958a]">
                  {message.role === "user" ? "YOU" : "AAYU ASSISTANT"}
                </span>
                {message.pending ? (
                  <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-[#e4ebe2] bg-white px-4 py-3.5 text-sm text-[#65766a] shadow-[0_3px_12px_rgba(34,63,46,.04)]" role="status">
                    <span className="flex gap-1"><i className="size-1.5 animate-bounce rounded-full bg-[#78a384] [animation-delay:-.2s]" /><i className="size-1.5 animate-bounce rounded-full bg-[#78a384] [animation-delay:-.1s]" /><i className="size-1.5 animate-bounce rounded-full bg-[#78a384]" /></span>
                    Looking through the guide…
                  </div>
                ) : (
                  <p className={`whitespace-pre-wrap rounded-2xl px-4 py-3.5 text-[15px] leading-7 sm:px-5 ${message.role === "user" ? "rounded-br-md bg-[#286d5c] text-white shadow-[0_5px_16px_rgba(40,109,92,.16)]" : "rounded-bl-md border border-[#e4ebe2] bg-white text-[#41574a] shadow-[0_3px_12px_rgba(34,63,46,.04)]"}`}>
                    {message.text}
                  </p>
                )}
                {message.role === "assistant" && !message.pending && (
                  <span className="mt-2 inline-flex items-center gap-1.5 px-1 text-[11px] text-[#8b988d]"><Check size={12} className="text-[#57916d]" /> Aayu Hub guide</span>
                )}
              </div>
              {message.role === "user" && (
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#edf0e9] text-[#69796d]" aria-hidden="true"><UserRound size={16} /></span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[#edf0e9] bg-white px-4 py-4 sm:px-7 sm:py-5">
          <form className="mx-auto flex max-w-2xl items-center gap-2 rounded-[18px] border border-[#dce5dc] bg-[#fcfdfa] p-1.5 pl-4 transition focus-within:border-[#8bb49a] focus-within:ring-4 focus-within:ring-[#39806d]/10 sm:pl-5" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="chat-question">Ask a question</label>
            <input
              ref={inputRef}
              className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[15px] text-[#263b33] outline-none placeholder:text-[#9aa49b]"
              id="chat-question"
              maxLength={500}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about care, appointments, or support…"
              value={input}
              disabled={isSending}
            />
            <button className="grid size-11 shrink-0 place-items-center gap-1 rounded-[14px] bg-[#286d5c] text-white transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#aabdb0]" disabled={!input.trim() || isSending} type="submit" aria-label="Send question">
              <Send size={18} />
            </button>
          </form>
          <p className="mx-auto mt-2.5 flex max-w-2xl items-center justify-center gap-1.5 text-center text-[11px] leading-5 text-[#89958b]"><ShieldCheck size={13} className="shrink-0" /> Avoid sharing personal details. For urgent medical help, contact emergency services.</p>
        </div>
      </div>

      <aside className="border-t border-[#edf0e9] bg-[#f7f9f4] px-5 py-5 lg:border-l lg:border-t-0 lg:px-5 lg:py-7">
        <div className="flex items-start gap-3 lg:block">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#67906e] shadow-sm lg:mb-5"><HeartPulse size={19} /></span>
          <div>
            <p className="text-sm font-semibold text-[#354d3d]">A good place to start</p>
            <p className="mt-1 text-xs leading-5 text-[#7e897c]">Choose a question or ask in your own words.</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-2 lg:mt-7">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.08em] text-[#738472]"><Sparkles size={14} className="text-[#86a777]" /> Suggested questions</p>
          <button className="inline-flex items-center gap-1 rounded-lg p-1 text-xs font-medium text-[#64816b] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#39806d] lg:hidden" onClick={() => setExpandedQuestions((expanded) => !expanded)} type="button" aria-expanded={expandedQuestions}>
            {expandedQuestions ? "Less" : "More"}<ChevronDown className={`size-3.5 transition-transform ${expandedQuestions ? "rotate-180" : ""}`} />
          </button>
        </div>
        <div className={`mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 ${expandedQuestions ? "" : "max-sm:hidden"}`}>
          {(expandedQuestions ? starterQuestions : starterQuestions.slice(0, 4)).map((question) => (
            <button className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[#e6ebe1] bg-white px-3.5 py-2.5 text-left text-[13px] leading-5 text-[#4c6250] transition hover:border-[#b8cfb9] hover:bg-[#fbfdf9] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#39806d] disabled:cursor-wait disabled:opacity-60" key={question.id} onClick={() => askQuestion(question.question)} type="button" disabled={isSending}>
              <span>{question.question}</span><span className="text-lg leading-none text-[#9aae96] transition-transform group-hover:translate-x-0.5">›</span>
            </button>
          ))}
        </div>
        <div className="mt-6 hidden rounded-2xl border border-[#e5ebe0] bg-white/75 p-4 lg:block">
          <p className="text-xs font-semibold text-[#536b57]">Need urgent help?</p>
          <p className="mt-1.5 text-xs leading-5 text-[#7f8b7e]">This guide can’t assess emergencies. Please contact local emergency services or your care team.</p>
        </div>
      </aside>
    </section>
  );
}
