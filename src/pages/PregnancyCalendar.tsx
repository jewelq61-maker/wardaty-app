import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Calendar as CalendarIcon,
  Plus,
  ArrowLeft,
  Pill,
  Syringe,
  Stethoscope,
  FlaskConical,
  FileText,
  Edit,
  Trash2,
  Weight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import { format, differenceInDays, differenceInWeeks, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PremiumPaywall from '@/components/PremiumPaywall';
import { appointmentSchema, medicineSchema } from '@/lib/validation';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string | null;
  appointment_type: string;
  title: string;
  notes: string | null;
  completed: boolean;
}

interface Medicine {
  id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

interface WeightLog {
  id: string;
  log_date: string;
  weight_kg: number;
  notes: string | null;
}

export default function PregnancyCalendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pregnancyData, setPregnancyData] = useState<{
    lmp: string | null;
    edd: string | null;
    is_pregnant: boolean;
  }>({ lmp: null, edd: null, is_pregnant: false });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'appointment' | 'medicine' | 'weight'>('appointment');
  const [editingItem, setEditingItem] = useState<Appointment | Medicine | WeightLog | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [appointmentForm, setAppointmentForm] = useState({
    date: new Date(),
    time: '',
    type: 'doctor_visit',
    title: '',
    notes: '',
  });

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date(),
    endDate: null as Date | null,
    notes: '',
  });

  const [weightForm, setWeightForm] = useState({
    date: new Date(),
    weight: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([
      loadPregnancyData(),
      loadPremiumStatus(),
      loadAppointments(),
      loadMedicines(),
      loadWeightLogs(),
    ]);
    setLoading(false);
  };

  const loadPregnancyData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('is_pregnant, pregnancy_lmp, pregnancy_edd')
      .eq('id', user.id)
      .single();

    if (data) {
      setPregnancyData({
        is_pregnant: data.is_pregnant,
        lmp: data.pregnancy_lmp,
        edd: data.pregnancy_edd,
      });

      if (!data.is_pregnant) {
        navigate('/');
      }
    }
  };

  const loadPremiumStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (data) {
      setIsPremium(data.is_premium);
    }
  };

  const loadAppointments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('pregnancy_appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true });

    if (data) {
      setAppointments(data);
    }
  };

  const loadMedicines = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('pregnancy_medicines')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true });

    if (data) {
      setMedicines(data);
    }
  };

  const loadWeightLogs = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('pregnancy_weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false });

    if (data) {
      setWeightLogs(data);
    }
  };

  const calculateGestationalAge = () => {
    if (!pregnancyData.lmp) return { weeks: 0, days: 0 };
    
    const lmpDate = new Date(pregnancyData.lmp);
    const today = selectedDate;
    const totalDays = differenceInDays(today, lmpDate);
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    
    return { weeks, days };
  };

  const getTrimester = (weeks: number): number => {
    if (weeks < 14) return 1;
    if (weeks < 28) return 2;
    return 3;
  };

  const getDaysUntilDue = () => {
    if (!pregnancyData.edd) return 0;
    return differenceInDays(new Date(pregnancyData.edd), selectedDate);
  };

  const handleAddAppointment = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    setDialogType('appointment');
    setEditingItem(null);
    setAppointmentForm({
      date: selectedDate,
      time: '',
      type: 'doctor_visit',
      title: '',
      notes: '',
    });
    setShowAddDialog(true);
  };

  const handleAddMedicine = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    setDialogType('medicine');
    setEditingItem(null);
    setMedicineForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: selectedDate,
      endDate: null,
      notes: '',
    });
    setShowAddDialog(true);
  };

  const handleAddWeight = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    setDialogType('weight');
    setEditingItem(null);
    setWeightForm({
      date: selectedDate,
      weight: '',
      notes: '',
    });
    setShowAddDialog(true);
  };

  const saveAppointment = async () => {
    if (!user) return;

    // Validate input using schema
    const validationResult = appointmentSchema.safeParse({
      title: appointmentForm.title,
      appointment_type: appointmentForm.type,
      appointment_date: appointmentForm.date,
      appointment_time: appointmentForm.time || '',
      notes: appointmentForm.notes || ''
    });

    if (!validationResult.success) {
      toast({
        title: t('common.error'),
        description: validationResult.error.errors[0]?.message || t('pregnancy.fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    const appointmentData = {
      user_id: user.id,
      appointment_date: format(validationResult.data.appointment_date, 'yyyy-MM-dd'),
      appointment_time: validationResult.data.appointment_time || null,
      appointment_type: validationResult.data.appointment_type,
      title: validationResult.data.title,
      notes: validationResult.data.notes || null,
      completed: false,
    };

    if (editingItem && 'appointment_type' in editingItem) {
      const { error } = await supabase
        .from('pregnancy_appointments')
        .update(appointmentData)
        .eq('id', editingItem.id);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('pregnancy.errorUpdating'),
          variant: 'destructive',
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('pregnancy_appointments')
        .insert(appointmentData);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('pregnancy.errorAdding'),
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: t('common.success'),
      description: t('pregnancy.appointmentSaved'),
    });

    setShowAddDialog(false);
    loadAppointments();
  };

  const saveMedicine = async () => {
    if (!user) return;

    // Validate input using schema
    const validationResult = medicineSchema.safeParse({
      medicine_name: medicineForm.name,
      dosage: medicineForm.dosage || '',
      frequency: medicineForm.frequency || '',
      start_date: medicineForm.startDate,
      end_date: medicineForm.endDate || undefined,
      notes: medicineForm.notes || ''
    });

    if (!validationResult.success) {
      toast({
        title: t('common.error'),
        description: validationResult.error.errors[0]?.message || t('pregnancy.fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    const medicineData = {
      user_id: user.id,
      medicine_name: validationResult.data.medicine_name,
      dosage: validationResult.data.dosage || null,
      frequency: validationResult.data.frequency || null,
      start_date: format(validationResult.data.start_date, 'yyyy-MM-dd'),
      end_date: validationResult.data.end_date ? format(validationResult.data.end_date, 'yyyy-MM-dd') : null,
      notes: validationResult.data.notes || null,
    };

    if (editingItem && 'medicine_name' in editingItem) {
      const { error } = await supabase
        .from('pregnancy_medicines')
        .update(medicineData)
        .eq('id', editingItem.id);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('pregnancy.errorUpdating'),
          variant: 'destructive',
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('pregnancy_medicines')
        .insert(medicineData);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('pregnancy.errorAdding'),
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: t('common.success'),
      description: t('pregnancy.medicineSaved'),
    });

    setShowAddDialog(false);
    loadMedicines();
  };

  const saveWeight = async () => {
    if (!user) return;

    const weight = parseFloat(weightForm.weight);
    if (!weight || weight <= 0 || weight >= 500) {
      toast({
        title: t('common.error'),
        description: t('pregnancy.invalidWeight'),
        variant: 'destructive',
      });
      return;
    }

    const weightData = {
      user_id: user.id,
      log_date: format(weightForm.date, 'yyyy-MM-dd'),
      weight_kg: weight,
      notes: weightForm.notes || null,
    };

    const { error } = await supabase
      .from('pregnancy_weight_logs')
      .insert(weightData);

    if (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('common.success'),
      description: t('pregnancy.weightAdded'),
    });

    setShowAddDialog(false);
    loadWeightLogs();
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase
      .from('pregnancy_appointments')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({
        title: t('common.success'),
        description: t('pregnancy.deleted'),
      });
      loadAppointments();
    }
  };

  const deleteMedicine = async (id: string) => {
    const { error } = await supabase
      .from('pregnancy_medicines')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({
        title: t('common.success'),
        description: t('pregnancy.deleted'),
      });
      loadMedicines();
    }
  };

  const deleteWeight = async (id: string) => {
    const { error } = await supabase
      .from('pregnancy_weight_logs')
      .delete()
      .eq('id', id);

    if (!error) {
      toast({
        title: t('common.success'),
        description: t('pregnancy.weightDeleted'),
      });
      loadWeightLogs();
    }
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'doctor_visit':
        return <Stethoscope className="h-4 w-4" />;
      case 'ultrasound':
        return <FileText className="h-4 w-4" />;
      case 'vaccine':
        return <Syringe className="h-4 w-4" />;
      case 'lab_test':
        return <FlaskConical className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter((apt) => apt.appointment_date === dateStr);
  };

  const { weeks, days } = calculateGestationalAge();
  const trimester = getTrimester(weeks);
  const daysUntilDue = getDaysUntilDue();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!pregnancyData.is_pregnant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {showPaywall && (
        <PremiumPaywall
          open={showPaywall}
          onClose={() => setShowPaywall(false)}
          feature="pregnancy-calendar"
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Baby className="h-5 w-5 text-pink-500" />
            {t('pregnancy.calendar')}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Pregnancy Summary */}
        <Card className="glass-card border-2 border-pink-200 dark:border-pink-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('pregnancy.gestationalAge')}</p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {weeks}+{days}
                </p>
                <p className="text-xs text-muted-foreground">{t('pregnancy.weeks')}</p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('pregnancy.trimester')}</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {trimester}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`pregnancy.${trimester === 1 ? 'firstTrimester' : trimester === 2 ? 'secondTrimester' : 'thirdTrimester'}`)}
                </p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('pregnancy.daysUntilDue')}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {daysUntilDue}
                </p>
                <p className="text-xs text-muted-foreground">{t('pregnancy.daysRemaining')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className={cn('rounded-md border pointer-events-auto')}
              locale={ar}
              modifiers={{
                hasAppointment: (date) => getAppointmentsForDate(date).length > 0,
              }}
              modifiersStyles={{
                hasAppointment: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Selected Date Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'PPP', { locale: ar })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appointments">{t('pregnancy.appointments')}</TabsTrigger>
                <TabsTrigger value="medicines">{t('pregnancy.medicines')}</TabsTrigger>
                <TabsTrigger value="weight">{t('pregnancy.weight')}</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="space-y-4 mt-4">
                <Button onClick={handleAddAppointment} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pregnancy.addAppointment')}
                </Button>

                {getAppointmentsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getAppointmentsForDate(selectedDate).map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 bg-muted/50 rounded-lg border space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getAppointmentIcon(apt.appointment_type)}
                            <div>
                              <p className="font-semibold">{apt.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {apt.appointment_time || t('pregnancy.noTime')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAppointment(apt.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-muted-foreground">{apt.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {t('pregnancy.noAppointments')}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="medicines" className="space-y-4 mt-4">
                <Button onClick={handleAddMedicine} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pregnancy.addMedicine')}
                </Button>

                {medicines.length > 0 ? (
                  <div className="space-y-3">
                    {medicines.map((med) => (
                      <div
                        key={med.id}
                        className="p-4 bg-muted/50 rounded-lg border space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4" />
                            <div>
                              <p className="font-semibold">{med.medicine_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} - {med.frequency}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMedicine(med.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {med.notes && (
                          <p className="text-sm text-muted-foreground">{med.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {t('pregnancy.noMedicines')}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="weight" className="space-y-4 mt-4">
                <Button onClick={handleAddWeight} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pregnancy.addWeight')}
                </Button>

                {weightLogs.length > 0 ? (
                  <div className="space-y-3">
                    {weightLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="p-4 bg-muted/50 rounded-lg border space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{log.weight_kg} كغ</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(log.log_date), 'PPP', { locale: ar })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteWeight(log.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {t('pregnancy.noWeight')}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'appointment'
                ? t('pregnancy.addAppointment')
                : dialogType === 'medicine'
                ? t('pregnancy.addMedicine')
                : t('pregnancy.addWeight')}
            </DialogTitle>
          </DialogHeader>

          {dialogType === 'appointment' ? (
            <div className="space-y-4">
              <div>
                <Label>{t('pregnancy.appointmentTitle')}</Label>
                <Input
                  value={appointmentForm.title}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, title: e.target.value })
                  }
                  placeholder={t('pregnancy.appointmentTitlePlaceholder')}
                />
              </div>

              <div>
                <Label>{t('pregnancy.appointmentType')}</Label>
                <Select
                  value={appointmentForm.type}
                  onValueChange={(value) =>
                    setAppointmentForm({ ...appointmentForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor_visit">{t('pregnancy.doctorVisit')}</SelectItem>
                    <SelectItem value="ultrasound">{t('pregnancy.ultrasound')}</SelectItem>
                    <SelectItem value="vaccine">{t('pregnancy.vaccine')}</SelectItem>
                    <SelectItem value="lab_test">{t('pregnancy.labTest')}</SelectItem>
                    <SelectItem value="other">{t('pregnancy.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('pregnancy.time')}</Label>
                <Input
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, time: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>{t('pregnancy.notes')}</Label>
                <Textarea
                  value={appointmentForm.notes}
                  onChange={(e) =>
                    setAppointmentForm({ ...appointmentForm, notes: e.target.value })
                  }
                  placeholder={t('pregnancy.notesPlaceholder')}
                />
              </div>

              <Button onClick={saveMedicine} className="w-full">
                {t('common.save')}
              </Button>
            </div>
          ) : dialogType === 'medicine' ? (
            <div className="space-y-4">
              <div>
                <Label>{t('pregnancy.medicineName')}</Label>
                <Input
                  value={medicineForm.name}
                  onChange={(e) =>
                    setMedicineForm({ ...medicineForm, name: e.target.value })
                  }
                  placeholder={t('pregnancy.medicineNamePlaceholder')}
                />
              </div>

              <div>
                <Label>{t('pregnancy.dosage')}</Label>
                <Input
                  value={medicineForm.dosage}
                  onChange={(e) =>
                    setMedicineForm({ ...medicineForm, dosage: e.target.value })
                  }
                  placeholder={t('pregnancy.dosagePlaceholder')}
                />
              </div>

              <div>
                <Label>{t('pregnancy.frequency')}</Label>
                <Input
                  value={medicineForm.frequency}
                  onChange={(e) =>
                    setMedicineForm({ ...medicineForm, frequency: e.target.value })
                  }
                  placeholder={t('pregnancy.frequencyPlaceholder')}
                />
              </div>

              <div>
                <Label>{t('pregnancy.notes')}</Label>
                <Textarea
                  value={medicineForm.notes}
                  onChange={(e) =>
                    setMedicineForm({ ...medicineForm, notes: e.target.value })
                  }
                  placeholder={t('pregnancy.notesPlaceholder')}
                />
              </div>

              <Button onClick={saveMedicine} className="w-full">
                {t('common.save')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>{t('pregnancy.weightKg')}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weightForm.weight}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, weight: e.target.value })
                  }
                  placeholder={t('pregnancy.weightPlaceholder')}
                />
              </div>

              <div>
                <Label>{t('pregnancy.notes')}</Label>
                <Textarea
                  value={weightForm.notes}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, notes: e.target.value })
                  }
                  placeholder={t('pregnancy.notesPlaceholder')}
                />
              </div>

              <Button onClick={saveWeight} className="w-full">
                {t('common.save')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
