import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import SecuritySection from '../components/SecuritySection';
import SecurityTransparencySection from '../components/SecurityTransparencySection';
import InstallationGuideSection from '../components/InstallationGuideSection';
import FAQSection from '../components/FAQSection';
import ChangelogSection from '../components/ChangelogSection';
import DonationSection from '../components/DonationSection';
import Footer from '../components/Footer';
import DownloadModal from '../components/DownloadModal';

export default function HomePage() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const navigate = useNavigate();
  useSEO();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar onDownloadClick={() => setIsDownloadModalOpen(true)} />
      <HeroSection onDownloadClick={() => setIsDownloadModalOpen(true)} />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <SecurityTransparencySection />
      <InstallationGuideSection />
      <FAQSection />
      <ChangelogSection />
      <DonationSection />
      <Footer />
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
