package com.projet_tutore.gdil2026.sujet;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.projet_tutore.gdil2026.candidature.CandidatureRepository;
import com.projet_tutore.gdil2026.candidature.StatutCandidature;
import com.projet_tutore.gdil2026.utilisateur.Role;
import com.projet_tutore.gdil2026.utilisateur.Utilisateur;
import com.projet_tutore.gdil2026.utilisateur.UtilisateurRepository;

@Service
@Transactional
public class SujetService {
    private final SujetRepository sujetRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CandidatureRepository candidatureRepository;

    public SujetService(SujetRepository sujetRepository, UtilisateurRepository utilisateurRepository,
            CandidatureRepository candidatureRepository) {
        this.sujetRepository = sujetRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.candidatureRepository = candidatureRepository;
    }

    public Sujet creer(Sujet sujet, Long enseignantId) {
        verifierSujet(sujet);
        Utilisateur enseignant = obtenirEnseignant(enseignantId);
        sujet.setId(null);
        sujet.setEnseignant(enseignant);
        sujet.setDateCreation(LocalDate.now());
        if (sujet.getStatut() == null) sujet.setStatut(Statut.DISPONIBLE);
        return sujetRepository.save(sujet);
    }

    @Transactional(readOnly = true)
    public Sujet obtenirParId(Long id) {
        return sujetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable."));
    }

    @Transactional(readOnly = true)
    public List<Sujet> lister() { return sujetRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<Sujet> listerDisponibles() {
        return sujetRepository.findByStatut(Statut.DISPONIBLE).stream()
                .filter(s -> placesRestantes(s) > 0)
                .toList();
    }

    public Sujet modifier(Long id, Sujet donnees, Long acteurId) {
        verifierSujet(donnees);
        Sujet sujet = sujetRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable."));
        verifierGestionnaire(sujet, acteurId);
        if (donnees.getCapaciteMax() < placesAcceptees(sujet.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La capacité ne peut pas être inférieure au nombre de candidatures acceptées.");
        }
        sujet.setTitre(donnees.getTitre().trim());
        sujet.setDescription(donnees.getDescription());
        sujet.setCapaciteMax(donnees.getCapaciteMax());
        if (donnees.getStatut() != null) sujet.setStatut(donnees.getStatut());
        return sujetRepository.save(sujet);
    }

    public void supprimer(Long id, Long acteurId) {
        Sujet sujet = obtenirParId(id);
        verifierGestionnaire(sujet, acteurId);
        sujetRepository.delete(sujet);
    }

    @Transactional(readOnly = true)
    public int placesRestantes(Long sujetId) { return placesRestantes(obtenirParId(sujetId)); }

    private int placesRestantes(Sujet sujet) {
        return sujet.getCapaciteMax() - (int) placesAcceptees(sujet.getId());
    }

    private long placesAcceptees(Long sujetId) {
        return candidatureRepository.countBySujet_IdAndStatut(sujetId, StatutCandidature.ACCEPTEE);
    }

    private Utilisateur obtenirEnseignant(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enseignant introuvable."));
        if (utilisateur.getRole() != Role.ENSEIGNANT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le créateur du sujet doit être enseignant.");
        }
        return utilisateur;
    }

    private void verifierGestionnaire(Sujet sujet, Long acteurId) {
        Utilisateur acteur = utilisateurRepository.findById(acteurId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
        boolean proprietaire = sujet.getEnseignant().getId().equals(acteurId);
        if (!proprietaire && acteur.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seul l'enseignant propriétaire ou un administrateur peut gérer ce sujet.");
        }
    }

    private void verifierSujet(Sujet sujet) {
        if (sujet == null || sujet.getTitre() == null || sujet.getTitre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le titre du sujet est obligatoire.");
        }
        if (sujet.getCapaciteMax() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La capacité doit être supérieure à zéro.");
        }
    }
}
