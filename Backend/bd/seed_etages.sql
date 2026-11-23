INSERT INTO Etage (id, hopital_id, niveau, nom, image_url) VALUES
(1, 1, 0, 'Rez-de-chaussee (RDC)', NULL),
(2, 1, 2, '2e Etage', NULL),
(3, 2, 0, 'Rez-de-chaussee (Atrium)', NULL),
(4, 2, 1, '1er Etage (Urgence)', NULL),
(5, 2, 3, '3e Etage (Soins specialises)', NULL),
(6, 3, 0, 'Rez-de-chaussee', NULL),
(7, 3, 1, '1er Etage', NULL),
(8, 4, -1, 'Sous-sol', NULL),
(9, 4, 0, 'Rez-de-chaussee', NULL)
ON CONFLICT (hopital_id, niveau) DO UPDATE SET
nom = EXCLUDED.nom, image_url = EXCLUDED.image_url;

SELECT setval('etage_id_seq', (SELECT MAX(id) FROM etage));

INSERT INTO Pin_Emplacement (hopital_id, etage_id, emplacement_id, x, y) VALUES
(1, 1, 1, 0.35, 0.45),
(1, 1, 2, 0.65, 0.30),
(1, 2, 3, 0.50, 0.55),
(2, 3, 4, 0.50, 0.40),
(2, 4, 5, 0.40, 0.60),
(2, 5, 6, 0.60, 0.35),
(3, 6, 7, 0.30, 0.50),
(3, 7, 8, 0.70, 0.45),
(4, 8, 9, 0.45, 0.50),
(4, 9, 10, 0.55, 0.40)
ON CONFLICT (emplacement_id) DO UPDATE SET
etage_id = EXCLUDED.etage_id, x = EXCLUDED.x, y = EXCLUDED.y;

SELECT setval('pin_emplacement_id_seq', (SELECT MAX(id) FROM pin_emplacement));
