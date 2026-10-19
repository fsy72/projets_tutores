package com.projet_tutore.gdil2026.candidature;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    @Override
    @EntityGraph(attributePaths = {"etudiant", "sujet.enseignant", "decidePar"})
    List<Candidature> findAll();

    @Override
    @EntityGraph(attributePaths = {"etudiant", "sujet.enseignant", "decidePar"})
    Optional<Candidature> findById(Long id);

    boolean existsByEtudiant_IdAndSujet_Id(Long etudiantId, Long sujetId);
    long countBySujet_IdAndStatut(Long sujetId, StatutCandidature statut);

    @EntityGraph(attributePaths = {"etudiant", "sujet.enseignant", "decidePar"})
    List<Candidature> findByEtudiant_Id(Long etudiantId);

    @EntityGraph(attributePaths = {"etudiant", "sujet.enseignant", "decidePar"})
    List<Candidature> findBySujet_Id(Long sujetId);

    List<Candidature> findByStatut(StatutCandidature statut);

}
