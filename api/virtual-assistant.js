const axios = require('axios');

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-small";

const collegeSummary = `You are a virtual assistant for Sir CR Reddy College of Engineering, Vatluru.
College details:
- Location: Vatluru, Andhra Pradesh, India.
- Departments: Computer Science Engineering, Mechanical Engineering, Electronics and Communication Engineering (ECE), Civil Engineering, Information Technology, Electrical Engineering.
- Campus landmarks: Administrative Block, Central Library, Boys and Girls Hostels, Canteen, Academic Blocks, Laboratories.
- Faculty highlights: Dean - Prof. Sharma; HOD of Computer Science - Dr. Kumar, Mechanical - Prof. Reddy, ECE - Dr. Rao.
- Services: Help Desk supports navigation queries, grievance logging, academic queries, technical assistance.
- Academic calendar: Semesters start in July and January; exams typically held in December and May.
`;

function detectRedirect(query) {
    const pageRedirects = [
        { keywords: ['help desk', 'student help'], url: '/help-desk' },
        { keywords: ['grievance', 'complaint'], url: '/grievance' },
        { keywords: ['campus map', 'map'], url: '/campus-map' },
        { keywords: ['faculty', 'professor', 'teacher'], url: '/faculty' },
        { keywords: ['study material', 'materials'], url: '/faculty#materials' }
    ];
    const lowered = query.toLowerCase();
    for (const redirect of pageRedirects) {
        for (const kw of redirect.keywords) {
            if (lowered.includes(kw)) {
                return redirect.url;
            }
        }
    }
    return null;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }
    const redirectUrl = detectRedirect(query);
    if (redirectUrl) {
        return res.status(200).json({ redirect: redirectUrl });
    }
    const prompt = `${collegeSummary}\nUser Query: ${query}\nAnswer:`;
    try {
        const response = await axios.post(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: MISTRAL_MODEL,
                messages: [
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        const answer = response.data.choices?.[0]?.message?.content || "Sorry, no answer generated.";
        return res.status(200).json({ answer });
    } catch (error) {
        console.error(error?.response?.data || error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
