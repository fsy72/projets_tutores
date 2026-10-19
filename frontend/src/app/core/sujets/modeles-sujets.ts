export interface Sujet {
  id: number;
  titre: string;
  description: string | null;
  capaciteMax: number;
  statut: 'DISPONIBLE' | 'INDISPONIBLE';
  dateCreation: string;
  enseignant?: { id: number; nom?: string; prenom?: string; email?: string } | null;
  placesRestantes?: number;
}

export type StatutCandidature = 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE';

export interface Candidature {
  id: number;
  dateCandidature: string;
  motivation: string | null;
  statut: StatutCandidature;
  dateDecision: string | null;
  sujet: Sujet;
}
