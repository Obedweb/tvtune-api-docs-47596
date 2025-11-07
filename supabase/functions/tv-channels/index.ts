import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helper
const sanitizeString = (value: string | null, maxLength: number = 100): string | null => {
  if (!value) return null;
  return value.trim().substring(0, maxLength);
};

const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
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

    // Validate UUID if ID is provided
    if (id && !validateUUID(id)) {
      console.error('Invalid UUID format:', id);
      return new Response(
        JSON.stringify({ error: 'Invalid channel ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      // Sanitize and validate input parameters
      const category = sanitizeString(url.searchParams.get('category'), 50);
      const language = sanitizeString(url.searchParams.get('language'), 50);
      const country = sanitizeString(url.searchParams.get('country'), 50);
      const search = sanitizeString(url.searchParams.get('search'), 100);
      
      // Pagination parameters
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
      const offset = (page - 1) * limit;
      
      console.log('Filters:', { category, language, country, search, page, limit });
      
      let query = supabase.from('tv_channels').select('*', { count: 'exact' });

      // Apply filters with validation
      if (category && category.length > 0) {
        query = query.eq('category', category);
      }
      if (language && language.length > 0) {
        query = query.eq('language', language);
      }
      if (country && country.length > 0) {
        query = query.eq('country', country);
      }
      if (search && search.length > 0) {
        query = query.ilike('name', `%${search}%`);
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching channels:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch channels',
            details: error.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Returning channels:', data?.length, 'Total:', count);
      return new Response(
        JSON.stringify({ 
          data, 
          count: data?.length || 0,
          total: count || 0,
          page,
          limit,
          total_pages: count ? Math.ceil(count / limit) : 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /tv-channels/:id - Get single channel by ID
    if (id) {
      console.log('Fetching channel with ID:', id);
      
      const { data, error } = await supabase
        .from('tv_channels')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching channel:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch channel',
            details: error.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        console.log('Channel not found with ID:', id);
        return new Response(
          JSON.stringify({ 
            error: 'Channel not found',
            message: 'No channel exists with the provided ID'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Successfully returning channel:', data.name);
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
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});