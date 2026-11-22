
const axios = require('axios');
const EmailHistory = require('../models/EmailHistory');

exports.generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (typeof prompt !== 'string') {
      return res.status(400).json({
        message: 'Prompt must be a string'
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        message: 'Prompt cannot be empty'
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        message: 'Prompt cannot exceed 2000 characters'
      });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(500).json({
        message: 'AI service is not configured'
      });
    }

    const systemPrompt = `You are an expert job outreach strategist.

Your task is to generate a HIGH-CONVERTING cold email to a recruiter for a job opportunity.

IMPORTANT:
- Even if the user gives only 2–4 words, assume realistic context.
- Do NOT ask for clarification.
- Make professional assumptions.
- Avoid generic phrases.
- Keep it concise and structured.

OUTPUT FORMAT (STRICT)

Return ONLY valid JSON:

{
  "subject": "",
  "emailBody": "",
  "linkedInDM": "",
  "followUpEmail": ""
}

No markdown.
No explanations.
Only JSON.

CONTEXT ASSUMPTIONS

Assume:
- Candidate has 2+ years experience
- Strong in DSA and system design
- Has worked on backend APIs or scalable systems
- Has contributed to production-level features
- Actively seeking Software Engineer roles

If prompt is short like "SDE role", "Backend engineer", "Startup job", create intelligent assumptions about scaling challenges, hiring urgency, performance, system reliability and team growth.

SUBJECT LINE RULES
- 6–9 words
- Confident and specific
- Avoid generic phrases like Quick question or Job application.

EMAIL BODY STRUCTURE
- 60–90 words
- Personalized observation about hiring
- Mention a common hiring/scaling challenge
- Mention candidate experience and strengths
- Include a specific impact or contribution
- Clear call to action
- Professional sign-off

LINKEDIN DM
- 30–50 words
- Conversational
- Observation + value + soft ask

FOLLOW-UP EMAIL
- 50–80 words
- New angle
- Emphasize long-term value
- Professional urgency
- Clear CTA

Return ONLY valid JSON.`;

    // Send request to Groq
    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b',

        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `User REQUEST: "${prompt.trim()}"

Generate a strong cold email.
Return only a valid JSON object with these four string fields:
subject, emailBody, linkedInDM, followUpEmail.
Do not include markdown or explanations.`
          }
        ],

        response_format: {
          type: 'json_object'
        },

        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Check Groq response
    if (
      !aiResponse.data.choices ||
      !aiResponse.data.choices[0] ||
      !aiResponse.data.choices[0].message
    ) {
      throw new Error('Invalid response from Groq API');
    }

    // Extract and parse AI response
    const generatedText =
      aiResponse.data.choices[0].message.content;

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('AI generated text:', generatedText);

      return res.status(500).json({
        message: 'Failed to parse AI response',
        error: 'The AI generated invalid JSON. Please try again.'
      });
    }

    // Prepare email data
    const emailData = {
      subject: parsedResponse.subject || '',
      emailBody: parsedResponse.emailBody || '',
      linkedInDM: parsedResponse.linkedInDM || '',
      followUpEmail: parsedResponse.followUpEmail || ''
    };

    if (!emailData.subject || !emailData.emailBody) {
      return res.status(500).json({
        message: 'AI generated incomplete email data. Please try again.'
      });
    }

    // Save generated email in MongoDB
    const historyEntry = await EmailHistory.create({
      user: req.user._id,
      prompt: prompt.trim(),
      subject: emailData.subject,
      emailBody: emailData.emailBody,
      linkedInDM: emailData.linkedInDM,
      followUpEmail: emailData.followUpEmail
    });

    return res.status(200).json(historyEntry);

  } catch (error) {
    console.error(
      'AI Generation Error:',
      error.response?.data || error.message
    );

    if (error.response?.status === 429) {
      return res.status(429).json({
        message: 'Too many requests. Please wait before trying again.',
        error: 'Rate limit exceeded'
      });
    }

    return res.status(500).json({
      message: 'Failed to generate email',
      error: error.response?.data?.error?.message || error.message
    });
  }
};


exports.getHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(history);

  } catch (error) {
    console.error('History Error:', error.message);

    return res.status(500).json({
      message: 'Failed to fetch history'
    });
  }
};



exports.getHistoryById = async (req, res) => {
  try {
    const history= await EmailHistory.find({ user:req.user._id,  }).sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch history', error: error.message });
}
}
