import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, BookOpen, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BottomNav from '@/components/BottomNav';

interface Article {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
}

export default function Articles() {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'basics', 'fertility', 'wellness', 'beauty', 'rulings'];

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

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const filterArticles = () => {
    let filtered = articles;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basics':
        return 'bg-info/20 text-info';
      case 'fertility':
        return 'bg-fertile/20 text-fertile';
      case 'wellness':
        return 'bg-success/20 text-success';
      case 'beauty':
        return 'bg-primary/20 text-primary';
      case 'rulings':
        return 'bg-warning/20 text-warning';
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('articlesPage.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex w-full justify-start">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="px-4">
                  {t(`categories.${category}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          <TabsContent value={selectedCategory} className="mt-6 space-y-4">
            {loading ? (
              <Card className="glass shadow-elegant">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">{t('loading')}</p>
                </CardContent>
              </Card>
            ) : filteredArticles.length === 0 ? (
              <Card className="glass shadow-elegant">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">{t('articlesPage.noArticles')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="glass shadow-elegant cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <Badge className={getCategoryColor(article.category)}>
                        {t(`categories.${article.category}`)}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">
                      {article.body.substring(0, 150)}...
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl">{selectedArticle?.title}</DialogTitle>
              {selectedArticle && (
                <Badge className={getCategoryColor(selectedArticle.category)}>
                  {t(`categories.${selectedArticle.category}`)}
                </Badge>
              )}
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <DialogDescription className="text-foreground whitespace-pre-line leading-relaxed">
              {selectedArticle?.body}
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
