import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tv, Globe, Languages } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Channel {
  id: string;
  name: string;
  category: string;
  language: string;
  country: string;
  description?: string;
  logo_url?: string;
}

interface ChannelGridProps {
  channels: Channel[];
  loading: boolean;
}

export const ChannelGrid = ({ channels, loading }: ChannelGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Tv className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No channels found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters to see more results
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {channels.map((channel) => (
        <Card key={channel.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{channel.name}</h3>
              {channel.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {channel.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Tv className="w-3 h-3" />
                {channel.category}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Languages className="w-3 h-3" />
                {channel.language}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                {channel.country}
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
