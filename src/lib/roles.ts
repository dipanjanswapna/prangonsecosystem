export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MANAGER: 'manager',
  COLLABORATOR: 'collaborator',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const roleHierarchy = {
  [ROLES.ADMIN]: 4,
  [ROLES.MODERATOR]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.COLLABORATOR]: 1,
  [ROLES.USER]: 0,
};
