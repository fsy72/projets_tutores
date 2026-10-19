package com.projet_tutore.gdil2026.utilisateur;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class UtilisateurService {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Utilisateur creer(Utilisateur utilisateur, String motDePasse) {
        verifierUtilisateur(utilisateur);
        verifierMotDePasse(motDePasse);
        if (utilisateurRepository.existsByEmailIgnoreCase(utilisateur.getEmail().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse email est déjà utilisée.");
        }
        verifierMatricule(utilisateur, null);
        utilisateur.setId(null);
        utilisateur.setEmail(utilisateur.getEmail().trim());
        utilisateur.setMotDePasseHash(passwordEncoder.encode(motDePasse));
        normaliserChampsSelonRole(utilisateur);
        return utilisateurRepository.save(utilisateur);
    }

    @Transactional(readOnly = true)
    public Utilisateur obtenirParId(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
    }

    @Transactional(readOnly = true)
    public List<Utilisateur> lister() {
        return utilisateurRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Utilisateur> listerParRole(Role role) {
        return utilisateurRepository.findByRole(role);
    }

    public Utilisateur modifier(Long id, Utilisateur donnees) {
        verifierUtilisateur(donnees);
        Utilisateur existant = obtenirParId(id);
        String email = donnees.getEmail().trim();
        if (utilisateurRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse email est déjà utilisée.");
        }
        verifierMatricule(donnees, id);
        existant.setNom(donnees.getNom().trim());
        existant.setPrenom(donnees.getPrenom().trim());
        existant.setEmail(email);
        existant.setRole(donnees.getRole());
        existant.setMatricule(normaliser(donnees.getMatricule()));
        existant.setNiveau(normaliser(donnees.getNiveau()));
        existant.setDepartement(normaliser(donnees.getDepartement()));
        normaliserChampsSelonRole(existant);
        return utilisateurRepository.save(existant);
    }

    public void supprimer(Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable.");
        }
        utilisateurRepository.deleteById(id);
    }

    public void changerMotDePasse(Long id, String motDePasse) {
        verifierMotDePasse(motDePasse);
        Utilisateur utilisateur = obtenirParId(id);
        utilisateur.setMotDePasseHash(passwordEncoder.encode(motDePasse));
        utilisateurRepository.save(utilisateur);
    }

    private void verifierUtilisateur(Utilisateur u) {
        if (u == null || vide(u.getNom()) || vide(u.getPrenom()) || vide(u.getEmail()) || u.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le nom, le prénom, l'email et le rôle sont obligatoires.");
        }
        if (u.getRole() == Role.ETUDIANT && (vide(u.getMatricule()) || vide(u.getNiveau()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le matricule et le niveau sont obligatoires pour un étudiant.");
        }
        if (u.getRole() == Role.ENSEIGNANT && vide(u.getDepartement())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le département est obligatoire pour un enseignant.");
        }
    }

    private void verifierMotDePasse(String motDePasse) {
        if (motDePasse == null || motDePasse.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le mot de passe doit contenir au moins 8 caractères.");
        }
    }

    private void verifierMatricule(Utilisateur u, Long id) {
        if (u.getRole() != Role.ETUDIANT || vide(u.getMatricule())) return;
        String matricule = u.getMatricule().trim();
        boolean existe = id == null
                ? utilisateurRepository.existsByMatriculeIgnoreCase(matricule)
                : utilisateurRepository.existsByMatriculeIgnoreCaseAndIdNot(matricule, id);
        if (existe) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce matricule est déjà utilisé.");
    }

    private static boolean vide(String valeur) { return valeur == null || valeur.isBlank(); }
    private static String normaliser(String valeur) { return valeur == null ? null : valeur.trim(); }

    private static void normaliserChampsSelonRole(Utilisateur utilisateur) {
        if (utilisateur.getRole() != Role.ETUDIANT) {
            utilisateur.setMatricule(null);
            utilisateur.setNiveau(null);
        }
        if (utilisateur.getRole() != Role.ENSEIGNANT) utilisateur.setDepartement(null);
    }
}
