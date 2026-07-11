"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS, getAgent } from "@/lib/agents";
import { streamPost } from "@/lib/client";
import MarkdownView from "@/components/MarkdownView";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [agentId, setAgentId] = useState("orchestrator");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const agent = getAgent(agentId);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      await streamPost("/api/chat", { messages: next, agentId }, (chunk) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      });
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠️ ${e instanceof Error ? e.message : String(e)}`,
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-4rem)]">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          เลือกผู้เชี่ยวชาญที่ต้องการคุยด้วย หรือให้ Orchestrator เลือกให้อัตโนมัติ
        </p>
      </header>

      {/* Agent picker */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {AGENTS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAgentId(a.id)}
            title={a.tagline}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
              a.id === agentId
                ? "border-brand-500 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <span>{a.emoji}</span>
            <span className="whitespace-nowrap">{a.nameTh}</span>
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
            <span className="mb-3 text-5xl">{agent.emoji}</span>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
              {agent.nameTh}
            </p>
            <p className="mt-1 max-w-md text-sm">{agent.tagline}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {m.role === "assistant" ? (
                    m.content ? (
                      <MarkdownView content={m.content} />
                    ) : (
                      <span className="text-slate-400">กำลังคิด…</span>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="mt-4 flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`ถาม ${agent.nameTh}…  (Enter เพื่อส่ง, Shift+Enter ขึ้นบรรทัดใหม่)`}
          className="max-h-40 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-900/40"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          ส่ง
        </button>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="rounded-2xl border border-slate-200 px-3 py-3 text-sm text-slate-500 dark:border-slate-700"
            title="ล้างบทสนทนา"
          >
            ล้าง
          </button>
        )}
      </div>
    </div>
  );
}
