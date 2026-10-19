import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ResponsibleApiService, CandidatureResponsable } from '../../core/responsable/service-api-responsable';
import { AuthService } from '../../core/authentification/service-authentification';
import { Sujet, StatutCandidature } from '../../core/sujets/modeles-sujets';

type ResponsibleTab = 'overview' | 'applications' | 'subjects';
type Decision = 'ACCEPTER' | 'REJETER' | null;
type StatusFilter = StatutCandidature | 'TOUS';

@Component({
  selector: 'app-page-responsable',
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './page-responsable.html',
})
export class PageResponsable {
  private readonly api = inject(ResponsibleApiService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly onglet = signal<ResponsibleTab>('overview');
  readonly candidatures = signal<CandidatureResponsable[]>([]);
  readonly sujets = signal<Sujet[]>([]);
  readonly chargement = signal(true);
  readonly envoi = signal(false);
  readonly erreur = signal('');
  readonly succes = signal('');
  readonly decision = signal<Decision>(null);
  readonly candidatureCible = signal<CandidatureResponsable | null>(null);
  readonly recherche = signal('');
  readonly filtreStatut = signal<StatusFilter>('TOUS');
  readonly filtreSujet = signal<number | 'TOUS'>('TOUS');
  readonly titreOnglet = computed(() => ({ overview: 'Vue d’ensemble', applications: 'Candidatures', subjects: 'Sujets' })[this.onglet()]);
  readonly candidaturesEnAttente = computed(() => this.candidatures().filter((c) => c.statut === 'EN_ATTENTE').sort((a, b) => b.dateCandidature.localeCompare(a.dateCandidature)));
  readonly candidaturesFiltrees = computed(() => {
    const texte = this.recherche().trim().toLocaleLowerCase('fr');
    const statut = this.filtreStatut();
    const sujet = this.filtreSujet();
    return this.candidatures().filter((c) => {
      const correspondTexte = !texte || `${c.etudiant.prenom} ${c.etudiant.nom} ${c.etudiant.email} ${c.sujet.titre}`.toLocaleLowerCase('fr').includes(texte);
      return correspondTexte && (statut === 'TOUS' || c.statut === statut) && (sujet === 'TOUS' || c.sujet.id === sujet);
    }).sort((a, b) => b.dateCandidature.localeCompare(a.dateCandidature));
  });

  constructor() { this.charger(); }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set('');
    this.api.candidatures().subscribe({
      next: (items) => {
        this.candidatures.set(items);
        this.api.sujets().subscribe({
          next: (sujets) => { this.sujets.set(sujets); this.chargement.set(false); },
          error: (error: HttpErrorResponse) => { this.sujets.set([...new Map(items.map((c) => [c.sujet.id, c.sujet])).values()]); this.erreur.set(this.messageErreur(error)); this.chargement.set(false); },
        });
      },
      error: (error: HttpErrorResponse) => { this.erreur.set(this.messageErreur(error)); this.chargement.set(false); },
    });
  }

  changerOnglet(tab: ResponsibleTab): void { this.onglet.set(tab); this.erreur.set(''); this.succes.set(''); }
  compter(statut: StatutCandidature): number { return this.candidatures().filter((c) => c.statut === statut).length; }
  trackById(_index: number, item: { id: number }): number { return item.id; }
  placesPrises(sujetId: number): number { return this.candidatures().filter((c) => c.sujet.id === sujetId && c.statut === 'ACCEPTEE').length; }
  placesRestantes(sujet: Sujet): number { return Math.max(0, sujet.capaciteMax - this.placesPrises(sujet.id)); }
  ratioCapacite(sujet: Sujet): number { return sujet.capaciteMax > 0 ? Math.min(100, this.placesPrises(sujet.id) / sujet.capaciteMax * 100) : 0; }
  statutLabel(statut: StatutCandidature): string { return { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REJETEE: 'Rejetée' }[statut]; }

  ouvrirCandidaturesEnAttente(): void { this.filtreStatut.set('EN_ATTENTE'); this.filtreSujet.set('TOUS'); this.recherche.set(''); this.changerOnglet('applications'); }
  ouvrirCandidatures(candidature: CandidatureResponsable): void { this.filtreStatut.set('TOUS'); this.filtreSujet.set(candidature.sujet.id); this.recherche.set(''); this.changerOnglet('applications'); }
  filtrerParSujet(sujetId: number): void { this.filtreSujet.set(sujetId); this.filtreStatut.set('TOUS'); this.recherche.set(''); this.changerOnglet('applications'); }
  demanderDecision(candidature: CandidatureResponsable, decision: Exclude<Decision, null>): void { this.erreur.set(''); this.candidatureCible.set(candidature); this.decision.set(decision); }
  fermerDecision(): void { if (!this.envoi()) { this.decision.set(null); this.candidatureCible.set(null); } }

  confirmerDecision(): void {
    const candidature = this.candidatureCible();
    const decision = this.decision();
    if (!candidature || !decision) return;
    this.envoi.set(true);
    this.erreur.set('');
    const action = decision === 'ACCEPTER' ? this.api.accepter(candidature.id) : this.api.rejeter(candidature.id);
    action.subscribe({
      next: () => { this.envoi.set(false); this.decision.set(null); this.candidatureCible.set(null); this.succes.set(decision === 'ACCEPTER' ? 'La candidature a été acceptée.' : 'La candidature a été rejetée.'); this.charger(); },
      error: (error: HttpErrorResponse) => { this.envoi.set(false); this.erreur.set(this.messageErreur(error)); },
    });
  }

  deconnecter(): void { this.auth.deconnecter(); void this.router.navigate(['/connexion']); }
  private messageErreur(error: HttpErrorResponse): string { return error.error?.detail ?? error.error?.message ?? 'Impossible de communiquer avec le serveur. Vérifiez que le backend est démarré.'; }
}
