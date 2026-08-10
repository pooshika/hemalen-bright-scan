import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_latest_scan",
  title: "Get latest scan",
  description: "Get the signed-in user's most recent hemoglobin screening result, if any.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("scans")
      .select("id, hb_value, severity, mode, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No scans recorded yet." }] };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { scan: data },
    };
  },
});
