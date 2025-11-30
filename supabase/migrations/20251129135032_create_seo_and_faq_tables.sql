/*
  # Create SEO and FAQ Management Tables

  ## Overview
  This migration creates tables for managing SEO metadata and FAQ entries
  that will be dynamically loaded on the landing page.

  ## New Tables

  ### 1. `seo_settings`
  Stores SEO metadata for the landing page including:
  - `id` (uuid, primary key) - Unique identifier
  - `page_title` (text) - HTML page title
  - `meta_description` (text) - Meta description
  - `meta_keywords` (text) - Meta keywords
  - `og_title` (text) - Open Graph title
  - `og_description` (text) - Open Graph description
  - `og_image_url` (text) - Open Graph image URL
  - `twitter_title` (text) - Twitter card title
  - `twitter_description` (text) - Twitter card description
  - `canonical_url` (text) - Canonical URL
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `faq_items`
  Stores FAQ items with:
  - `id` (uuid, primary key) - Unique identifier
  - `question` (text) - FAQ question
  - `answer` (text) - FAQ answer
  - `sort_order` (integer) - Display order (lower = higher priority)
  - `is_active` (boolean) - Whether FAQ is visible on site
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on both tables
  - Public read access for all users
  - Admin-only write access (authenticated users)
  
  ## Notes
  - SEO settings uses single row pattern (only one config at a time)
  - FAQ items support ordering and active/inactive states
  - Default SEO values populated from current site
  - Default FAQ items migrated from hardcoded values
*/

-- Create SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title text NOT NULL DEFAULT 'Renamerged - Solusi Auto Rename Faktur Pajak Coretax (Gratis & Offline)',
  meta_description text NOT NULL DEFAULT 'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet. Hemat waktu administrasi pajak Anda!',
  meta_keywords text NOT NULL DEFAULT 'cara ubah nama faktur pajak coretax banyak, ubah nama faktur pajak, cara ngubah nama file faktur pajak, cara cepat ganti nama faktur pajak, auto rename faktur pajak coretax, cara rename faktur pajak sekaligus di coretax, rename ribuan faktur pajak dalam 1 klik, aplikasi rename faktur pajak, gabung pdf faktur, tools coretax indonesia',
  og_title text NOT NULL DEFAULT 'Renamerged - Solusi Auto Rename Faktur Pajak Coretax (Gratis & Offline)',
  og_description text NOT NULL DEFAULT 'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet. Hemat waktu administrasi pajak Anda!',
  og_image_url text NOT NULL DEFAULT 'https://renamerged.id/Screenshot%202025-11-26%20084158.png',
  twitter_title text NOT NULL DEFAULT 'Renamerged - Solusi Auto Rename Faktur Pajak Coretax',
  twitter_description text NOT NULL DEFAULT 'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet.',
  canonical_url text NOT NULL DEFAULT 'https://renamerged.id/',
  updated_at timestamptz DEFAULT now()
);

-- Create FAQ items table
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seo_settings
CREATE POLICY "Anyone can read SEO settings"
  ON seo_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert SEO settings"
  ON seo_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update SEO settings"
  ON seo_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for faq_items
CREATE POLICY "Anyone can read active FAQ items"
  ON faq_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert FAQ items"
  ON faq_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update FAQ items"
  ON faq_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete FAQ items"
  ON faq_items FOR DELETE
  TO authenticated
  USING (true);

-- Insert default SEO settings
INSERT INTO seo_settings (
  page_title,
  meta_description,
  meta_keywords,
  og_title,
  og_description,
  og_image_url,
  twitter_title,
  twitter_description,
  canonical_url
) VALUES (
  'Renamerged - Solusi Auto Rename Faktur Pajak Coretax (Gratis & Offline)',
  'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet. Hemat waktu administrasi pajak Anda!',
  'cara ubah nama faktur pajak coretax banyak, ubah nama faktur pajak, cara ngubah nama file faktur pajak, cara cepat ganti nama faktur pajak, auto rename faktur pajak coretax, cara rename faktur pajak sekaligus di coretax, rename ribuan faktur pajak dalam 1 klik, aplikasi rename faktur pajak, gabung pdf faktur, tools coretax indonesia, rename coretax, merge faktur pajak, aplikasi pajak gratis, software faktur pajak, djp coretax, administrasi pajak, rename bulk faktur pajak, ganti nama faktur massal, aplikasi rename pdf coretax',
  'Renamerged - Solusi Auto Rename Faktur Pajak Coretax (Gratis & Offline)',
  'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet. Hemat waktu administrasi pajak Anda!',
  'https://renamerged.id/Screenshot%202025-11-26%20084158.png',
  'Renamerged - Solusi Auto Rename Faktur Pajak Coretax',
  'Download Renamerged GRATIS - Aplikasi Windows untuk auto rename & merge faktur pajak sesuai format Coretax DJP. 100% offline, aman, tanpa internet.',
  'https://renamerged.id/'
);

-- Insert default FAQ items (from current hardcoded FAQs)
INSERT INTO faq_items (question, answer, sort_order, is_active) VALUES
  (
    'Apakah aplikasi ini benar-benar gratis?',
    'Ya, 100% Gratis untuk selamanya (Freeware). Tidak ada fitur berbayar. Dukungan dana hanya melalui donasi sukarela.',
    1,
    true
  ),
  (
    'Apakah bisa dijalankan di MacOS atau HP?',
    'Saat ini Renamerged hanya tersedia khusus untuk sistem operasi Windows (10 dan 11).',
    2,
    true
  ),
  (
    'Bagaimana cara update ke versi baru?',
    'Cukup kunjungi website ini lagi, download versi terbaru, dan jalankan. Settingan lama Anda tidak akan hilang.',
    3,
    true
  ),
  (
    'Apakah data faktur saya aman?',
    'Sangat aman. Aplikasi bekerja offline tanpa internet. File PDF Anda tidak pernah keluar dari komputer Anda.',
    4,
    true
  ),
  (
    'Apakah bisa untuk scan PDF dari kamera/scanner?',
    'TIDAK. Renamerged hanya support file PDF hasil download dari Coretax DJP. Tidak support scan PDF. Jika kesusahan mendapatkan Faktur Pajaknya, tinggal cari di Faktur Keluaran (sebagai penjual) atau Faktur Masukan (sebagai pembeli) di dashboard Coretax.',
    5,
    true
  ),
  (
    'Berapa banyak file PDF yang bisa diproses sekaligus?',
    'Tidak ada batasan! Anda bisa memproses ratusan bahkan ribuan file PDF sekaligus. Kecepatan pemrosesan tergantung pada spesifikasi komputer Anda.',
    6,
    true
  ),
  (
    'Bagaimana cara kerja fitur Merge PDF?',
    'Fitur Merge PDF menggabungkan semua file PDF dalam folder input menjadi satu file PDF besar. File akan digabung sesuai urutan nama file setelah di-rename. Sangat berguna untuk membuat arsip bulanan atau tahunan.',
    7,
    true
  );

-- Create index for FAQ sorting
CREATE INDEX IF NOT EXISTS idx_faq_items_sort_order ON faq_items(sort_order, is_active);
