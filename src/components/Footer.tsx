import { motion } from 'framer-motion';
import { MessageSquare, Github, Mail, FileText, Shield } from 'lucide-react';
import { useAppConfig } from '../hooks/useAppConfig';

export default function Footer() {
  const { config } = useAppConfig();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative border-t border-slate-800/50">
      <div className="absolute inset-0 bg-slate-950" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              Renamerged
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Solusi manajemen Faktur Pajak #1 untuk profesional.
            </p>
            <p className="text-gray-600 text-xs">
              Made with passion for Indonesian tax professionals
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="text-white text-sm font-semibold mb-4">Navigation</h4>
            <nav className="space-y-2">
              <button
                onClick={() => scrollToSection('features')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Fitur
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Cara Kerja
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Keamanan
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                FAQ
              </button>
            </nav>
          </div>

          {/* Resources */}
          <div className="md:col-span-1">
            <h4 className="text-white text-sm font-semibold mb-4">Resources</h4>
            <div className="space-y-2">
              <button
                onClick={() => scrollToSection('installation')}
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Installation Guide</span>
              </button>
              <button
                onClick={() => scrollToSection('security-transparency')}
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                <Shield className="w-4 h-4" />
                <span>Security Report</span>
              </button>
              <a
                href={config.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                <span>Documentation</span>
              </a>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-1">
            <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <a
                href="https://t.me/iunoin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Report Bug</span>
              </a>
              <a
                href="https://t.me/iunoin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Request Feature</span>
              </a>
              <a
                href={config.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/50 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs text-center md:text-left">
              © 2025 Renamerged.id. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs text-center md:text-right max-w-2xl">
              Disclaimer: Software independen, tidak berafiliasi dengan DJP.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
