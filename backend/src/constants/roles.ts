export const ROLES = {
	SECURITY_SEWADAR: 'SECURITY_SEWADAR',
	SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];
