/**
 * Modernized Notion Bridge
 * Uses the latest Node.js URL standards to avoid deprecation warnings.
 */

export default async function handler(req, res) {
  // Use modern URL search params to avoid url.parse() warnings
  const url = new URL(req.url, `https://${req.headers.host}`);
  const databaseId = url.searchParams.get('databaseId');
  
  const token = process.env.NOTION_TOKEN;

  // 1. Basic Validation
  if (!databaseId) {
    console.error("DEBUG: Missing databaseId in request");
    return res.status(400).json({ error: "Missing databaseId" });
  }

  if (!token) {
    console.error("DEBUG: NOTION_TOKEN is missing in Vercel Environment Variables");
    return res.status(500).json({ error: "Server configuration error: NOTION_TOKEN not found." });
  }

  // 2. Token Format Warning (Logs only)
  if (token.startsWith('ntn_')) {
    console.warn("DEBUG: Using an 'ntn_' token. Notion API usually requires 'secret_'.");
  }

  try {
    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page_size: 100 })
    });

    const data = await notionResponse.json();

    if (!notionResponse.ok) {
      // LOG THE ACTUAL ERROR FROM NOTION
      console.error("NOTION API ERROR:", JSON.stringify(data, null, 2));
      return res.status(notionResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("FETCH ERROR:", error.message);
    return res.status(500).json({ error: "Internal Server Error connecting to Notion" });
  }
}