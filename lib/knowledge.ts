import { createClient } from "./supabase/server";

type Row = { title: string; category: string | null; content: string };

/** Lightweight lexical relevance score (works reasonably for TH + EN). */
function score(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let s = 0;
  for (const w of q.split(/[\s,.;:/()\-]+/).filter((w) => w.length >= 2)) {
    if (t.includes(w)) s += 1;
  }
  // Thai has no word spaces — reward short substring overlaps too.
  for (let i = 0; i + 4 <= q.length; i += 2) {
    const seg = q.slice(i, i + 4);
    if (seg.trim().length === 4 && t.includes(seg)) s += 0.5;
  }
  return s;
}

/**
 * Retrieve the user's most relevant knowledge-base entries for a query and
 * format them as a context block to prepend to the system prompt.
 * Returns "" when Supabase is unconfigured, the user is anonymous, or no KB.
 */
export async function getKnowledgeContext(query: string): Promise<string> {
  const supabase = await createClient();
  if (!supabase) return "";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "";

  const { data } = await supabase
    .from("knowledge_base")
    .select("title,category,content")
    .limit(50);
  const rows = (data as Row[]) ?? [];
  if (!rows.length) return "";

  const ranked = rows
    .map((r) => ({ r, s: score(`${r.title} ${r.content}`, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  if (!ranked.length) return "";

  let budget = 6000;
  const parts: string[] = [];
  for (const { r } of ranked) {
    const body = r.content.slice(0, 2200);
    const chunk = `### ${r.title}${r.category ? ` (${r.category})` : ""}\n${body}`;
    if (budget - chunk.length < 0) break;
    budget -= chunk.length;
    parts.push(chunk);
  }
  if (!parts.length) return "";

  return `\n\n---\nคลังความรู้ขององค์กร (ใช้อ้างอิงเมื่อเกี่ยวข้อง อย่าแต่งข้อมูลเกินจากนี้ และระบุเมื่ออ้างอิง):\n${parts.join(
    "\n\n",
  )}\n---\n`;
}
