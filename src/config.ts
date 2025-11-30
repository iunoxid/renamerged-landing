import { supabase } from './lib/supabase';

interface SiteConfig {
  github_repo_url: string;
  download_url: string;
  version: string;
  file_size: string;
}

let cachedConfig: SiteConfig | null = null;

export async function getAppConfig() {
  if (cachedConfig) {
    return {
      downloadUrl: cachedConfig.download_url,
      appVersion: cachedConfig.version,
      githubUrl: cachedConfig.github_repo_url,
      fileSize: cachedConfig.file_size,
      virusTotalUrl: 'https://www.virustotal.com/gui/file/659ee926078262e08fedc9c6744ba37ebf03580bf203b332609f094d6fc0d162/detection',
    };
  }

  const { data, error } = await supabase
    .from('site_config')
    .select('*')
    .maybeSingle();

  if (error || !data) {
    return {
      downloadUrl: 'https://drive.google.com/file/d/1CU0M7hJQTtAfObYCIA5WI0EdkRwlpUl-/view?usp=sharing',
      appVersion: '3.0.1',
      githubUrl: 'https://github.com/iunoxid/renamergedV3',
      fileSize: '~33MB',
      virusTotalUrl: 'https://www.virustotal.com/gui/file/659ee926078262e08fedc9c6744ba37ebf03580bf203b332609f094d6fc0d162/detection',
    };
  }

  cachedConfig = data;
  return {
    downloadUrl: data.download_url,
    appVersion: data.version,
    githubUrl: data.github_repo_url,
    fileSize: data.file_size || '~33MB',
    virusTotalUrl: 'https://www.virustotal.com/gui/file/659ee926078262e08fedc9c6744ba37ebf03580bf203b332609f094d6fc0d162/detection',
  };
}

export const APP_CONFIG = {
  downloadUrl: 'https://drive.google.com/file/d/1CU0M7hJQTtAfObYCIA5WI0EdkRwlpUl-/view?usp=sharing',
  appVersion: '3.0.1',
  githubUrl: 'https://github.com/iunoxid/renamergedV3',
  fileSize: '~33MB',
  virusTotalUrl: 'https://www.virustotal.com/gui/file/659ee926078262e08fedc9c6744ba37ebf03580bf203b332609f094d6fc0d162/detection',
};