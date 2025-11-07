
-- Migration: 20251105040020
-- Create TV channels table
CREATE TABLE public.tv_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  logo_url TEXT,
  stream_url TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tv_channels ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
CREATE POLICY "Anyone can view TV channels" 
ON public.tv_channels 
FOR SELECT 
USING (true);

-- Insert sample TV channels
INSERT INTO public.tv_channels (name, category, language, country, stream_url, logo_url, description) VALUES
('Tech News Network', 'News', 'English', 'USA', 'https://example.com/stream/tech-news', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200', 'Latest technology news and updates'),
('Sports Central', 'Sports', 'English', 'UK', 'https://example.com/stream/sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200', 'Live sports coverage and highlights'),
('Movie Theater HD', 'Entertainment', 'English', 'USA', 'https://example.com/stream/movies', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200', 'Classic and modern movies 24/7'),
('Kids World', 'Kids', 'English', 'Canada', 'https://example.com/stream/kids', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200', 'Educational and fun content for children'),
('Music Live', 'Music', 'English', 'USA', 'https://example.com/stream/music', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200', 'Live concerts and music videos'),
('Global News', 'News', 'Spanish', 'Spain', 'https://example.com/stream/global-news', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200', 'International news coverage');
