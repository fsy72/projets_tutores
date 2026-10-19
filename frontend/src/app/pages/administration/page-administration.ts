import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/authentification/service-authentification';
import { ROLE_LABELS, Role } from '../../core/authentification/modeles-authentification';
import { AdminApiService } from '../../core/administration/service-api-administration';
import { CandidatureAdmin, UtilisateurAdmin, UtilisateurForm } from '../../core/administration/modeles-administration';
import { Sujet } from '../../core/sujets/modeles-sujets';

type AdminTab = 'overview' | 'users' | 'subjects' | 'applications';
type RoleFilter = Role | 'TOUS';

@Component({
  selector: 'app-page-administration',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './page-administration.html',
})
export class PageAdmin {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly roles: { value: Role; label: string }[] = [
    { value: 'ETUDIANT', label: 'Étudiant' },
    { value: 'ENSEIGNANT', label: 'Enseignant' },
    { value: 'RESPONSABLE', label: 'Responsable pédagogique' },
  ];
  readonly rolesFiltrables = this.roles.filter((role) => role.value !== 'ADMIN');
  readonly onglet = signal<AdminTab>('overview');
  readonly utilisateurs = signal<UtilisateurAdmin[]>([]);
  readonly sujets = signal<Sujet[]>([]);
  readonly candidatures = signal<CandidatureAdmin[]>([]);
  readonly chargement = signal(true);
  readonly loadingSujets = signal(true);
  readonly loadingCandidatures = signal(true);
  readonly erreur = signal('');
  readonly succes = signal('');
  readonly envoi = signal(false);
  readonly recherche = signal('');
  readonly rechercheCandidature = signal('');
  readonly filtreRole = signal<RoleFilter>('TOUS');
  readonly modal = signal<'utilisateur' | 'motdepasse' | 'suppression' | null>(null);
  readonly utilisateurEnEdition = signal<number | null>(null);
  readonly utilisateurCible = signal<UtilisateurAdmin | null>(null);
  readonly utilisateursGeres = computed(() => this.utilisateurs().filter((user) => user.role !== 'ADMIN'));
  readonly utilisateursFiltres = computed(() => {
    const query = this.recherche().trim().toLocaleLowerCase('fr');
    const role = this.filtreRole();
    return this.utilisateursGeres().filter((user) => {
      const matchesRole = role === 'TOUS' || user.role === role;
      const text = `${user.nom} ${user.prenom} ${user.email}`.toLocaleLowerCase('fr');
      return matchesRole && (!query || text.includes(query));
    });
  });
  readonly candidaturesFiltrees = computed(() => {
    const query = this.rechercheCandidature().trim().toLocaleLowerCase('fr');
    if (!query) return this.candidatures();
    return this.candidatures().filter((c) =>
      `${c.etudiant?.nom ?? ''} ${c.etudiant?.prenom ?? ''} ${c.sujet?.titre ?? ''}`.toLocaleLowerCase('fr').includes(query),
    );
  });
  form: UtilisateurForm = this.formulaireVide();
  confirmationNouveauCompte = '';
  nouveauMotDePasse = '';
  confirmationMotDePasse = '';

  constructor() { this.chargerDonnees(); }

  get titreOnglet(): string {
    return { overview: 'Vue d’ensemble', users: 'Utilisateurs', subjects: 'Sujets', applications: 'Candidatures' }[this.onglet()];
  }

  chargerDonnees(): void {
    this.chargement.set(true);
    this.api.utilisateurs().subscribe({
      next: (items) => { this.utilisateurs.set(items); this.chargement.set(false); },
      error: (error: HttpErrorResponse) => { this.erreur.set(this.messageErreur(error)); this.chargement.set(false); },
    });
    this.api.sujets().subscribe({
      next: (items) => { this.sujets.set(items); this.loadingSujets.set(false); },
      error: () => { this.loadingSujets.set(false); },
    });
    this.api.candidatures().subscribe({
      next: (items) => { this.candidatures.set([...items].sort((a, b) => b.dateCandidature.localeCompare(a.dateCandidature))); this.loadingCandidatures.set(false); },
      error: () => { this.loadingCandidatures.set(false); },
    });
  }

  changerOnglet(tab: AdminTab): void { this.onglet.set(tab); this.erreur.set(''); this.succes.set(''); }
  ouvrirCreation(): void { this.form = this.formulaireVide(); this.confirmationNouveauCompte = ''; this.utilisateurEnEdition.set(null); this.erreur.set(''); this.modal.set('utilisateur'); }

  ouvrirModification(user: UtilisateurAdmin): void {
    this.form = { nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, matricule: user.matricule ?? '', niveau: user.niveau ?? '', departement: user.departement ?? '', motDePasse: '' };
    this.utilisateurEnEdition.set(user.id); this.erreur.set(''); this.modal.set('utilisateur');
  }

  enregistrerUtilisateur(): void {
    this.erreur.set('');
    if (!this.form.prenom.trim() || !this.form.nom.trim() || !this.form.email.trim() || !this.form.role) { this.erreur.set('Le prénom, le nom, l’adresse e-mail et le rôle sont obligatoires.'); return; }
    if (!this.utilisateurEnEdition() && this.form.role === 'ADMIN') { this.erreur.set('La création d’un compte administrateur n’est pas autorisée depuis cette interface.'); return; }
    if (!this.utilisateurEnEdition() && this.form.motDePasse.length < 8) { this.erreur.set('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (!this.utilisateurEnEdition() && this.form.motDePasse !== this.confirmationNouveauCompte) { this.erreur.set('Les deux mots de passe ne correspondent pas.'); return; }
    if (this.form.role === 'ETUDIANT' && (!this.form.matricule.trim() || !this.form.niveau.trim())) { this.erreur.set('Le matricule et le niveau sont requis pour un étudiant.'); return; }
    if (this.form.role === 'ENSEIGNANT' && !this.form.departement.trim()) { this.erreur.set('Le département est requis pour un enseignant.'); return; }
    this.envoi.set(true);
    const id = this.utilisateurEnEdition();
    const request = id ? this.api.modifierUtilisateur(id, this.form) : this.api.creerUtilisateur(this.form);
    request.subscribe({
      next: () => { this.envoi.set(false); this.modal.set(null); this.succes.set(id ? 'Les informations du compte ont été mises à jour.' : 'Le compte utilisateur a été créé.'); this.chargerUtilisateurs(); },
      error: (error: HttpErrorResponse) => { this.envoi.set(false); this.erreur.set(this.messageErreur(error)); },
    });
  }

  ouvrirMotDePasse(user: UtilisateurAdmin): void { this.utilisateurCible.set(user); this.nouveauMotDePasse = ''; this.confirmationMotDePasse = ''; this.erreur.set(''); this.modal.set('motdepasse'); }

  changerMotDePasse(): void {
    const user = this.utilisateurCible();
    if (!user) return;
    if (this.nouveauMotDePasse.length < 8) { this.erreur.set('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (this.nouveauMotDePasse !== this.confirmationMotDePasse) { this.erreur.set('Les mots de passe ne correspondent pas.'); return; }
    this.envoi.set(true); this.erreur.set('');
    this.api.changerMotDePasse(user.id, this.nouveauMotDePasse).subscribe({
      next: () => { this.envoi.set(false); this.modal.set(null); this.succes.set(`Le mot de passe de ${user.prenom} ${user.nom} a été modifié.`); },
      error: (error: HttpErrorResponse) => { this.envoi.set(false); this.erreur.set(this.messageErreur(error)); },
    });
  }

  demanderSuppression(user: UtilisateurAdmin): void { this.utilisateurCible.set(user); this.erreur.set(''); this.modal.set('suppression'); }

  supprimerUtilisateur(): void {
    const user = this.utilisateurCible();
    if (!user) return;
    this.envoi.set(true); this.erreur.set('');
    this.api.supprimerUtilisateur(user.id).subscribe({
      next: () => { this.envoi.set(false); this.modal.set(null); this.succes.set(`Le compte de ${user.prenom} ${user.nom} a été supprimé.`); this.chargerUtilisateurs(); },
      error: (error: HttpErrorResponse) => { this.envoi.set(false); this.erreur.set(this.messageErreur(error)); },
    });
  }

  fermerModal(): void { if (!this.envoi()) this.modal.set(null); }
  roleLabel(role: Role): string { return ROLE_LABELS[role]; }
  trackById(_index: number, item: { id: number }): number { return item.id; }
  trackByValue(_index: number, item: { value: string }): string { return item.value; }
  countRole(role: Role): number { return this.utilisateurs().filter((u) => u.role === role).length; }
  ratioRole(role: Role): number { const total = this.utilisateurs().length; return total ? (this.countRole(role) / total) * 100 : 0; }
  countSubjects(statut: Sujet['statut']): number { return this.sujets().filter((s) => s.statut === statut).length; }
  countApplications(statut: CandidatureAdmin['statut']): number { return this.candidatures().filter((c) => c.statut === statut).length; }
  statutLabel(statut: CandidatureAdmin['statut']): string { return { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REJETEE: 'Rejetée' }[statut]; }

  deconnecter(): void { this.auth.deconnecter(); void this.router.navigate(['/connexion']); }

  private chargerUtilisateurs(): void {
    this.api.utilisateurs().subscribe({
      next: (items) => this.utilisateurs.set(items),
      error: (error: HttpErrorResponse) => this.erreur.set(this.messageErreur(error)),
    });
  }

  private formulaireVide(): UtilisateurForm {
    return { nom: '', prenom: '', email: '', role: 'ETUDIANT', matricule: '', niveau: '', departement: '', motDePasse: '' };
  }

  private messageErreur(error: HttpErrorResponse): string {
    return error.error?.detail ?? error.error?.message ?? 'L’opération a échoué. Vérifiez que le serveur répond et réessayez.';
  }
}
