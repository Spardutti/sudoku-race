import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { createServerClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileCalendar } from "@/components/profile/ProfileCalendar";
import { ProfileStreak } from "@/components/profile/ProfileStreak";
import { ProfileStatsSkeleton } from "@/components/profile/ProfileStatsSkeleton";
import { ProfileCalendarSkeleton } from "@/components/profile/ProfileCalendarSkeleton";
import { ProfileStreakSkeleton } from "@/components/profile/ProfileStreakSkeleton";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.profile' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ProfilePage() {
  const t = await getTranslations('profile');
  const tAuth = await getTranslations('auth');
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect(`/?message=${encodeURIComponent(tAuth('signInRequired'))}`);
  }

  const supabase = await createServerClient();

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("username, email, created_at, oauth_provider")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    redirect(`/?message=${encodeURIComponent(t('failedToLoad'))}`);
  }

  return (
    <>
      <ProfileHeader
        user={{
          username: userData.username,
          email: userData.email,
          createdAt: userData.created_at,
          oauthProvider: userData.oauth_provider,
        }}
      />

      <div className="container max-w-4xl mx-auto px-4 pb-8 space-y-6">
        <Suspense fallback={<ProfileStatsSkeleton />}>
          <ProfileStats userId={userId} />
        </Suspense>

        <Suspense fallback={<ProfileStreakSkeleton />}>
          <ProfileStreak userId={userId} />
        </Suspense>

        <Suspense fallback={<ProfileCalendarSkeleton />}>
          <ProfileCalendar userId={userId} />
        </Suspense>

        <Card className="p-6 space-y-4">
          <Typography variant="h2" className="text-2xl">
            {t('accountActions')}
          </Typography>

          <div className="flex flex-col gap-3 sm:flex-row">
            <LogoutButton />
          </div>
        </Card>

        <DeleteAccountButton userId={userId} />
      </div>
    </>
  );
}
