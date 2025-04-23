import { AppLayout } from "@/components/layout/AppLayout";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout requireAuth={false}>{children}</AppLayout>;
}
