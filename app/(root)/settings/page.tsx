import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";
import SettingsSection from "@/components/settings/SettingsSection";
import ProfileForm from "@/components/settings/ProfileForm";
import PreferencesForm from "@/components/settings/PreferencesForm";
import DigestSwitch from "@/components/settings/DigestSwitch";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  // The session carries the Better Auth additional fields (preferences, digest).
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const { user } = session;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-title">Settings</h1>

      <SettingsSection title="Profile">
        <ProfileForm name={user.name} email={user.email} />
      </SettingsSection>

      <SettingsSection
        title="Preferences"
        description="Optional. Used to personalize your welcome email; the daily digest follows your watchlist."
      >
        <PreferencesForm
          defaults={{
            country: user.country ?? "",
            investmentGoals: user.investmentGoals ?? "",
            riskTolerance: user.riskTolerance ?? "",
            preferredIndustry: user.preferredIndustry ?? "",
          }}
        />
      </SettingsSection>

      <SettingsSection title="Email">
        {/* Missing means "on": accounts created before the switch existed. */}
        <DigestSwitch initialEnabled={user.digestEnabled !== false} />
        <p className="mt-4 text-sm text-fg-muted">
          Account emails (verification, password reset) are always sent.
        </p>
      </SettingsSection>
    </div>
  );
}
