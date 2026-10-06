export type TrackingStatus = "LIVE" | "STALE" | "OFFLINE";

export function getTrackingStatus(
  recordedAt: string | Date,
  now = Date.now(),
): TrackingStatus {
  const timestamp =
    typeof recordedAt === "string" ? new Date(recordedAt).getTime() : recordedAt.getTime();
  const ageMilliseconds = now - timestamp;

  if (!Number.isFinite(timestamp) || ageMilliseconds < -60_000) return "OFFLINE";
  if (ageMilliseconds <= 30_000) return "LIVE";
  if (ageMilliseconds <= 120_000) return "STALE";
  return "OFFLINE";
}

export function formatUpdatedAt(recordedAt: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(recordedAt);
}
