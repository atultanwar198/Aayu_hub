"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import questionData from "@/data/questions.json";

type QuestionEntry = (typeof questionData)[number];
type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const starterQuestions = questionData.filter((question) => question.id !== "emergency");
const welcomeMessage =
  "Hi, I’m here to help you find information in the Aayu Hub guide. What would you like to know?";

function findAnswer(message: string) {
  const normalizedMessage = message.trim().toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ");
  if (!normalizedMessage) return null;

  const matches = (question: QuestionEntry) =>
    question.keywords.some((keyword) =>
      normalizedMessage.includes(keyword.toLowerCase()),
    );

  const emergencyEntry = questionData.find((question) => question.id === "emergency");
  if (emergencyEntry && matches(emergencyEntry)) return emergencyEntry.answer;

  const matchedEntry = questionData.find(
    (question) => question.id !== "emergency" && matches(question),
  );
  if (matchedEntry) return matchedEntry.answer;

  return "I don’t have a prepared answer for that question yet. I can help with preparing for an appointment, noting symptoms, medicines, the patient portal, or privacy. For personal medical advice, please contact a qualified healthcare professional.";
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "assistant", text: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [messageId, setMessageId] = useState(1);
  const [expandedQuestions, setExpandedQuestions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function askQuestion(question: string) {
    const answer = findAnswer(question);
    if (!answer) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { id: messageId, role: "user", text: question },
      { id: messageId + 1, role: "assistant", text: answer },
    ]);
    setMessageId((currentId) => currentId + 2);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    askQuestion(input);
  }

  function resetChat() {
    setMessages([{ id: messageId, role: "assistant", text: welcomeMessage }]);
    setMessageId((currentId) => currentId + 1);
    setInput("");
    setExpandedQuestions(false);
  }

  return (
    <section
      className="overflow-hidden rounded-[26px] border border-[#dfe8df] bg-white shadow-[0_24px_70px_rgba(47,78,66,.11)]"
      aria-label="Aayu Hub question chatbot"
    >
      <div className="h-1 bg-gradient-to-r from-[#9ac7a8] via-[#3f9278] to-[#e6c18a]" />
      <div className="flex items-center justify-between border-b border-[#e8ede7] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#e7f3e9] to-[#dceee4] text-[#347361] shadow-sm">
            <Bot size={23} />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#5ca67a]" />
          </span>
          <div>
            <h2 className="font-semibold text-[#2c433a]">Aayu Hub assistant</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#738078]">
              <span className="size-1.5 rounded-full bg-[#5ca67a]" />
              Guide ready to help
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e5eae4] px-3 text-sm font-medium text-[#526b5f] transition hover:border-[#c6dccb] hover:bg-[#f5f9f5] hover:text-[#286d5c] focus:outline-none focus:ring-2 focus:ring-[#39806d]"
          onClick={resetChat}
          type="button"
          aria-label="Start a new chat"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>

      <div
        className="max-h-[min(56vh,560px)] min-h-[340px] space-y-6 overflow-y-auto bg-[linear-gradient(180deg,#f8fbf8_0%,#f4f8f4_100%)] px-4 py-6 sm:min-h-[390px] sm:px-7 sm:py-8"
        aria-live="polite"
      >
        {messages.map((message) => (
          <div
            className={`flex items-end gap-2.5 sm:gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
            key={message.id}
          >
            {message.role === "assistant" && (
              <span
                className="grid size-8 shrink-0 place-items-center rounded-xl border border-[#dce9df] bg-white text-[#39806d] shadow-sm sm:size-9"
                aria-hidden="true"
              >
                <Bot size={18} />
              </span>
            )}
            <div
              className={`flex max-w-[88%] flex-col ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <span className="mb-1.5 px-1 text-xs font-semibold text-[#7a8a80]">
                {message.role === "user" ? "You" : "Aayu assistant"}
              </span>
              <p
                className={`whitespace-pre-wrap rounded-2xl px-4 py-3.5 text-[15px] leading-7 shadow-sm sm:px-5 sm:text-base ${
                  message.role === "user"
                    ? "rounded-br-md bg-[#286d5c] text-white"
                    : "rounded-bl-md border border-[#e3eae3] bg-white text-[#40564c]"
                }`}
              >
                {message.text}
              </p>
              {message.role === "assistant" && (
                <span className="mt-2 inline-flex items-center gap-1.5 px-1 text-xs text-[#87948c]">
                  <Check size={13} className="text-[#4d8975]" />
                  From the Aayu Hub guide
                </span>
              )}
            </div>
            {message.role === "user" && (
              <span
                className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#e7eee8] text-[#60746a] sm:size-9"
                aria-hidden="true"
              >
                <UserRound size={18} />
              </span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[#e8ede7] bg-white p-4 sm:p-6">
        <div className="mb-4">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#526b5f]">
              <Sparkles size={16} className="text-[#6b9b78]" />
              {messages.length > 1 ? "Keep exploring" : "Try asking"}
            </p>
            <button
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#52806b] transition hover:bg-[#f1f7f2] focus:outline-none focus:ring-2 focus:ring-[#39806d]"
              onClick={() => setExpandedQuestions((expanded) => !expanded)}
              type="button"
              aria-expanded={expandedQuestions}
            >
              {expandedQuestions ? "Fewer" : "More"}
              <ChevronDown
                className={`size-4 transition-transform ${
                  expandedQuestions ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(expandedQuestions
              ? starterQuestions
              : starterQuestions.slice(0, 3)
            ).map((question) => (
              <button
                className="rounded-xl border border-[#dce9df] bg-[#fbfdfb] px-3 py-2 text-left text-sm leading-5 text-[#386a54] transition hover:border-[#9dbdac] hover:bg-[#f2f7f3] focus:outline-none focus:ring-2 focus:ring-[#39806d]"
                key={question.id}
                onClick={() => askQuestion(question.question)}
                type="button"
              >
                {question.question}
              </button>
            ))}
          </div>
        </div>

        <form
          className="flex items-center gap-2 rounded-2xl border border-[#d6dfd8] bg-[#fbfdfb] p-1.5 pl-4 transition focus-within:border-[#78a88e] focus-within:ring-4 focus-within:ring-[#39806d]/10 sm:gap-3 sm:p-2 sm:pl-5"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="chat-question">
            Ask a question
          </label>
          <input
            className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-base text-[#263b33] outline-none placeholder:text-[#89968e]"
            id="chat-question"
            maxLength={500}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Write your question here..."
            value={input}
          />
          <button
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#286d5c] text-white transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#9eb7aa] sm:size-12"
            disabled={!input.trim()}
            type="submit"
            aria-label="Send question"
          >
            <Send size={19} />
          </button>
        </form>
        <p className="mt-2 px-1 text-xs text-[#87948c]">
          Please avoid sharing your name, passwords, or other private details.
        </p>
      </div>
    </section>
  );
}
