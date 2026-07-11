"use client";

import { useEffect, useState } from "react";
import { useConfig, MODEL_OPTIONS } from "@/lib/config";

type TestState =
  | { status: "idle" }
  | { status: "testing" }
  | { status: "ok"; model: string }
  | { status: "fail"; message: string };

export default function SettingsPage() {
  const { config, update } = useConfig();
  const [keyInput, setKeyInput] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState<TestState>({ status: "idle" });
  const [serverHasKey, setServerHasKey] = useState(false);

  useEffect(() => {
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then((d) => setServerHasKey(!!d.serverHasKey))
      .catch(() => {});
  }, []);

  // keyInput mirrors config until the user edits it
  const value = keyInput ?? config.apiKey;

  function save() {
    update({ apiKey: (keyInput ?? config.apiKey).trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function runTest() {
    save();
    setTest({ status: "testing" });
    try {
      const res = await fetch("/api/config-test", {
        method: "POST",
        headers: {
          "x-anthropic-key": (keyInput ?? config.apiKey).trim(),
          ...(config.model ? { "x-anthropic-model": config.model } : {}),
        },
      });
      const data = (await res.json()) as {
        ok: boolean;
        model?: string;
        message?: string;
      };
      if (data.ok) setTest({ status: "ok", model: data.model || "" });
      else setTest({ status: "fail", message: data.message || "เชื่อมต่อไม่สำเร็จ" });
    } catch (e) {
      setTest({
        status: "fail",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const configured = !!config.apiKey.trim();

  return (
    <div className="max-w-2xl">
      <header className="mb-6 flex items-start gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl dark:bg-brand-900/30">
          ⚙️
        </span>
        <div>
          <h1 className="text-2xl font-bold">ตั้งค่า</h1>
          <p className="text-slate-500 dark:text-slate-400">
            ใช้คีย์ส่วนตัว (ไม่บังคับ) — ปกติเซิร์ฟเวอร์ตั้งคีย์ให้ทุกคนอยู่แล้ว
          </p>
        </div>
      </header>

      {/* Status */}
      <div
        className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
          serverHasKey || configured
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
            : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
        }`}
      >
        {serverHasKey ? (
          <>
            <span className="font-semibold">เซิร์ฟเวอร์ตั้งค่าคีย์ให้แล้ว:</span>{" "}
            ผู้ใช้ทุกคนใช้ AI ได้เลย <span className="font-semibold">ไม่ต้องกรอกคีย์</span>{" "}
            — ช่องด้านล่างมีไว้เฉพาะกรณีอยากใช้ <span className="font-semibold">คีย์ส่วนตัวของคุณเอง</span> แทน (ไม่บังคับ)
          </>
        ) : configured ? (
          <>
            <span className="font-semibold">เชื่อมต่อแล้ว:</span> ใช้ API key ส่วนตัวที่
            บันทึกไว้ในเบราว์เซอร์นี้ — ฟีเจอร์ AI ทั้งหมดใช้งาน Claude เต็มรูปแบบ
          </>
        ) : (
          <>
            <span className="font-semibold">โหมดสาธิต:</span> ยังไม่มีคีย์
            (ทั้งฝั่งเซิร์ฟเวอร์และเบราว์เซอร์) — ใส่คีย์ด้านล่าง หรือให้ผู้ดูแลตั้ง{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
              ANTHROPIC_API_KEY
            </code>{" "}
            บนเซิร์ฟเวอร์เพื่อเปิดให้ทุกคน
          </>
        )}
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {/* API key */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Anthropic API Key
          </label>
          <div className="flex gap-2">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setTest({ status: "idle" });
              }}
              placeholder="sk-ant-..."
              autoComplete="off"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              onClick={() => setShow((v) => !v)}
              className="rounded-xl border border-slate-200 px-3 text-sm text-slate-500 dark:border-slate-700"
            >
              {show ? "ซ่อน" : "แสดง"}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            รับคีย์ได้ที่ console.anthropic.com — คีย์เก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น
            (localStorage) ส่งไปเซิร์ฟเวอร์เฉพาะตอนเรียกใช้ AI และไม่ถูกบันทึกฝั่งเซิร์ฟเวอร์
          </p>
        </div>

        {/* Model */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            โมเดล
          </label>
          <select
            value={config.model}
            onChange={(e) => update({ model: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          >
            {MODEL_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            บันทึก
          </button>
          <button
            onClick={runTest}
            disabled={test.status === "testing"}
            className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {test.status === "testing" ? "กำลังทดสอบ…" : "ทดสอบการเชื่อมต่อ"}
          </button>
          {config.apiKey && (
            <button
              onClick={() => {
                update({ apiKey: "" });
                setKeyInput("");
                setTest({ status: "idle" });
              }}
              className="text-sm text-slate-400 hover:text-rose-500"
            >
              ล้างคีย์
            </button>
          )}
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              บันทึกแล้ว ✓
            </span>
          )}
        </div>

        {/* Test result */}
        {test.status === "ok" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓ เชื่อมต่อสำเร็จ — โมเดล {test.model}
          </div>
        )}
        {test.status === "fail" && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            ✗ {test.message}
          </div>
        )}
      </div>
    </div>
  );
}
