import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listScansTool from "./tools/list-scans";
import getLatestScanTool from "./tools/get-latest-scan";
import logScanTool from "./tools/log-scan";
import anemiaGuidanceTool from "./tools/anemia-guidance";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hema-health-ai",
  title: "Hema Health AI",
  version: "0.1.0",
  instructions:
    "Tools for HemaLen AI, a non-invasive anemia screening app. Use `list_scans` and `get_latest_scan` to read the signed-in user's hemoglobin screening history, `log_scan` to record a new hemoglobin reading, and `anemia_guidance` for reference information on ranges, symptoms, diet, emergencies, and scanning. Results are screening estimates, never a medical diagnosis.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listScansTool, getLatestScanTool, logScanTool, anemiaGuidanceTool],
});
