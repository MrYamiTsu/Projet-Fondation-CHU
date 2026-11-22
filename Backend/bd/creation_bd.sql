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
create table hopital (
   id       serial primary key,
   acronyme varchar(50),
   nom      varchar(255)
);

-- ------------------------------------------------------------
-- 2. Table FL (Facteur de Localisation)
-- ------------------------------------------------------------
create table fl (
   id        serial primary key,
   fl        double precision,
   type_lieu varchar(100)
);

-- ------------------------------------------------------------
-- 3. Table FF (Facteur de Fréquentation)
-- ------------------------------------------------------------
create table ff (
   id            serial primary key,
   ff            double precision,
   nbr_personnes double precision
);

-- ------------------------------------------------------------
-- 4. Table EMPLACEMENT (dépend de Hopital, FL, FF)
-- ------------------------------------------------------------
create table emplacement (
   id                        serial primary key,
   composante_id             integer not null,
   no_local_pavillon         varchar(100),
   categorie                 varchar(100),
   type_lieu                 varchar(100),
   lieu_specifique           varchar(255),
   description               varchar(255),
   superficie                double precision,
   fl_id                     integer not null,
   ff_id                     integer not null,
   superficie_ajuste         double precision,
   poid_relatif              integer,
   valeur_toponymique        integer,
   valeur_toponymique_ancien integer,
   commentaire               varchar(255),
   statut                    varchar(50),
   constraint fk_emplacement_hopital foreign key ( composante_id )
      references hopital ( id ),
   constraint fk_emplacement_fl foreign key ( fl_id )
      references fl ( id ),
   constraint fk_emplacement_ff foreign key ( ff_id )
      references ff ( id ),
   constraint uq_emplacement_hopital unique ( id,
                                              composante_id )
);

-- ------------------------------------------------------------
-- 5. Table ACHALANDAGE (dépend de Hopital)
-- ------------------------------------------------------------
create table achalandage (
   id               serial primary key,
   hopital_id       integer not null,
   type_achalandage varchar(100),
   annee            integer,
   valeur           integer,
   constraint fk_achalandage_hopital foreign key ( hopital_id )
      references hopital ( id )
);

-- ------------------------------------------------------------
-- 6. Table SOMMAIRE (dépend de Hopital)
-- ------------------------------------------------------------
create table sommaire (
   id                                 serial primary key,
   hopital_id                         integer not null,
   avant_actifs_externe               double precision,
   avant_actifs_interne_toponymiques  double precision,
   avant_actifs_interne_publicitaires double precision,
   avant_valorisation                 double precision,
   apres_actifs_externe               double precision,
   apres_actifs_interne_toponymiques  double precision,
   apres_actifs_interne_publicitaires double precision,
   apres_valorisation                 double precision,
   constraint fk_sommaire_hopital foreign key ( hopital_id )
      references hopital ( id )
);

-- ------------------------------------------------------------
-- 7. Table UTILISATEUR (table de référence, aucune dépendance)
-- ------------------------------------------------------------
create table utilisateur (
   id            serial primary key,
   nom           varchar(100) not null,
   prenom        varchar(100) not null,
   email         varchar(255) not null unique,
   password_hash varchar(255) not null,
   role          varchar(20) not null default 'user',
   actif         boolean not null default true,
   created_at    timestamptz not null default current_timestamp,
   updated_at    timestamptz not null default current_timestamp,
   constraint check_user_role check ( role in ( 'user',
                                                'admin' ) )
);
create unique index utilisateur_email_unique_lower on
   utilisateur ( lower(email) );

-- ------------------------------------------------------------
-- 8. Table RESERVATION (dépend de Emplacement et Utilisateur)
-- ------------------------------------------------------------
create table reservation (
   id             serial primary key,
   emplacement_id integer not null,
   utilisateur_id integer not null,
   statut         varchar(50),
   date_debut     timestamp,
   date_fin       timestamp,
   constraint fk_reservation_emplacement foreign key ( emplacement_id )
      references emplacement ( id ),
   constraint fk_reservation_utilisateur foreign key ( utilisateur_id )
      references utilisateur ( id ),
   constraint check_reservation_statut
      check ( statut in ( 'pending',
                          'confirmed',
                          'cancelled' ) )
);

-- ------------------------------------------------------------
-- 9. Table Étages
-- ------------------------------------------------------------
create table etage (
   id              serial primary key,
   hopital_id      integer not null
      references hopital ( id ),
   niveau          integer not null,
   nom             varchar(100) not null,
   image_url       varchar(255),
   image_public_id varchar(255),
   constraint uq_etage_niveau unique ( hopital_id,
                                       niveau ),
   constraint uq_etage_hopital unique ( id,
                                        hopital_id )
);

-- ------------------------------------------------------------
-- 10. Table Pins d'Emplacement
-- ------------------------------------------------------------
create table pin_emplacement (
   id             serial primary key,
   hopital_id     integer not null,
   etage_id       integer not null,
   emplacement_id integer not null unique,
   x              real not null check ( x between 0 and 1 ),
   y              real not null check ( y between 0 and 1 ),
   constraint fk_pin_etage
      foreign key ( etage_id,
                    hopital_id )
         references etage ( id,
                            hopital_id )
            on delete cascade,
   constraint fk_pin_emplacement
      foreign key ( emplacement_id,
                    hopital_id )
         references emplacement ( id,
                                  composante_id )
            on delete cascade
);
-- ============================================================
-- Fin du script
-- ============================================================