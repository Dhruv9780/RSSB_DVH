declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: 'SECURITY_SEWADAR' | 'SUPER_ADMIN';
      };
    }
  }
}

export {};
