// This file lives in the /api folder of your project.
// Vercel automatically turns this into a secure serverless function.

export default async function handler(req, res) {
  // 1. Get the Database ID from the request
  const { databaseId } = req.query;

  if (!databaseId) {
    return res.status(400).json({ error: "Missing databaseId" });
  }

  // 2. Get your Secret from Vercel's environment variables
  const token = process.env.NOTION_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "NOTION_TOKEN not configured in Vercel" });
  }

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

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Send the data back to your chart
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
