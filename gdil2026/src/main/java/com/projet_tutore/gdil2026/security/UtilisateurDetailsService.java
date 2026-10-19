package com.projet_tutore.gdil2026.security;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import com.projet_tutore.gdil2026.utilisateur.Utilisateur;
import com.projet_tutore.gdil2026.utilisateur.UtilisateurRepository;

@Service
public class UtilisateurDetailsService implements UserDetailsService {
    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurDetailsService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Identifiants invalides."));
        if (utilisateur.getMotDePasseHash() == null || utilisateur.getMotDePasseHash().isBlank()) {
            throw new UsernameNotFoundException("Ce compte doit d'abord recevoir un nouveau mot de passe.");
        }
        return User.withUsername(utilisateur.getEmail())
                .password(utilisateur.getMotDePasseHash())
                .roles(utilisateur.getRole().name())
                .build();
    }
}
