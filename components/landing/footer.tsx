"use client";

import Link from "next/link";
import { Github, Twitter, Disc as Discord, Youtube } from "lucide-react";

const footerColumns = [
  {
    title: "Products",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Streamers", href: "#" },
      { label: "Content Creators", href: "#" },
      { label: "Artists", href: "#" },
      { label: "Developers", href: "#" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { label: "Getting Started", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "SDKs", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Open Source", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const bottomLinks = [
  { label: "© 2025 Zavo", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Report Abuse", href: "#" },
];

export default function Footer() {
  const maxLinks = Math.max(...footerColumns.map(col => col.links.length));

  return (
    <footer className="relative bg-background">
      {/* Full-width horizontal lines at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      {/* Dot Matrix Pattern */}
      <div
        className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle, #FF5722 1.5px, transparent 1.5px)`,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black 30%, transparent 70%)',
        }}
      />

      {/* Footer Grid - uses same container as page vertical lines */}
      <div className="container mx-auto">
        <div className="relative border-l border-r border-t border-border">
          {/* Continuous Vertical Lines at 1/4 positions */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-border" />
            <div className="absolute top-0 bottom-0 left-2/4 w-px bg-border" />
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-border" />
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-4 border-b border-border">
            {footerColumns.map((column) => (
              <div key={column.title} className="py-4 px-6">
                <span className="text-sm font-semibold text-foreground">
                  {column.title}
                </span>
              </div>
            ))}
          </div>

          {/* Link Rows */}
          {Array.from({ length: maxLinks }).map((_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-4 border-b border-border">
              {footerColumns.map((column, colIdx) => {
                const link = column.links[rowIdx];
                return (
                  <div key={colIdx} className="py-3 px-6">
                    {link ? (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Spacer Row */}
          <div className="h-8 border-b border-border" />

          {/* Bottom Row */}
          <div className="grid grid-cols-4 border-b border-border">
            {bottomLinks.map((link, idx) => (
              <div key={idx} className="py-4 px-6">
                {idx === 0 ? (
                  <span className="text-sm text-muted-foreground">{link.label}</span>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom with Social */}
        <div className="py-6 px-6 flex justify-between items-center border-t border-b border-l border-r border-border">
          <div className="flex items-center gap-2 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">All systems normal</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github size={20} />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Discord size={20} />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Youtube size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
