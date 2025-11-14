import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BookOpen, Search, Sparkles, Clock, ChevronRight, ExternalLink, Shield, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRTL } from '@/hooks/use-rtl';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

interface Article {
  id: string;
  title: string;
  body: string;
  category: string;
  lang: string;
  source?: string;
  reference_url?: string;
  author?: string;
}

const categories = ['all', 'bookmarked', 'basics', 'wellness', 'beauty', 'fertility', 'rulings'] as const;

export default function Articles() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { isRTL } = useRTL();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchArticles();
    fetchBookmarks();
  }, [locale, user]);

  useEffect(() => {
    filterArticles();
  }, [articles, selectedCategory, searchQuery, bookmarkedArticles]);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('lang', locale)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setArticles(data);
    }
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('bookmarks')
      .select('article_id')
      .eq('user_id', user.id);

    if (data) {
      setBookmarkedArticles(new Set(data.map(b => b.article_id)));
    }
  };

  const toggleBookmark = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: t('error'),
        description: t('articlesPage.loginToBookmark'),
        variant: 'destructive',
      });
      return;
    }

    const isBookmarked = bookmarkedArticles.has(articleId);

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (!error) {
        setBookmarkedArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });
        toast({
          title: t('success'),
          description: t('articlesPage.bookmarkRemoved'),
        });
      }
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, article_id: articleId });

      if (!error) {
        setBookmarkedArticles(prev => new Set(prev).add(articleId));
        toast({
          title: t('success'),
          description: t('articlesPage.bookmarkAdded'),
        });
      }
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by bookmarked
    if (selectedCategory === 'bookmarked') {
      filtered = filtered.filter((article) => bookmarkedArticles.has(article.id));
    } else if (selectedCategory !== 'all') {
      // Filter by category
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics':
        return 'bg-info/10 text-info border-info/20';
      case 'wellness':
        return 'bg-fertile/10 text-fertile border-fertile/20';
      case 'beauty':
        return 'bg-ovulation/10 text-ovulation border-ovulation/20';
      case 'fertility':
        return 'bg-period/10 text-period border-period/20';
      case 'rulings':
        return 'bg-fasting/10 text-fasting border-fasting/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen gradient-bg pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-lg z-10 border-b border-border/50">
        <div className="p-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-elegant">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('articlesPage.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('articlesPage.subtitle')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('articlesPage.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full min-w-max gap-2 bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-xl px-5 py-2.5 text-sm font-medium transition-all"
                >
                  {t(`categories.${category}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-3xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredArticles.length === 0 && (
          <Card className="glass shadow-elegant border-border/50 rounded-3xl">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t('articlesPage.noResults')}</p>
            </CardContent>
          </Card>
        )}

        {/* Featured Article */}
        {!loading && featuredArticle && (
          <Card 
            className="glass shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-border/50 rounded-3xl overflow-hidden group bg-gradient-to-br from-primary/8 to-secondary/8 animate-fade-in backdrop-blur-sm"
            onClick={() => setSelectedArticle(featuredArticle)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">{t('articlesPage.featured')}</span>
                    {featuredArticle.source && featuredArticle.category === 'rulings' && (
                      <Badge variant="outline" className="text-xs gap-1.5 bg-success/10 text-success border-success/30">
                        <Shield className="w-3 h-3" />
                        {t('articlesPage.verified')}
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getCategoryColor(featuredArticle.category)} mb-3`}
                  >
                    {t(`categories.${featuredArticle.category}`)}
                  </Badge>
                  <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors mb-2">
                    {featuredArticle.title}
                  </CardTitle>
                  {featuredArticle.source && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {featuredArticle.source}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => toggleBookmark(featuredArticle.id, e)}
                  className="p-2.5 hover:bg-muted/50 rounded-xl transition-all shrink-0 hover:scale-110"
                >
                  {bookmarkedArticles.has(featuredArticle.id) ? (
                    <BookmarkCheck className="w-6 h-6 text-primary fill-primary" />
                  ) : (
                    <Bookmark className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                {featuredArticle.body}
              </p>
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10 -ml-2">
                {t('articlesPage.readMore')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Articles Grid */}
        {!loading && regularArticles.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {regularArticles.map((article, index) => (
              <Card
                key={article.id}
                className="glass shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 rounded-3xl overflow-hidden group animate-fade-in backdrop-blur-sm"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={`${getCategoryColor(article.category)} text-xs`}
                      >
                        {t(`categories.${article.category}`)}
                      </Badge>
                      {article.source && article.category === 'rulings' && (
                        <Badge variant="outline" className="text-xs gap-1 bg-success/10 text-success border-success/30">
                          <Shield className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {article.title}
                    </CardTitle>
                    {article.source && (
                      <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {article.source}
                      </p>
                    )}
                    </div>
                    <button
                      onClick={(e) => toggleBookmark(article.id, e)}
                      className="p-2 hover:bg-muted/50 rounded-xl transition-all shrink-0 hover:scale-110"
                    >
                      {bookmarkedArticles.has(article.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                    {article.body}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('articlesPage.readTime')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] rounded-3xl p-0 overflow-hidden border-border/50 shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
          <ScrollArea className="max-h-[90vh]">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50 p-8 pb-6 relative">
              <button
                onClick={(e) => selectedArticle && toggleBookmark(selectedArticle.id, e)}
                className={`absolute ${isRTL ? 'left-8' : 'right-8'} top-8 p-2 hover:bg-background/50 rounded-xl transition-colors`}
              >
                {selectedArticle && bookmarkedArticles.has(selectedArticle.id) ? (
                  <BookmarkCheck className="w-6 h-6 text-primary fill-primary" />
                ) : (
                  <Bookmark className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge
                  variant="outline"
                  className={selectedArticle ? getCategoryColor(selectedArticle.category) : ''}
                >
                  {selectedArticle && t(`categories.${selectedArticle.category}`)}
                </Badge>
                {selectedArticle?.source && selectedArticle.category === 'rulings' && (
                  <Badge variant="outline" className="gap-1.5 bg-success/10 text-success border-success/30">
                    <Shield className="w-3.5 h-3.5" />
                    {t('articlesPage.verified')}
                  </Badge>
                )}
              </div>
              
              <DialogTitle className="text-3xl md:text-4xl leading-[1.2] font-bold pr-8 text-foreground mb-4">
                {selectedArticle?.title}
              </DialogTitle>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('articlesPage.readTime')}</span>
                </div>
                {selectedArticle?.author && (
                  <>
                    <span className="text-border">•</span>
                    <span className="text-foreground/80 font-medium">{selectedArticle.author}</span>
                  </>
                )}
              </div>
            </div>

            {/* Source info */}
            {selectedArticle?.source && (
              <div className="px-8 pt-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-semibold text-foreground">{t('articlesPage.source')}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{selectedArticle.source}</p>
                      {selectedArticle.reference_url && (
                        <a
                          href={selectedArticle.reference_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm group"
                        >
                          <span>{t('articlesPage.viewOriginal')}</span>
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Article content */}
            <div className="px-8 py-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="text-foreground/90 leading-[1.9] text-[17px] md:text-lg space-y-5">
                  {selectedArticle?.body.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line first-letter:text-2xl first-letter:font-bold first-letter:text-primary">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
