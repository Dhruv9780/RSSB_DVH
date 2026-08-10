import fs from 'node:fs';
import path from 'node:path';

import { app } from './app.js';
import { env } from './config/env.js';

const uploadRoots = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'uploads', 'found-items'),
  path.join(process.cwd(), 'uploads', 'lost-reports'),
];

for (const dir of uploadRoots) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

app.listen(env.PORT, () => {
  console.log(`Backend listening on port ${env.PORT}`);
});
