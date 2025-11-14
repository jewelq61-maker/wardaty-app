import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Plus, Trash2, Edit2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SharedEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  created_by: string;
}

interface CycleDay {
  date: string;
  flow: string | null;
  mood: string | null;
}

interface SharedCalendarProps {
  shareLinkId: string;
  partnerId: string;
  partnerName: string;
}

export default function SharedCalendar({ shareLinkId, partnerId, partnerName }: SharedCalendarProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<SharedEvent[]>([]);
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [latestCycle, setLatestCycle] = useState<any>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    event_type: 'reminder',
  });

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth, shareLinkId, partnerId]);

  const loadCalendarData = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    // Load shared events
    const { data: eventsData } = await supabase
      .from('shared_events')
      .select('*')
      .eq('share_link_id', shareLinkId)
      .gte('event_date', format(start, 'yyyy-MM-dd'))
      .lte('event_date', format(end, 'yyyy-MM-dd'))
      .order('event_date');

    if (eventsData) setEvents(eventsData);

    // Load partner's cycle days
    const { data: cycleDaysData } = await supabase
      .from('cycle_days')
      .select('date, flow, mood')
      .eq('user_id', partnerId)
      .gte('date', format(start, 'yyyy-MM-dd'))
      .lte('date', format(end, 'yyyy-MM-dd'));

    if (cycleDaysData) setCycleDays(cycleDaysData);

    // Load partner's latest cycle
    const { data: cycleData } = await supabase
      .from('cycles')
      .select('start_date, length, duration')
      .eq('user_id', partnerId)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cycleData) setLatestCycle(cycleData);
  };

  const handleAddEvent = async () => {
    if (!user || !newEvent.title.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('shared_events')
        .insert({
          share_link_id: shareLinkId,
          title: newEvent.title,
          description: newEvent.description || null,
          event_date: newEvent.event_date,
          event_type: newEvent.event_type,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('sharedCalendar.eventAdded'),
      });

      setShowAddEvent(false);
      setNewEvent({
        title: '',
        description: '',
        event_date: format(new Date(), 'yyyy-MM-dd'),
        event_type: 'reminder',
      });
      loadCalendarData();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('sharedCalendar.addEventError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('shared_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('sharedCalendar.eventDeleted'),
      });

      loadCalendarData();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('sharedCalendar.deleteEventError'),
        variant: 'destructive',
      });
    }
  };

  const getDayInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check for events
    const dayEvents = events.filter(e => e.event_date === dateStr);
    
    // Check for cycle day
    const cycleDay = cycleDays.find(c => c.date === dateStr);
    
    // Calculate cycle phase if in active cycle
    let cyclePhase = null;
    if (latestCycle && latestCycle.start_date) {
      const startDate = parseISO(latestCycle.start_date);
      const daysSinceStart = differenceInDays(date, startDate) + 1;
      const cycleLength = latestCycle.length || 28;
      
      if (daysSinceStart > 0 && daysSinceStart <= cycleLength) {
        const duration = latestCycle.duration || 5;
        if (daysSinceStart <= duration) {
          cyclePhase = 'menstrual';
        } else if (daysSinceStart <= 13) {
          cyclePhase = 'follicular';
        } else if (daysSinceStart <= 17) {
          cyclePhase = 'ovulation';
        } else {
          cyclePhase = 'luteal';
        }
      }
    }
    
    return { events: dayEvents, cycleDay, cyclePhase };
  };

  const renderDayContent = (date: Date) => {
    const { events: dayEvents, cycleDay, cyclePhase } = getDayInfo(date);
    
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
        <div className="text-sm">{format(date, 'd')}</div>
        <div className="flex gap-1 mt-1">
          {cyclePhase && (
            <div
              className={`w-2 h-2 rounded-full ${
                cyclePhase === 'menstrual'
                  ? 'bg-destructive'
                  : cyclePhase === 'follicular'
                  ? 'bg-info'
                  : cyclePhase === 'ovulation'
                  ? 'bg-warning'
                  : 'bg-primary'
              }`}
              title={t(`home.${cyclePhase}`)}
            />
          )}
          {dayEvents.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-success" title={`${dayEvents.length} ${t('sharedCalendar.events')}`} />
          )}
        </div>
      </div>
    );
  };

  const selectedDateEvents = events.filter(e => e.event_date === format(selectedDate, 'yyyy-MM-dd'));
  const selectedDateInfo = getDayInfo(selectedDate);

  return (
    <Card className="glass shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {t('sharedCalendar.title')}
          </CardTitle>
          <Button onClick={() => setShowAddEvent(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {t('sharedCalendar.addEvent')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {t('sharedCalendar.description', { name: partnerName })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            onMonthChange={setCurrentMonth}
            locale={i18n.language === 'ar' ? ar : undefined}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => renderDayContent(date),
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>{t('home.menstrual')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-info" />
            <span>{t('home.follicular')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>{t('home.ovulation')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>{t('home.luteal')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>{t('sharedCalendar.sharedEvent')}</span>
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium">
              {format(selectedDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })}
            </h4>
            
            {selectedDateInfo.cyclePhase && (
              <Badge className="bg-primary/10 text-primary">
                {t(`home.${selectedDateInfo.cyclePhase}`)}
              </Badge>
            )}

            {selectedDateEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {t(`sharedCalendar.${event.event_type}`)}
                        </Badge>
                      </div>
                      {event.created_by === user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('sharedCalendar.noEvents')}</p>
            )}
          </div>
        )}
      </CardContent>

      {/* Add Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sharedCalendar.addNewEvent')}</DialogTitle>
            <DialogDescription>
              {t('sharedCalendar.addEventDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('sharedCalendar.eventTitle')}</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder={t('sharedCalendar.eventTitlePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('sharedCalendar.eventDescription')}</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder={t('sharedCalendar.eventDescriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t('sharedCalendar.eventDate')}</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t('sharedCalendar.eventType')}</Label>
              <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">{t('sharedCalendar.reminder')}</SelectItem>
                  <SelectItem value="appointment">{t('sharedCalendar.appointment')}</SelectItem>
                  <SelectItem value="note">{t('sharedCalendar.note')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEvent} disabled={loading || !newEvent.title.trim()} className="flex-1">
                {t('sharedCalendar.add')}
              </Button>
              <Button onClick={() => setShowAddEvent(false)} variant="outline">
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
