"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, BrainCircuit, RotateCcw, Zap } from "lucide-react";

interface Message { role: "user" | "model"; text: string; loading?: boolean; }
interface Props { onClose: () => void; quoteRef?: string; }

const WELCOME = "Hello! I'm KuFull AI. Tell me about your camp — how many guests, what type of camp, location, and how many days. I'll help you build a complete equipment manifest.";

export default function AIChatPanel({ onClose, quoteRef }: Props) {
  const [messages, setMessages] = useState<Message[]>([{ role: "model", text: WELCOME }]);
  const [input, setInput]       = useState("");
  const [engine, setEngine]     = useState<"Gemini" | "Groq">("Gemini");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }, { role: "model", text: "", loading: true }]);
    setThinking(true);

    try {
      // Simple keyword extraction for camp planning
      const reply = simulateAIReply(text, messages);
      await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
      setMessages(prev => prev.slice(0,-1).concat({ role: "model", text: reply }));
    } catch {
      setMessages(prev => prev.slice(0,-1).concat({ role: "model", text: "Sorry, I couldn't process that. Please try again." }));
    } finally {
      setThinking(false);
    }
  }

  function simulateAIReply(text: string, history: Message[]): string {
    const t = text.toLowerCase();
    if (t.includes("guest") || t.includes("pax") || /\d+\s*(people|person|guests?)/.test(t)) {
      return "Got it! To build your manifest, I also need:\n• Tent types (VIP, Standard, or Staff)\n• Location\n• Number of days\n• Camp type (Safari, Corporate, Wedding, etc.)\n\nCan you share those details?";
    }
    if (t.includes("vip") || t.includes("standard") || t.includes("staff") || t.includes("tent")) {
      return "Perfect — tents noted. Now, what's your camp location and how many days will the camp run?";
    }
    if (t.includes("mara") || t.includes("amboseli") || t.includes("serengeti") || t.includes("laikipia")) {
      return "Great location! Once you fill in all the details in the **New Quote** wizard, our calculator will generate a complete equipment manifest including tents, bedding, catering, washrooms, power, and safety items.\n\n→ Click **New Quote** on the dashboard to get started!";
    }
    if (t.includes("help") || t.includes("how") || t.includes("what")) {
      return "KuFull CHARGE helps safari operators:\n\n• **Generate** complete equipment manifests\n• **Track** inventory vs. what's needed\n• **Price** quotes with margin calculator\n• **Export** manifests and to-buy lists as PDF\n\nStart by clicking **New Quote** and filling in the 7-step wizard!";
    }
    return "I can help you plan your safari camp equipment. Share details like the number of guests, tent types (VIP/Standard/Staff), location, and number of days — or head to **New Quote** to use the full wizard with real-time manifest generation.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md h-[580px] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,21,16,0.97)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5"
          style={{ background: "rgba(200,146,42,0.1)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C8922A, #A07320)" }}>
            <BrainCircuit size={18} color="white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: "#F2D080" }}>KuFull AI</p>
            <p className="text-xs" style={{ color: "rgba(200,146,42,0.7)" }}>Camp Planning Assistant</p>
          </div>
          {/* Engine selector */}
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
            {(["Gemini","Groq"] as const).map(e => (
              <button key={e} onClick={() => setEngine(e)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                style={{
                  background: engine === e ? "rgba(200,146,42,0.3)" : "transparent",
                  color: engine === e ? "#F2D080" : "rgba(255,255,255,0.4)",
                }}>{e}</button>
            ))}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseOver={e=>(e.currentTarget.style.color="white")}
            onMouseOut={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}>
            <X size={16}/>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "model" && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                  style={{ background: "rgba(200,146,42,0.2)" }}>
                  <Zap size={12} color="#C8922A" />
                </div>
              )}
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: m.role === "user"
                    ? "rgba(200,146,42,0.2)"
                    : "rgba(255,255,255,0.07)",
                  border: `1px solid ${m.role === "user" ? "rgba(200,146,42,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: m.role === "user" ? "#F2D080" : "rgba(255,255,255,0.9)",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}>
                {m.loading ? (
                  <div className="flex items-center gap-2" style={{ color: "rgba(200,146,42,0.7)" }}>
                    <div className="spinner" style={{ width:14, height:14 }} /> Thinking…
                  </div>
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#F2D080">$1</strong>') }} />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <input className="glass-input flex-1 text-sm py-2.5"
            placeholder="Ask about camp planning…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            disabled={thinking}
          />
          <button onClick={send} disabled={thinking || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: input.trim() ? "#C8922A" : "rgba(255,255,255,0.08)",
              color: input.trim() ? "white" : "rgba(255,255,255,0.3)",
            }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
