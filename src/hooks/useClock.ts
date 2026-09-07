import { useEffect, useState } from "react";

function stamp(): string {
  return new Date().toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Status-bar clock. Ticks every 30 s, same cadence as the web app. */
export function useClock(): string {
  const [now, setNow] = useState(stamp);
  useEffect(() => {
    const id = setInterval(() => setNow(stamp()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
