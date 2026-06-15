import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  return <AppShell><h1 className="text-3xl font-black">Profile</h1><Card className="mt-6"><p>Personal information, tax preferences, uploaded documents, and analysis history.</p></Card></AppShell>;
}
