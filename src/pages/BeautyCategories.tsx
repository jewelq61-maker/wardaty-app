import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Sparkles,
  Scissors,
  Droplet,
  Heart,
  Star,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

interface BeautyCategory {
  id: string;
  name: string;
  name_en: string | null;
  color: string;
  icon: string;
  is_system: boolean;
}

const ICON_OPTIONS = [
  { value: 'sparkles', icon: Sparkles },
  { value: 'scissors', icon: Scissors },
  { value: 'droplet', icon: Droplet },
  { value: 'heart', icon: Heart },
  { value: 'star', icon: Star },
];

const COLOR_OPTIONS = [
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#14B8A6', // Teal
];

export default function BeautyCategories() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BeautyCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    color: COLOR_OPTIONS[0],
    icon: 'sparkles',
  });

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('beauty_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data) {
      setCategories(data as any);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      name_en: '',
      color: COLOR_OPTIONS[0],
      icon: 'sparkles',
    });
    setShowDialog(true);
  };

  const handleEditCategory = (category: BeautyCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_en: category.name_en || '',
      color: category.color,
      icon: category.icon,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!user || !formData.name) {
      toast({
        title: t('common.error'),
        description: t('beautyRoutines.fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    const categoryData = {
      user_id: user.id,
      name: formData.name,
      name_en: formData.name_en || null,
      color: formData.color,
      icon: formData.icon,
      is_system: false,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('beauty_categories')
        .update(categoryData as any)
        .eq('id', editingCategory.id);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('beautyRoutines.errorUpdating'),
          variant: 'destructive',
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('beauty_categories')
        .insert(categoryData as any);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('beautyRoutines.errorAdding'),
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: t('common.success'),
      description: t('beautyRoutines.categorySaved'),
    });

    setShowDialog(false);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('beauty_categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: t('common.error'),
        description: t('beautyRoutines.errorDeleting'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: t('beautyRoutines.deleted'),
      });
      loadCategories();
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName);
    return iconOption ? iconOption.icon : Sparkles;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{t('beautyRoutines.categories')}</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Button onClick={handleAddCategory} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('beautyRoutines.addCategory')}
        </Button>

        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          return (
            <Card key={category.id} className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent
                        className="h-6 w-6"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      {category.name_en && (
                        <p className="text-sm text-muted-foreground">{category.name_en}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!category.is_system && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {categories.length === 0 && (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t('beautyRoutines.noCategories')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? t('beautyRoutines.editCategory')
                : t('beautyRoutines.addCategory')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t('beautyRoutines.categoryNameAr')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('beautyRoutines.categoryNamePlaceholder')}
              />
            </div>

            <div>
              <Label>{t('beautyRoutines.categoryNameEn')}</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="Category Name"
              />
            </div>

            <div>
              <Label>{t('beautyRoutines.icon')}</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {ICON_OPTIONS.map((option) => {
                  const IconComp = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, icon: option.value })}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all',
                        formData.icon === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <IconComp className="h-6 w-6 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>{t('beautyRoutines.color')}</Label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-all',
                      formData.color === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
