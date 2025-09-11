// src/hooks/useCheckNewVersion.ts
import { useEffect, useState } from "react";

export function useCheckNewVersion(interval = 60000) {
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    const current = process.env.NEXT_PUBLIC_COMMIT_SHA;

    const check = async () => {
      try {
        const res = await fetch("/api/version");
        const data = await res.json();
        if (data.version !== current) {
          setNewVersion(data.version);
        }
      } catch (err) {
        console.error("Version check failed", err);
      }
    };

    check(); // direkt einmal beim Mount
    const id = setInterval(check, interval);
    return () => clearInterval(id);
  }, [interval]);

  return newVersion;
}
