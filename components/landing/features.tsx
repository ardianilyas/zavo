import { cn } from "@/lib/utils";

const features = [
  {
    title: "Donations",
    description: "Receive support from your fans with 0% platform fees on your first $1k.",
    className: "md:col-span-2",
  },
  {
    title: "Memberships",
    description: "Launch tiered memberships to provide exclusive content and perks.",
    className: "md:col-span-1",
  },
  {
    title: "Analytics",
    description: "Track your earnings and audience growth with real-time insights.",
    className: "md:col-span-1",
  },
  {
    title: "Integrations",
    description: "Connect with your favorite tools like Discord, Streamlabs, and more.",
    className: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section className="container mx-auto px-6 py-20" id="features">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Everything you need
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          To turn your passion into a profession.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature, i) => (
          <div
            key={i}
            className={cn(
              "group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-colors hover:bg-accent/40",
              feature.className
            )}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <div className="mt-8 h-40 w-full rounded-2xl border border-dashed border-border/60 bg-muted/20" />
              {/* Placeholder for feature image/demo */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
