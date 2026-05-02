import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { CompanyInfoSection } from '@/components/home/CompanyInfoSection';
import { OrgChartSection } from '@/components/home/OrgChartSection';
import { DepartmentTabsSection } from '@/components/home/DepartmentTabsSection';
import { EmergencyFooter } from '@/components/home/EmergencyFooter';
import { useChecklist } from '@/context/ChecklistContext';
import { currentUser } from '@/data/mockData';
import { User } from '@/types/onboarding';

export default function Home() {
  const navigate = useNavigate();
  const [activeUser, setActiveUser] = useState<User>(currentUser);
  const { items: allItems } = useChecklist();

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (!stored) {
      navigate('/login');
      return;
    }
    setActiveUser(JSON.parse(stored));
  }, [navigate]);

  const progress = useMemo(() => {
    const userItems = allItems.filter((i) => i.userId === activeUser.id);
    if (userItems.length === 0) return 0;
    const done = userItems.filter((i) => i.status === 'complete').length;
    return Math.round((done / userItems.length) * 100);
  }, [allItems, activeUser.id]);

  return (
    <AppLayout user={activeUser}>
      <div className="relative">
        <HeroSection user={activeUser} progress={progress} />
        <CompanyInfoSection />
        <OrgChartSection />
        <DepartmentTabsSection />
        <EmergencyFooter />
      </div>
    </AppLayout>
  );
}
