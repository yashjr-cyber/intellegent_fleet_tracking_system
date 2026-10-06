import type { Stop } from "../types/models";

export type TrafficCondition = "light" | "moderate" | "heavy";

export interface ArrivalPredictionInput {
  latitude: number;
  longitude: number;
  destination: Stop;
  stopsRemaining: number;
  historicalMinutesPerStop: readonly number[];
  currentTime: Date;
  isWeekday: boolean;
  traffic: TrafficCondition;
}

export interface ArrivalPrediction {
  minutes: number;
  range: { earliestMinutes: number; latestMinutes: number };
  arrivalAt: Date;
  distanceKm: number;
  traffic: TrafficCondition;
}

export interface ArrivalPredictionService {
  predict(input: ArrivalPredictionInput): ArrivalPrediction;
}
