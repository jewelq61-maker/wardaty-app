import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BookOpen, Search, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
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
import BottomNav from '@/components/BottomNav';

interface Article {
  id: string;
  title: string;
  body: string;
  category: string;
  lang: string;
}

const categories = ['all', 'basics', 'wellness', 'beauty', 'fertility', 'rulings'] as const;

export default function Articles() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { locale } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [locale]);

  useEffect(() => {
    filterArticles();
  }, [articles, selectedCategory, searchQuery]);

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

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'all') {
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      {/* Compact Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 ring-2 ring-primary/10">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                {user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {t('articles')}
              </h1>
              <p className="text-xs text-muted-foreground">{filteredArticles.length} {t('articlesPage.articlesFound')}</p>
            </div>
          </div>
          
          <button className="p-2 hover:bg-muted/50 rounded-xl transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder={t('articlesPage.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 glass border-border/50 focus-visible:ring-primary/20 rounded-2xl"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full min-w-max gap-2 bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium"
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
            className="glass shadow-elegant hover:shadow-xl transition-all cursor-pointer border-border/50 rounded-3xl overflow-hidden group bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in"
            onClick={() => setSelectedArticle(featuredArticle)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">{t('articlesPage.featured')}</span>
                </div>
                <Badge
                  variant="outline"
                  className={getCategoryColor(featuredArticle.category)}
                >
                  {t(`categories.${featuredArticle.category}`)}
                </Badge>
              </div>
              <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                {featuredArticle.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed mb-4">
                {featuredArticle.body}
              </p>
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                {t('articlesPage.readMore')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Articles Grid */}
        {!loading && regularArticles.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regularArticles.map((article, index) => (
              <Card
                key={article.id}
                className="glass shadow-elegant hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 rounded-3xl overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`${getCategoryColor(article.category)} text-xs`}
                    >
                      {t(`categories.${article.category}`)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {article.body}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
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
        <DialogContent className="max-w-3xl max-h-[85vh] rounded-3xl">
          <ScrollArea className="max-h-[75vh] pr-4">
            <DialogHeader className="mb-6">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className={selectedArticle ? getCategoryColor(selectedArticle.category) : ''}
                >
                  {selectedArticle && t(`categories.${selectedArticle.category}`)}
                </Badge>
                <DialogTitle className="text-2xl leading-tight pr-6">
                  {selectedArticle?.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{t('articlesPage.readTime')}</span>
                </div>
              </div>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line text-foreground/90 leading-relaxed text-base">
                {selectedArticle?.body}
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
