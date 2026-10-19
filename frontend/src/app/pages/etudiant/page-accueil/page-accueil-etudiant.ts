import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/authentification/service-authentification';
import { StudentApiService } from '../../../core/sujets/service-api-etudiant';
import { Candidature, StatutCandidature, Sujet } from '../../../core/sujets/modeles-sujets';

@Component({
  selector: 'app-page-accueil-etudiant',
  imports: [
    CommonModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './page-accueil-etudiant.html',
})
export class PageAccueilEtudiant {
  private readonly api = inject(StudentApiService);
  readonly auth = inject(AuthService);
  readonly sujets = signal<Sujet[]>([]);
  readonly candidatures = signal<Candidature[]>([]);
  readonly chargement = signal(true);
  readonly erreur = signal('');
  readonly candidaturesRecentes = computed(() => [...this.candidatures()].sort((a, b) => b.dateCandidature.localeCompare(a.dateCandidature)).slice(0, 4));
  readonly sujetsSuggeres = computed(() => this.sujets().filter((s) => !this.candidatures().some((c) => c.sujet.id === s.id)).slice(0, 3));

  constructor() { this.charger(); }

  charger(): void {
    const id = this.auth.utilisateur?.id;
    if (!id) { this.erreur.set('Votre session a expiré. Reconnectez-vous pour consulter votre espace.'); this.chargement.set(false); return; }
    forkJoin({
      sujets: this.api.sujetsDisponibles().pipe(catchError((error: HttpErrorResponse) => { this.erreur.set(this.messageErreur(error)); return of([] as Sujet[]); })),
      candidatures: this.api.candidaturesEtudiant(id).pipe(catchError((error: HttpErrorResponse) => { this.erreur.set(this.messageErreur(error)); return of([] as Candidature[]); })),
    }).subscribe(({ sujets, candidatures }) => {
      this.sujets.set(sujets);
      this.candidatures.set(candidatures);
      this.chargement.set(false);
    });
  }

  compter(statut: StatutCandidature): number { return this.candidatures().filter((c) => c.statut === statut).length; }
  trackById(_index: number, item: { id: number }): number { return item.id; }
  statutLabel(statut: StatutCandidature): string { return { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REJETEE: 'Rejetée' }[statut]; }
  private messageErreur(error: HttpErrorResponse): string { return error.error?.detail ?? error.error?.message ?? 'Impossible de charger certaines données. Vérifiez que le backend est démarré.'; }
}
