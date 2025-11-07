import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StatData {
  name: string;
  count: number;
}

interface StatsResponse {
  total_channels: number;
  by_category: StatData[];
  by_language: StatData[];
  by_country: StatData[];
}

interface StatsViewProps {
  data: StatsResponse | null;
  onDataLoad: (data: StatsResponse) => void;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

export const StatsView = ({ data, onDataLoad }: StatsViewProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: result, error } = await supabase.functions.invoke('tv-channels/stats');
        
        if (error) throw error;
        
        // Extract the data property from the response
        const statsData = result?.data || result;
        onDataLoad(statsData);
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Error loading statistics",
          description: error.message || "Failed to load statistics. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (!data) {
      fetchStats();
    }
  }, [data, onDataLoad, toast]);

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-6 text-primary-foreground">
        <h3 className="text-4xl font-bold mb-2">{data.total_channels}</h3>
        <p className="text-sm opacity-90">Total TV Channels</p>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold mb-4">Channels by Category</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.by_category}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.by_category.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-4">By Language</h4>
          <div className="space-y-2">
            {data.by_language.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">By Country</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.by_country.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};