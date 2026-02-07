"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Alex Rivera",
    handle: "@alexcreates",
    avatar: "",
    content: "Zavo is honestly incredible. Setup took 5 minutes and I was receiving donations the same day. The dashboard is so clean!",
    highlight: "incredible",
  },
  {
    name: "Sarah Chen",
    handle: "@sarahstreams",
    avatar: "",
    content: "Switched from our old platform and Zavo is 10x better. The instant payouts feature is a game changer for creators.",
    highlight: "10x better",
  },
  {
    name: "Marcus Johnson",
    handle: "@marcusdev",
    avatar: "",
    content: "As a developer, I love that Zavo has a proper API. Integrated it into my Discord bot in under an hour. Great docs too!",
    highlight: "proper API",
  },
  {
    name: "Emily Watson",
    handle: "@emilywrites",
    avatar: "",
    content: "The analytics dashboard shows me exactly where my supporters come from. Helped me grow my community 3x in 2 months.",
    highlight: "3x in 2 months",
  },
  {
    name: "David Kim",
    handle: "@davidbuilds",
    avatar: "",
    content: "Transparent pricing and great support. Zavo actually cares about smaller creators.",
    highlight: "actually cares",
  },
  {
    name: "Lisa Park",
    handle: "@lisapaints",
    avatar: "",
    content: "My fans love how easy it is to support me through Zavo. The checkout is seamless and fast.",
    highlight: "seamless and fast",
  },
];

function highlightText(content: string, highlight: string) {
  const lowerContent = content.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const index = lowerContent.indexOf(lowerHighlight);

  if (index === -1) return content;

  return (
    <>
      {content.slice(0, index)}
      <span className="text-primary font-medium">{content.slice(index, index + highlight.length)}</span>
      {content.slice(index + highlight.length)}
    </>
  );
}

export default function Testimonials() {
  return (
    <section className="relative py-24" id="testimonials">
      {/* Full-width horizontal lines at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      {/* Dot Matrix Pattern - Bottom Left */}
      <div
        className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #FF5722 1.5px, transparent 1.5px)`,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 0% 100%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 100%, black 30%, transparent 70%)',
        }}
      />

      {/* Section Header */}
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="section-badge mb-4">
            02 — Testimonials
          </span>
          <h2
            className="text-3xl font-bold tracking-tight md:text-5xl text-foreground mt-6"
            style={{ letterSpacing: '-0.01em' }}
          >
            People <span className="text-primary">love</span> Zavo
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See what creators are saying about us.
          </p>
        </motion.div>
      </div>

      {/* Testimonials Grid - uses same container as page vertical lines */}
      <div className="container mx-auto">
        <div className="relative border-l border-r border-t border-border">
          {/* Inner Vertical Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-border hidden lg:block" />
            <div className="absolute top-0 bottom-0 left-2/3 w-px bg-border hidden lg:block" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border md:block lg:hidden hidden" />
          </div>

          {/* Horizontal divider between rows */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-border hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="p-6 bg-background transition-all duration-200 hover:bg-orange-100/30 dark:hover:bg-orange-900/30 border-b border-border"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.handle}</p>
                  </div>
                </div>
                {/* Content */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{highlightText(testimonial.content, testimonial.highlight)}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
