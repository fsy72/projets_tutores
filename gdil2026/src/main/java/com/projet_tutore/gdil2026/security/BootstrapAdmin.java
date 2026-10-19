package com.projet_tutore.gdil2026.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.projet_tutore.gdil2026.utilisateur.*;

@Component
public class BootstrapAdmin implements ApplicationRunner {
    private final String email;
    private final String motDePasse;
    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurService utilisateurService;

    public BootstrapAdmin(@Value("${app.bootstrap-admin.email:}") String email,
            @Value("${app.bootstrap-admin.password:}") String motDePasse,
            UtilisateurRepository utilisateurRepository, UtilisateurService utilisateurService) {
        this.email = email;
        this.motDePasse = motDePasse;
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurService = utilisateurService;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() && motDePasse.isBlank()) return;
        if (email.isBlank() || motDePasse.isBlank()) {
            throw new IllegalStateException("Renseignez ensemble BOOTSTRAP_ADMIN_EMAIL et BOOTSTRAP_ADMIN_PASSWORD.");
        }
        var existant = utilisateurRepository.findByEmailIgnoreCase(email.trim());
        if (existant.isPresent()) {
            if (existant.get().getRole() != Role.ADMIN) {
                throw new IllegalStateException("L'email de bootstrap existe déjà mais n'appartient pas à un admin.");
            }
            if (existant.get().getMotDePasseHash() == null || existant.get().getMotDePasseHash().isBlank()) {
                utilisateurService.changerMotDePasse(existant.get().getId(), motDePasse);
            }
            return;
        }
        Utilisateur admin = new Utilisateur();
        admin.setNom("Administrateur");
        admin.setPrenom("Initial");
        admin.setEmail(email.trim());
        admin.setRole(Role.ADMIN);
        utilisateurService.creer(admin, motDePasse);
    }
}
