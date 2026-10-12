import { describe, expect, it } from "vitest";
import {
  campusRouteTimetables,
  formatRouteTime,
  getReturnTimetable,
} from "./campusRoutes";

describe("REC campus route timetables", () => {
  it("contains the six screenshot routes with the recorded first and campus stop times", () => {
    expect(campusRouteTimetables.map(({ name }) => name)).toEqual([
      "Thiruvottiyur",
      "Ambattur Singapore Shopping",
      "Ambattur Estate",
      "Redhills",
      "Iyyappanthangal",
      "Guduvanchery",
    ]);
    expect(campusRouteTimetables.map((route) => [
      route.stops[0].time,
      route.stops[route.stops.length - 1].time,
    ])).toEqual([
      ["06:25", "08:10"],
      ["06:05", "08:10"],
      ["06:35", "08:10"],
      ["06:05", "08:10"],
      ["06:40", "08:10"],
      ["06:40", "08:10"],
    ]);
  });

  it("reverses each stop list from the 4 PM campus departure and preserves the adjacent time gaps", () => {
    for (const route of campusRouteTimetables) {
      const returned = getReturnTimetable(route);
      expect(returned.map(({ stop }) => stop.id)).toEqual(
        [...route.stops].reverse().map(({ id }) => id),
      );
      expect(returned[0]).toMatchObject({
        stop: { id: "stop-campus" },
        time: "16:00",
      });
      for (let index = 1; index < returned.length; index += 1) {
        const outboundLater = route.stops[route.stops.length - index];
        const outboundEarlier = route.stops[route.stops.length - index - 1];
        const toMinutes = (time: string) => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        };
        expect(toMinutes(returned[index].time) - toMinutes(returned[index - 1].time))
          .toBe(toMinutes(outboundLater.time) - toMinutes(outboundEarlier.time));
      }
    }
  });

  it("formats morning and evening stop times for the selectors", () => {
    expect(formatRouteTime("06:25")).toBe("6:25 AM");
    expect(formatRouteTime("16:00")).toBe("4:00 PM");
  });
});
