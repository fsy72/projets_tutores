import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service-authentification';
import { Role } from './modeles-authentification';

const ROLE_HOME_PATHS: Record<Role, string> = {
  ADMIN: '/espace/admin',
  ENSEIGNANT: '/espace/enseignant',
  ETUDIANT: '/espace/etudiant',
  RESPONSABLE: '/espace/responsable',
};

export const connectedGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estConnecte()) return true;
  return router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.estConnecte()) return router.createUrlTree(['/connexion']);
  const roles = route.data['roles'] as Role[] | undefined;
  if (!roles?.includes(auth.utilisateur!.role)) return router.createUrlTree(['/espace']);
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.estConnecte()) return true;
  const router = inject(Router);
  const role = auth.utilisateur?.role;
  return router.parseUrl(role ? ROLE_HOME_PATHS[role] : '/connexion');
};
