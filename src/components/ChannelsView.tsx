import { useState, useEffect } from "react";
import { FilterBar } from "@/components/FilterBar";
import { ChannelGrid } from "@/components/ChannelGrid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  category: string;
  language: string;
  country: string;
  description?: string;
  logo_url?: string;
}

export const ChannelsView = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [channels, selectedCategory, selectedLanguage, selectedCountry, searchQuery]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('tv-channels');
      
      if (error) throw error;
      
      // Handle new API response format with pagination
      const channelData = data?.data || [];
      setChannels(channelData);
      
      // Extract unique values for filters
      const uniqueCategories = [...new Set(channelData.map((c: Channel) => c.category))] as string[];
      const uniqueLanguages = [...new Set(channelData.map((c: Channel) => c.language))] as string[];
      const uniqueCountries = [...new Set(channelData.map((c: Channel) => c.country))] as string[];
      
      setCategories(uniqueCategories.sort());
      setLanguages(uniqueLanguages.sort());
      setCountries(uniqueCountries.sort());
      
      console.log('Loaded channels:', channelData.length, 'Total:', data?.total);
    } catch (error: any) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error loading channels",
        description: error.message || "Failed to load TV channels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...channels];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (selectedLanguage !== "all") {
      filtered = filtered.filter(c => c.language === selectedLanguage);
    }

    if (selectedCountry !== "all") {
      filtered = filtered.filter(c => c.country === selectedCountry);
    }

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChannels(filtered);
  };

  return (
    <div className="space-y-6">
      <FilterBar
        categories={categories}
        languages={languages}
        countries={countries}
        selectedCategory={selectedCategory}
        selectedLanguage={selectedLanguage}
        selectedCountry={selectedCountry}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onLanguageChange={setSelectedLanguage}
        onCountryChange={setSelectedCountry}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredChannels.length} of {channels.length} channels
        </p>
      </div>

      <ChannelGrid channels={filteredChannels} loading={loading} />
    </div>
  );
};
