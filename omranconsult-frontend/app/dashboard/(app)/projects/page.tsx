"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { InputField } from "@/core/ui/input-field";
import { adminProjects } from "@/lib/api/admin-browser";
import type { AdminProjectListItem } from "@/lib/api/types";

export default function ProjectsListPage() {
  const t = useTranslations("Dashboard.projects");
  const [items, setItems] = useState<AdminProjectListItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void adminProjects(q).then((payload) => setItems(payload.data));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [q]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-h3">{t("title")}</h1>
      <InputField id="projects-q" label={t("search")} onChange={(event) => setQ(event.target.value)} value={q} />
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {items.map((project) => (
          <li key={project.id}>
            <Link className="flex items-center justify-between px-4 py-3 hover:bg-highlight" href={`/dashboard/projects/${project.id}`}>
              <span>{project.title.ar ?? project.title.en}</span>
              <span className="text-caption text-muted">{t(`status.${project.status}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
