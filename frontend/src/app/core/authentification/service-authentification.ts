import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthSession, InscriptionEtudiantRequest, LoginResponse, UtilisateurConnecte } from './modeles-authentification';

const API_URL = 'http://localhost:8080/api';
const SESSION_KEY = 'projets-tutores.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storedSession = this.readSession();
  readonly session = signal<AuthSession | null>(this.storedSession);

  constructor(private readonly http: HttpClient) {}

  get utilisateur(): UtilisateurConnecte | null {
    return this.session()?.utilisateur ?? null;
  }

  connecter(email: string, motDePasse: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/connexion`, { email, motDePasse }).pipe(
      tap((response) => {
        const session: AuthSession = {
          accessToken: response.accessToken,
          expiresAt: Date.now() + response.expiresInSeconds * 1000,
          utilisateur: response.utilisateur,
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        this.session.set(session);
      }),
    );
  }

  inscrireEtudiant(request: InscriptionEtudiantRequest): Observable<unknown> {
    return this.http.post(`${API_URL}/auth/inscription-etudiant`, request);
  }

  deconnecter(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.session.set(null);
  }

  estConnecte(): boolean {
    const session = this.session();
    if (!session) return false;
    if (session.expiresAt <= Date.now()) {
      this.deconnecter();
      return false;
    }
    return true;
  }

  private readSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as AuthSession;
      if (!session.accessToken || !session.utilisateur || session.expiresAt <= Date.now()) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
