package com.projet_tutore.gdil2026.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.projet_tutore.gdil2026.auth.LoginResponse.UtilisateurConnecte;
import com.projet_tutore.gdil2026.utilisateur.Role;
import com.projet_tutore.gdil2026.utilisateur.Utilisateur;
import com.projet_tutore.gdil2026.utilisateur.UtilisateurRepository;
import com.projet_tutore.gdil2026.utilisateur.UtilisateurService;

@Service
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurService utilisateurService;
    private final long dureeJetonMinutes;

    public AuthenticationService(AuthenticationManager authenticationManager, JwtEncoder jwtEncoder,
            UtilisateurRepository utilisateurRepository, UtilisateurService utilisateurService,
            @Value("${app.security.jwt.expiration-minutes:30}") long dureeJetonMinutes) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurService = utilisateurService;
        this.dureeJetonMinutes = dureeJetonMinutes;
    }

    @Transactional(readOnly = true)
    public LoginResponse connecter(String email, String motDePasse) {
        try {
            authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email.trim(), motDePasse));
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect.");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Email ou mot de passe incorrect."));
        return creerJeton(utilisateur);
    }

    public Utilisateur inscrireEtudiant(InscriptionEtudiantRequest request) {
        Utilisateur etudiant = new Utilisateur();
        etudiant.setNom(request.nom());
        etudiant.setPrenom(request.prenom());
        etudiant.setEmail(request.email());
        etudiant.setRole(Role.ETUDIANT); // Le rôle est imposé par le serveur.
        etudiant.setMatricule(request.matricule());
        etudiant.setNiveau(request.niveau());
        return utilisateurService.creer(etudiant, request.motDePasse());
    }

    private LoginResponse creerJeton(Utilisateur utilisateur) {
        Instant maintenant = Instant.now();
        Instant expiration = maintenant.plus(dureeJetonMinutes, ChronoUnit.MINUTES);
        String autorite = "ROLE_" + utilisateur.getRole().name();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("gdil2026")
                .issuedAt(maintenant)
                .expiresAt(expiration)
                .subject(utilisateur.getEmail())
                .claim("uid", utilisateur.getId())
                .claim("roles", List.of(autorite))
                .claim("name", utilisateur.getPrenom() + " " + utilisateur.getNom())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String jeton = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new LoginResponse(jeton, "Bearer", dureeJetonMinutes * 60,
                new UtilisateurConnecte(utilisateur.getId(), utilisateur.getNom(), utilisateur.getPrenom(),
                        utilisateur.getEmail(), utilisateur.getRole()));
    }

    public record InscriptionEtudiantRequest(String nom, String prenom, String email, String motDePasse,
            String matricule, String niveau) { }
}
