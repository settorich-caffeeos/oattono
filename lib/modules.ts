export type Field = {
  name: string;
  label: string;
  labelTh: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

export type ModuleDef = {
  slug: string;
  title: string;
  titleTh: string;
  emoji: string;
  phase: 1 | 2 | 3 | 4;
  agentId: string;
  summary: string;
  /** Section headings the AI (and demo mode) should produce. */
  outline: string[];
  fields: Field[];
  /** Special modules render a dedicated page instead of the generic form. */
  route?: string;
  outputFormat?: "markdown" | "mermaid";
};

export const PHASE_LABEL: Record<number, string> = {
  1: "Phase 1 · MVP",
  2: "Phase 2",
  3: "Phase 3",
  4: "Phase 4",
};

export const MODULES: ModuleDef[] = [
  {
    slug: "project-assistant",
    title: "AI Project Assistant",
    titleTh: "ผู้ช่วยสร้างโครงการ",
    emoji: "🗂️",
    phase: 1,
    agentId: "digital-consultant",
    summary:
      "สร้างโครงร่างโครงการใหม่ เช่น AI Call Center, Open Banking, Digital Lending พร้อมขอบเขต วัตถุประสงค์ และผู้มีส่วนได้ส่วนเสีย",
    outline: [
      "ภาพรวมโครงการ (Project Overview)",
      "วัตถุประสงค์และเป้าหมาย (Objectives & Goals)",
      "ขอบเขต (Scope / Out of Scope)",
      "ผู้มีส่วนได้ส่วนเสีย (Stakeholders)",
      "ผลลัพธ์ที่คาดหวัง (Expected Outcomes)",
      "ขั้นตอนถัดไป (Next Steps)",
    ],
    fields: [
      {
        name: "projectName",
        label: "Project name",
        labelTh: "ชื่อโครงการ",
        type: "text",
        placeholder: "เช่น AI Call Center สำหรับลูกค้ารายย่อย",
        required: true,
      },
      {
        name: "context",
        label: "Background / context",
        labelTh: "ที่มา / บริบทองค์กร",
        type: "textarea",
        placeholder: "อธิบายบริบท ปัญหา หรือโอกาสที่ต้องการแก้ไข",
      },
      {
        name: "audience",
        label: "Target users / audience",
        labelTh: "กลุ่มผู้ใช้เป้าหมาย",
        type: "text",
        placeholder: "เช่น ทีม Call Center, ลูกค้า, ฝ่ายปฏิบัติการ",
      },
    ],
  },
  {
    slug: "problem-analyzer",
    title: "Problem Analyzer",
    titleTh: "วิเคราะห์ปัญหา",
    emoji: "🔬",
    phase: 1,
    agentId: "business-analyst",
    summary:
      "วิเคราะห์ Current State, Pain Point, Root Cause, Future State, Gap Analysis และ Impact",
    outline: [
      "Current State",
      "Pain Points",
      "Root Cause Analysis",
      "Future State (Target)",
      "Gap Analysis",
      "Impact & Priority",
    ],
    fields: [
      {
        name: "problem",
        label: "Problem statement",
        labelTh: "ปัญหาที่พบ",
        type: "textarea",
        placeholder: "อธิบายปัญหา อาการ และสิ่งที่ได้รับผลกระทบ",
        required: true,
      },
      {
        name: "area",
        label: "Business area",
        labelTh: "หน่วยงาน / กระบวนการที่เกี่ยวข้อง",
        type: "text",
        placeholder: "เช่น กระบวนการอนุมัติสินเชื่อ",
      },
    ],
  },
  {
    slug: "solution-designer",
    title: "Solution Designer",
    titleTh: "ออกแบบโซลูชัน",
    emoji: "🧩",
    phase: 1,
    agentId: "enterprise-architect",
    summary:
      "ออกแบบ Solution พร้อม Architecture, Technology Stack, Workflow และ Integration",
    outline: [
      "แนวคิดโซลูชัน (Solution Concept)",
      "สถาปัตยกรรม (Architecture Overview)",
      "Technology Stack",
      "Workflow / Process",
      "Integration Points",
      "ข้อควรพิจารณา (NFR, Security, Scalability)",
    ],
    fields: [
      {
        name: "problem",
        label: "Problem / need",
        labelTh: "โจทย์ / ความต้องการ",
        type: "textarea",
        placeholder: "อธิบายปัญหาหรือความต้องการที่จะออกแบบโซลูชัน",
        required: true,
      },
      {
        name: "constraints",
        label: "Constraints",
        labelTh: "ข้อจำกัด / เงื่อนไข",
        type: "textarea",
        placeholder: "เช่น งบประมาณ, ระบบเดิม, ข้อกำหนดด้าน compliance",
      },
      {
        name: "preference",
        label: "Technology preference",
        labelTh: "เทคโนโลยีที่ต้องการ (ถ้ามี)",
        type: "text",
        placeholder: "เช่น Azure, AWS, Microservices",
      },
    ],
  },
  {
    slug: "business-case",
    title: "Business Case Generator",
    titleTh: "สร้าง Business Case",
    emoji: "📈",
    phase: 2,
    agentId: "financial-analyst",
    summary:
      "สร้าง Business Case: Objectives, Expected Benefits, KPI, Cost, Timeline, Success Metrics",
    outline: [
      "บทสรุปย่อ (Summary)",
      "วัตถุประสงค์ (Objectives)",
      "ประโยชน์ที่คาดว่าจะได้รับ (Expected Benefits)",
      "KPI & Success Metrics",
      "ประมาณการต้นทุน (Cost Estimate)",
      "Timeline",
      "ข้อเสนอแนะ (Recommendation)",
    ],
    fields: [
      {
        name: "initiative",
        label: "Initiative / project",
        labelTh: "ชื่อโครงการ / ริเริ่ม",
        type: "text",
        placeholder: "เช่น ระบบ Digital Onboarding",
        required: true,
      },
      {
        name: "objective",
        label: "Business objective",
        labelTh: "เป้าหมายทางธุรกิจ",
        type: "textarea",
        placeholder: "ต้องการบรรลุผลลัพธ์อะไร",
      },
      {
        name: "budget",
        label: "Rough budget",
        labelTh: "งบประมาณคร่าว ๆ",
        type: "text",
        placeholder: "เช่น 10 ล้านบาท",
      },
    ],
  },
  {
    slug: "roi-calculator",
    title: "ROI Calculator",
    titleTh: "คำนวณ ROI",
    emoji: "🧮",
    phase: 2,
    agentId: "financial-analyst",
    summary:
      "กรอกจำนวนพนักงาน เวลาที่ใช้ และต้นทุน แล้วให้ AI คำนวณ ROI, Payback และ Saving",
    outline: [],
    fields: [],
    route: "/roi",
  },
  {
    slug: "executive-proposal",
    title: "Executive Proposal Builder",
    titleTh: "สร้างข้อเสนอผู้บริหาร",
    emoji: "📄",
    phase: 1,
    agentId: "executive-writer",
    summary:
      "Generate Executive Summary, Background, Objectives, Benefits, Budget, Timeline, Risk, Recommendation",
    outline: [
      "Executive Summary",
      "Background / ที่มา",
      "Objectives",
      "Expected Benefits",
      "Budget (สรุป)",
      "Timeline",
      "Key Risks",
      "Recommendation",
    ],
    fields: [
      {
        name: "topic",
        label: "Proposal topic",
        labelTh: "หัวข้อข้อเสนอ",
        type: "text",
        placeholder: "เช่น การลงทุนแพลตฟอร์ม Data & AI",
        required: true,
      },
      {
        name: "background",
        label: "Background",
        labelTh: "ที่มา / บริบท",
        type: "textarea",
        placeholder: "อธิบายบริบทและเหตุผลของข้อเสนอ",
      },
      {
        name: "audience",
        label: "Audience / decision maker",
        labelTh: "กลุ่มผู้อ่าน / ผู้ตัดสินใจ",
        type: "select",
        options: ["Board", "CEO / EXCOM", "SVP / VP", "Steering Committee"],
      },
    ],
  },
  {
    slug: "presentation-builder",
    title: "Presentation Builder",
    titleTh: "สร้างสไลด์นำเสนอ",
    emoji: "🎤",
    phase: 1,
    agentId: "presentation-expert",
    summary:
      "AI ออกแบบสไลด์สวย ๆ พร้อมพรีวิว, กราฟ, speaker notes และ export PowerPoint / PDF",
    outline: [],
    fields: [],
    route: "/present",
  },
  {
    slug: "research-assistant",
    title: "Research Assistant",
    titleTh: "ผู้ช่วยวิจัย",
    emoji: "🔎",
    phase: 1,
    agentId: "research-specialist",
    summary:
      "ค้นคว้าและสรุปข้อมูลด้าน AI, Cloud, Microsoft, AWS, Google, Banking Trend เป็นเวอร์ชันผู้บริหาร",
    outline: [
      "บทสรุปผู้บริหาร (Executive Summary)",
      "ประเด็นสำคัญ (Key Findings)",
      "การเปรียบเทียบ (Comparison / Options)",
      "ข้อควรพิจารณาสำหรับองค์กร",
      "ข้อเสนอแนะ (Recommendation)",
    ],
    fields: [
      {
        name: "topic",
        label: "Research topic",
        labelTh: "หัวข้อที่ต้องการค้นคว้า",
        type: "textarea",
        placeholder: "เช่น เปรียบเทียบบริการ Generative AI ของ Azure, AWS, Google",
        required: true,
      },
      {
        name: "focus",
        label: "Focus / angle",
        labelTh: "มุมมองที่ต้องการเน้น",
        type: "text",
        placeholder: "เช่น ความปลอดภัย, ต้นทุน, การใช้งานในธนาคาร",
      },
    ],
  },
  {
    slug: "meeting-assistant",
    title: "Meeting Assistant",
    titleTh: "ผู้ช่วยสรุปประชุม",
    emoji: "📝",
    phase: 1,
    agentId: "pmo-coach",
    summary: "วาง Transcript แล้วให้ AI สรุป Decision, Action, Owner และ Due Date",
    outline: [
      "สรุปการประชุม (Summary)",
      "การตัดสินใจ (Decisions)",
      "รายการงานที่ต้องทำ (Action Items — Owner / Due Date)",
      "ประเด็นค้าง / ติดตาม (Open Issues)",
    ],
    fields: [
      {
        name: "transcript",
        label: "Transcript / notes",
        labelTh: "Transcript หรือโน้ตการประชุม",
        type: "textarea",
        placeholder: "วางเนื้อหาการประชุมที่นี่...",
        required: true,
      },
      {
        name: "meetingTitle",
        label: "Meeting title",
        labelTh: "ชื่อการประชุม",
        type: "text",
        placeholder: "เช่น ประชุมติดตามโครงการ Digital Lending",
      },
    ],
  },
  {
    slug: "training-generator",
    title: "Training Generator",
    titleTh: "สร้างหลักสูตรอบรม",
    emoji: "🎓",
    phase: 3,
    agentId: "digital-consultant",
    summary: "สร้าง Training, Workshop, Quiz, Exercise และ Case Study",
    outline: [
      "ภาพรวมหลักสูตร (Overview & Learning Objectives)",
      "โครงสร้างเนื้อหา (Agenda / Modules)",
      "Workshop / Exercise",
      "Quiz (พร้อมเฉลย)",
      "Case Study",
    ],
    fields: [
      {
        name: "topic",
        label: "Training topic",
        labelTh: "หัวข้ออบรม",
        type: "text",
        placeholder: "เช่น พื้นฐาน Data Governance สำหรับผู้จัดการ",
        required: true,
      },
      {
        name: "audience",
        label: "Audience level",
        labelTh: "กลุ่มผู้เรียน / ระดับ",
        type: "text",
        placeholder: "เช่น พนักงานทั่วไป, ผู้บริหาร",
      },
      {
        name: "duration",
        label: "Duration",
        labelTh: "ระยะเวลา",
        type: "select",
        options: ["ครึ่งวัน (3 ชม.)", "1 วัน", "2 วัน", "หลักสูตรต่อเนื่อง"],
      },
    ],
  },
  {
    slug: "requirement-generator",
    title: "Requirement Generator",
    titleTh: "สร้างเอกสาร Requirement",
    emoji: "📋",
    phase: 1,
    agentId: "business-analyst",
    summary: "สร้าง BRD, FRD, NFR, TOR, RFP, SOW",
    outline: [
      "ภาพรวมและวัตถุประสงค์ (Overview)",
      "ขอบเขต (Scope)",
      "ความต้องการเชิงธุรกิจ (Business Requirements)",
      "ความต้องการเชิงหน้าที่ (Functional Requirements)",
      "ความต้องการที่ไม่ใช่หน้าที่ (Non-Functional Requirements)",
      "สมมติฐานและข้อจำกัด (Assumptions & Constraints)",
    ],
    fields: [
      {
        name: "docType",
        label: "Document type",
        labelTh: "ประเภทเอกสาร",
        type: "select",
        options: ["BRD", "FRD", "NFR", "TOR", "RFP", "SOW"],
        required: true,
      },
      {
        name: "system",
        label: "System / initiative",
        labelTh: "ระบบ / โครงการ",
        type: "text",
        placeholder: "เช่น ระบบบริหารจัดการเอกสารอิเล็กทรอนิกส์",
        required: true,
      },
      {
        name: "details",
        label: "Key details",
        labelTh: "รายละเอียดสำคัญ",
        type: "textarea",
        placeholder: "อธิบายความต้องการหลัก ผู้ใช้ และขอบเขต",
      },
    ],
  },
  {
    slug: "risk-analyzer",
    title: "Risk Analyzer",
    titleTh: "วิเคราะห์ความเสี่ยง",
    emoji: "🛡️",
    phase: 2,
    agentId: "risk-consultant",
    summary: "วิเคราะห์ความเสี่ยง Operational, Cyber, Compliance, Legal, PDPA, Business",
    outline: [
      "สรุปภาพรวมความเสี่ยง (Risk Summary)",
      "ตารางความเสี่ยง (Risk Register: ประเภท / Likelihood / Impact / ระดับ)",
      "มาตรการควบคุมและบรรเทา (Mitigation & Controls)",
      "ความเสี่ยงตกค้างและข้อเสนอแนะ (Residual Risk)",
    ],
    fields: [
      {
        name: "initiative",
        label: "Initiative / system",
        labelTh: "โครงการ / ระบบที่ประเมิน",
        type: "text",
        placeholder: "เช่น การเปิดให้บริการ Mobile Banking ฟีเจอร์ใหม่",
        required: true,
      },
      {
        name: "context",
        label: "Context",
        labelTh: "บริบทเพิ่มเติม",
        type: "textarea",
        placeholder: "เช่น ข้อมูลลูกค้า, การเชื่อมต่อภายนอก, กฎระเบียบที่เกี่ยวข้อง",
      },
    ],
  },
  {
    slug: "roadmap-generator",
    title: "Roadmap Generator",
    titleTh: "สร้าง Roadmap",
    emoji: "🛣️",
    phase: 2,
    agentId: "digital-consultant",
    summary:
      "สร้าง Roadmap: Phase 1 Quick Win, Phase 2, Phase 3 Transformation พร้อม Milestone",
    outline: [
      "ภาพรวมและหลักการจัดลำดับ (Guiding Principles)",
      "Phase 1 — Quick Win",
      "Phase 2 — Scale",
      "Phase 3 — Transformation",
      "Milestones & Timeline (ตาราง)",
      "Dependencies & Risks",
    ],
    fields: [
      {
        name: "goal",
        label: "Transformation goal",
        labelTh: "เป้าหมายการทรานส์ฟอร์ม",
        type: "textarea",
        placeholder: "เช่น ยกระดับองค์กรสู่ Data-Driven Bank ภายใน 3 ปี",
        required: true,
      },
      {
        name: "horizon",
        label: "Time horizon",
        labelTh: "กรอบเวลา",
        type: "select",
        options: ["12 เดือน", "18 เดือน", "2 ปี", "3 ปี"],
      },
    ],
  },
  {
    slug: "ai-diagram",
    title: "AI Diagram",
    titleTh: "สร้างไดอะแกรม",
    emoji: "🕸️",
    phase: 2,
    agentId: "enterprise-architect",
    summary:
      "สร้าง Process Flow, Swimlane, Architecture, Sequence Diagram, Journey Map (เป็นโค้ด Mermaid)",
    outputFormat: "mermaid",
    outline: [],
    fields: [
      {
        name: "diagramType",
        label: "Diagram type",
        labelTh: "ประเภทไดอะแกรม",
        type: "select",
        options: [
          "Process Flow (flowchart)",
          "Swimlane",
          "Architecture",
          "Sequence Diagram",
          "Journey Map",
        ],
        required: true,
      },
      {
        name: "description",
        label: "What to diagram",
        labelTh: "อธิบายสิ่งที่ต้องการวาด",
        type: "textarea",
        placeholder: "เช่น กระบวนการอนุมัติสินเชื่อตั้งแต่ยื่นคำขอจนอนุมัติ",
        required: true,
      },
    ],
  },
];

export const MODULES_BY_SLUG: Record<string, ModuleDef> = Object.fromEntries(
  MODULES.map((m) => [m.slug, m]),
);

export function getModule(slug: string): ModuleDef | undefined {
  return MODULES_BY_SLUG[slug];
}
