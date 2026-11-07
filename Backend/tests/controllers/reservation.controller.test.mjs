import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addReservation,
  obtenirReservationsParEmplacement,
  approveReservation,
} from "../../src/controllers/reservation.controller.mjs";
import {
  createReservation,
  getReservationsByEmplacementId,
  getReservationById,
  confirmReservation,
} from "../../src/models/reservation.mjs";

vi.mock("../../src/models/reservation.mjs", () => ({
  getAllReservations: vi.fn(),
  createReservation: vi.fn(),
  getReservationById: vi.fn(),
  getReservationsByEmplacementId: vi.fn(),
  getReservationsByStatus: vi.fn(),
  updateReservation: vi.fn(),
  confirmReservation: vi.fn(),
}));

describe("Contrôleur des réservations", () => {
  let requete;
  let reponse;
  let next;

  const emplacementId = 3;
  const utilisateurId = 6;

  const reservationConfirmee = {
    id: 1,
    emplacement_id: emplacementId,
    statut: "confirmed",
    date_debut: "2026-11-10",
    date_fin: "2026-11-15",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    reponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("addReservation – période disponible", () => {
    beforeEach(() => {
      requete = {
        user: { id: utilisateurId },
        body: {
          emplacementId,
          dateDebut: "2026-11-10",
          dateFin: "2026-11-15",
        },
      };

      getReservationsByEmplacementId.mockResolvedValue([]);
      createReservation.mockResolvedValue({
        id: 1,
        emplacement_id: emplacementId,
        utilisateur_id: utilisateurId,
        statut: "pending",
      });
    });

    it("crée la réservation pour l’emplacement, l’utilisateur et les dates demandés", async () => {
      await addReservation(requete, reponse, next);

      expect(createReservation).toHaveBeenCalledWith(
        emplacementId,
        utilisateurId,
        "2026-11-10",
        "2026-11-15",
      );
    });

    it("renvoie le statut HTTP 201", async () => {
      await addReservation(requete, reponse, next);

      expect(reponse.status).toHaveBeenCalledWith(201);
    });

    it("termine la requête sans appeler next", async () => {
      await addReservation(requete, reponse, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("addReservation – la période commence le dernier jour d’une réservation confirmée", () => {
    beforeEach(() => {
      requete = {
        user: { id: utilisateurId },
        body: {
          emplacementId,
          dateDebut: "2026-11-15",
          dateFin: "2026-11-20",
        },
      };

      getReservationsByEmplacementId.mockResolvedValue([reservationConfirmee]);
    });

    it("transmet une erreur 409 à next", async () => {
      await addReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(409);
    });

    it("ne crée aucune réservation", async () => {
      await addReservation(requete, reponse, next);

      expect(createReservation).not.toHaveBeenCalled();
    });
  });

  describe("obtenirReservationsParEmplacement – une réservation existe", () => {
    beforeEach(() => {
      requete = { params: { emplacementId: String(emplacementId) } };
      getReservationsByEmplacementId.mockResolvedValue([reservationConfirmee]);
    });

    it("renvoie le statut HTTP 200", async () => {
      await obtenirReservationsParEmplacement(requete, reponse, next);

      expect(reponse.status).toHaveBeenCalledWith(200);
    });

    it("retourne les réservations de l’emplacement", async () => {
      await obtenirReservationsParEmplacement(requete, reponse, next);

      const corpsReponse = reponse.json.mock.lastCall?.[0];
      expect(corpsReponse?.data?.reservations).toEqual([reservationConfirmee]);
    });

    it("indique le nombre de réservations retournées", async () => {
      await obtenirReservationsParEmplacement(requete, reponse, next);

      const corpsReponse = reponse.json.mock.lastCall?.[0];
      expect(corpsReponse?.data?.count).toBe(1);
    });

    it("termine la requête sans appeler next", async () => {
      await obtenirReservationsParEmplacement(requete, reponse, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("approveReservation – la période chevauche une réservation confirmée", () => {
    beforeEach(() => {
      requete = { params: { id: "2" } };
      getReservationById.mockResolvedValue({
        id: 2,
        emplacement_id: emplacementId,
        statut: "pending",
        date_debut: "2026-11-12",
        date_fin: "2026-11-18",
      });
      getReservationsByEmplacementId.mockResolvedValue([reservationConfirmee]);
    });

    it("transmet une erreur 409 à next", async () => {
      await approveReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(409);
    });

    it("ne confirme aucune réservation", async () => {
      await approveReservation(requete, reponse, next);

      expect(confirmReservation).not.toHaveBeenCalled();
    });
  });

  describe("approveReservation – seule la réservation à confirmer occupe la période", () => {
    beforeEach(() => {
      const reservationEnAttente = {
        id: 2,
        emplacement_id: emplacementId,
        statut: "pending",
        date_debut: "2026-11-20",
        date_fin: "2026-11-25",
      };

      requete = { params: { id: "2" } };
      getReservationById.mockResolvedValue(reservationEnAttente);
      getReservationsByEmplacementId.mockResolvedValue([reservationEnAttente]);
      confirmReservation.mockResolvedValue({
        ...reservationEnAttente,
        statut: "confirmed",
      });
    });

    it("confirme la réservation demandée", async () => {
      await approveReservation(requete, reponse, next);

      expect(confirmReservation).toHaveBeenCalledWith(2);
    });

    it("renvoie le statut HTTP 200", async () => {
      await approveReservation(requete, reponse, next);

      expect(reponse.status).toHaveBeenCalledWith(200);
    });

    it("termine la requête sans appeler next", async () => {
      await approveReservation(requete, reponse, next);

      expect(next).not.toHaveBeenCalled();
    });
  });
});