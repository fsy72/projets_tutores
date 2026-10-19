package com.projet_tutore.gdil2026.utilisateur;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {
    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Utilisateur creer(@Valid @RequestBody CreationUtilisateurRequest requete) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(requete.nom());
        utilisateur.setPrenom(requete.prenom());
        utilisateur.setEmail(requete.email());
        utilisateur.setRole(requete.role());
        utilisateur.setMatricule(requete.matricule());
        utilisateur.setNiveau(requete.niveau());
        utilisateur.setDepartement(requete.departement());
        return utilisateurService.creer(utilisateur, requete.motDePasse());
    }

    @GetMapping
    public List<Utilisateur> lister(@RequestParam(required = false) Role role) {
        return role == null ? utilisateurService.lister() : utilisateurService.listerParRole(role);
    }

    @GetMapping("/{id}")
    public Utilisateur obtenir(@PathVariable @Positive Long id) {
        return utilisateurService.obtenirParId(id);
    }

    @PutMapping("/{id}")
    public Utilisateur modifier(@PathVariable @Positive Long id, @Valid @RequestBody Utilisateur utilisateur) {
        return utilisateurService.modifier(id, utilisateur);
    }

    @PatchMapping("/{id}/mot-de-passe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changerMotDePasse(@PathVariable @Positive Long id,
            @Valid @RequestBody ChangementMotDePasseRequest requete) {
        utilisateurService.changerMotDePasse(id, requete.motDePasse());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimer(@PathVariable @Positive Long id) {
        utilisateurService.supprimer(id);
    }

    public record CreationUtilisateurRequest(
            @NotBlank String nom,
            @NotBlank String prenom,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String motDePasse,
            @jakarta.validation.constraints.NotNull Role role,
            String matricule,
            String niveau,
            String departement) { }

    public record ChangementMotDePasseRequest(@NotBlank @Size(min = 8) String motDePasse) { }
}
