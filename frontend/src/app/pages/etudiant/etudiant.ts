import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/authentification/service-authentification';

@Component({
  selector: 'app-etudiant',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './etudiant.html',
  styleUrl: './etudiant.css',
})
export class PageEtudiant {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  deconnecter(): void {
    this.auth.deconnecter();
    void this.router.navigate(['/connexion']);
  }
}
