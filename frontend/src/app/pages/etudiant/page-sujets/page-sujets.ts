import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentApiService } from '../../../core/sujets/service-api-etudiant';
import { Sujet } from '../../../core/sujets/modeles-sujets';
import { AuthService } from '../../../core/authentification/service-authentification';

@Component({
  selector: 'app-page-sujets',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe
  ],
  templateUrl: './page-sujets.html',
  styleUrl: './page-sujets.css',
})
export class PageSujets {
  private readonly api = inject(StudentApiService);
  private readonly auth = inject(AuthService);
  private readonly sujetList = signal<Sujet[]>([]);
  readonly recherche = signal('');
  readonly filteredSubjects = computed(() => {
    const query = this.recherche().trim().toLocaleLowerCase('fr');
    if (!query) return this.sujetList();
    return this.sujetList().filter((sujet) => `${sujet.titre} ${sujet.description ?? ''}`.toLocaleLowerCase('fr').includes(query));
  });
  readonly chargement = signal(true);
  readonly erreur = signal('');
  readonly succes = signal('');
  readonly envoi = signal(false);
  readonly sujetSelectionne = signal<Sujet | null>(null);
  motivation = '';
  private readonly idsCandidatures = signal<Set<number>>(new Set());

  constructor() { this.charger(); }

  trackById(_index: number, item: { id: number }): number { return item.id; }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set('');
    this.api.sujetsDisponibles().subscribe({
      next: (sujets) => { this.sujetList.set(sujets); this.chargement.set(false); },
      error: (error: HttpErrorResponse) => { this.erreur.set(this.messageErreur(error)); this.chargement.set(false); },
    });
    const userId = this.auth.utilisateur?.id;
    if (userId) this.api.candidaturesEtudiant(userId).subscribe({
      next: (candidatures) => this.idsCandidatures.set(new Set(candidatures.map((c) => c.sujet.id))),
      error: () => undefined,
    });
  }

  dejaPostule(sujetId: number): boolean { return this.idsCandidatures().has(sujetId); }
  ouvrirFormulaire(sujet: Sujet): void { this.succes.set(''); this.erreur.set(''); this.motivation = ''; this.sujetSelectionne.set(sujet); }
  fermerFormulaire(): void { if (!this.envoi()) this.sujetSelectionne.set(null); }

  deposer(): void {
    const sujet = this.sujetSelectionne();
    if (!sujet) return;
    this.envoi.set(true);
    this.erreur.set('');
    this.api.deposerCandidature(sujet.id, this.motivation.trim()).subscribe({
      next: () => {
        this.envoi.set(false);
        this.sujetSelectionne.set(null);
        this.idsCandidatures.update((ids) => new Set([...ids, sujet.id]));
        this.succes.set('Votre candidature a bien été déposée. Vous pouvez suivre son statut dans « Mes candidatures ».');
        this.chargerSujetsSeuls();
      },
      error: (error: HttpErrorResponse) => { this.envoi.set(false); this.erreur.set(this.messageErreur(error)); },
    });
  }

  private chargerSujetsSeuls(): void {
    this.api.sujetsDisponibles().subscribe({ next: (sujets) => this.sujetList.set(sujets) });
  }

  private messageErreur(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'Impossible de communiquer avec le serveur. Vérifiez que le backend est démarré.';
  }
}
