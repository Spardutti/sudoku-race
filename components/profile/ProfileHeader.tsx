"use client";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useTranslations } from "next-intl";

interface ProfileHeaderProps {
  user: {
    username: string;
    email: string;
    createdAt: string;
    oauthProvider: string;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const t = useTranslations('profile');
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const providerDisplay: Record<string, { name: string; icon: string }> = {
    google: { name: "Google", icon: "🔵" },
    github: { name: "GitHub", icon: "⚫" },
    apple: { name: "Apple", icon: "🍎" },
  };

  const provider = providerDisplay[user.oauthProvider] || {
    name: user.oauthProvider,
    icon: "🔑",
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Typography variant="h1" className="mb-8">
        {t('title')}
      </Typography>

      <Card className="p-6 space-y-4">
        <Typography variant="h2" className="text-2xl">
          {t('accountInfo')}
        </Typography>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">
              {t('username')}
            </p>
            <p className="font-medium">
              {user.username}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              {t('email')}
            </p>
            <p className="font-mono text-sm">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              {t('memberSince')}
            </p>
            <p>{memberSince}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              {t('authProvider')}
            </p>
            <p>
              {provider.icon} {provider.name}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
