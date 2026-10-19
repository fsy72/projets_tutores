import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/authentification/service-authentification';
import { StudentApiService } from '../../../core/sujets/service-api-etudiant';
import { Candidature, StatutCandidature } from '../../../core/sujets/modeles-sujets';

@Component({
  selector: 'app-page-candidatures',
  imports: [
    CommonModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './page-candidatures.html',
  styleUrl: './page-candidatures.css',
})
export class PageCandidatures {
  private readonly api = inject(StudentApiService);
  private readonly auth = inject(AuthService);
  readonly candidatures = signal<Candidature[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal('');

  constructor() {
    const id = this.auth.utilisateur?.id;
    if (!id) { this.chargement.set(false); this.erreur.set('Votre session a expiré. Reconnectez-vous pour consulter vos candidatures.'); return; }
    this.api.candidaturesEtudiant(id).subscribe({
      next: (items) => { this.candidatures.set([...items].sort((a, b) => b.dateCandidature.localeCompare(a.dateCandidature))); this.chargement.set(false); },
      error: (error: HttpErrorResponse) => { this.erreur.set(error.error?.detail ?? error.error?.message ?? 'Impossible de charger vos candidatures.'); this.chargement.set(false); },
    });
  }

  statutLabel(statut: StatutCandidature): string {
    return { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REJETEE: 'Rejetée' }[statut];
  }

  trackById(_index: number, item: { id: number }): number { return item.id; }
}
