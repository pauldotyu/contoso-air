const express = require("express");
const services = require("../services");

const router = express.Router();
const airportsService = services.AirportsService();

// Lightweight airports search API
// GET /api/airports?q=sea -> { items: [{ code, city, country, name }] }
router.get("/", (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const limit = Math.min(parseInt(req.query.limit || "50", 10) || 50, 200);
    const all = airportsService.getAll();

    let items = all;
    if (q) {
      items = all.filter((a) => {
        const city = String(a.city || "").toLowerCase();
        const code = String(a.code || "").toLowerCase();
        const name = String(a.name || "").toLowerCase();
        const country = String(a.country || "").toLowerCase();
        return (
          code.includes(q) ||
          city.includes(q) ||
          name.includes(q) ||
          country.includes(q)
        );
      });
    }

    const result = items.slice(0, limit).map((a) => ({
      code: a.code,
      city: a.city,
      country: a.country,
      name: a.name,
    }));

    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: "airports_search_failed" });
  }
});

module.exports = router;
