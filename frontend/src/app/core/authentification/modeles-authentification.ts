export type Role = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT' | 'RESPONSABLE';

export interface UtilisateurConnecte {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  utilisateur: UtilisateurConnecte;
}

export interface InscriptionEtudiantRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  matricule: string;
  niveau: string;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: number;
  utilisateur: UtilisateurConnecte;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrateur',
  ENSEIGNANT: 'Enseignant',
  ETUDIANT: 'Étudiant',
  RESPONSABLE: 'Responsable pédagogique',
};
