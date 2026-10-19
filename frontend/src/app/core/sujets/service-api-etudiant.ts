import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { Candidature, Sujet } from './modeles-sujets';

const API_URL = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  constructor(private readonly http: HttpClient) {}

  sujetsDisponibles(): Observable<Sujet[]> {
    return this.http.get<Sujet[]>(`${API_URL}/sujets/disponibles`).pipe(
      switchMap((sujets) => {
        if (sujets.length === 0) return of(sujets);
        return forkJoin(sujets.map((sujet) =>
          this.http.get<number>(`${API_URL}/sujets/${sujet.id}/places-restantes`),
        )).pipe(map((places) => sujets.map((sujet, index) => ({ ...sujet, placesRestantes: places[index] }))));
      }),
    );
  }

  candidaturesEtudiant(etudiantId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${API_URL}/candidatures/etudiant/${etudiantId}`);
  }

  deposerCandidature(sujetId: number, motivation: string): Observable<Candidature> {
    return this.http.post<Candidature>(`${API_URL}/candidatures`, { sujetId, motivation });
  }
}
