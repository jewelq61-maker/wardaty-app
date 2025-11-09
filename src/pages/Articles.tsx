import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BookOpen, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg z-10 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-single-primary to-married-primary text-white">
              {user?.email?.[0].toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">{t('articles')}</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('articlesPage.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {t(`categories.${category}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Articles Grid */}
        {loading ? (
          <Card className="glass shadow-elegant">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">{t('loading')}</p>
            </CardContent>
          </Card>
        ) : filteredArticles.length === 0 ? (
          <Card className="glass shadow-elegant">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">{t('articlesPage.noResults')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="glass shadow-elegant hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${getCategoryColor(article.category)}`}
                    >
                      {t(`categories.${article.category}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start gap-2 mb-2">
              <DialogTitle className="flex-1 text-xl">
                {selectedArticle?.title}
              </DialogTitle>
              <Badge
                variant="outline"
                className={selectedArticle ? getCategoryColor(selectedArticle.category) : ''}
              >
                {selectedArticle && t(`categories.${selectedArticle.category}`)}
              </Badge>
            </div>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-line text-foreground leading-relaxed">
              {selectedArticle?.body}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
