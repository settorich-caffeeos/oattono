"use client";

import { useCallback, useEffect, useState } from "react";

export type AiConfig = {
  apiKey: string;
  model: string;
};

export const MODEL_OPTIONS = [
  { id: "", label: "ค่าเริ่มต้น (claude-opus-4-8)" },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8 — เก่งสุด" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5 — สมดุล/เร็ว" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 — ประหยัด" },
];

const KEY = "dtcopilot.config.v1";
const EVENT = "dtcopilot:config";

const EMPTY: AiConfig = { apiKey: "", model: "" };

export function getConfig(): AiConfig {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as AiConfig) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function setConfig(cfg: AiConfig) {
  window.localStorage.setItem(KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event(EVENT));
}

/** Headers to attach to AI requests based on the browser-stored config. */
export function configHeaders(): Record<string, string> {
  const cfg = getConfig();
  const h: Record<string, string> = {};
  if (cfg.apiKey.trim()) h["x-anthropic-key"] = cfg.apiKey.trim();
  if (cfg.model.trim()) h["x-anthropic-model"] = cfg.model.trim();
  return h;
}

export function useConfig() {
  const [config, setState] = useState<AiConfig>(EMPTY);

  useEffect(() => {
    const sync = () => setState(getConfig());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<AiConfig>) => {
    setConfig({ ...getConfig(), ...patch });
  }, []);

  return { config, update };
}
