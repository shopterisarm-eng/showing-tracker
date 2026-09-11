export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: "No transcript" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `From: "${transcript}"\nReturn JSON: {"positive":[],"concerns":[],"size":[],"condition":[],"clientReaction":[]}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API error");

    const attributes = JSON.parse(data.content[0].text);
    res.json({ attributes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
