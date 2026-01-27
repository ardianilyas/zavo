export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
