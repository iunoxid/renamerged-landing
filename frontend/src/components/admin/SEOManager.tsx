import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save } from 'lucide-react';
import { ToastType } from './ToastContainer';

interface SEOSettings {
  id: string;
  page_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  twitter_title: string;
  twitter_description: string;
  canonical_url: string;
}

interface SEOManagerProps {
  showToast: (message: string, type: ToastType) => void;
}

export default function SEOManager({ showToast }: SEOManagerProps) {
  const [settings, setSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error loading SEO settings:', error);
      showToast('Failed to load SEO settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('seo_settings')
        .update({
          page_title: settings.page_title,
          meta_description: settings.meta_description,
          meta_keywords: settings.meta_keywords,
          og_title: settings.og_title,
          og_description: settings.og_description,
          og_image_url: settings.og_image_url,
          twitter_title: settings.twitter_title,
          twitter_description: settings.twitter_description,
          canonical_url: settings.canonical_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      showToast('SEO settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      showToast('Failed to save SEO settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SEOSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-gray-400">
        No SEO settings found. Please create one first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-xl font-bold text-white mb-4">Basic SEO Settings</h3>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Page Title
          </label>
          <input
            type="text"
            value={settings.page_title}
            onChange={(e) => updateField('page_title', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meta Description
          </label>
          <textarea
            value={settings.meta_description}
            onChange={(e) => updateField('meta_description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meta Keywords
          </label>
          <textarea
            value={settings.meta_keywords}
            onChange={(e) => updateField('meta_keywords', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Canonical URL
          </label>
          <input
            type="url"
            value={settings.canonical_url}
            onChange={(e) => updateField('canonical_url', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-xl font-bold text-white mb-4">Open Graph (Facebook)</h3>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            OG Title
          </label>
          <input
            type="text"
            value={settings.og_title}
            onChange={(e) => updateField('og_title', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            OG Description
          </label>
          <textarea
            value={settings.og_description}
            onChange={(e) => updateField('og_description', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            OG Image URL
          </label>
          <input
            type="url"
            value={settings.og_image_url}
            onChange={(e) => updateField('og_image_url', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-xl font-bold text-white mb-4">Twitter Card</h3>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Twitter Title
          </label>
          <input
            type="text"
            value={settings.twitter_title}
            onChange={(e) => updateField('twitter_title', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Twitter Description
          </label>
          <textarea
            value={settings.twitter_description}
            onChange={(e) => updateField('twitter_description', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
