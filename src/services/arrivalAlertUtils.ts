export interface EveningAlertSettings {
  enabled: boolean;
  tripId: string;
  pickupStopId: string;
  dropStopId: string;
  leadMinutes: 5 | 10 | 15 | 20;
}

export function getAlertDeduplicationKey(
  tripId: string,
  pickupStopId: string,
  date = new Date(),
): string {
  return `wayfinder-arrival-alert:${tripId}:${pickupStopId}:${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function etaChangedMaterially(
  previousMinutes: number | null,
  nextMinutes: number,
  thresholdMinutes = 2,
): boolean {
  return previousMinutes === null || Math.abs(previousMinutes - nextMinutes) >= thresholdMinutes;
}

export function isEveningAlertSettings(value: unknown): value is EveningAlertSettings {
  if (typeof value !== "object" || value === null) return false;
  const settings = value as Partial<EveningAlertSettings>;
  return (
    typeof settings.enabled === "boolean" &&
    typeof settings.tripId === "string" &&
    typeof settings.pickupStopId === "string" &&
    typeof settings.dropStopId === "string" &&
    [5, 10, 15, 20].includes(settings.leadMinutes ?? -1)
  );
}
