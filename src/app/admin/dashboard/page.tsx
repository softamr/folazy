
// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText, CheckCircle, AlertCircle, Hourglass, BarChart3, Loader2, Package } from 'lucide-react'; // Assuming Package for Sold
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
  soldListings: number;
}

const translations = {
  en: {
    pageTitle: "Admin Dashboard",
    manageUsersButton: "Manage Users",
    manageListingsButton: "Manage Listings",
    totalUsersTitle: "Total Users",
    totalUsersDesc: "Registered users on the platform",
    totalListingsTitle: "Total Listings",
    totalListingsDesc: "Across all statuses",
    pendingApprovalTitle: "Pending Approval",
    pendingApprovalDesc: "Listings awaiting review",
    approvedListingsTitle: "Approved Listings",
    approvedListingsDesc: "Currently live on the site",
    rejectedListingsTitle: "Rejected Listings",
    rejectedListingsDesc: "Not approved for display",
    soldListingsTitle: "Sold Listings",
    soldListingsDesc: "Listings marked as sold",
    platformOverviewTitle: "Platform Overview",
    platformOverviewDesc: "Key metrics and quick actions for platform management.",
    platformOverviewContent: "This area can be expanded with more detailed statistics, charts (e.g., using ShadCN charts), and quick access tools for common administrative tasks.",
    analyticsComingSoonTitle: "Analytics & Reports Section (Coming Soon)",
    analyticsComingSoonDesc: "Consider adding charts for listings over time, user growth, popular categories, etc.",
    loadingDashboardData: "Loading dashboard data...",
    errorFetchingStatsTitle: "Error Fetching Stats",
    errorFetchingStatsDesc: "Could not load dashboard data. Please try again later.",
  },
  ar: {
    pageTitle: "لوحة تحكم المشرف",
    manageUsersButton: "إدارة المستخدمين",
    manageListingsButton: "إدارة الإعلانات",
    totalUsersTitle: "إجمالي المستخدمين",
    totalUsersDesc: "المستخدمون المسجلون على المنصة",
    totalListingsTitle: "إجمالي الإعلانات",
    totalListingsDesc: "عبر جميع الحالات",
    pendingApprovalTitle: "بانتظار الموافقة",
    pendingApprovalDesc: "الإعلانات التي تنتظر المراجعة",
    approvedListingsTitle: "الإعلانات المعتمدة",
    approvedListingsDesc: "معروضة حاليًا على الموقع",
    rejectedListingsTitle: "الإعلانات المرفوضة",
    rejectedListingsDesc: "غير معتمدة للعرض",
    soldListingsTitle: "الإعلانات المباعة",
    soldListingsDesc: "الإعلانات التي تم تحديدها كمباعة",
    platformOverviewTitle: "نظرة عامة على المنصة",
    platformOverviewDesc: "المقاييس الرئيسية والأدوات السريعة لإدارة المنصة.",
    platformOverviewContent: "يمكن توسيع هذه المنطقة بإحصائيات أكثر تفصيلاً ورسوم بيانية (باستخدام رسوم ShadCN البيانية مثلاً) وأدوات وصول سريع للمهام الإدارية الشائعة.",
    analyticsComingSoonTitle: "قسم التحليلات والتقارير (قريباً)",
    analyticsComingSoonDesc: "فكر في إضافة رسوم بيانية للإعلانات بمرور الوقت، نمو المستخدمين، الفئات الشائعة، إلخ.",
    loadingDashboardData: "جار تحميل بيانات لوحة التحكم...",
    errorFetchingStatsTitle: "خطأ في جلب الإحصائيات",
    errorFetchingStatsDesc: "لم نتمكن من تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى لاحقًا.",
  }
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0,
    soldListings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const usersCollectionRef = collection(db, 'users');
        const listingsCollectionRef = collection(db, 'listings');

        const usersSnapshot = await getCountFromServer(usersCollectionRef);
        const allListingsSnapshot = await getCountFromServer(listingsCollectionRef);
        
        const pendingListingsQuery = query(listingsCollectionRef, where('status', '==', 'pending'));
        const pendingListingsSnapshot = await getCountFromServer(pendingListingsQuery);
        
        const approvedListingsQuery = query(listingsCollectionRef, where('status', '==', 'approved'));
        const approvedListingsSnapshot = await getCountFromServer(approvedListingsQuery);
        
        const rejectedListingsQuery = query(listingsCollectionRef, where('status', '==', 'rejected'));
        const rejectedListingsSnapshot = await getCountFromServer(rejectedListingsQuery);

        const soldListingsQuery = query(listingsCollectionRef, where('status', '==', 'sold'));
        const soldListingsSnapshot = await getCountFromServer(soldListingsQuery);

        setStats({
          totalUsers: usersSnapshot.data().count,
          totalListings: allListingsSnapshot.data().count,
          pendingListings: pendingListingsSnapshot.data().count,
          approvedListings: approvedListingsSnapshot.data().count,
          rejectedListings: rejectedListingsSnapshot.data().count,
          soldListings: soldListingsSnapshot.data().count,
        });

      } catch (error) {
        console.error("Error fetching dashboard stats: ", error);
        toast({
          title: t.errorFetchingStatsTitle,
          description: t.errorFetchingStatsDesc,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast, t]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingDashboardData}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t.pageTitle}</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/admin/users"><Users className="me-2 h-4 w-4"/>{t.manageUsersButton}</Link>
            </Button>
            <Button asChild>
                <Link href="/admin/listings"><FileText className="me-2 h-4 w-4"/>{t.manageListingsButton}</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalUsersTitle}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{t.totalUsersDesc}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalListingsTitle}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">{t.totalListingsDesc}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pendingApprovalTitle}</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingListings}</div>
            <p className="text-xs text-muted-foreground">{t.pendingApprovalDesc}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.approvedListingsTitle}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedListings}</div>
            <p className="text-xs text-muted-foreground">{t.approvedListingsDesc}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.rejectedListingsTitle}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedListings}</div>
            <p className="text-xs text-muted-foreground">{t.rejectedListingsDesc}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.soldListingsTitle}</CardTitle>
            <Package className="h-4 w-4 text-blue-500" /> {}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldListings}</div>
            <p className="text-xs text-muted-foreground">{t.soldListingsDesc}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 me-2"/>
                {t.platformOverviewTitle}
            </CardTitle>
            <CardDescription>{t.platformOverviewDesc}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                {t.platformOverviewContent}
            </p>
            <div className="mt-6 p-8 text-center border-2 border-dashed rounded-lg">
                <p className="text-lg font-medium text-muted-foreground">{t.analyticsComingSoonTitle}</p>
                 <p className="text-sm text-muted-foreground mt-2">{t.analyticsComingSoonDesc}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
