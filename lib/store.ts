"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/client";

export type SavedDoc = {
  id: string;
  moduleSlug: string;
  title: string;
  content: string;
  createdAt: number;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  documents: SavedDoc[];
};

const KEY = "dtcopilot.projects.v1";
const EVENT = "dtcopilot:update";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* -------------------- localStorage backend -------------------- */
function readLocal(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}
function writeLocal(projects: Project[]) {
  window.localStorage.setItem(KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event(EVENT));
}

/* -------------------- Supabase mapping -------------------- */
type Row = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  documents?: {
    id: string;
    module_slug: string | null;
    title: string | null;
    content: string | null;
    created_at: string;
  }[];
};
function mapRow(r: Row): Project {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    createdAt: new Date(r.created_at).getTime(),
    documents: (r.documents ?? [])
      .map((d) => ({
        id: d.id,
        moduleSlug: d.module_slug ?? "",
        title: d.title ?? "",
        content: d.content ?? "",
        createdAt: new Date(d.created_at).getTime(),
      }))
      .sort((a, b) => b.createdAt - a.createdAt),
  };
}

export function useProjects() {
  const supa = isSupabaseConfigured();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(supa);

  const loadSupabase = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("projects")
      .select(
        "id,name,description,created_at,documents(id,module_slug,title,content,created_at)",
      )
      .order("created_at", { ascending: false });
    setProjects(((data as Row[]) ?? []).map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supa) {
      const sync = () => setProjects(readLocal());
      sync();
      window.addEventListener(EVENT, sync);
      window.addEventListener("storage", sync);
      return () => {
        window.removeEventListener(EVENT, sync);
        window.removeEventListener("storage", sync);
      };
    }
    loadSupabase();
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadSupabase());
    return () => sub.subscription.unsubscribe();
  }, [supa, loadSupabase]);

  const addProject = useCallback(
    async (name: string, description = ""): Promise<Project | null> => {
      const cleanName = name.trim() || "โครงการไม่มีชื่อ";
      if (!supa) {
        const project: Project = {
          id: uid(),
          name: cleanName,
          description: description.trim(),
          createdAt: Date.now(),
          documents: [],
        };
        writeLocal([project, ...readLocal()]);
        return project;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .insert({ name: cleanName, description: description.trim() })
        .select("id,name,description,created_at")
        .single();
      if (error || !data) return null;
      await loadSupabase();
      return mapRow(data as Row);
    },
    [supa, loadSupabase],
  );

  const removeProject = useCallback(
    async (id: string) => {
      if (!supa) {
        writeLocal(readLocal().filter((p) => p.id !== id));
        return;
      }
      await createClient().from("projects").delete().eq("id", id);
      await loadSupabase();
    },
    [supa, loadSupabase],
  );

  const addDocument = useCallback(
    async (
      projectId: string,
      doc: Omit<SavedDoc, "id" | "createdAt">,
    ): Promise<void> => {
      if (!supa) {
        const all = readLocal();
        const p = all.find((x) => x.id === projectId);
        if (!p) return;
        p.documents = [
          { ...doc, id: uid(), createdAt: Date.now() },
          ...p.documents,
        ];
        writeLocal(all);
        return;
      }
      await createClient().from("documents").insert({
        project_id: projectId,
        module_slug: doc.moduleSlug,
        title: doc.title,
        content: doc.content,
      });
      await loadSupabase();
    },
    [supa, loadSupabase],
  );

  const removeDocument = useCallback(
    async (projectId: string, docId: string) => {
      if (!supa) {
        const all = readLocal();
        const p = all.find((x) => x.id === projectId);
        if (!p) return;
        p.documents = p.documents.filter((d) => d.id !== docId);
        writeLocal(all);
        return;
      }
      await createClient().from("documents").delete().eq("id", docId);
      await loadSupabase();
    },
    [supa, loadSupabase],
  );

  return {
    projects,
    loading,
    mode: supa ? ("supabase" as const) : ("local" as const),
    addProject,
    removeProject,
    addDocument,
    removeDocument,
  };
}
