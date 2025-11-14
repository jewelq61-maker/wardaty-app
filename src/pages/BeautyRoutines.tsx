import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Upload,
  X,
  Sun,
  Moon,
  Calendar,
  CalendarRange,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';

interface BeautyCategory {
  id: string;
  name: string;
  name_en: string | null;
  color: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  notes: string | null;
}

interface BeautyRoutine {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: 'morning' | 'evening' | 'both' | null;
  created_at: string;
  products?: Product[];
}

export default function BeautyRoutines() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [routines, setRoutines] = useState<BeautyRoutine[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<BeautyRoutine | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time_of_day: 'morning' as 'morning' | 'evening' | 'both',
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    notes: '',
    image_url: null as string | null,
  });

  useEffect(() => {
    if (user) {
      loadCategories();
      loadRoutines();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('beauty_categories' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data) {
      setCategories(data as unknown as BeautyCategory[]);
    }
  };

  const loadRoutines = async () => {
    if (!user) return;

    const { data: routinesData } = await supabase
      .from('beauty_routines' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (routinesData) {
      const routinesWithProducts = await Promise.all(
        routinesData.map(async (routine: any) => {
          const { data: productsData } = await supabase
            .from('routine_products' as any)
            .select('*')
            .eq('routine_id', routine.id);

          return {
            ...routine,
            products: productsData || [],
          };
        })
      );

      setRoutines(routinesWithProducts as unknown as BeautyRoutine[]);
    }
  };

  const handleAddRoutine = () => {
    setEditingRoutine(null);
    setFormData({
      category_id: categories[0]?.id || '',
      title: '',
      description: '',
      frequency: 'daily',
      time_of_day: 'morning',
    });
    setProducts([]);
    setShowDialog(true);
  };

  const handleEditRoutine = (routine: BeautyRoutine) => {
    setEditingRoutine(routine);
    setFormData({
      category_id: routine.category_id,
      title: routine.title,
      description: routine.description || '',
      frequency: routine.frequency,
      time_of_day: routine.time_of_day || 'morning',
    });
    setProducts(routine.products || []);
    setShowDialog(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setNewProduct({ ...newProduct, image_url: publicUrl });

      toast({
        title: t('common.success'),
        description: t('beautyRoutines.imageUploaded'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name) {
      toast({
        title: t('common.error'),
        description: t('beautyRoutines.productNameRequired'),
        variant: 'destructive',
      });
      return;
    }

    setProducts([...products, { ...newProduct, id: Math.random().toString() }]);
    setNewProduct({ name: '', notes: '', image_url: null });
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (!user || !formData.title || !formData.category_id) {
      toast({
        title: t('common.error'),
        description: t('beautyRoutines.fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    const routineData = {
      user_id: user.id,
      category_id: formData.category_id,
      title: formData.title,
      description: formData.description || null,
      frequency: formData.frequency,
      time_of_day: formData.time_of_day,
    };

    try {
      if (editingRoutine) {
        const { error } = await supabase
          .from('beauty_routines' as any)
          .update(routineData)
          .eq('id', editingRoutine.id);

        if (error) throw error;

        // Delete old products
        await supabase
          .from('routine_products' as any)
          .delete()
          .eq('routine_id', editingRoutine.id);

        // Add new products
        if (products.length > 0) {
          const productsData = products.map((p) => ({
            routine_id: editingRoutine.id,
            name: p.name,
            image_url: p.image_url,
            notes: p.notes,
          }));

          await supabase.from('routine_products' as any).insert(productsData);
        }
      } else {
        const { data: newRoutine, error } = await supabase
          .from('beauty_routines' as any)
          .insert(routineData)
          .select()
          .single();

        if (error) throw error;

        if (products.length > 0 && newRoutine) {
          const productsData = products.map((p) => ({
            routine_id: (newRoutine as any).id,
            name: p.name,
            image_url: p.image_url,
            notes: p.notes,
          }));

          await supabase.from('routine_products' as any).insert(productsData);
        }
      }

      toast({
        title: t('common.success'),
        description: t('beautyRoutines.routineSaved'),
      });

      setShowDialog(false);
      loadRoutines();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('routine_products' as any).delete().eq('routine_id', id);
      
      const { error } = await supabase
        .from('beauty_routines' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('beautyRoutines.deleted'),
      });
      loadRoutines();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return <Calendar className="h-4 w-4" />;
      case 'weekly':
      case 'monthly':
        return <CalendarRange className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTimeIcon = (time: string | null) => {
    switch (time) {
      case 'morning':
        return <Sun className="h-4 w-4" />;
      case 'evening':
        return <Moon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{t('beautyRoutines.routines')}</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/beauty-categories')}>
            <Edit2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Button onClick={handleAddRoutine} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('beautyRoutines.addRoutine')}
        </Button>

        {routines.map((routine) => {
          const category = getCategoryById(routine.category_id);
          return (
            <Card key={routine.id} className="glass-card">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {category && (
                          <Badge style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                            {category.name}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {getFrequencyIcon(routine.frequency)}
                          <span className="text-xs text-muted-foreground">
                            {t(`beautyRoutines.frequency.${routine.frequency}`)}
                          </span>
                        </div>
                        {routine.time_of_day && routine.time_of_day !== 'both' && (
                          <div className="flex items-center gap-1">
                            {getTimeIcon(routine.time_of_day)}
                            <span className="text-xs text-muted-foreground">
                              {t(`beautyRoutines.time.${routine.time_of_day}`)}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{routine.title}</h3>
                      {routine.description && (
                        <p className="text-sm text-muted-foreground mt-1">{routine.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRoutine(routine)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(routine.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {routine.products && routine.products.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t('beautyRoutines.products')}:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {routine.products.map((product) => (
                          <div key={product.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              {product.notes && (
                                <p className="text-xs text-muted-foreground truncate">{product.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {routines.length === 0 && (
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">{t('beautyRoutines.noRoutines')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoutine ? t('beautyRoutines.editRoutine') : t('beautyRoutines.addRoutine')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t('beautyRoutines.category')}</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('beautyRoutines.title')}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('beautyRoutines.titlePlaceholder')}
              />
            </div>

            <div>
              <Label>{t('beautyRoutines.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('beautyRoutines.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('beautyRoutines.frequency.label')}</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('beautyRoutines.frequency.daily')}</SelectItem>
                    <SelectItem value="weekly">{t('beautyRoutines.frequency.weekly')}</SelectItem>
                    <SelectItem value="monthly">{t('beautyRoutines.frequency.monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('beautyRoutines.time.label')}</Label>
                <Select
                  value={formData.time_of_day}
                  onValueChange={(value: any) => setFormData({ ...formData, time_of_day: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{t('beautyRoutines.time.morning')}</SelectItem>
                    <SelectItem value="evening">{t('beautyRoutines.time.evening')}</SelectItem>
                    <SelectItem value="both">{t('beautyRoutines.time.both')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="mb-2 block">{t('beautyRoutines.addProduct')}</Label>
              <div className="space-y-3">
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder={t('beautyRoutines.productName')}
                />
                <Input
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                  placeholder={t('beautyRoutines.productNotes')}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('product-image')?.click()}
                    disabled={uploadingImage}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? t('beautyRoutines.uploading') : t('beautyRoutines.uploadImage')}
                  </Button>
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button type="button" onClick={handleAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('beautyRoutines.add')}
                  </Button>
                </div>
                {newProduct.image_url && (
                  <img src={newProduct.image_url} alt="Preview" className="w-20 h-20 rounded object-cover" />
                )}
              </div>
            </div>

            {products.length > 0 && (
              <div className="space-y-2">
                <Label>{t('beautyRoutines.products')}</Label>
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      {product.image_url && (
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.notes && <p className="text-xs text-muted-foreground">{product.notes}</p>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
