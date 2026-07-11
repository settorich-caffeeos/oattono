# DT Copilot — AI Digital Transformation Workspace

AI Workspace สำหรับพนักงานสาย **Digital Transformation, Technology, Innovation, PMO, Strategy, Business Analyst และ Enterprise Architecture** ที่ช่วยลดเวลาทำงานเอกสารจาก **2–5 วัน เหลือ 15–30 นาที**

AI จะช่วยคิด วิเคราะห์ สร้างเอกสาร และเตรียมการนำเสนอ โดยอ้างอิงมาตรฐานและแนวปฏิบัติขององค์กร

> เว็บแอปนี้เป็น **MVP ที่ใช้งานได้จริง** ครอบคลุม Phase 1–2 ของ Roadmap และวางโครงสร้างไว้รองรับ Phase 3–4

---

## ฟีเจอร์หลัก

- **AI Chat กับผู้เชี่ยวชาญ 11 คน** — Executive Writer, Business Analyst, Enterprise Architect, Financial Analyst, Risk Consultant, PMO Coach ฯลฯ หรือให้ **Orchestrator** เลือกให้อัตโนมัติ (แต่ละคนมี system prompt เฉพาะทาง)
- **14 Core Modules** — ตัวสร้างเอกสารด้วย AI แบบ streaming เรียลไทม์:
  - AI Project Assistant, Problem Analyzer, Solution Designer
  - Business Case Generator, **ROI Calculator** (คำนวณจริง + บทวิเคราะห์ AI)
  - Executive Proposal Builder, Presentation Builder, Research Assistant
  - Meeting Assistant, Training Generator, Requirement Generator (BRD/FRD/NFR/TOR/RFP/SOW)
  - Risk Analyzer, Roadmap Generator, AI Diagram (Mermaid)
- **จัดการโครงการ** — บันทึกเอกสารเข้าโครงการ, ดู, ลบ (เก็บใน localStorage ของเบราว์เซอร์)
- **คัดลอก / ดาวน์โหลด .md** เอกสารที่สร้าง
- **โหมดสาธิต** — ใช้งานได้ครบทุกฟีเจอร์แม้ยังไม่มี API key

---

## Tech Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | Next.js API Routes (streaming) |
| AI | Claude `claude-opus-4-8` ผ่าน Anthropic SDK (มี demo fallback) |
| Persistence | localStorage (MVP) — พร้อมเปลี่ยนเป็น PostgreSQL/Supabase ในภายหลัง |

> โครงสร้างนี้รวม Frontend + Backend ไว้ในแอปเดียวเพื่อให้ deploy ง่าย ตาม Roadmap เดิมที่ระบุ FastAPI + PostgreSQL สามารถแยก service ภายหลังได้เมื่อขึ้น Phase 3 (RAG, Approval Flow)

---

## เริ่มต้นใช้งาน

```bash
# 1) ติดตั้ง dependency
npm install

# 2) (ไม่บังคับ) ตั้งค่า API key เพื่อเปิดใช้งาน Claude เต็มรูปแบบ
cp .env.example .env.local
# แล้วใส่ค่า ANTHROPIC_API_KEY=sk-ant-...

# 3) รันโหมดพัฒนา
npm run dev
# เปิด http://localhost:3000

# หรือ build สำหรับ production
npm run build && npm start
```

ถ้าไม่ตั้งค่า `ANTHROPIC_API_KEY` แอปจะรันใน **โหมดสาธิต** โดยแสดงเนื้อหาตัวอย่างที่มีโครงสร้างครบ

---

## โครงสร้างโปรเจกต์

```
app/
  page.tsx              แดชบอร์ด
  chat/                 AI Chat + เลือก Agent
  modules/              รวมโมดูล + หน้า generator ต่อโมดูล
  roi/                  ROI Calculator
  projects/             จัดการโครงการ + เอกสาร
  api/chat/             streaming endpoint สำหรับแชท
  api/generate/         streaming endpoint สำหรับสร้างเอกสาร
lib/
  agents.ts             นิยาม AI Agents 11 คน (system prompts)
  modules.ts            นิยาม 14 โมดูล (fields, outline, prompt)
  ai.ts                 ชั้นเชื่อม Claude + demo fallback
  store.ts              จัดเก็บโครงการใน localStorage
components/             Sidebar, MarkdownView, GeneratorClient, DocActions ฯลฯ
```

---

## Roadmap — ทำแล้ว / ที่ควรทำต่อ

**ทำแล้ว (Phase 1–2)**
- ✅ AI Chat, Executive Summary/Proposal, Meeting Summary, Presentation Outline
- ✅ Business Case, ROI Calculator, Roadmap, Diagram Generator
- ✅ Multi-Agent (11 ผู้เชี่ยวชาญ + Orchestrator)

**แนะนำให้เพิ่มต่อ**
- **Auth & สิทธิ์การเข้าถึงองค์กร** (SSO / Azure AD) — ก่อนใช้งานจริงในองค์กร
- **ฐานข้อมูลจริง** (PostgreSQL / Supabase) แทน localStorage + เก็บประวัติ/เวอร์ชัน
- **RAG กับเอกสารองค์กร** (pgvector) — Company Policy, Templates, Past Projects (Phase 3)
- **Export DOCX / PPTX / PDF** จริง (ปัจจุบัน export Markdown)
- **Approval Flow & Version Control** (Phase 3)
- **Microsoft 365 / Teams / Outlook / SharePoint Integration** (Phase 4)
- เชื่อม **Web Search** ให้ Research Assistant ดึงข้อมูลสด และ **render Mermaid** ในหน้าเว็บ
