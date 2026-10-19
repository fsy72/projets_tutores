import { Routes } from '@angular/router';
import { AuthPage } from './authentification/page-connexion';
import { DashboardPage } from './pages/partage/page-tableau-de-bord';
import { connectedGuard, guestGuard, roleGuard } from './core/authentification/gardes-authentification';
import { PageEtudiant } from './pages/etudiant/etudiant';
import { PageSujets } from './pages/etudiant/page-sujets/page-sujets';
import { PageCandidatures } from './pages/etudiant/page-candidatures/page-candidatures';
import { PageAdmin } from './pages/administration/page-administration';
import { PageAccueil } from './pages/accueil/page-accueil';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: PageAccueil },
  { path: 'connexion', component: AuthPage, canActivate: [guestGuard] },
  { path: 'espace', component: DashboardPage, canActivate: [connectedGuard] },
  { path: 'espace/admin', component: PageAdmin, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'espace/enseignant', loadComponent: () => import('./pages/enseignant/page-enseignant').then((m) => m.PageEnseignant), canActivate: [roleGuard], data: { roles: ['ENSEIGNANT'] } },
  {
    path: 'espace/etudiant', component: PageEtudiant, canActivate: [roleGuard], data: { roles: ['ETUDIANT'] },
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./pages/etudiant/page-accueil/page-accueil-etudiant').then((m) => m.PageAccueilEtudiant) },
      { path: 'sujets', component: PageSujets },
      { path: 'candidatures', component: PageCandidatures },
    ],
  },
  { path: 'espace/responsable', loadComponent: () => import('./pages/responsable/page-responsable').then((m) => m.PageResponsable), canActivate: [roleGuard], data: { roles: ['RESPONSABLE'] } },
  { path: '**', redirectTo: '' },
];
