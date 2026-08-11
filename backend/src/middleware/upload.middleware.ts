import fs from 'node:fs';
import path from 'node:path';

import multer from 'multer';

const enableLocalUploads = process.env.ENABLE_LOCAL_UPLOADS !== 'false';

const ensureDirectory = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (subFolder: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destinationPath = path.join(process.cwd(), 'uploads', subFolder);
      ensureDirectory(destinationPath);
      cb(null, destinationPath);
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const randomPart = Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, `${timestamp}-${randomPart}${extension}`);
    },
  });
};

const imageFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!enableLocalUploads) {
    cb(new Error('File uploads are disabled on this deployment. Configure cloud storage for media uploads.'));
    return;
  }

  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }

  cb(null, true);
};

export const uploadFoundItemImages = multer({
  storage: createStorage('found-items'),
  fileFilter: imageFilter,
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadLostReportPhoto = multer({
  storage: createStorage('lost-reports'),
  fileFilter: imageFilter,
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadIncidentImage = multer({
  storage: createStorage('incidents'),
  fileFilter: imageFilter,
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadReturnReceiverPhoto = multer({
  storage: createStorage('returns'),
  fileFilter: imageFilter,
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024,
  },
});
