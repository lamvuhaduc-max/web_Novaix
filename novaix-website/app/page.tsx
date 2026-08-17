import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Modules from "@/components/Modules";
import Features from "@/components/Features";
import Process from "@/components/Process";
import Segments from "@/components/Segments";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import ArticleRail from "@/components/blog/ArticleRail";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getHomeRails } from "@/lib/blog/queries";

export const revalidate = 60; // Refresh home page cache every 60 seconds

export default async function Home() {
  const homeRails = await getHomeRails();

  return (
    <main>
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Modules />
      <Features />
      <Process />
      <Segments />
      <Pricing />
      <Testimonials />
      <FAQ />
      <ArticleRail rails={homeRails} />
      <CTA />
      <Footer />
    </main>
  );
}
