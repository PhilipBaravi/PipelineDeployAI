const systemPrompt = `I need a structured feasibility analysis for a networking pipeline deployment project in the address provided in the user prompt.

There is an existing pipeline provided in the user prompt and an unused pipeline (canalization) provided away in the prompt, each with its own length. The main goal is to compare the cost difference when deploying the network from scratch versus deploying it through empty pipelines (canalizations).

The analysis should be specific to networking pipelines and must be detailed, location-specific, and include full source links (always providing the complete URL including the protocol, e.g., https://www.example.com) where applicable.

**Important:**
- Consider the entire chat history, including any follow-up questions, and integrate additional details or clarifications provided by the user during the conversation.
- If the user asks follow-up questions (e.g., "how can it improve connectivity?"), provide a comprehensive response addressing those queries while complementing the original feasibility analysis.

The report should be structured as follows:

1. **Cost Optimization Analysis**  
   - Provide a breakdown of construction and operational costs (materials, labor, permitting, logistics, etc.).  
   - Compare the cost-saving benefits of connecting to an existing canalization versus new trenching and installation.  
   - Estimate projected savings (excavation, labor, installation time) and provide an estimated implementation timeframe.  
   - **Data Presentation:** Return the cost and time-related data as a JSON object only (in a code block). The JSON must have the following structure (and no extra text):
     
     \`\`\`json
     {
       "costData": [
         {
           "component": "Materials",
           "newDeployment": <number>,
           "existingCanalization": <number>,
           "costReduction": <number>,
           "costReductionPercent": <number>,
           "timeReduction": <number>
         },
         {
           "component": "Labor",
           "newDeployment": <number>,
           "existingCanalization": <number>,
           "costReduction": <number>,
           "costReductionPercent": <number>,
           "timeReduction": <number>
         },
         {
           "component": "Permitting",
           "newDeployment": <number>,
           "existingCanalization": <number>,
           "costReduction": <number>,
           "costReductionPercent": <number>,
           "timeReduction": <number>
         },
         {
           "component": "Excavation and Restoration",
           "newDeployment": <number>,
           "existingCanalization": <number>,
           "costReduction": <number>,
           "costReductionPercent": <number>,
           "timeReduction": <number>
         }
       ],
       "totals": {
         "newDeployment": <number>,
         "existingCanalization": <number>,
         "costReduction": <number>,
         "costReductionPercent": <number>,
         "timeReduction": <number>
       },
       "regulatoryLinks": [
         {
           "id": 1,
           "title": "Title of regulation 1",
           "link": "https://www.example.com"
         },
         {
           "id": 2,
           "title": "Title of regulation 2",
           "link": "https://www.example.com"
         },
         {
           "id": 3,
           "title": "Title of regulation 3",
           "link": "https://www.example.com"
         }
       ]
     }
     \`\`\`
     
2. **Regional Connectivity Improvements**  
   - Identify businesses or industries within a 7000-meter radius of the provided address that will benefit from improved connectivity.  
   - Explain how the network ensures long-term scalability and list local infrastructure that could facilitate deployment.

3. **Regulatory Compliance & Environmental Considerations**  
   - List all applicable regulations for the address, including potential risks and prevention strategies.  
   - Provide at least three regulatory links (with full URLs) for local regulatory bodies or official resources.

4. **Infrastructure Installation Strategy**  
   - Explain the installation approach (trenching, welding, hydrostatic testing, etc.), assess technical viability, and discuss necessary adaptations.

Ensure the analysis is clear, precise, and actionable with realistic financial and technical estimates, and that all data is specific to networking pipelines.`;

export async function getFeasibilityAnalysis(
  userInput: string
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userInput },
  ];

  const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      reasoning: "low",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analysis from OpenAI API");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
