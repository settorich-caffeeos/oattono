"use client";

import { useCallback, useEffect, useState } from "react";

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

function read(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

function write(projects: Project[]) {
  window.localStorage.setItem(KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event(EVENT));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const sync = () => setProjects(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addProject = useCallback((name: string, description = ""): Project => {
    const project: Project = {
      id: uid(),
      name: name.trim() || "โครงการไม่มีชื่อ",
      description: description.trim(),
      createdAt: Date.now(),
      documents: [],
    };
    write([project, ...read()]);
    return project;
  }, []);

  const removeProject = useCallback((id: string) => {
    write(read().filter((p) => p.id !== id));
  }, []);

  const addDocument = useCallback(
    (projectId: string, doc: Omit<SavedDoc, "id" | "createdAt">) => {
      const all = read();
      const p = all.find((x) => x.id === projectId);
      if (!p) return;
      p.documents = [
        { ...doc, id: uid(), createdAt: Date.now() },
        ...p.documents,
      ];
      write(all);
    },
    [],
  );

  const removeDocument = useCallback((projectId: string, docId: string) => {
    const all = read();
    const p = all.find((x) => x.id === projectId);
    if (!p) return;
    p.documents = p.documents.filter((d) => d.id !== docId);
    write(all);
  }, []);

  return {
    projects,
    addProject,
    removeProject,
    addDocument,
    removeDocument,
  };
}
