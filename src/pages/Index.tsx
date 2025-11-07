import { useState } from "react";
import { ApiOverview } from "@/components/ApiOverview";
import { EndpointCard } from "@/components/EndpointCard";
import { ApiTester } from "@/components/ApiTester";
import { StatsView } from "@/components/StatsView";
import { ChannelsView } from "@/components/ChannelsView";
import { Code2, Tv, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<any>(null);

  const endpoints = [
    {
      id: 'get-stats',
      method: 'GET',
      path: '/tv-channels/stats',
      description: 'Get channel statistics including category, language, and country distribution',
      parameters: [],
      exampleResponse: {
        data: {
          total_channels: 26,
          by_category: [
            { name: "News", count: 5 },
            { name: "Entertainment", count: 4 },
            { name: "Kids", count: 4 }
          ],
          by_language: [
            { name: "English", count: 23 },
            { name: "Spanish", count: 2 },
            { name: "French", count: 1 }
          ],
          by_country: [
            { name: "USA", count: 18 },
            { name: "UK", count: 4 },
            { name: "Canada", count: 1 }
          ]
        }
      }
    },
    {
      id: 'get-all',
      method: 'GET',
      path: '/tv-channels',
      description: 'Fetch all TV channels with optional filters',
      parameters: [
        { name: 'category', type: 'string', description: 'Filter by category (News, Sports, Entertainment, Kids, Music)', required: false },
        { name: 'language', type: 'string', description: 'Filter by language', required: false },
        { name: 'country', type: 'string', description: 'Filter by country', required: false },
        { name: 'search', type: 'string', description: 'Search by channel name', required: false },
      ],
      exampleResponse: {
        data: [
          {
            id: "uuid-here",
            name: "Tech News Network",
            category: "News",
            language: "English",
            country: "USA",
            stream_url: "https://example.com/stream/tech-news",
            logo_url: "https://example.com/logo.png",
            description: "Latest technology news",
            created_at: "2024-01-01T00:00:00Z"
          }
        ],
        count: 1
      }
    },
    {
      id: 'get-by-id',
      method: 'GET',
      path: '/tv-channels/{id}',
      description: 'Get a specific TV channel by ID',
      parameters: [
        { name: 'id', type: 'uuid', description: 'Channel ID', required: true },
      ],
      exampleResponse: {
        data: {
          id: "uuid-here",
          name: "Sports Central",
          category: "Sports",
          language: "English",
          country: "UK",
          stream_url: "https://example.com/stream/sports",
          logo_url: "https://example.com/logo.png",
          description: "Live sports coverage",
          created_at: "2024-01-01T00:00:00Z"
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Tv className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TV Channels API
              </h1>
              <p className="text-sm text-muted-foreground">RESTful API Documentation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <Code2 className="w-4 h-4" />
              API Docs
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <Tv className="w-4 h-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12">
            <div className="grid lg:grid-cols-2 gap-8">
              <ApiOverview />
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Quick Start</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Base URL:</p>
                    <code className="block bg-muted px-3 py-2 rounded-lg text-sm font-mono break-all">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Example Request:</p>
                    <pre className="bg-muted px-3 py-2 rounded-lg text-sm font-mono overflow-x-auto">
{`curl -X GET \\
  '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tv-channels?category=News'`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div>
              <h2 className="text-2xl font-bold mb-6">API Endpoints</h2>
              <div className="space-y-6">
                {endpoints.map((endpoint) => (
                  <EndpointCard
                    key={endpoint.id}
                    endpoint={endpoint}
                    onTest={() => setSelectedEndpoint(endpoint.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="channels">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Browse Channels</h2>
                <p className="text-muted-foreground">
                  Explore and filter TV channels from across Africa and beyond
                </p>
              </div>
              <ChannelsView />
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Channel Statistics</h2>
                <p className="text-muted-foreground">
                  Real-time analytics of TV channel distribution across categories, languages, and countries
                </p>
              </div>
              <StatsView data={statsData} onDataLoad={setStatsData} />
            </div>
          </TabsContent>
        </Tabs>

        {/* API Tester */}
        {selectedEndpoint && (
          <ApiTester 
            endpoint={endpoints.find(e => e.id === selectedEndpoint)!}
            onClose={() => setSelectedEndpoint(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>Built with Lovable Cloud • RESTful API for TV Channels</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;