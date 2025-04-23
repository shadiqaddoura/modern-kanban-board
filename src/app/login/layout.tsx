import { AppLayout } from "@/components/layout/AppLayout";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout requireAuth={false}>{children}</AppLayout>;
}
