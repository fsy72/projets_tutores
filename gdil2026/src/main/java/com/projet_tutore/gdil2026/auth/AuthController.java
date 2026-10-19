package com.projet_tutore.gdil2026.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.projet_tutore.gdil2026.utilisateur.Utilisateur;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/connexion")
    public LoginResponse connecter(@Valid @RequestBody ConnexionRequest request) {
        return authenticationService.connecter(request.email(), request.motDePasse());
    }

    @PostMapping("/inscription-etudiant")
    @ResponseStatus(HttpStatus.CREATED)
    public Utilisateur inscrireEtudiant(@Valid @RequestBody InscriptionRequest request) {
        return authenticationService.inscrireEtudiant(new AuthenticationService.InscriptionEtudiantRequest(
                request.nom(), request.prenom(), request.email(), request.motDePasse(),
                request.matricule(), request.niveau()));
    }

    public record ConnexionRequest(@NotBlank @Email String email, @NotBlank String motDePasse) { }

    public record InscriptionRequest(
            @NotBlank String nom,
            @NotBlank String prenom,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String motDePasse,
            @NotBlank String matricule,
            @NotBlank String niveau) { }
}
