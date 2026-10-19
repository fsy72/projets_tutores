package com.projet_tutore.gdil2026.auth;

import com.projet_tutore.gdil2026.utilisateur.Role;

public record LoginResponse(String accessToken, String tokenType, long expiresInSeconds,
        UtilisateurConnecte utilisateur) {
    public record UtilisateurConnecte(Long id, String nom, String prenom, String email, Role role) { }
}
