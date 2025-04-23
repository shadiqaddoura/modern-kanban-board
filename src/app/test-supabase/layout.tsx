import { AppLayout } from "@/components/layout/AppLayout";

export default function TestSupabaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
