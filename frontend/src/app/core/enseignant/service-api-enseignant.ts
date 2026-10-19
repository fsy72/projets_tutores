import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sujet, StatutCandidature } from '../sujets/modeles-sujets';

const API_URL = 'http://localhost:8080/api';

export interface SujetEnseignantRequest {
  titre: string;
  description: string;
  capaciteMax: number;
  statut: Sujet['statut'];
}

export interface CandidatureEnseignant {
  id: number;
  dateCandidature: string;
  motivation: string | null;
  statut: StatutCandidature;
  dateDecision: string | null;
  etudiant: { id: number; nom: string; prenom: string; email: string };
  sujet: Sujet;
}

@Injectable({ providedIn: 'root' })
export class TeacherApiService {
  constructor(private readonly http: HttpClient) {}

  sujets(): Observable<Sujet[]> {
    return this.http.get<Sujet[]>(`${API_URL}/sujets`);
  }

  creerSujet(form: SujetEnseignantRequest): Observable<Sujet> {
    return this.http.post<Sujet>(`${API_URL}/sujets`, form);
  }

  modifierSujet(id: number, form: SujetEnseignantRequest): Observable<Sujet> {
    return this.http.put<Sujet>(`${API_URL}/sujets/${id}`, form);
  }

  supprimerSujet(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/sujets/${id}`);
  }

  candidaturesParSujet(id: number): Observable<CandidatureEnseignant[]> {
    return this.http.get<CandidatureEnseignant[]>(`${API_URL}/candidatures/sujet/${id}`);
  }
}
