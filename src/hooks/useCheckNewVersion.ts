// src/hooks/useCheckNewVersion.ts
import { useEffect, useState } from "react";
import { Tables } from "@/types/db.types";

export function useCheckNewVersion(
  interval = 60000,
  profile: Tables<"profiles"> | undefined
) {
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    const current = process.env.NEXT_PUBLIC_COMMIT_SHA;

    // Skip checks when there is no authenticated user/profile
    if (!profile) {
      setNewVersion(null);
      return;
    }

    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("application/json")) {
          throw new Error(
            `Unexpected response: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        if (data?.version && data.version !== current) {
          setNewVersion(data.version);
        } else {
          setNewVersion(null);
        }
      } catch (err) {
        console.error("Version check failed", err);
      }
    };

    // Run once and then in interval
    check();
    const id = interval > 0 ? setInterval(check, interval) : undefined;
    return () => {
      if (id) clearInterval(id);
    };
  }, [interval, profile]);

  return newVersion;
}
