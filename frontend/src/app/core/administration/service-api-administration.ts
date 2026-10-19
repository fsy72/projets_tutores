import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sujet } from '../sujets/modeles-sujets';
import { CandidatureAdmin, UtilisateurAdmin, UtilisateurForm } from './modeles-administration';

const API_URL = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private readonly http: HttpClient) {}

  utilisateurs(): Observable<UtilisateurAdmin[]> {
    return this.http.get<UtilisateurAdmin[]>(`${API_URL}/utilisateurs`);
  }

  creerUtilisateur(form: UtilisateurForm): Observable<UtilisateurAdmin> {
    return this.http.post<UtilisateurAdmin>(`${API_URL}/utilisateurs`, form);
  }

  modifierUtilisateur(id: number, form: Omit<UtilisateurForm, 'motDePasse'>): Observable<UtilisateurAdmin> {
    const { nom, prenom, email, role, matricule, niveau, departement } = form;
    return this.http.put<UtilisateurAdmin>(`${API_URL}/utilisateurs/${id}`, {
      nom, prenom, email, role, matricule: matricule || null, niveau: niveau || null, departement: departement || null,
    });
  }

  changerMotDePasse(id: number, motDePasse: string): Observable<void> {
    return this.http.patch<void>(`${API_URL}/utilisateurs/${id}/mot-de-passe`, { motDePasse });
  }

  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/utilisateurs/${id}`);
  }

  sujets(): Observable<Sujet[]> {
    return this.http.get<Sujet[]>(`${API_URL}/sujets`);
  }

  candidatures(): Observable<CandidatureAdmin[]> {
    return this.http.get<CandidatureAdmin[]>(`${API_URL}/candidatures`);
  }
}
