package com.projet_tutore.gdil2026.candidature;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
@RequestMapping("/api/candidatures")
public class CandidatureController {
    private final CandidatureService candidatureService;

    public CandidatureController(CandidatureService candidatureService) {
        this.candidatureService = candidatureService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Candidature deposer(@Valid @RequestBody DeposerCandidatureRequest requete,
            @AuthenticationPrincipal Jwt jwt) {
        return candidatureService.deposer(idUtilisateur(jwt), requete.sujetId(), requete.motivation());
    }

    @GetMapping
    public List<Candidature> lister() {
        return candidatureService.lister();
    }

    @GetMapping("/{id}")
    public Candidature obtenir(@PathVariable @Positive Long id, @AuthenticationPrincipal Jwt jwt) {
        return candidatureService.obtenirParId(id, idUtilisateur(jwt));
    }

    @GetMapping("/etudiant/{etudiantId}")
    public List<Candidature> listerParEtudiant(@PathVariable @Positive Long etudiantId,
            @AuthenticationPrincipal Jwt jwt) {
        return candidatureService.listerParEtudiant(etudiantId, idUtilisateur(jwt));
    }

    @GetMapping("/sujet/{sujetId}")
    public List<Candidature> listerParSujet(@PathVariable @Positive Long sujetId,
            @AuthenticationPrincipal Jwt jwt) {
        return candidatureService.listerParSujet(sujetId, idUtilisateur(jwt));
    }

    @PostMapping("/{id}/accepter")
    public Candidature accepter(@PathVariable @Positive Long id, @AuthenticationPrincipal Jwt jwt) {
        return candidatureService.accepter(id, idUtilisateur(jwt));
    }

    @PostMapping("/{id}/rejeter")
    public Candidature rejeter(@PathVariable @Positive Long id, @AuthenticationPrincipal Jwt jwt) {
        return candidatureService.rejeter(id, idUtilisateur(jwt));
    }

    public record DeposerCandidatureRequest(
            @NotNull @Positive Long sujetId,
            String motivation) { }

    private static Long idUtilisateur(Jwt jwt) {
        Number id = jwt.getClaim("uid");
        return id.longValue();
    }
}
