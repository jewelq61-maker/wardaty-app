import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/db/client';
import { profiles, cycles, cycleDays, beautyActions, fastingEntries, daughters, shareLinks } from '@/db/schema';
import { sql, count, eq, lt, and, gte } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { format, subDays, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Database, 
  Trash2, 
  Users, 
  Calendar,
  Heart,
  Activity,
  TrendingUp,
  UserPlus,
  RefreshCw,
  BarChart3,
  HardDrive,
  Sparkles,
  Baby,
  Share2,
  Shield,
  Search
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface UserStats {
  id: string;
  email: string;
  name: string | null;
  persona: string;
  isPremium: boolean;
  createdAt: Date;
  cyclesCount: number;
  daysLogged: number;
  beautyActionsCount: number;
}

interface DBStats {
  totalUsers: number;
  totalCycles: number;
  totalCycleDays: number;
  totalBeautyActions: number;
  totalFastingEntries: number;
  totalDaughters: number;
  totalShareLinks: number;
  premiumUsers: number;
  activeUsersLast30Days: number;
  newUsersLast7Days: number;
  dbSize: string;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DBStats>({
    totalUsers: 0,
    totalCycles: 0,
    totalCycleDays: 0,
    totalBeautyActions: 0,
    totalFastingEntries: 0,
    totalDaughters: 0,
    totalShareLinks: 0,
    premiumUsers: 0,
    activeUsersLast30Days: 0,
    newUsersLast7Days: 0,
    dbSize: '0 KB',
  });
  const [users, setUsers] = useState<UserStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cleanupRunning, setCleanupRunning] = useState(false);

  // Simple admin check - in production, add isAdmin field to profiles table
  const isAdmin = user?.email === 'a@domo.com';

  useEffect(() => {
    if (user && isAdmin) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get all counts
      const usersCount = db.select({ count: count() }).from(profiles).get()?.count || 0;
      const cyclesCount = db.select({ count: count() }).from(cycles).get()?.count || 0;
      const cycleDaysCount = db.select({ count: count() }).from(cycleDays).get()?.count || 0;
      const beautyActionsCount = db.select({ count: count() }).from(beautyActions).get()?.count || 0;
      const fastingEntriesCount = db.select({ count: count() }).from(fastingEntries).get()?.count || 0;
      const daughtersCount = db.select({ count: count() }).from(daughters).get()?.count || 0;
      const shareLinksCount = db.select({ count: count() }).from(shareLinks).get()?.count || 0;

      // Premium users
      const premiumCount = db.select({ count: count() })
        .from(profiles)
        .where(eq(profiles.isPremium, true))
        .get()?.count || 0;

      // Active users (last 30 days) - users with cycle days in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = db.select({ userId: cycleDays.userId })
        .from(cycleDays)
        .where(gte(cycleDays.date, thirtyDaysAgo.toISOString().split('T')[0]))
        .groupBy(cycleDays.userId)
        .all();

      // New users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newUsersCount = db.select({ count: count() })
        .from(profiles)
        .where(gte(profiles.createdAt, sevenDaysAgo))
        .get()?.count || 0;

      // Get detailed user stats
      const allUsers = db.select().from(profiles).all();
      const userStatsData: UserStats[] = allUsers.map(user => {
        const userCyclesCount = db.select({ count: count() })
          .from(cycles)
          .where(eq(cycles.userId, user.id))
          .get()?.count || 0;

        const userDaysCount = db.select({ count: count() })
          .from(cycleDays)
          .where(eq(cycleDays.userId, user.id))
          .get()?.count || 0;

        const userBeautyCount = db.select({ count: count() })
          .from(beautyActions)
          .where(eq(beautyActions.userId, user.id))
          .get()?.count || 0;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          persona: user.persona,
          isPremium: user.isPremium,
          createdAt: user.createdAt,
          cyclesCount: userCyclesCount,
          daysLogged: userDaysCount,
          beautyActionsCount: userBeautyCount,
        };
      });

      // Estimate DB size (rough calculation)
      const totalRecords = usersCount + cyclesCount + cycleDaysCount + beautyActionsCount + 
                          fastingEntriesCount + daughtersCount + shareLinksCount;
      const estimatedKB = totalRecords * 0.5; // Rough estimate: 0.5KB per record
      const dbSize = estimatedKB < 1024 
        ? `${estimatedKB.toFixed(0)} KB`
        : `${(estimatedKB / 1024).toFixed(2)} MB`;

      setStats({
        totalUsers: usersCount,
        totalCycles: cyclesCount,
        totalCycleDays: cycleDaysCount,
        totalBeautyActions: beautyActionsCount,
        totalFastingEntries: fastingEntriesCount,
        totalDaughters: daughtersCount,
        totalShareLinks: shareLinksCount,
        premiumUsers: premiumCount,
        activeUsersLast30Days: activeUsers.length,
        newUsersLast7Days: newUsersCount,
        dbSize,
      });

      setUsers(userStatsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات لوحة التحكم',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    try {
      setCleanupRunning(true);
      
      const startTime = Date.now();
      let deletedCount = 0;

      // Delete old completed beauty actions (older than 90 days)
      const ninetyDaysAgo = subDays(new Date(), 90).toISOString().split('T')[0];
      const beautyDeleted = db.delete(beautyActions)
        .where(
          and(
            eq(beautyActions.completed, true),
            lt(beautyActions.scheduledAt, ninetyDaysAgo)
          )
        )
        .run();
      deletedCount += beautyDeleted.changes;

      // Delete old completed fasting entries (older than 1 year)
      const oneYearAgo = subMonths(new Date(), 12).toISOString().split('T')[0];
      const fastingDeleted = db.delete(fastingEntries)
        .where(
          and(
            eq(fastingEntries.isCompleted, true),
            lt(fastingEntries.date, oneYearAgo)
          )
        )
        .run();
      deletedCount += fastingDeleted.changes;

      // Delete expired share links
      const now = new Date();
      const expiredLinks = db.delete(shareLinks)
        .where(lt(shareLinks.expiresAt, now))
        .run();
      deletedCount += expiredLinks.changes;

      const executionTime = Date.now() - startTime;

      toast({
        title: 'اكتمل التنظيف',
        description: `تم حذف ${deletedCount} سجل في ${executionTime}ms`,
      });

      // Reload data
      await loadDashboardData();
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تشغيل عملية التنظيف',
        variant: 'destructive',
      });
    } finally {
      setCleanupRunning(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 pb-24">
          <div className="flex justify-center items-center min-h-[60vh]">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 pb-24">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                غير مصرح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ليس لديك صلاحيات للوصول إلى لوحة تحكم المسؤول.
              </p>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20" dir="rtl">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="w-8 h-8 text-primary" />
              لوحة تحكم المسؤول
            </h1>
            <p className="text-muted-foreground mt-1">
              إحصائيات ومعلومات النظام والمستخدمين
            </p>
          </div>
          <Button onClick={runCleanup} disabled={cleanupRunning} variant="destructive">
            <Trash2 className={`w-4 h-4 ml-2 ${cleanupRunning ? 'animate-spin' : ''}`} />
            تنظيف قاعدة البيانات
          </Button>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                المستخدمون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.premiumUsers} مميز
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                نشط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsersLast30Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                آخر 30 يوم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-500" />
                جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newUsersLast7Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                آخر 7 أيام
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-500" />
                الدورات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCycles}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalCycleDays} يوم مسجل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                الجمال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBeautyActions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                إجراءات جمال
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-orange-500" />
                حجم DB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dbSize}</div>
              <p className="text-xs text-muted-foreground mt-1">
                تقديري
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                إدخالات الصيام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFastingEntries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                قضاء الصيام المسجل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Baby className="w-4 h-4 text-purple-500" />
                البنات المسجلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDaughters}</div>
              <p className="text-xs text-muted-foreground mt-1">
                من قبل الأمهات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-500" />
                روابط المشاركة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalShareLinks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                للأزواج والشركاء
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Management */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة المستخدمين</CardTitle>
                    <CardDescription>
                      عرض وإدارة جميع مستخدمي التطبيق
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="بحث بالبريد أو الاسم..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 w-64"
                      />
                    </div>
                    <Button onClick={loadDashboardData} variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">الشخصية</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الدورات</TableHead>
                        <TableHead className="text-right">الأيام المسجلة</TableHead>
                        <TableHead className="text-right">إجراءات الجمال</TableHead>
                        <TableHead className="text-right">تاريخ الانضمام</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            لا توجد نتائج
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>{user.name || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {user.persona === 'single' && 'عزباء'}
                                {user.persona === 'married' && 'متزوجة'}
                                {user.persona === 'mother' && 'أم'}
                                {user.persona === 'partner' && 'شريك'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.isPremium && (
                                <Badge className="bg-yellow-500">
                                  <Sparkles className="w-3 h-3 ml-1" />
                                  مميز
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">{user.cyclesCount}</TableCell>
                            <TableCell className="text-center">{user.daysLogged}</TableCell>
                            <TableCell className="text-center">{user.beautyActionsCount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ar })}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  تحليلات الاستخدام
                </CardTitle>
                <CardDescription>
                  إحصائيات مفصلة عن استخدام التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">توزيع الشخصيات</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['single', 'married', 'mother', 'partner'].map((persona) => {
                        const count = users.filter(u => u.persona === persona).length;
                        const percentage = users.length > 0 ? (count / users.length * 100).toFixed(1) : 0;
                        return (
                          <Card key={persona}>
                            <CardContent className="pt-4">
                              <div className="text-2xl font-bold">{count}</div>
                              <div className="text-sm text-muted-foreground">
                                {persona === 'single' && 'عزباء'}
                                {persona === 'married' && 'متزوجة'}
                                {persona === 'mother' && 'أم'}
                                {persona === 'partner' && 'شريك'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {percentage}%
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">متوسط الاستخدام</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-pink-500" />
                            <span className="text-sm text-muted-foreground">الدورات لكل مستخدم</span>
                          </div>
                          <div className="text-2xl font-bold">
                            {users.length > 0 
                              ? (stats.totalCycles / users.length).toFixed(1)
                              : '0'
                            }
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">الأيام المسجلة لكل مستخدم</span>
                          </div>
                          <div className="text-2xl font-bold">
                            {users.length > 0 
                              ? (stats.totalCycleDays / users.length).toFixed(1)
                              : '0'
                            }
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-muted-foreground">إجراءات الجمال لكل مستخدم</span>
                          </div>
                          <div className="text-2xl font-bold">
                            {users.length > 0 
                              ? (stats.totalBeautyActions / users.length).toFixed(1)
                              : '0'
                            }
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">معدل التحويل إلى Premium</h3>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold">
                              {users.length > 0 
                                ? ((stats.premiumUsers / users.length) * 100).toFixed(1)
                                : '0'
                              }%
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {stats.premiumUsers} من {users.length} مستخدم
                            </p>
                          </div>
                          <TrendingUp className="w-12 h-12 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              معلومات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">قاعدة البيانات</span>
              <span className="font-medium">SQLite (better-sqlite3)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">ORM</span>
              <span className="font-medium">Drizzle ORM</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">المصادقة</span>
              <span className="font-medium">Local (bcryptjs)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">حجم قاعدة البيانات المقدر</span>
              <span className="font-medium">{stats.dbSize}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">إجمالي السجلات</span>
              <span className="font-medium">
                {(stats.totalUsers + stats.totalCycles + stats.totalCycleDays + 
                  stats.totalBeautyActions + stats.totalFastingEntries + 
                  stats.totalDaughters + stats.totalShareLinks).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
