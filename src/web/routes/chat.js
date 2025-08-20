const express = require("express");
const axios = require("axios");

const router = express.Router();

// Minimal OpenAI-compatible chat relay
// Env vars:
// - OPENAI_BASE_URL (default: https://api.openai.com/v1)
// - OPENAI_API_KEY (required)
// - OPENAI_MODEL (default: gpt-4o-mini)
router.post("/", async (req, res) => {
  try {
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Server not configured: missing OPENAI_API_KEY" });
    }

    const userMessages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

    // Prepend a short system prompt to keep answers concise and travel-focused
    const messages = [
      {
        role: "system",
        content:
          "You are Contoso Air's virtual travel assistant. Be concise and friendly. Help with flights, destinations, tips. Avoid making bookings.",
      },
      ...userMessages,
    ];

    const payload = {
      model,
      messages,
      temperature: 0.3,
    };

    const response = await axios.post(`${baseUrl}/chat/completions`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 20000,
    });

    const choice = response?.data?.choices?.[0];
    const content = choice?.message?.content ?? "";
    return res.json({ reply: content });
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data;
    console.error("/api/chat error:", status, data || err.message);
    return res
      .status(500)
      .json({ error: "Chat request failed", details: data || err.message });
  }
});

module.exports = router;
