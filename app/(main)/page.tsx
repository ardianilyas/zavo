
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-sans antialiased">
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
