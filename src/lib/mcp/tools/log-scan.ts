import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const severity = z.enum(["normal", "mild", "moderate", "severe", "critical"]);

function severityFor(hb: number) {
  if (hb >= 12) return "normal" as const;
  if (hb >= 11) return "mild" as const;
  if (hb >= 9) return "moderate" as const;
  if (hb >= 7) return "severe" as const;
  return "critical" as const;
}

export default defineTool({
  name: "log_scan",
  title: "Log a hemoglobin reading",
  description:
    "Record a hemoglobin reading (g/dL) for the signed-in user, e.g. a lab result. Severity is derived automatically when not provided.",
  inputSchema: {
    hb_value: z.number().min(1).max(25).describe("Hemoglobin value in g/dL."),
    mode: z.enum(["eyelid", "nail", "lab"]).default("lab").describe("How the reading was obtained."),
    severity: severity.nullable().default(null).describe("Optional severity override."),
    notes: z.string().max(500).nullable().default(null).describe("Optional free-text note."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ hb_value, mode, severity: level, notes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError("Could not resolve the signed-in user.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        hb_value,
        mode: mode ?? "lab",
        severity: level ?? severityFor(hb_value),
        notes: notes ?? null,
      })
      .select("id, hb_value, severity, mode, notes, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { scan: data },
    };
  },
});
