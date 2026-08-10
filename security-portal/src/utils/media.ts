import { env } from '../config/env';

export const toMediaUrl = (relativePath: string): string => {
  const serverRoot = env.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
  return `${serverRoot}${relativePath}`;
};
