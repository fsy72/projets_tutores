package com.projet_tutore.gdil2026.sujet;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
@RequestMapping("/api/sujets")
public class SujetController {
    private final SujetService sujetService;

    public SujetController(SujetService sujetService) {
        this.sujetService = sujetService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sujet creer(@Valid @RequestBody Sujet sujet, @AuthenticationPrincipal Jwt jwt) {
        return sujetService.creer(sujet, idUtilisateur(jwt));
    }

    @GetMapping
    public List<Sujet> lister() {
        return sujetService.lister();
    }

    @GetMapping("/disponibles")
    public List<Sujet> listerDisponibles() {
        return sujetService.listerDisponibles();
    }

    @GetMapping("/{id}")
    public Sujet obtenir(@PathVariable @Positive Long id) {
        return sujetService.obtenirParId(id);
    }

    @GetMapping("/{id}/places-restantes")
    public int placesRestantes(@PathVariable @Positive Long id) {
        return sujetService.placesRestantes(id);
    }

    @PutMapping("/{id}")
    public Sujet modifier(@PathVariable @Positive Long id, @Valid @RequestBody Sujet sujet,
            @AuthenticationPrincipal Jwt jwt) {
        return sujetService.modifier(id, sujet, idUtilisateur(jwt));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimer(@PathVariable @Positive Long id, @AuthenticationPrincipal Jwt jwt) {
        sujetService.supprimer(id, idUtilisateur(jwt));
    }

    private static Long idUtilisateur(Jwt jwt) {
        Number id = jwt.getClaim("uid");
        return id.longValue();
    }
}
