const nodemailer = require("nodemailer");

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
    const { showings, clientEmail, clientName } = req.body;

    if (!showings || !Array.isArray(showings)) {
      return res.status(400).json({ error: "Showings array is required" });
    }

    if (!clientEmail) {
      return res.status(400).json({ error: "Client email is required" });
    }

    // Generate HTML summary
    const html = generateHTML(showings, clientName);

    // For now, return the HTML so they can copy/share
    // In production, you'd configure email here
    // Example with SendGrid or Resend below:

    /*
    // Option 1: SendGrid (requires SENDGRID_API_KEY env var)
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: clientEmail,
      from: process.env.SENDER_EMAIL || "showing-tracker@yourdomain.com",
      subject: `Showing Summary - ${new Date().toLocaleDateString()}`,
      html: html,
    });
    */

    /*
    // Option 2: Resend (requires RESEND_API_KEY env var)
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: "showing-tracker@yourdomain.com",
      to: clientEmail,
      subject: `Showing Summary - ${new Date().toLocaleDateString()}`,
      html: html,
    });
    */

    // For now, return the summary
    res.status(200).json({
      success: true,
      message: "Summary generated. Copy the HTML below to email to your client.",
      html: html,
      summary: generateText(showings),
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate summary" });
  }
};

function generateText(showings) {
  let text = `SHOWING SUMMARY - ${new Date().toLocaleDateString()}\n\n`;

  showings.forEach((showing, index) => {
    text += `${index + 1}. ${showing.address}\n`;
    text += `   Client: ${showing.client || "Not specified"}\n`;
    text += `   Rating: ${showing.rating || "Not rated"}/5\n`;
    if (showing.notes) {
      text += `   Notes: ${showing.notes}\n`;
    }
    if (showing.memos && showing.memos.length > 0) {
      text += `   Memos:\n`;
      showing.memos.forEach((memo) => {
        if (memo.attributes) {
          if (memo.attributes.positive && memo.attributes.positive.length) {
            text += `     • Positive: ${memo.attributes.positive.join(", ")}\n`;
          }
          if (memo.attributes.concerns && memo.attributes.concerns.length) {
            text += `     • Concerns: ${memo.attributes.concerns.join(", ")}\n`;
          }
          if (memo.attributes.size && memo.attributes.size.length) {
            text += `     • Size: ${memo.attributes.size.join(", ")}\n`;
          }
          if (memo.attributes.condition && memo.attributes.condition.length) {
            text += `     • Condition: ${memo.attributes.condition.join(", ")}\n`;
          }
          if (
            memo.attributes.clientReaction &&
            memo.attributes.clientReaction.length
          ) {
            text += `     • Reaction: ${memo.attributes.clientReaction.join(", ")}\n`;
          }
        }
      });
    }
    text += "\n";
  });

  return text;
}

function generateHTML(showings, clientName) {
  const sortedShowings = [...showings].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #185FA5; }
    .showing-card { background: #f9f8f7; border-left: 4px solid #185FA5; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .address { font-size: 18px; font-weight: bold; color: #2c2c2a; }
    .rating { font-size: 14px; color: #885; margin: 8px 0; }
    .rating-stars { color: #FFB81C; font-size: 16px; }
    .attribute-section { margin: 10px 0; }
    .attribute-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; }
    .attributes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; }
    .tag { padding: 4px 10px; border-radius: 12px; font-size: 13px; }
    .positive { background: #E8F5E9; color: #2E7D32; }
    .concerns { background: #FCEBEB; color: #A32D2D; }
    .size { background: #F3E5F5; color: #6A1B9A; }
    .condition { background: #FFF3E0; color: #E65100; }
    .reaction { background: #E0F2F1; color: #00695C; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Showing Summary</h1>
    <p>Date: ${new Date().toLocaleDateString()}</p>
    ${clientName ? `<p>For: ${clientName}</p>` : ""}
    <hr>
  `;

  sortedShowings.forEach((showing, index) => {
    html += `
    <div class="showing-card">
      <div class="address">${index + 1}. ${showing.address}</div>
      ${showing.client ? `<div style="color: #666; font-size: 14px;">Client: ${showing.client}</div>` : ""}
      ${showing.rating ? `<div class="rating"><span class="rating-stars">${"★".repeat(showing.rating)}${"☆".repeat(5 - showing.rating)}</span> ${showing.rating}/5</div>` : ''}
      ${showing.notes ? `<div style="font-size: 13px; margin: 10px 0; color: #555;"><strong>Notes:</strong> ${showing.notes}</div>` : ""}
      
      ${
        showing.memos && showing.memos.length > 0
          ? showing.memos
              .map((memo) => {
                if (!memo.attributes) return "";
                let section = "";
                if (
                  memo.attributes.positive &&
                  memo.attributes.positive.length
                ) {
                  section += `
                <div class="attribute-section">
                  <div class="attribute-label">Positive Features</div>
                  <div class="attributes">
                    ${memo.attributes.positive.map((a) => `<span class="tag positive">${a}</span>`).join("")}
                  </div>
                </div>
              `;
                }
                if (memo.attributes.concerns && memo.attributes.concerns.length) {
                  section += `
                <div class="attribute-section">
                  <div class="attribute-label">Concerns</div>
                  <div class="attributes">
                    ${memo.attributes.concerns.map((a) => `<span class="tag concerns">${a}</span>`).join("")}
                  </div>
                </div>
              `;
                }
                if (memo.attributes.size && memo.attributes.size.length) {
                  section += `
                <div class="attribute-section">
                  <div class="attribute-label">Size/Layout</div>
                  <div class="attributes">
                    ${memo.attributes.size.map((a) => `<span class="tag size">${a}</span>`).join("")}
                  </div>
                </div>
              `;
                }
                if (
                  memo.attributes.condition &&
                  memo.attributes.condition.length
                ) {
                  section += `
                <div class="attribute-section">
                  <div class="attribute-label">Condition</div>
                  <div class="attributes">
                    ${memo.attributes.condition.map((a) => `<span class="tag condition">${a}</span>`).join("")}
                  </div>
                </div>
              `;
                }
                if (
                  memo.attributes.clientReaction &&
                  memo.attributes.clientReaction.length
                ) {
                  section += `
                <div class="attribute-section">
                  <div class="attribute-label">Client Reaction</div>
                  <div class="attributes">
                    ${memo.attributes.clientReaction.map((a) => `<span class="tag reaction">${a}</span>`).join("")}
                  </div>
                </div>
              `;
                }
                return section;
              })
              .join("")
          : ""
      }
    </div>
    `;
  });

  html += `
    <div class="footer">
      <p>Generated by Showing Tracker | ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}
