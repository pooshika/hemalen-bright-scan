import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Activity, History, User } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-5 py-4">
        <h1 className="text-xl font-bold text-foreground">HemaLen AI</h1>
        <p className="text-sm text-muted-foreground">Welcome back</p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
          <Activity className="h-14 w-14 text-primary" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Start New Scan</h2>
          <p className="mt-2 text-base text-muted-foreground">
            Take a photo of your eyelid or nail to estimate hemoglobin levels
          </p>
        </div>

        <Button variant="clinical" size="lg" className="w-full max-w-xs">
          Begin Screening
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          This is a screening tool, not a final diagnosis.
        </p>
      </main>

      <nav className="flex items-center justify-around border-t border-border px-4 py-3">
        <button className="flex flex-col items-center gap-1 text-primary">
          <Activity className="h-5 w-5" />
          <span className="text-xs font-medium">Scan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <History className="h-5 w-5" />
          <span className="text-xs font-medium">History</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
