import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/authentification/service-authentification';
import { CandidatureEnseignant, SujetEnseignantRequest, TeacherApiService } from '../../core/enseignant/service-api-enseignant';
import { Sujet, StatutCandidature } from '../../core/sujets/modeles-sujets';

type TeacherTab = 'overview' | 'subjects' | 'applications';
type ModalMode = 'subject' | 'delete' | null;

@Component({
  selector: 'app-page-enseignant',
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './page-enseignant.html',
})
export class PageEnseignant {
  private readonly api = inject(TeacherApiService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly onglet = signal<TeacherTab>('overview');
  readonly sujets = signal<Sujet[]>([]);
  readonly candidatures = signal<CandidatureEnseignant[]>([]);
  readonly chargement = signal(true);
  readonly chargementCandidatures = signal(false);
  readonly envoi = signal(false);
  readonly erreur = signal('');
  readonly succes = signal('');
  readonly modal = signal<ModalMode>(null);
  readonly sujetEnEdition = signal<number | null>(null);
  readonly sujetCible = signal<Sujet | null>(null);
  readonly sujetSelectionneId = signal<number | null>(null);
  readonly sujetsDisponibles = computed(() => this.sujets().filter((s) => s.statut === 'DISPONIBLE').length);
  readonly candidaturesRecentes = computed(() => [...this.candidatures()].sort((a, b) => b.dateCandidature.localeCompare(a.dateCandidature)).slice(0, 5));
  readonly candidaturesFiltrees = computed(() => {
    const sujetId = this.sujetSelectionneId();
    return this.candidatures().filter((c) => sujetId === null || c.sujet.id === sujetId).sort((a, b) => b.dateCandidature.localeCompare(a.dateCandidature));
  });
  readonly titreOnglet = computed(() => ({ overview: 'Vue d’ensemble', subjects: 'Mes sujets', applications: 'Candidatures reçues' })[this.onglet()]);
  form = this.formulaireVide();

  constructor() { this.charger(); }

  get initiales(): string { return this.initials(this.auth.utilisateur?.prenom, this.auth.utilisateur?.nom); }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set('');
    const enseignantId = this.auth.utilisateur?.id;
    this.api.sujets().subscribe({
      next: (items) => {
        const miens = items.filter((s) => s.enseignant?.id === enseignantId);
        this.sujets.set(miens);
        if (this.sujetSelectionneId() !== null && !miens.some((s) => s.id === this.sujetSelectionneId())) this.sujetSelectionneId.set(null);
        if (!this.sujetSelectionneId() && miens.length === 1) this.sujetSelectionneId.set(miens[0].id);
        if (!miens.length) { this.candidatures.set([]); this.chargement.set(false); return; }
        forkJoin(miens.map((s) => this.api.candidaturesParSujet(s.id).pipe(catchError(() => of([] as CandidatureEnseignant[]))))).subscribe((listes) => {
          this.candidatures.set(listes.flat());
          this.chargement.set(false);
        });
      },
      error: (error: HttpErrorResponse) => { this.erreur.set(this.messageErreur(error)); this.chargement.set(false); },
    });
  }

  changerOnglet(tab: TeacherTab): void { this.onglet.set(tab); this.erreur.set(''); this.succes.set(''); }
  selectionnerSujet(id: number | null): void { this.sujetSelectionneId.set(id); }
  countCandidatures(statut: StatutCandidature): number { return this.candidatures().filter((c) => c.statut === statut).length; }
  trackById(_index: number, item: { id: number }): number { return item.id; }
  countForSujet(sujetId: number): number { return this.candidatures().filter((c) => c.sujet.id === sujetId).length; }
  statutLabel(statut: StatutCandidature): string { return { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REJETEE: 'Rejetée' }[statut]; }
  initials(prenom?: string, nom?: string): string { return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toLocaleUpperCase('fr') || 'E'; }

  ouvrirCreation(): void { this.form = this.formulaireVide(); this.sujetEnEdition.set(null); this.erreur.set(''); this.modal.set('subject'); }
  ouvrirModification(sujet: Sujet): void { this.form = { titre: sujet.titre, description: sujet.description ?? '', capaciteMax: sujet.capaciteMax, statut: sujet.statut }; this.sujetEnEdition.set(sujet.id); this.erreur.set(''); this.modal.set('subject'); }
  demanderSuppression(sujet: Sujet): void { this.sujetCible.set(sujet); this.erreur.set(''); this.modal.set('delete'); }
  voirCandidatures(sujet: Sujet): void { this.sujetSelectionneId.set(sujet.id); this.changerOnglet('applications'); }

  enregistrerSujet(): void {
    this.erreur.set('');
    const titre = this.form.titre.trim();
    if (!titre) { this.erreur.set('Le titre du sujet est obligatoire.'); return; }
    if (this.form.capaciteMax < 1) { this.erreur.set('La capacité doit être au moins égale à 1.'); return; }
    const request: SujetEnseignantRequest = { ...this.form, titre, description: this.form.description.trim() };
    const id = this.sujetEnEdition();
    this.envoi.set(true);
    const requete = id ? this.api.modifierSujet(id, request) : this.api.creerSujet(request);
    requete.subscribe({
      next: () => { this.envoi.set(false); this.modal.set(null); this.succes.set(id ? 'Le sujet a été mis à jour.' : 'Le sujet a été créé.'); this.charger(); },
      error: (error: HttpErrorResponse) => { this.envoi.set(false); this.erreur.set(this.messageErreur(error)); },
    });
  }

  supprimerSujet(): void {
    const sujet = this.sujetCible();
    if (!sujet) return;
    this.envoi.set(true);
    this.api.supprimerSujet(sujet.id).subscribe({
      next: () => { this.envoi.set(false); this.modal.set(null); this.sujetCible.set(null); this.succes.set('Le sujet et ses candidatures ont été supprimés.'); this.charger(); },
      error: (error: HttpErrorResponse) => { this.envoi.set(false); this.erreur.set(this.messageErreur(error)); },
    });
  }

  fermerModal(): void { if (!this.envoi()) this.modal.set(null); }
  deconnecter(): void { this.auth.deconnecter(); void this.router.navigate(['/connexion']); }

  private formulaireVide(): SujetEnseignantRequest { return { titre: '', description: '', capaciteMax: 1, statut: 'DISPONIBLE' }; }
  private messageErreur(error: HttpErrorResponse): string { return error.error?.detail ?? error.error?.message ?? 'Impossible de communiquer avec le serveur. Vérifiez que le backend est démarré.'; }
}
