const moment = require("moment");

class BookFormService {
  constructor(airports) {
    this._airports = airports;
  }

  getForm() {
  // With curated data, use full lists for selects
  const grouped = this._airports.getGroupedByCountry();
  const all = grouped.length ? [] : this._airports.getAll();
    return {
      kinds: [
        { text: "Round trip", active: true },
        { text: "One way" },
        { text: "Multi-city" },
      ],
      today: moment().format("YYYY-MM-DD"),
      passengers: [1, 2, 3, 4, 5],
  airports: all,
  airportsByCountry: grouped,
    };
  }
}

module.exports = BookFormService;
