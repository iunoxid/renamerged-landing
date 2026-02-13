import { useState, useEffect } from 'react';
import { getAppConfig, APP_CONFIG } from '../config';

interface AppConfig {
  downloadUrl: string;
  appVersion: string;
  githubUrl: string;
  fileSize: string;
  virusTotalUrl: string;
}

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>({
    downloadUrl: APP_CONFIG.downloadUrl,
    appVersion: APP_CONFIG.appVersion,
    githubUrl: APP_CONFIG.githubUrl,
    fileSize: APP_CONFIG.fileSize,
    virusTotalUrl: APP_CONFIG.virusTotalUrl,
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
