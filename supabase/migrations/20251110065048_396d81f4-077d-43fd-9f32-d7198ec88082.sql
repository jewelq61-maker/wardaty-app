-- Add source and reference fields to articles table for proper attribution
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS reference_url TEXT,
ADD COLUMN IF NOT EXISTS author TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.articles.source IS 'Source of the article (e.g., إسلام سؤال وجواب, دار الإفتاء المصرية)';
COMMENT ON COLUMN public.articles.reference_url IS 'URL reference to the original fatwa or article';
COMMENT ON COLUMN public.articles.author IS 'Author or scholar name if applicable';