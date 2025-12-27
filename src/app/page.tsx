import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Announcements from "@/components/landing/Announcements";
import Teachers from "@/components/landing/Teachers";
import TopStudents from "@/components/landing/TopStudents";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Announcements />
      <Teachers />
      <TopStudents />
      <Footer />
    </div>
  );
}
