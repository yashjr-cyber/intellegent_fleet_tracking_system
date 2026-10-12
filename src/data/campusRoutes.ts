export interface CampusRouteStop {
  id: string;
  name: string;
  time: string;
  latitude: number;
  longitude: number;
}

export interface CampusRouteTimetable {
  id: string;
  name: string;
  code: string;
  stops: readonly CampusRouteStop[];
}

const campus = {
  id: "stop-campus",
  name: "Rajalakshmi Engineering College · South Campus, Perungudi",
  time: "08:10",
  latitude: 12.9730868,
  longitude: 80.2430635,
};

export const campusRouteTimetables: readonly CampusRouteTimetable[] = [
  {
    id: "route-north",
    code: "1",
    name: "Thiruvottiyur",
    stops: [
      { id: "stop-r1-thiruvottiyur", name: "Thiruvottiyur Bus Stand", time: "06:25", latitude: 13.1604, longitude: 80.3002 },
      { id: "stop-r1-tollgate", name: "Tollgate", time: "06:33", latitude: 13.1667, longitude: 80.3008 },
      { id: "stop-r1-tondiarpet", name: "Tondiarpet Mani Cycle Shop", time: "06:43", latitude: 13.1332, longitude: 80.2896 },
      { id: "stop-r1-central-railway", name: "Central Railway Station", time: "06:55", latitude: 13.0827, longitude: 80.2757 },
      { id: "stop-r1-university-madras", name: "University of Madras", time: "07:10", latitude: 13.0644, longitude: 80.2835 },
      { id: "stop-r1-santhome", name: "Santhome Church", time: "07:20", latitude: 13.0337, longitude: 80.2771 },
      { id: "stop-r1-pattinapakkam", name: "Pattinapakkam Signal", time: "07:27", latitude: 13.0228, longitude: 80.2711 },
      { id: "stop-r1-adyar", name: "Adyar Signal", time: "07:40", latitude: 13.0067, longitude: 80.2574 },
      { id: "stop-r1-thiruvanmiyur", name: "Thiruvanmiyur Thyagaraja Theatre", time: "07:55", latitude: 12.9828, longitude: 80.2592 },
      campus,
    ],
  },
  {
    id: "route-garden",
    code: "2",
    name: "Ambattur Singapore Shopping",
    stops: [
      { id: "stop-r2-singapore-shopping", name: "Singapore Shopping", time: "06:05", latitude: 13.1142, longitude: 80.1548 },
      { id: "stop-r2-thirumullaivoyal", name: "Thirumullaivoyal Bus Stop", time: "06:15", latitude: 13.1280, longitude: 80.1372 },
      { id: "stop-r2-avadi", name: "Avadi Bus Stop", time: "06:25", latitude: 13.1147, longitude: 80.1018 },
      { id: "stop-r2-govarthanagiri", name: "Govarthanagiri", time: "06:35", latitude: 13.0967, longitude: 80.1004 },
      { id: "stop-r2-kumanachavadi", name: "Kumanachavadi Bus Stop", time: "06:45", latitude: 13.0488, longitude: 80.1018 },
      { id: "stop-r2-mangadu", name: "Mangadu Bus Stop", time: "06:55", latitude: 13.0383, longitude: 80.0944 },
      { id: "stop-r2-kundrathur", name: "Kundrathur Shanthi Jewellers", time: "07:05", latitude: 12.9976, longitude: 80.0978 },
      { id: "stop-r2-pammal", name: "Pammal - Rettai Pillaiyar Kovil", time: "07:15", latitude: 12.9798, longitude: 80.1262 },
      { id: "stop-r2-pallavaram", name: "Pallavaram Signal", time: "07:25", latitude: 12.9675, longitude: 80.1492 },
      { id: "stop-r2-chromepet", name: "Chromepet Bus Stand", time: "07:30", latitude: 12.9516, longitude: 80.1462 },
      { id: "stop-r2-vels", name: "Vels University", time: "07:40", latitude: 12.9801, longitude: 80.2181 },
      { id: "stop-r2-echangadu", name: "Echangadu Signal", time: "07:48", latitude: 12.9512, longitude: 80.1878 },
      { id: "stop-r2-kavery", name: "Kavery Hospital", time: "07:50", latitude: 12.9511, longitude: 80.1944 },
      campus,
    ],
  },
  {
    id: "route-ambattur-estate",
    code: "3",
    name: "Ambattur Estate",
    stops: [
      { id: "stop-r3-ambattur-estate", name: "Ambattur Estate", time: "06:35", latitude: 13.0901, longitude: 80.1618 },
      { id: "stop-r3-wavin", name: "Wavin Bus Stop", time: "06:40", latitude: 13.0866, longitude: 80.1744 },
      { id: "stop-r3-mgr-university", name: "MGR University", time: "06:45", latitude: 13.0693, longitude: 80.2014 },
      { id: "stop-r3-anna-arch", name: "Anna Arch", time: "06:55", latitude: 13.0753, longitude: 80.2208 },
      { id: "stop-r3-pachaiyappas", name: "Pachaiyappa's", time: "07:00", latitude: 13.0781, longitude: 80.2327 },
      { id: "stop-r3-chetpet", name: "Chetpet", time: "07:05", latitude: 13.0733, longitude: 80.2417 },
      { id: "stop-r3-teynampet", name: "Teynampet Signal", time: "07:15", latitude: 13.0418, longitude: 80.2498 },
      { id: "stop-r3-kotturpuram", name: "Kotturpuram Anna Library", time: "07:25", latitude: 13.0167, longitude: 80.2429 },
      campus,
    ],
  },
  {
    id: "route-redhills",
    code: "4",
    name: "Redhills",
    stops: [
      { id: "stop-r4-redhills", name: "Redhills Bus Stand", time: "06:05", latitude: 13.1860, longitude: 80.2042 },
      { id: "stop-r4-madhavaram", name: "Madhavaram Roundana", time: "06:15", latitude: 13.1484, longitude: 80.2314 },
      { id: "stop-r4-retteri", name: "Retteri Signal", time: "06:23", latitude: 13.1248, longitude: 80.2288 },
      { id: "stop-r4-padi", name: "Padi Bridge Down", time: "06:33", latitude: 13.0955, longitude: 80.1840 },
      { id: "stop-r4-anna-nagar", name: "Anna Nagar West Depot", time: "06:43", latitude: 13.0851, longitude: 80.1945 },
      { id: "stop-r4-koyambedu", name: "Koyambedu Ambedkar Statue", time: "06:53", latitude: 13.0694, longitude: 80.1948 },
      { id: "stop-r4-vadapalani", name: "Vadapalani Bus Stop", time: "07:03", latitude: 13.0508, longitude: 80.2121 },
      { id: "stop-r4-postal-colony", name: "Postal Colony", time: "07:13", latitude: 13.0381, longitude: 80.2242 },
      { id: "stop-r4-tnagar", name: "T. Nagar - Pothys", time: "07:25", latitude: 13.0417, longitude: 80.2341 },
      { id: "stop-r4-saidapet", name: "Saidapet Metro Station", time: "07:35", latitude: 13.0238, longitude: 80.2236 },
      { id: "stop-r4-little-mount", name: "Little Mount Bus Stop", time: "07:43", latitude: 13.0128, longitude: 80.2236 },
      { id: "stop-r4-velachery", name: "Velachery Bypass", time: "07:53", latitude: 12.9818, longitude: 80.2182 },
      { id: "stop-r4-baby-nagar", name: "Baby Nagar Bus Stop", time: "08:03", latitude: 12.9766, longitude: 80.2352 },
      campus,
    ],
  },
  {
    id: "route-iyyappanthangal",
    code: "5",
    name: "Iyyappanthangal",
    stops: [
      { id: "stop-r5-iyyappanthangal", name: "Iyyappanthangal (Shanthi Jewellers)", time: "06:40", latitude: 13.0370, longitude: 80.1362 },
      { id: "stop-r5-porur", name: "Porur Bus Stop", time: "06:45", latitude: 13.0359, longitude: 80.1568 },
      { id: "stop-r5-dlf", name: "DLF", time: "06:47", latitude: 13.0102, longitude: 80.1634 },
      { id: "stop-r5-ramapuram", name: "Ramapuram Bus Stop", time: "06:50", latitude: 13.0254, longitude: 80.1791 },
      { id: "stop-r5-nesapakkam", name: "Nesapakkam Corner", time: "06:55", latitude: 13.0296, longitude: 80.1928 },
      { id: "stop-r5-mgr-nagar", name: "MGR Nagar Market", time: "06:57", latitude: 13.0267, longitude: 80.2050 },
      { id: "stop-r5-esi", name: "ESI Hospital", time: "06:59", latitude: 13.0218, longitude: 80.2075 },
      { id: "stop-r5-guindy", name: "Guindy - Dheeran Chinnamalai Statue", time: "07:07", latitude: 13.0067, longitude: 80.2206 },
      campus,
    ],
  },
  {
    id: "route-guduvanchery",
    code: "6",
    name: "Guduvanchery",
    stops: [
      { id: "stop-r6-guduvanchery", name: "Guduvanchery Bus Stand", time: "06:40", latitude: 12.8438, longitude: 80.0609 },
      { id: "stop-r6-kilambakkam", name: "Kilambakkam Bus Stand", time: "06:48", latitude: 12.8678, longitude: 80.0688 },
      { id: "stop-r6-vandalur", name: "Vandalur Bus Stop", time: "06:56", latitude: 12.8925, longitude: 80.0812 },
      { id: "stop-r6-perungalathur", name: "Perungalathur Bus Stop", time: "07:01", latitude: 12.9048, longitude: 80.0885 },
      { id: "stop-r6-tambaram-east", name: "Tambaram East Bus Stand", time: "07:06", latitude: 12.9249, longitude: 80.1272 },
      { id: "stop-r6-sembakkam", name: "Sembakkam Signal", time: "07:19", latitude: 12.9237, longitude: 80.1517 },
      { id: "stop-r6-medavakkam", name: "Medavakkam Bus Stand", time: "07:32", latitude: 12.9209, longitude: 80.1924 },
      { id: "stop-r6-jain-college", name: "Jain College - OMR", time: "07:46", latitude: 12.9082, longitude: 80.2278 },
      { id: "stop-r6-perungudi-tollgate", name: "Perungudi Tollgate", time: "08:00", latitude: 12.9585, longitude: 80.2460 },
      campus,
    ],
  },
];

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutesFromMidnight: number): string {
  const normalized = ((minutesFromMidnight % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

export function getReturnTimetable(
  route: CampusRouteTimetable,
  campusDeparture = "16:00",
): { stop: CampusRouteStop; time: string }[] {
  const reverseStops = [...route.stops].reverse();
  let currentMinutes = toMinutes(campusDeparture);
  const schedule = [{ stop: reverseStops[0], time: formatTime(currentMinutes) }];

  for (let index = 1; index < reverseStops.length; index += 1) {
    const previousOutboundStop = route.stops[route.stops.length - index];
    const nextOutboundStop = route.stops[route.stops.length - index - 1];
    currentMinutes += toMinutes(previousOutboundStop.time) - toMinutes(nextOutboundStop.time);
    schedule.push({ stop: reverseStops[index], time: formatTime(currentMinutes) });
  }
  return schedule;
}

export function formatRouteTime(time: string): string {
  const minutes = toMinutes(time);
  const hour = Math.floor(minutes / 60);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes % 60).padStart(2, "0")} ${suffix}`;
}
