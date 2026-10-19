import { Role } from '../authentification/modeles-authentification';
import { Sujet, StatutCandidature } from '../sujets/modeles-sujets';

export interface UtilisateurAdmin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  matricule: string | null;
  niveau: string | null;
  departement: string | null;
}

export interface UtilisateurForm {
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  matricule: string;
  niveau: string;
  departement: string;
  motDePasse: string;
}

export interface CandidatureAdmin {
  id: number;
  dateCandidature: string;
  statut: StatutCandidature;
  motivation: string | null;
  sujet: Sujet;
  etudiant: Pick<UtilisateurAdmin, 'id' | 'nom' | 'prenom' | 'email'>;
}
