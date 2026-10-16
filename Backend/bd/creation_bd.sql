-- ============================================================
-- Script de création de la base de données
-- Comment créer la bd dans pgadmin 4:
-- PREMIÈRE UTILISATION : Mettre comme mot de passe 1234
-- Clique droit sur "Databases" -> Create -> Database... -> Nom de la base: projet_integrateur -> Owner: postgres -> Save
-- Ensuite, clique droit sur la base de données -> Query Tool -> Copier le contenu de ce fichier -> Exécuter le script (F5)


-- ============================================================

-- ------------------------------------------------------------
-- 1. Table HOPITAL (table de référence, aucune dépendance)
-- ------------------------------------------------------------
CREATE TABLE Hopital (
    id        SERIAL PRIMARY KEY,
    acronyme  VARCHAR(50),
    nom       VARCHAR(255)
);

-- ------------------------------------------------------------
-- 2. Table FL (Facteur de Localisation)
-- ------------------------------------------------------------
CREATE TABLE FL (
    id         SERIAL PRIMARY KEY,
    fl         DOUBLE PRECISION,
    type_lieu  VARCHAR(100)
);

-- ------------------------------------------------------------
-- 3. Table FF (Facteur de Fréquentation)
-- ------------------------------------------------------------
CREATE TABLE FF (
    id            SERIAL PRIMARY KEY,
    ff            DOUBLE PRECISION,
    nbr_personnes DOUBLE PRECISION
);

-- ------------------------------------------------------------
-- 4. Table EMPLACEMENT (dépend de Hopital, FL, FF)
-- ------------------------------------------------------------
CREATE TABLE Emplacement (
    id                          SERIAL PRIMARY KEY,
    composante_id               INTEGER NOT NULL,
    No_local_pavillon           VARCHAR(100),
    categorie                   VARCHAR(100),
    type_lieu                   VARCHAR(100),
    lieu_specifique             VARCHAR(255),
    description                 VARCHAR(255),
    superficie                  DOUBLE PRECISION,
    fl_id                       INTEGER NOT NULL,
    ff_id                       INTEGER NOT NULL,
    superficie_ajuste           DOUBLE PRECISION,
    poid_relatif                INTEGER,
    valeur_toponymique          INTEGER,
    valeur_toponymique_ancien   INTEGER,
    commentaire                 VARCHAR(255),
    statut                      VARCHAR(50),
    CONSTRAINT fk_emplacement_hopital
        FOREIGN KEY (composante_id) REFERENCES Hopital(id),
    CONSTRAINT fk_emplacement_fl
        FOREIGN KEY (fl_id) REFERENCES FL(id),
    CONSTRAINT fk_emplacement_ff
        FOREIGN KEY (ff_id) REFERENCES FF(id)
);

-- ------------------------------------------------------------
-- 5. Table ACHALANDAGE (dépend de Hopital)
-- ------------------------------------------------------------
CREATE TABLE Achalandage (
    id                SERIAL PRIMARY KEY,
    hopital_id        INTEGER NOT NULL,
    type_achalandage  VARCHAR(100),
    annee             INTEGER,
    valeur            INTEGER,
    CONSTRAINT fk_achalandage_hopital
        FOREIGN KEY (hopital_id) REFERENCES Hopital(id)
);

-- ------------------------------------------------------------
-- 6. Table SOMMAIRE (dépend de Hopital)
-- ------------------------------------------------------------
CREATE TABLE Sommaire (
    id                                   SERIAL PRIMARY KEY,
    hopital_id                           INTEGER NOT NULL,
    avant_actifs_externe                 DOUBLE PRECISION,
    avant_actifs_interne_toponymiques    DOUBLE PRECISION,
    avant_actifs_interne_publicitaires   DOUBLE PRECISION,
    avant_valorisation                   DOUBLE PRECISION,
    apres_actifs_externe                 DOUBLE PRECISION,
    apres_actifs_interne_toponymiques    DOUBLE PRECISION,
    apres_actifs_interne_publicitaires   DOUBLE PRECISION,
    apres_valorisation                   DOUBLE PRECISION,
    CONSTRAINT fk_sommaire_hopital
        FOREIGN KEY (hopital_id) REFERENCES Hopital(id)
);

-- ------------------------------------------------------------
-- 7. Table UTILISATEUR (table de référence, aucune dépendance)
-- ------------------------------------------------------------
CREATE TABLE Utilisateur (
    id        SERIAL PRIMARY KEY,
    courriel  VARCHAR(255) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL
);

-- ------------------------------------------------------------
-- 8. Table RESERVATION (dépend de Emplacement et Utilisateur)
-- ------------------------------------------------------------
CREATE TABLE Reservation (
    id             SERIAL PRIMARY KEY,
    emplacement_id INTEGER NOT NULL,
    utilisateur_id INTEGER NOT NULL,
    statut         VARCHAR(50),
    date_debut     TIMESTAMP,
    date_fin       TIMESTAMP,
    CONSTRAINT fk_reservation_emplacement
        FOREIGN KEY (emplacement_id) REFERENCES Emplacement(id),
    CONSTRAINT fk_reservation_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
);

-- ============================================================
-- Fin du script
-- ============================================================