import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import ValueProposition from "@/components/landing/value-proposition";
import Testimonials from "@/components/landing/testimonials";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background font-sans antialiased overflow-x-hidden">
      {/* Structural Border Lines - Left & Right Edges */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="container mx-auto px-6 h-full relative">
          <div className="border-line-v left-0 opacity-50" />
          <div className="border-line-v right-0 opacity-50" />
        </div>
      </div>

      <div className="relative z-10">
        <Hero />
        <Features />
        <ValueProposition />
        <Testimonials />
        <Footer />
      </div>
    </main>
  );
}
