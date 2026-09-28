import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileSection } from './ProfileSection';
import { PasswordSection } from './PasswordSection';
import { DangerZone } from './DangerZone';

export function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Account" description="Manage your profile, sign-in details, and data." />
      <ProfileSection />
      <PasswordSection />
      <DangerZone />
    </div>
  );
}
