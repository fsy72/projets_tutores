import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/authentification/service-authentification';
import { ROLE_LABELS } from '../../core/authentification/modeles-authentification';

@Component({
  selector: 'app-page-tableau-de-bord',
  templateUrl: './page-tableau-de-bord.html',
  styleUrl: './page-tableau-de-bord.css',
})
export class DashboardPage {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  get libelleRole(): string {
    const role = this.auth.utilisateur?.role;
    return role ? ROLE_LABELS[role] : '';
  }

  deconnecter(): void {
    this.auth.deconnecter();
    void this.router.navigate(['/connexion']);
  }
}
