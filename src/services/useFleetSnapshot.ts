import { useCallback, useEffect, useState } from "react";
import { demoFleetService } from "./demoFleetService";
import type { FleetSnapshot } from "../types/models";

export function useFleetSnapshot(refreshMilliseconds = 15_000) {
  const [snapshot, setSnapshot] = useState<FleetSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await demoFleetService.getSnapshot();
      setSnapshot(next);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The shared demo workspace could not be loaded. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribe = demoFleetService.subscribe(() => void refresh());
    const interval = window.setInterval(() => void refresh(), refreshMilliseconds);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [refresh, refreshMilliseconds]);

  return { snapshot, loading, error, refresh };
}
