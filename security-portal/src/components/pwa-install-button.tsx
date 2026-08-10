import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import { Button } from '@mui/material';

import { usePwaInstall } from '../hooks/use-pwa-install';

export const PwaInstallButton = () => {
  const { canInstall, installApp } = usePwaInstall();

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      variant="contained"
      size="small"
      color="primary"
      startIcon={<DownloadForOfflineOutlinedIcon />}
      onClick={() => {
        void installApp();
      }}
    >
      Install App
    </Button>
  );
};
