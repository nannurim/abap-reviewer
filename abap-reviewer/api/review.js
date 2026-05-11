export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, focus } = req.body;

  if (!code || !focus) {
    return res.status(400).json({ error: 'Missing code or focus areas' });
  }

  const prompt = `You are a senior ABAP developer with 20+ years of SAP experience. Review the following ABAP code and provide a concise, actionable code review.

Focus areas: ${focus}

Structure your review as:
1. Overall assessment (1-2 sentences + rating: Good / Needs work / Critical issues)
2. Issues found (numbered list — what the issue is, why it matters, how to fix it)
3. Quick wins (top 2-3 most impactful changes to make first)

Be direct and specific. Reference actual code where possible.

ABAP code:
\`\`\`abap
${code}
\`\`\``;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.map(b => b.text || '').join('') || 'No response.';
    return res.status(200).json({ result: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
