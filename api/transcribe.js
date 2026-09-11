const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res
        .status(500)
        .json({ error: "ANTHROPIC_API_KEY not configured" });
    }

    // Call Claude to extract and categorize attributes
    const message = await client.messages.create({
      model: "claude-opus-4-1",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Extract home features and conditions from this voice memo. Categorize them into: Positive Features, Concerns, Size/Layout, Condition, and Client Reaction.

Voice memo: "${transcript}"

Return ONLY a JSON object like this (no markdown, no extra text):
{
  "positive": ["large deck", "updated kitchen"],
  "concerns": ["needs roof work"],
  "size": ["3 bedrooms", "2 bathrooms"],
  "condition": ["hardwood floors", "fresh paint"],
  "clientReaction": ["loved the kitchen", "interested in pool"]
}

If a category has no items, use an empty array. Be concise - 2-4 words per feature.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const attributes = JSON.parse(content.text.trim());

    res.status(200).json({ attributes });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({
        error: error.message || "Failed to process transcription",
      });
  }
};
