import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const guidance: Record<string, string> = {
  ranges:
    "Normal hemoglobin ranges (g/dL): men 13.5-17.5, women 12.0-15.5, children 11.0-16.0. HemaLen severity bands: normal >=12, mild 11-12, moderate 9-11, severe 7-9, critical <7. Screening only - not a diagnosis.",
  symptoms:
    "Common anemia symptoms: fatigue and weakness, pale skin (especially lower eyelids and nail beds), shortness of breath, dizziness, cold hands and feet, headaches, brittle nails.",
  diet:
    "Iron-rich foods: spinach, moringa, beetroot, broccoli, lentils, chickpeas, kidney beans, eggs, fish, lean red meat, pumpkin and sesame seeds, dates. Pair with vitamin C (orange, lemon, guava) to boost absorption, and avoid tea or coffee with meals.",
  emergency:
    "If hemoglobin is below 8 g/dL or symptoms are severe: stay calm, sit down if dizzy, contact a doctor immediately, and go to the nearest hospital. Emergency services in India: 108.",
  scanning:
    "How to scan in HemaLen AI: open the Scan screen, choose Eyelid Mode or Nail Bed Mode, start the camera, gently pull the lower eyelid down, align it inside the guide circle, hold still and capture. The AI estimate appears on the Results screen.",
};

export default defineTool({
  name: "anemia_guidance",
  title: "Anemia guidance",
  description:
    "Look up HemaLen's reference guidance on hemoglobin ranges, anemia symptoms, iron-rich diet, emergency steps, or how to scan.",
  inputSchema: {
    topic: z
      .enum(["ranges", "symptoms", "diet", "emergency", "scanning"])
      .describe("Which guidance topic to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ topic }) => ({ content: [{ type: "text", text: guidance[topic] }] }),
});
