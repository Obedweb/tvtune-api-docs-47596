import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface ApiTesterProps {
  endpoint: Endpoint;
  onClose: () => void;
}

export const ApiTester = ({ endpoint, onClose }: ApiTesterProps) => {
  const [params, setParams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);

    try {
      let path = endpoint.path;
      const queryParams: Record<string, string> = {};

      // Handle path parameters - replace any {param} with actual values
      Object.entries(params).forEach(([key, value]) => {
        if (value && path.includes(`{${key}}`)) {
          path = path.replace(`{${key}}`, value);
        } else if (value && !path.includes(`{${key}}`)) {
          // If not a path parameter, add as query parameter
          queryParams[key] = value;
        }
      });

      // Clean up the path - remove leading slash
      const cleanPath = path.replace('/tv-channels', '').replace(/^\//, '');
      
      // Build the function name with path
      const functionPath = cleanPath ? `tv-channels/${cleanPath}` : 'tv-channels';
      
      // Build the query string
      const queryString = new URLSearchParams(queryParams).toString();
      const fullPath = queryString ? `${functionPath}?${queryString}` : functionPath;

      console.log('Calling function with path:', fullPath);

      const { data, error } = await supabase.functions.invoke(fullPath);

      if (error) throw error;

      setResponse(data);
      toast({
        title: "Success",
        description: "API request completed successfully",
      });
    } catch (error: any) {
      console.error('API Error:', error);
      setResponse({ error: error.message || 'Failed to fetch data' });
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Test API Endpoint</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <code className="text-sm font-mono">
              {endpoint.method} {endpoint.path}
            </code>
          </div>

          {endpoint.parameters.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Parameters</h4>
              {endpoint.parameters.map((param) => (
                <div key={param.name}>
                  <Label htmlFor={param.name} className="text-sm mb-1 flex items-center gap-2">
                    {param.name}
                    {param.required && (
                      <span className="text-xs text-destructive">*required</span>
                    )}
                  </Label>
                  <Input
                    id={param.name}
                    placeholder={param.description}
                    value={params[param.name] || ''}
                    onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Request
              </>
            )}
          </Button>

          {response && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Response</h4>
              <pre className="bg-muted rounded-lg p-4 overflow-x-auto max-h-96">
                <code className="text-sm font-mono text-foreground">
                  {JSON.stringify(response, null, 2)}
                </code>
              </pre>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};