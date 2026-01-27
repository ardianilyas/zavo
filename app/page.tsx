import { ThemeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen gap-2 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-3xl font-bold">Hi</h1>
      <div>
        <ThemeToggle />
      </div>
    </div>
  );
}
