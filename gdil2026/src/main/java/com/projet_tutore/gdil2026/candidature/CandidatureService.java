package com.projet_tutore.gdil2026.candidature;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.projet_tutore.gdil2026.sujet.*;
import com.projet_tutore.gdil2026.utilisateur.*;

@Service
@Transactional
public class CandidatureService {
    private final CandidatureRepository candidatureRepository;
    private final SujetRepository sujetRepository;
    private final UtilisateurRepository utilisateurRepository;

    public CandidatureService(CandidatureRepository candidatureRepository, SujetRepository sujetRepository,
            UtilisateurRepository utilisateurRepository) {
        this.candidatureRepository = candidatureRepository;
        this.sujetRepository = sujetRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public Candidature deposer(Long etudiantId, Long sujetId, String motivation) {
        Utilisateur etudiant = obtenirUtilisateur(etudiantId);
        if (etudiant.getRole() != Role.ETUDIANT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul un étudiant peut déposer une candidature.");
        }
        Sujet sujet = sujetRepository.findByIdForUpdate(sujetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable."));
        verifierSujetCandidatable(sujet);
        if (candidatureRepository.existsByEtudiant_IdAndSujet_Id(etudiantId, sujetId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cet étudiant a déjà candidaté à ce sujet.");
        }
        if (placesRestantes(sujet) <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La capacité de ce sujet est atteinte.");
        }

        Candidature candidature = new Candidature();
        candidature.setEtudiant(etudiant);
        candidature.setSujet(sujet);
        candidature.setMotivation(motivation);
        candidature.setDateCandidature(LocalDateTime.now());
        candidature.setStatut(StatutCandidature.EN_ATTENTE);
        Candidature enregistree = candidatureRepository.save(candidature);
        return candidatureRepository.findById(enregistree.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "La candidature enregistrée est introuvable."));
    }

    @Transactional(readOnly = true)
    public Candidature obtenirParId(Long id, Long acteurId) {
        Candidature candidature = candidatureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable."));
        Utilisateur acteur = obtenirUtilisateur(acteurId);
        boolean autorise = acteur.getRole() == Role.ADMIN || acteur.getRole() == Role.RESPONSABLE
                || (acteur.getRole() == Role.ETUDIANT && candidature.getEtudiant().getId().equals(acteurId))
                || (acteur.getRole() == Role.ENSEIGNANT
                        && candidature.getSujet().getEnseignant().getId().equals(acteurId));
        if (!autorise) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès non autorisé à cette candidature.");
        }
        return candidature;
    }

    @Transactional(readOnly = true)
    public List<Candidature> lister() { return candidatureRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<Candidature> listerParEtudiant(Long etudiantId, Long acteurId) {
        Utilisateur acteur = obtenirUtilisateur(acteurId);
        if (!acteurId.equals(etudiantId) && acteur.getRole() != Role.ADMIN
                && acteur.getRole() != Role.RESPONSABLE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès non autorisé à ces candidatures.");
        }
        return candidatureRepository.findByEtudiant_Id(etudiantId);
    }

    @Transactional(readOnly = true)
    public List<Candidature> listerParSujet(Long sujetId, Long acteurId) {
        Sujet sujet = obtenirSujet(sujetId);
        Utilisateur acteur = obtenirUtilisateur(acteurId);
        boolean proprietaire = sujet.getEnseignant().getId().equals(acteurId);
        if (!proprietaire && acteur.getRole() != Role.ADMIN && acteur.getRole() != Role.RESPONSABLE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès non autorisé à ces candidatures.");
        }
        return candidatureRepository.findBySujet_Id(sujetId);
    }

    public Candidature accepter(Long candidatureId, Long responsableId) {
        return decider(candidatureId, responsableId, StatutCandidature.ACCEPTEE);
    }

    public Candidature rejeter(Long candidatureId, Long responsableId) {
        return decider(candidatureId, responsableId, StatutCandidature.REJETEE);
    }

    private Candidature decider(Long candidatureId, Long responsableId, StatutCandidature decision) {
        Utilisateur responsable = obtenirUtilisateur(responsableId);
        if (responsable.getRole() != Role.RESPONSABLE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seul un responsable pédagogique peut décider d'une candidature.");
        }
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable."));
        // Le verrou sur le sujet sérialise les acceptations concurrentes et protège sa capacité.
        Sujet sujet = sujetRepository.findByIdForUpdate(candidature.getSujet().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable."));
        if (candidature.getStatut() != StatutCandidature.EN_ATTENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette candidature a déjà été traitée.");
        }
        if (decision == StatutCandidature.ACCEPTEE && placesRestantes(sujet) <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La capacité de ce sujet est atteinte.");
        }
        candidature.setStatut(decision);
        candidature.setDecidePar(responsable);
        candidature.setDateDecision(LocalDateTime.now());
        return candidatureRepository.save(candidature);
    }

    private int placesRestantes(Sujet sujet) {
        long acceptees = candidatureRepository.countBySujet_IdAndStatut(
                sujet.getId(), StatutCandidature.ACCEPTEE);
        return sujet.getCapaciteMax() - (int) acceptees;
    }

    private void verifierSujetCandidatable(Sujet sujet) {
        if (sujet.getStatut() != Statut.DISPONIBLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce sujet n'est pas disponible.");
        }
    }

    private Sujet obtenirSujet(Long id) {
        return sujetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sujet introuvable."));
    }

    private Utilisateur obtenirUtilisateur(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
    }
}
