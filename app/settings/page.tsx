import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return <AppShell><h1 className="text-3xl font-black">Settings</h1><Card className="mt-6"><p>Privacy settings, consent management, and data deletion requests.</p></Card></AppShell>;
}
