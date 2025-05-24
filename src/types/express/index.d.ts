// src/types/express/index.d.ts
import {} from 'express';

declare global {
  namespace Express {
    interface AuthInfo {
      // Common Entra ID token claims
      oid?: string;
      tid?: string;
      sub?: string;
      name?: string;
      upn?: string;
      preferred_username?: string;
      email?: string;
      
      // Scope and role related claims
      scp?: string;
      scope?: string;
      roles?: string[];
    }
  }
}