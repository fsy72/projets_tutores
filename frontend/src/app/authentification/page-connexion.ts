import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/authentification/service-authentification';
import { InscriptionEtudiantRequest } from '../core/authentification/modeles-authentification';

@Component({
  selector: 'app-auth-page',
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './page-connexion.html',
  styleUrl: './page-connexion.css',
})
export class AuthPage {
  mode: 'connexion' | 'inscription' = 'connexion';
  email = '';
  motDePasse = '';
  confirmation = '';
  nom = '';
  prenom = '';
  matricule = '';
  niveau = '';
  readonly erreur = signal('');
  readonly succes = signal('');
  readonly chargement = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  changerMode(mode: 'connexion' | 'inscription'): void {
    this.mode = mode;
    this.erreur.set('');
    this.succes.set('');
  }

  soumettre(): void {
    this.erreur.set('');
    this.succes.set('');
    if (this.mode === 'inscription') {
      if (this.motDePasse !== this.confirmation) {
        this.erreur.set('Les mots de passe ne correspondent pas.');
        return;
      }
      const request: InscriptionEtudiantRequest = {
        nom: this.nom.trim(), prenom: this.prenom.trim(), email: this.email.trim(),
        motDePasse: this.motDePasse, matricule: this.matricule.trim(), niveau: this.niveau.trim(),
      };
      this.chargement.set(true);
      this.auth.inscrireEtudiant(request).subscribe({
        next: () => {
          this.chargement.set(false);
          this.mode = 'connexion';
          this.motDePasse = '';
          this.succes.set('Votre compte étudiant a été créé. Vous pouvez maintenant vous connecter.');
        },
        error: (error: HttpErrorResponse) => this.afficherErreur(error),
      });
      return;
    }
    this.chargement.set(true);
    this.auth.connecter(this.email.trim(), this.motDePasse).subscribe({
      next: (response) => {
        this.chargement.set(false);
        const retour = this.route.snapshot.queryParamMap.get('retour');
        const rolePath: Record<string, string> = {
          ADMIN: '/espace/admin',
          ENSEIGNANT: '/espace/enseignant',
          ETUDIANT: '/espace/etudiant/sujets',
          RESPONSABLE: '/espace/responsable',
        };
        void this.router.navigateByUrl(retour?.startsWith('/') ? retour : rolePath[response.utilisateur.role]);
      },
      error: (error: HttpErrorResponse) => this.afficherErreur(error),
    });
  }

  private afficherErreur(error: HttpErrorResponse): void {
    this.chargement.set(false);
    const message = error.error?.detail ?? error.error?.message ?? error.error?.error;
    this.erreur.set(typeof message === 'string' ? message : 'Une erreur est survenue. Vérifiez les informations et réessayez.');
  }
}
