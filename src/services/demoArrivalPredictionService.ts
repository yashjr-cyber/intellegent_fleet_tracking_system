import type {
  ArrivalPrediction,
  ArrivalPredictionInput,
  ArrivalPredictionService,
} from "./ArrivalPredictionService";

export function distanceInKilometers(
  latitude: number,
  longitude: number,
  destinationLatitude: number,
  destinationLongitude: number,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(destinationLatitude - latitude);
  const longitudeDelta = radians(destinationLongitude - longitude);
  const arc =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude)) *
      Math.cos(radians(destinationLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

const trafficMultiplier = {
  light: 0.92,
  moderate: 1.08,
  heavy: 1.32,
} satisfies Record<ArrivalPredictionInput["traffic"], number>;

function timeOfDayMultiplier(hour: number): number {
  if ((hour >= 7 && hour < 10) || (hour >= 16 && hour < 19)) return 1.14;
  if (hour >= 22 || hour < 6) return 0.95;
  return 1;
}

export const demoArrivalPredictionService: ArrivalPredictionService = {
  predict(input): ArrivalPrediction {
    const distanceKm = distanceInKilometers(
      input.latitude,
      input.longitude,
      input.destination.latitude,
      input.destination.longitude,
    );
    const stopsRemaining = Math.max(1, input.stopsRemaining);
    const historicalAverage =
      input.historicalMinutesPerStop.reduce((total, value) => total + value, 0) /
      Math.max(1, input.historicalMinutesPerStop.length);
    const averageCruisingSpeedKph =
      input.traffic === "heavy" ? 14 : input.traffic === "moderate" ? 19 : 25;
    const distanceEstimate = (distanceKm / averageCruisingSpeedKph) * 60;
    const routeEstimate = historicalAverage * stopsRemaining;
    const rushHourFactor = timeOfDayMultiplier(input.currentTime.getHours());
    const weekdayFactor = input.isWeekday ? 1.03 : 0.96;
    const predictedMinutes = Math.max(
      1,
      Math.round(
        ((distanceEstimate * 0.55 + routeEstimate * 0.45) *
          trafficMultiplier[input.traffic] *
          rushHourFactor *
          weekdayFactor),
      ),
    );
    const rangeMargin = Math.max(3, Math.round(predictedMinutes * 0.24));
    const arrivalAt = new Date(
      input.currentTime.getTime() + predictedMinutes * 60_000,
    );

    return {
      minutes: predictedMinutes,
      range: {
        earliestMinutes: Math.max(1, predictedMinutes - rangeMargin),
        latestMinutes: predictedMinutes + rangeMargin,
      },
      arrivalAt,
      distanceKm,
      traffic: input.traffic,
    };
  },
};
