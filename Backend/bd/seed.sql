-- ============================================================
-- Seed de la base projet_integrateur
-- ============================================================

TRUNCATE Reservation, Achalandage, Sommaire, Emplacement, FL, FF, Hopital
RESTART IDENTITY CASCADE;

-- 1. Hopital
INSERT INTO Hopital (acronyme, nom) VALUES
('CHUL', 'Centre hospitalier de l''Université Laval'),
('NCH',  'Nouveau complexe hospitalier'),
('HSFA', 'Hôpital Saint-François d''Assise'),
('HSS',  'Hôpital du Saint-Sacrement');

-- 2. FL (Facteur de localisation)
INSERT INTO FL (fl, type_lieu) VALUES
(0.25, 'Salle du personnel, stagiaires, résidents'),
(0.5,  'Salle d''entrevue, salle d''enseignement'),
(1,    'Salon des familles, salle de traitement, salle clinique, salle d''intervention, salle d''équipement'),
(1.25, 'Salles spécialisées, salle d''examen'),
(1.5,  'Salles d''attente ou secteur de soins'),
(1.75, 'Espaces publics et commerciaux (hall, centre d''information, cour intérieure, aire d''accueil)');

-- 3. FF (Facteur de fréquentation) - nbr_personnes = borne inférieure de la plage
INSERT INTO FF (ff, nbr_personnes) VALUES
(0.25,    3),   -- 3 - 19 personnes
(0.5,    20),   -- 20 - 39
(0.75,   40),   -- 40 - 79
(1,      80),   -- 80 - 199
(1.25,  200),   -- 200 - 399
(1.5,   400),   -- 400 - 899
(1.75,  900),   -- 900 - 2699
(2,    2700);   -- 2700 et plus

-- 4. Emplacement (superficie_ajuste = superficie * fl * ff)
INSERT INTO Emplacement
(composante_id, No_local_pavillon, categorie, type_lieu, lieu_specifique, description,
 superficie, fl_id, ff_id, superficie_ajuste, poid_relatif,
 valeur_toponymique, valeur_toponymique_ancien, commentaire, statut) VALUES
-- CHUL (id 1)
(1, 'CHUL-RC-001', 'Intérieur', 'Espace public',       'Hall principal',      'Hall d''accueil du CHUL',                  250, 6, 8, 875.00,  10, 50000, 45000, 'Emplacement phare',                 'Disponible'),
(1, 'CHUL-RC-120', 'Intérieur', 'Salle d''attente',    'Cliniques externes',  'Salle d''attente des cliniques externes',  120, 5, 6, 270.00,   6, 20000, 18000, NULL,                                'Réservé'),
(1, 'CHUL-2E-210', 'Intérieur', 'Salle d''examen',     'Salle d''examen 210', 'Salle d''examen polyvalente',               25, 4, 3,  23.44,   2,  3000,  3000, NULL,                                'Disponible'),
-- NCH (id 2)
(2, 'NCH-RC-001',  'Intérieur', 'Espace public',       'Atrium central',      'Atrium du nouveau complexe',               400, 6, 8, 1400.00, 10, 80000,  NULL, 'Nouveau complexe, aucun ancien nom', 'Disponible'),
(2, 'NCH-1E-105',  'Intérieur', 'Salle d''attente',    'Urgence',             'Salle d''attente de l''urgence',           180, 5, 7, 472.50,   8, 45000,  NULL, NULL,                                'Occupé'),
(2, 'NCH-3E-310',  'Intérieur', 'Salle de traitement', 'Hémodialyse',         'Salle de traitement d''hémodialyse',        60, 3, 2,  30.00,   2,  4000,  NULL, NULL,                                'Disponible'),
-- HSFA (id 3)
(3, 'HSFA-RC-001', 'Intérieur', 'Espace public',       'Hall d''entrée',      'Hall d''entrée principal',                 150, 6, 7, 459.38,   7, 30000, 28000, NULL,                                'Occupé'),
(3, 'HSFA-1E-050', 'Intérieur', 'Salle d''enseignement','Enseignement',       'Salle d''enseignement 050',                 40, 2, 2,  10.00,   1,  1500,  1500, NULL,                                'Disponible'),
-- HSS (id 4)
(4, 'HSS-RC-001',  'Intérieur', 'Espace public',       'Hall du Saint-Sacrement','Hall d''accueil',                       130, 6, 6, 341.25,   6, 25000, 22000, NULL,                                'Réservé'),
(4, 'HSS-2E-200',  'Intérieur', 'Salle du personnel',  'Salle de repos',      'Salle de repos du personnel',               35, 1, 1,   2.19,   1,   500,   500, 'Non offert à la commandite',       'Inactif');

-- 5. Achalandage (Total = Admission + Visiteur)
INSERT INTO Achalandage (hopital_id, type_achalandage, annee, valeur) VALUES
-- CHUL
(1, 'Admission', 2023,   32000), (1, 'Visiteur', 2023, 1150000), (1, 'Total', 2023, 1182000),
(1, 'Admission', 2024,   33500), (1, 'Visiteur', 2024, 1210000), (1, 'Total', 2024, 1243500),
(1, 'Admission', 2025,   34200), (1, 'Visiteur', 2025, 1245000), (1, 'Total', 2025, 1279200),
-- NCH
(2, 'Admission', 2023,   28000), (2, 'Visiteur', 2023,  980000), (2, 'Total', 2023, 1008000),
(2, 'Admission', 2024,   29500), (2, 'Visiteur', 2024, 1030000), (2, 'Total', 2024, 1059500),
(2, 'Admission', 2025,   31000), (2, 'Visiteur', 2025, 1075000), (2, 'Total', 2025, 1106000),
-- HSFA
(3, 'Admission', 2023,   14000), (3, 'Visiteur', 2023,  520000), (3, 'Total', 2023,  534000),
(3, 'Admission', 2024,   14600), (3, 'Visiteur', 2024,  545000), (3, 'Total', 2024,  559600),
(3, 'Admission', 2025,   15100), (3, 'Visiteur', 2025,  560000), (3, 'Total', 2025,  575100),
-- HSS
(4, 'Admission', 2023,    9000), (4, 'Visiteur', 2023,  310000), (4, 'Total', 2023,  319000),
(4, 'Admission', 2024,    9400), (4, 'Visiteur', 2024,  325000), (4, 'Total', 2024,  334400),
(4, 'Admission', 2025,    9700), (4, 'Visiteur', 2025,  338000), (4, 'Total', 2025,  347700);

-- 6. Sommaire (un par hôpital, valorisation = externe + toponymiques + publicitaires)
INSERT INTO Sommaire
(hopital_id, avant_actifs_externe, avant_actifs_interne_toponymiques, avant_actifs_interne_publicitaires, avant_valorisation,
 apres_actifs_externe, apres_actifs_interne_toponymiques, apres_actifs_interne_publicitaires, apres_valorisation) VALUES
(1, 20000, 45000, 15000, 80000, 25000, 50000, 18000,  93000),
(2,     0, 60000, 10000, 70000,     0, 80000, 15000,  95000),
(3,     0, 28000,  8000, 36000,     0, 30000, 10000,  40000),
(4,  5000, 22000,  6000, 33000,  5000, 25000,  7000,  37000);

-- 7. Reservation
INSERT INTO Reservation (emplacement_id, statut, date_debut, date_fin) VALUES
(2, 'confirmed', '2026-01-15 08:00', '2026-12-31 17:00'),
(5, 'confirmed', '2025-09-01 08:00', '2026-08-31 17:00'),
(4, 'pending',   '2026-06-01 08:00', '2027-05-31 17:00'),
(9, 'confirmed', '2025-04-01 08:00', '2026-03-31 17:00'),
(1, 'cancelled', '2026-02-01 08:00', '2026-07-31 17:00'),
(7, 'confirmed', '2025-06-01 08:00', '2026-05-31 17:00');

-- Vérification rapide
SELECT 'Hopital' AS t, COUNT(*) FROM Hopital
UNION ALL SELECT 'FL', COUNT(*) FROM FL
UNION ALL SELECT 'FF', COUNT(*) FROM FF
UNION ALL SELECT 'Emplacement', COUNT(*) FROM Emplacement
UNION ALL SELECT 'Achalandage', COUNT(*) FROM Achalandage
UNION ALL SELECT 'Sommaire', COUNT(*) FROM Sommaire
UNION ALL SELECT 'Reservation', COUNT(*) FROM Reservation;