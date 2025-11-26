import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StatsCounter from './components/StatsCounter';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import SecuritySection from './components/SecuritySection';
import SecurityTransparencySection from './components/SecurityTransparencySection';
import InstallationGuideSection from './components/InstallationGuideSection';
import FAQSection from './components/FAQSection';
import DonationSection from './components/DonationSection';
import Footer from './components/Footer';
import DownloadModal from './components/DownloadModal';

export default function App() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar onDownloadClick={() => setIsDownloadModalOpen(true)} />
      <HeroSection onDownloadClick={() => setIsDownloadModalOpen(true)} />
      <StatsCounter />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <SecurityTransparencySection />
      <InstallationGuideSection />
      <FAQSection />
      <DonationSection />
      <Footer />
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
