import { Database, Lock, Zap } from "lucide-react";

export const ApiOverview = () => {
  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">API Overview</h2>
      <p className="text-muted-foreground mb-6">
        A powerful RESTful API for accessing TV channel information. Filter by category, language, or country.
      </p>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Fast & Reliable</h3>
            <p className="text-sm text-muted-foreground">Built on serverless infrastructure</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Database className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Rich Data</h3>
            <p className="text-sm text-muted-foreground">Comprehensive channel information</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Public Access</h3>
            <p className="text-sm text-muted-foreground">No authentication required</p>
          </div>
        </div>
      </div>
    </div>
  );
};