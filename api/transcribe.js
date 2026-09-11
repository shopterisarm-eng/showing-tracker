module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
      return res.status(400).json({ error: "No transcript" });
    }

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "No API key" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `Extract features from: "${transcript}"\n\nReturn JSON:\n{"positive":[],"concerns":[],"size":[],"condition":[],"clientReaction":[]}`,
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error });
    }

    const text = data.content[0].text;
    const attributes = JSON.parse(text);
    
    res.status(200).json({ attributes });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};
