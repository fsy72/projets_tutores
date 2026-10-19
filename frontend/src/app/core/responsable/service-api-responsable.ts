import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sujet, StatutCandidature } from '../sujets/modeles-sujets';

const API_URL = 'http://localhost:8080/api';

export interface CandidatureResponsable {
  id: number;
  dateCandidature: string;
  motivation: string | null;
  statut: StatutCandidature;
  dateDecision: string | null;
  etudiant: { id: number; nom: string; prenom: string; email: string };
  sujet: Sujet;
}

@Injectable({ providedIn: 'root' })
export class ResponsibleApiService {
  constructor(private readonly http: HttpClient) {}

  candidatures(): Observable<CandidatureResponsable[]> {
    return this.http.get<CandidatureResponsable[]>(`${API_URL}/candidatures`);
  }

  sujets(): Observable<Sujet[]> {
    return this.http.get<Sujet[]>(`${API_URL}/sujets`);
  }

  accepter(id: number): Observable<CandidatureResponsable> {
    return this.http.post<CandidatureResponsable>(`${API_URL}/candidatures/${id}/accepter`, {});
  }

  rejeter(id: number): Observable<CandidatureResponsable> {
    return this.http.post<CandidatureResponsable>(`${API_URL}/candidatures/${id}/rejeter`, {});
  }
}
