/**
 * This is the secure bridge.
 * It takes the Database ID from the browser and uses your 
 * Vercel NOTION_TOKEN to talk to Notion.
 */

export default async function handler(req, res) {
  const { databaseId } = req.query;
  const token = process.env.NOTION_TOKEN;

  if (!databaseId) return res.status(400).json({ error: "No databaseId provided" });
  if (!token) return res.status(500).json({ error: "NOTION_TOKEN is not set in Vercel settings" });

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page_size: 100 })
    });

    const data = await response.json();

    // Send Notion's response directly back to the chart
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to connect to Notion" });
  }
}

