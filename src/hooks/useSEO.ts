import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SEOSettings {
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

const defaultSEO: SEOSettings = {
  page_title: 'Renamerged - Solusi Auto Rename Faktur Pajak Coretax (Gratis & Offline)',
  meta_description: 'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet. Hemat waktu administrasi pajak Anda!',
  meta_keywords: 'cara ubah nama faktur pajak coretax banyak, ubah nama faktur pajak, cara ngubah nama file faktur pajak, cara cepat ganti nama faktur pajak, auto rename faktur pajak coretax',
  og_title: 'Renamerged - Solusi Auto Rename Faktur Pajak Coretax (Gratis & Offline)',
  og_description: 'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet. Hemat waktu administrasi pajak Anda!',
  og_image_url: 'https://renamerged.id/Screenshot%202025-11-26%20084158.png',
  twitter_title: 'Renamerged - Solusi Auto Rename Faktur Pajak Coretax',
  twitter_description: 'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet.',
  canonical_url: 'https://renamerged.id/',
};

export function useSEO() {
  const [seo, setSEO] = useState<SEOSettings>(defaultSEO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSEO({
          page_title: data.page_title,
          meta_description: data.meta_description,
          meta_keywords: data.meta_keywords,
          og_title: data.og_title,
          og_description: data.og_description,
          og_image_url: data.og_image_url,
          twitter_title: data.twitter_title,
          twitter_description: data.twitter_description,
          canonical_url: data.canonical_url,
        });
      }
    } catch (err) {
      console.error('Error loading SEO settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentHead = () => {
    document.title = seo.page_title;

    const updateMetaTag = (name: string, content: string, property?: string) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);

      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', content);
    };

    updateMetaTag('description', seo.meta_description);
    updateMetaTag('keywords', seo.meta_keywords);
    updateMetaTag('og:title', seo.og_title, 'og:title');
    updateMetaTag('og:description', seo.og_description, 'og:description');
    updateMetaTag('og:image', seo.og_image_url, 'og:image');
    updateMetaTag('og:url', seo.canonical_url, 'og:url');
    updateMetaTag('twitter:title', seo.twitter_title);
    updateMetaTag('twitter:description', seo.twitter_description);
    updateMetaTag('twitter:image', seo.og_image_url);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seo.canonical_url;
  };

  useEffect(() => {
    if (!loading) {
      updateDocumentHead();
    }
  }, [seo, loading]);

  return { seo, loading };
}
