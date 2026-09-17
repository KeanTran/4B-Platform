CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT,
  category TEXT DEFAULT 'Kinh nghiệm sống chung',
  image_url TEXT,
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published blog posts
CREATE POLICY "Public blog posts are viewable by everyone" 
ON public.blog_posts 
FOR SELECT 
USING (is_published = true);

-- Allow anyone (public/anon & auth) to insert blog posts
CREATE POLICY "Anyone can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (title IS NOT NULL AND length(trim(title)) > 0 AND content IS NOT NULL AND author_name IS NOT NULL);

-- Create index on created_at
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts (created_at DESC);
;
