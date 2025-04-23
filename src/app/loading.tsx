import { Loading } from "@/components/ui/loading";

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}
