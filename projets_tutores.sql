-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : lun. 19 oct. 2026 à 20:09
-- Version du serveur : 8.0.30
-- Version de PHP : 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `projets_tutores`
--

-- --------------------------------------------------------

--
-- Structure de la table `candidature`
--

CREATE TABLE `candidature` (
  `id` bigint NOT NULL,
  `date_candidature` datetime(6) NOT NULL,
  `date_decision` datetime(6) DEFAULT NULL,
  `motivation` text,
  `statut` enum('ACCEPTEE','EN_ATTENTE','REJETEE') NOT NULL,
  `decide_par_id` bigint DEFAULT NULL,
  `etudiant_id` bigint NOT NULL,
  `sujet_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `candidature`
--

INSERT INTO `candidature` (`id`, `date_candidature`, `date_decision`, `motivation`, `statut`, `decide_par_id`, `etudiant_id`, `sujet_id`) VALUES
(1, '2026-10-18 16:15:16.882174', '2026-10-18 16:18:06.209309', '', 'REJETEE', 4, 9, 1),
(2, '2026-10-18 16:15:50.791856', '2026-10-18 16:17:56.564552', '', 'ACCEPTEE', 4, 9, 5),
(3, '2026-10-19 09:22:23.287269', '2026-10-19 09:40:52.435338', '', 'ACCEPTEE', 4, 11, 5),
(4, '2026-10-19 09:22:46.869935', '2026-10-19 09:45:31.764615', '', 'ACCEPTEE', 4, 11, 4),
(5, '2026-10-19 09:22:52.847361', '2026-10-19 09:42:25.653486', '', 'ACCEPTEE', 4, 11, 1),
(6, '2026-10-19 09:26:09.716447', NULL, '', 'EN_ATTENTE', NULL, 10, 5),
(7, '2026-10-19 09:26:25.796452', NULL, '', 'EN_ATTENTE', NULL, 10, 2),
(8, '2026-10-19 09:26:32.260396', NULL, '', 'EN_ATTENTE', NULL, 10, 6),
(9, '2026-10-19 09:29:45.096543', '2026-10-19 09:41:00.503515', '', 'ACCEPTEE', 4, 12, 5),
(10, '2026-10-19 09:30:00.571078', '2026-10-19 09:42:50.584282', '', 'ACCEPTEE', 4, 12, 2),
(11, '2026-10-19 09:30:06.236701', '2026-10-19 09:42:07.736999', '', 'ACCEPTEE', 4, 12, 3),
(12, '2026-10-19 09:30:19.549409', '2026-10-19 09:43:13.049557', '', 'REJETEE', 4, 12, 4),
(13, '2026-10-19 09:32:13.847169', '2026-10-19 09:41:05.320508', '', 'ACCEPTEE', 4, 5, 5),
(14, '2026-10-19 09:32:24.750169', '2026-10-19 09:42:02.112146', '', 'ACCEPTEE', 4, 5, 3),
(15, '2026-10-19 09:32:26.532055', '2026-10-19 09:43:24.755814', '', 'REJETEE', 4, 5, 4);

-- --------------------------------------------------------

--
-- Structure de la table `sujet`
--

CREATE TABLE `sujet` (
  `id` bigint NOT NULL,
  `capacite_max` int NOT NULL,
  `date_creation` date NOT NULL,
  `description` text,
  `statut` enum('DISPONIBLE','INDISPONIBLE') NOT NULL,
  `titre` varchar(200) NOT NULL,
  `enseignant_id` bigint NOT NULL
) ;

--
-- Déchargement des données de la table `sujet`
--

INSERT INTO `sujet` (`id`, `capacite_max`, `date_creation`, `description`, `statut`, `titre`, `enseignant_id`) VALUES
(1, 4, '2026-10-18', '', 'DISPONIBLE', 'Gestion des emplois du temps', 3),
(2, 5, '2026-10-18', 'Le projet consiste à concevoir et à développer une application web de gestion de logements permettant de centraliser et de simplifier les opérations liées à la location immobilière. L\'application permettra aux propriétaires ou aux administrateurs de gérer les logements disponibles, les locataires, les contrats de location, les paiements des loyers ainsi que les demandes de maintenance.', 'DISPONIBLE', 'Gestion des logements', 3),
(3, 3, '2026-10-18', 'Le projet consiste à concevoir et à développer une plate-forme web de vente en ligne permettant aux commerçants de présenter et de commercialiser leurs produits sur Internet. La plate-forme offrira aux clients la possibilité de consulter un catalogue de produits, de rechercher des articles, de comparer les prix, d\'ajouter des produits à leur panier et de passer des commandes à distance.', 'DISPONIBLE', 'Plate-forme de vente en ligne', 6),
(4, 3, '2026-10-18', 'Cette application permettra aux patients de consulter les disponibilités des médecins, de prendre des rendez-vous en ligne et de suivre leurs consultations. Les médecins pourront gérer leurs horaires, tandis que les administrateurs assureront la gestion des patients, des praticiens et des rendez-vous.', 'DISPONIBLE', 'Application de gestion des rendez-vous médicaux', 8),
(5, 4, '2026-10-18', 'Cette plateforme permettra aux utilisateurs de rechercher, de comparer et de réserver des véhicules pour une durée déterminée. Les gestionnaires pourront administrer les véhicules, les disponibilités, les réservations, les paiements et les contrats de location.', 'DISPONIBLE', 'Plateforme de réservation de véhicules', 7),
(6, 3, '2026-10-18', 'Cette application facilitera la gestion des élèves, des enseignants, des classes, des notes et des emplois du temps. Les administrateurs pourront centraliser les informations scolaires, tandis que les enseignants et les élèves pourront consulter les données correspondant à leurs rôles respectifs.', 'DISPONIBLE', 'Application de gestion des établissements scolaires', 7),
(7, 3, '2026-10-19', '', 'INDISPONIBLE', 'Plate-forme de vente de tickets restaurants', 13);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` bigint NOT NULL,
  `departement` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `matricule` varchar(30) DEFAULT NULL,
  `niveau` varchar(30) DEFAULT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `role` enum('ADMIN','ENSEIGNANT','ETUDIANT','RESPONSABLE') NOT NULL,
  `mot_de_passe_hash` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `departement`, `email`, `matricule`, `niveau`, `nom`, `prenom`, `role`, `mot_de_passe_hash`) VALUES
(1, NULL, 'khadidiatou.ndiaye@gmail.com', NULL, NULL, 'NDIAYE', 'Khadidiatou', 'ADMIN', '$2a$10$EG2M12sZfKBJ8OlfY84Ibe6GIWZXpMgZLc9yV3gj7KFYCN41uRyLS'),
(3, 'Mathématiques', 'moussa.balde@gmail.com', NULL, NULL, 'BALDÉ', 'Moussa', 'ENSEIGNANT', '$2a$10$VL3c6GgJkIoooHDDpaNhseevzrpl6DGqVhI6TSM.W7eO1a6CF7qgO'),
(4, NULL, 'yacine.fall@gmail.com', NULL, NULL, 'FALL', 'Yacine', 'RESPONSABLE', '$2a$10$wx8KqIagpljFvhzhlLcbu.OaoYhn1rfTqa6rCFfzTuAcbGisos0qG'),
(5, NULL, 'lalla.aicha.diop@gmail.com', 'P32 567', 'Master 2', 'DIOP', 'Lalla Aïcha', 'ETUDIANT', '$2a$10$KaoeII9lYAhkkPsTybICxeHjmP7.McdUlkRNzOCDQdyPbMYhakzEa'),
(6, 'Informatique', 'djiby.ndiaye@gmail.com', NULL, NULL, 'NDIAYE', 'Djiby', 'ENSEIGNANT', '$2a$10$Dmu6pvvzYrmSPr65nrHdgeS8yRBprCOjvIXmyrJh4LaMvrAKDSbne'),
(7, 'Mathématiques', 'bassirou.sow@gmail.com', NULL, NULL, 'SOW', 'Bassirou', 'ENSEIGNANT', '$2a$10$.a/PxuvJ9ExKQUl.iMQSSO.lQxQk0f9Dd4v2eJpbOxKddIwDQ9.Ve'),
(8, 'Physique', 'abdoulaye.ba@gmail.com', NULL, NULL, 'Bâ', 'Abdoulaye', 'ENSEIGNANT', '$2a$10$BTguqdko/8D2EXHkiEqGfObjast4y.ksm21I6Yv.fDqwOq.YxaHke'),
(9, NULL, 'fatou.sy@gmail.com', 'P35 567', 'Licence 3', 'SY', 'Fatou', 'ETUDIANT', '$2a$10$wVKIJLsD13k9thk6/vu7AuAxI8f8Yxc06gbJvXea8Y8fFIG4ormem'),
(10, NULL, 'malick.sow@gmail.com', 'P34 3245', 'Master 1', 'SOW', 'Malick', 'ETUDIANT', '$2a$10$kTlXRF78BeNQbzgSRDasJe02w/miSnaJuzy4vwOTKBNffmme7YLxS'),
(11, NULL, 'fallou.ndiaye@gmail.com', 'P36 9871', 'Licence 2', 'NDIAYE', 'Fallou', 'ETUDIANT', '$2a$10$qyMmM6B.xhPzR6VdyhKwR.pOhanf/SKsyf4hmpq77Be0d5RMjTN0e'),
(12, NULL, 'binta.fall@gmail.com', 'P37 1234', 'Licence 1', 'FALL', 'Binta', 'ETUDIANT', '$2a$10$49ya9bAoFZK2/HuJyjJxluTBZLyQOEEM7gq2G862Gttq3wBZ2ziTG'),
(13, 'Informatique', 'birame.faye@gmail.com', NULL, NULL, 'FAYE', 'Birame', 'ENSEIGNANT', '$2a$10$JuZ4MQMN3sHj1O.ePsQB0en2/5a.adciLH5dyy5IQkFc6Oo0WyL5y');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `candidature`
--
ALTER TABLE `candidature`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_candidature_etudiant_sujet` (`etudiant_id`,`sujet_id`),
  ADD KEY `FKags391y6wx0ijje22apqrfyu4` (`decide_par_id`),
  ADD KEY `FK5lo3gvch8lw2hrqw1iftitfrj` (`sujet_id`);

--
-- Index pour la table `sujet`
--
ALTER TABLE `sujet`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKb4pxcy91hjlgyaxka0yh25tkb` (`enseignant_id`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKrma38wvnqfaf66vvmi57c71lo` (`email`),
  ADD UNIQUE KEY `UKh9dsmk9btbiirpb6oy1ayob2n` (`matricule`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `candidature`
--
ALTER TABLE `candidature`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `sujet`
--
ALTER TABLE `sujet`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `candidature`
--
ALTER TABLE `candidature`
  ADD CONSTRAINT `FK1lw41a0ljssmmwuwcsk6odtl9` FOREIGN KEY (`etudiant_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `FK5lo3gvch8lw2hrqw1iftitfrj` FOREIGN KEY (`sujet_id`) REFERENCES `sujet` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FKags391y6wx0ijje22apqrfyu4` FOREIGN KEY (`decide_par_id`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `sujet`
--
ALTER TABLE `sujet`
  ADD CONSTRAINT `FKb4pxcy91hjlgyaxka0yh25tkb` FOREIGN KEY (`enseignant_id`) REFERENCES `utilisateur` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
