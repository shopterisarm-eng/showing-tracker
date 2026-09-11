module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    const transcript = body.transcript;

    res.json({
      received: true,
      transcript: transcript ? transcript.substring(0, 50) : null,
      hasTranscript: !!transcript,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
