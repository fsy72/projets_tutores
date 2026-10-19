package com.projet_tutore.gdil2026.sujet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface SujetRepository extends JpaRepository<Sujet, Long> {
    long countByEnseignant_Id(Long enseignantId);
    @Override
    @EntityGraph(attributePaths = "enseignant")
    List<Sujet> findAll();

    @Override
    @EntityGraph(attributePaths = "enseignant")
    Optional<Sujet> findById(Long id);

    @EntityGraph(attributePaths = "enseignant")
    List<Sujet> findByStatut(Statut statut);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "enseignant")
    @Query("select s from Sujet s where s.id = :id")
    Optional<Sujet> findByIdForUpdate(@Param("id") Long id);
}
