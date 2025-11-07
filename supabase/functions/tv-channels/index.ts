import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Check if this is a stats request
    const isStatsRequest = pathParts.length === 2 && pathParts[1] === 'stats';
    const id = pathParts.length === 2 && !isStatsRequest ? pathParts[1] : null;

    console.log('Request method:', req.method);
    console.log('Path parts:', pathParts);
    console.log('Is stats request:', isStatsRequest);
    console.log('ID:', id);

    // GET /tv-channels/stats - Get statistics
    if (isStatsRequest) {
      // Get all channels for statistics
      const { data: channels, error } = await supabase
        .from('tv_channels')
        .select('category, language, country');

      if (error) {
        console.error('Error fetching channels for stats:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate statistics
      const categoryStats: Record<string, number> = {};
      const languageStats: Record<string, number> = {};
      const countryStats: Record<string, number> = {};

      channels?.forEach(channel => {
        // Category count
        categoryStats[channel.category] = (categoryStats[channel.category] || 0) + 1;
        
        // Language count
        languageStats[channel.language] = (languageStats[channel.language] || 0) + 1;
        
        // Country count
        countryStats[channel.country] = (countryStats[channel.country] || 0) + 1;
      });

      // Sort by count descending
      const sortByCount = (obj: Record<string, number>) => 
        Object.entries(obj)
          .sort(([, a], [, b]) => b - a)
          .map(([name, count]) => ({ name, count }));

      const stats = {
        total_channels: channels?.length || 0,
        by_category: sortByCount(categoryStats),
        by_language: sortByCount(languageStats),
        by_country: sortByCount(countryStats),
      };

      console.log('Returning statistics');
      return new Response(
        JSON.stringify({ data: stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /tv-channels - Get all channels with optional filters
    if (!id && !isStatsRequest) {
      const category = url.searchParams.get('category');
      const language = url.searchParams.get('language');
      const country = url.searchParams.get('country');
      const search = url.searchParams.get('search');
      
      let query = supabase.from('tv_channels').select('*');

      if (category) {
        query = query.eq('category', category);
      }
      if (language) {
        query = query.eq('language', language);
      }
      if (country) {
        query = query.eq('country', country);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching channels:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Returning channels:', data?.length);
      return new Response(
        JSON.stringify({ data, count: data?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /tv-channels/:id - Get single channel by ID
    if (id) {
      const { data, error } = await supabase
        .from('tv_channels')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching channel:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Channel not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Returning channel:', data.name);
      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});