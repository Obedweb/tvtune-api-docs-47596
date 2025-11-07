import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface Endpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  parameters: Parameter[];
  exampleResponse: any;
}

interface EndpointCardProps {
  endpoint: Endpoint;
  onTest: () => void;
}

export const EndpointCard = ({ endpoint, onTest }: EndpointCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const methodColors: Record<string, string> = {
    GET: "bg-accent text-accent-foreground",
    POST: "bg-primary text-primary-foreground",
    PUT: "bg-secondary text-secondary-foreground",
    DELETE: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className={`${methodColors[endpoint.method]} font-mono px-3 py-1`}>
              {endpoint.method}
            </Badge>
            <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-4">{endpoint.description}</p>

        {expanded && (
          <div className="space-y-4 mt-6">
            {/* Parameters */}
            {endpoint.parameters.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3">Parameters</h4>
                <div className="space-y-2">
                  {endpoint.parameters.map((param) => (
                    <div key={param.name} className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono text-sm text-primary">{param.name}</code>
                        <span className="text-xs text-muted-foreground">({param.type})</span>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs px-2 py-0">required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Response */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Example Response</h4>
              <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                <code className="text-sm font-mono text-foreground">
                  {JSON.stringify(endpoint.exampleResponse, null, 2)}
                </code>
              </pre>
            </div>

            <Button onClick={onTest} className="w-full gap-2">
              <Play className="w-4 h-4" />
              Test Endpoint
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};