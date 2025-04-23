import { Button } from "@/components/ui/button";
import { KanbanSquare } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <KanbanSquare className="h-6 w-6" />
            <span className="font-bold">Modern Kanban</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Modern Kanban Board
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              A beautiful, responsive Kanban board application built with Next.js, Supabase, and shadcn/ui.
              Organize your tasks with ease and boost your productivity.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">User Authentication</h3>
                <p className="text-muted-foreground">
                  Secure user authentication with Supabase. Create an account and access your boards from anywhere.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">Drag and Drop</h3>
                <p className="text-muted-foreground">
                  Intuitive drag and drop interface for managing tasks and columns. Organize your workflow with ease.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">Real-time Updates</h3>
                <p className="text-muted-foreground">
                  Changes are synchronized in real-time. Collaborate with your team seamlessly.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">Responsive Design</h3>
                <p className="text-muted-foreground">
                  Access your boards from any device. The application is fully responsive and mobile-friendly.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">Dark Mode</h3>
                <p className="text-muted-foreground">
                  Switch between light and dark mode based on your preference or system settings.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">Data Security</h3>
                <p className="text-muted-foreground">
                  Row Level Security ensures that your data is private and secure. Only you can access your boards.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Modern Kanban Board. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
