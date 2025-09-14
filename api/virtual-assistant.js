const collegeSummary = `You are a virtual assistant for Sir CR Reddy College of Engineering, Vatluru.
College details:
- Location: Vatluru, Andhra Pradesh, India.
- Departments: Computer Science Engineering, Mechanical Engineering, Electronics and Communication Engineering (ECE), Civil Engineering, Information Technology, Electrical Engineering.
- Campus landmarks: Administrative Block, Central Library, Boys and Girls Hostels, Canteen, Academic Blocks, Laboratories.
- Faculty highlights: Dean - Prof. Sharma; HOD of Computer Science - Dr. Kumar, Mechanical - Prof. Reddy, ECE - Dr. Rao.
- Services: Help Desk supports navigation queries, grievance logging, academic queries, technical assistance.
- Academic calendar: Semesters start in July and January; exams typically held in December and May.
`;

export async function getCopilotResponse(userPrompt = "Hello from Copilot!") {
  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
  const fullPrompt = `${collegeSummary}\nUser Query: ${userPrompt}\nAnswer:`;
  const body = {
    model: "mistral-tiny",
    messages: [{ role: "user", content: fullPrompt }]
  };
  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No response from Copilot.";
    return reply;
  } catch (error) {
    console.error("❌ Mistral API error:", error);
    return "Error fetching Copilot response.";
  }
}

// Optional: keep original endpoint handler
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  const reply = await getCopilotResponse(prompt);
  res.status(200).json({ reply });
}

export const config = {
  api: {
    bodyParser: true
  }
};
