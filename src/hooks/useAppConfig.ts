import { useState, useEffect } from 'react';
import { getAppConfig } from '../config';

interface AppConfig {
  downloadUrl: string;
  appVersion: string;
  githubUrl: string;
  fileSize: string;
  virusTotalUrl: string;
}

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>({
    downloadUrl: 'https://drive.google.com/file/d/1CU0M7hJQTtAfObYCIA5WI0EdkRwlpUl-/view?usp=sharing',
    appVersion: '3.0.1',
    githubUrl: 'https://github.com/iunoxid/renamergedV3',
    fileSize: '~33MB',
    virusTotalUrl: 'https://www.virustotal.com/gui/file/659ee926078262e08fedc9c6744ba37ebf03580bf203b332609f094d6fc0d162/detection',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      const appConfig = await getAppConfig();
      setConfig(appConfig);
      setLoading(false);
    }
    loadConfig();
  }, []);

  return { config, loading };
}
