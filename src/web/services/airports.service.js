const normalizeAirport = function (a) {
  // Ensure required fields exist to avoid template issues
  const rawCity = a.city || "-";
  const state = (a.state || "").trim();
  const city = state ? `${rawCity}, ${state}` : rawCity;
  return Object.assign({}, a, {
    city,
    country: a.country || "Other",
  });
};

const isValidCode = (c) => typeof c === "string" && /^[A-Z]{3}$/.test(c);

// Popular travel countries in desired order (case-insensitive match)
const POPULAR_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "France",
  "Spain",
  "Italy",
  "Germany",
  "Japan",
  "Mexico",
  "Netherlands",
  "Switzerland",
  "China",
  "India",
  "Brazil",
  "Ireland",
  "Portugal",
  "Greece",
  "United Arab Emirates",
  "Singapore",
  "Thailand",
  "New Zealand",
  "South Korea",
];
const countryRank = (name) => {
  const idx = POPULAR_COUNTRIES.findIndex(
    (c) => c.toLowerCase() === String(name || "").toLowerCase()
  );
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
};

class AirportsService {
  constructor(airports) {
    this._airports = airports;
  }

  getAll() {
    // Return airports with valid IATA-like code, normalized, sorted by city (then code)
    return this._airports
      .filter(
        (a) =>
          isValidCode(a.code) &&
          typeof a.city === "string" &&
          a.city.trim().length > 0
      )
      .map(normalizeAirport)
      .sort((a, b) => {
        const ac = (a.city || "").toLowerCase();
        const bc = (b.city || "").toLowerCase();
        if (ac < bc) return -1;
        if (ac > bc) return 1;
        // tie-breaker by code to keep deterministic order
        return (a.code || "").localeCompare(b.code || "");
      });
  }


  getByCode(code) {
    const q = typeof code === "string" ? code.toUpperCase() : code;
    const found = this._airports.find((a) => a.code === q);
    return normalizeAirport(found || {});
  }

  getGroupedByCountry() {
    // Group normalized airports by country and sort
    const byCountry = new Map();
    this._airports
      .filter(
        (a) =>
          isValidCode(a.code) &&
          typeof a.city === "string" &&
          a.city.trim().length > 0
      )
      .map(normalizeAirport)
      .forEach((a) => {
        const key = a.country || "Other";
        if (!byCountry.has(key)) byCountry.set(key, []);
        byCountry.get(key).push(a);
      });

    return Array.from(byCountry.entries())
      .sort(([a], [b]) => {
        const ra = countryRank(a);
        const rb = countryRank(b);
        if (ra !== rb) return ra - rb; // popular first in given order
        return a.localeCompare(b); // then alphabetical
      })
      .map(([country, airports]) => ({
        country,
        airports: airports.sort((a, b) => {
          const ac = (a.city || "").toLowerCase();
          const bc = (b.city || "").toLowerCase();
          if (ac < bc) return -1;
          if (ac > bc) return 1;
          return (a.code || "").localeCompare(b.code || "");
        }),
      }));
  }

}

module.exports = AirportsService;
