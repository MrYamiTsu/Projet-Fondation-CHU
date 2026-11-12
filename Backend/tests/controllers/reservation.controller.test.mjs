import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addReservation,
  obtenirReservationsParEmplacement,
  obtenirReservationsConfirmees,
  approveReservation,
  getMyReservations,
  updateMyReservation,
  cancelMyReservation,
} from "../../src/controllers/reservation.controller.mjs";
import {
  createReservation,
  getReservationsByEmplacementId,
  getReservationById,
  getReservationsByUserId,
  confirmReservation,
  updateMyPendingReservation,
  cancelMyPendingReservation,
  getConfirmedReservations,
} from "../../src/models/reservation.mjs";

vi.mock("../../src/models/reservation.mjs", () => ({
  getAllReservations: vi.fn(),
  createReservation: vi.fn(),
  getReservationById: vi.fn(),
  getReservationsByEmplacementId: vi.fn(),
  getReservationsByStatus: vi.fn(),
  getReservationsByUserId: vi.fn(),
  updateReservation: vi.fn(),
  confirmReservation: vi.fn(),
  updateMyPendingReservation: vi.fn(),
  cancelMyPendingReservation: vi.fn(),
  getConfirmedReservations: vi.fn(),
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

  // Réservation en attente appartenant à l'utilisateur connecté
  const maReservationEnAttente = {
    id: 2,
    emplacement_id: emplacementId,
    utilisateur_id: utilisateurId,
    statut: "pending",
    date_debut: "2026-11-20",
    date_fin: "2026-11-25",
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

  describe("getMyReservations – l’utilisateur a une réservation", () => {
    beforeEach(() => {
      requete = { user: { id: utilisateurId } };
      getReservationsByUserId.mockResolvedValue([maReservationEnAttente]);
    });

    it("cherche les réservations de l’utilisateur connecté", async () => {
      await getMyReservations(requete, reponse, next);

      expect(getReservationsByUserId).toHaveBeenCalledWith(utilisateurId);
    });

    it("renvoie le statut HTTP 200", async () => {
      await getMyReservations(requete, reponse, next);

      expect(reponse.status).toHaveBeenCalledWith(200);
    });

    it("retourne ses réservations et leur nombre", async () => {
      await getMyReservations(requete, reponse, next);

      const corpsReponse = reponse.json.mock.lastCall?.[0];
      expect(corpsReponse?.data).toEqual({
        reservations: [maReservationEnAttente],
        count: 1,
      });
    });

    it("termine la requête sans appeler next", async () => {
      await getMyReservations(requete, reponse, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateMyReservation – la réservation en attente est modifiable", () => {
    beforeEach(() => {
      requete = {
        user: { id: utilisateurId },
        params: { id: "2" },
        body: { dateDebut: "2026-12-01", dateFin: "2026-12-05" },
      };

      getReservationById.mockResolvedValue(maReservationEnAttente);
      // Elle est seule sur l’emplacement : elle ne doit pas entrer en conflit avec elle-même
      getReservationsByEmplacementId.mockResolvedValue([maReservationEnAttente]);
      updateMyPendingReservation.mockResolvedValue({
        ...maReservationEnAttente,
        date_debut: "2026-12-01",
        date_fin: "2026-12-05",
      });
    });

    it("enregistre les nouvelles dates pour l’utilisateur connecté", async () => {
      await updateMyReservation(requete, reponse, next);

      expect(updateMyPendingReservation).toHaveBeenCalledWith(
        2,
        utilisateurId,
        "2026-12-01",
        "2026-12-05",
      );
    });

    it("renvoie le statut HTTP 200", async () => {
      await updateMyReservation(requete, reponse, next);

      expect(reponse.status).toHaveBeenCalledWith(200);
    });

    it("termine la requête sans appeler next", async () => {
      await updateMyReservation(requete, reponse, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateMyReservation – les nouvelles dates chevauchent une réservation confirmée", () => {
    beforeEach(() => {
      requete = {
        user: { id: utilisateurId },
        params: { id: "2" },
        body: { dateDebut: "2026-11-12", dateFin: "2026-11-18" },
      };

      getReservationById.mockResolvedValue(maReservationEnAttente);
      getReservationsByEmplacementId.mockResolvedValue([
        reservationConfirmee,
        maReservationEnAttente,
      ]);
    });

    it("transmet une erreur 409 à next", async () => {
      await updateMyReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(409);
    });

    it("ne modifie aucune réservation", async () => {
      await updateMyReservation(requete, reponse, next);

      expect(updateMyPendingReservation).not.toHaveBeenCalled();
    });
  });

  describe("updateMyReservation – la réservation n’est plus en attente", () => {
    beforeEach(() => {
      requete = {
        user: { id: utilisateurId },
        params: { id: "2" },
        body: { dateDebut: "2026-12-01", dateFin: "2026-12-05" },
      };

      getReservationById.mockResolvedValue({
        ...maReservationEnAttente,
        statut: "confirmed",
      });
    });

    it("transmet une erreur 409 à next", async () => {
      await updateMyReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(409);
    });

    it("ne modifie aucune réservation", async () => {
      await updateMyReservation(requete, reponse, next);

      expect(updateMyPendingReservation).not.toHaveBeenCalled();
    });
  });

  describe("updateMyReservation – la réservation appartient à un autre utilisateur", () => {
    beforeEach(() => {
      requete = {
        user: { id: utilisateurId },
        params: { id: "2" },
        body: { dateDebut: "2026-12-01", dateFin: "2026-12-05" },
      };

      getReservationById.mockResolvedValue({
        ...maReservationEnAttente,
        utilisateur_id: 99,
      });
    });

    it("transmet une erreur 404 à next", async () => {
      await updateMyReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(404);
    });

    it("ne modifie aucune réservation", async () => {
      await updateMyReservation(requete, reponse, next);

      expect(updateMyPendingReservation).not.toHaveBeenCalled();
    });
  });

  describe("updateMyReservation – la date de fin précède la date de début", () => {
    beforeEach(() => {
      requete = {
        user: { id: utilisateurId },
        params: { id: "2" },
        body: { dateDebut: "2026-12-05", dateFin: "2026-12-01" },
      };
    });

    it("transmet une erreur 400 à next", async () => {
      await updateMyReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(400);
    });

    it("ne consulte pas la base de données", async () => {
      await updateMyReservation(requete, reponse, next);

      expect(getReservationById).not.toHaveBeenCalled();
    });
  });

  describe("cancelMyReservation – la réservation est annulable", () => {
    beforeEach(() => {
      requete = { user: { id: utilisateurId }, params: { id: "2" } };
      cancelMyPendingReservation.mockResolvedValue({
        ...maReservationEnAttente,
        statut: "cancelled",
      });
    });

    it("annule la réservation de l’utilisateur connecté", async () => {
      await cancelMyReservation(requete, reponse, next);

      expect(cancelMyPendingReservation).toHaveBeenCalledWith(2, utilisateurId);
    });

    it("renvoie le statut HTTP 200", async () => {
      await cancelMyReservation(requete, reponse, next);

      expect(reponse.status).toHaveBeenCalledWith(200);
    });

    it("termine la requête sans appeler next", async () => {
      await cancelMyReservation(requete, reponse, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("cancelMyReservation – la réservation n’est pas annulable", () => {
    beforeEach(() => {
      requete = { user: { id: utilisateurId }, params: { id: "2" } };
      cancelMyPendingReservation.mockResolvedValue(null);
    });

    it("transmet une erreur 409 à next", async () => {
      await cancelMyReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(409);
    });

    it("n’envoie aucune réponse de succès", async () => {
      await cancelMyReservation(requete, reponse, next);

      expect(reponse.json).not.toHaveBeenCalled();
    });
  });

  describe("cancelMyReservation – l’identifiant est invalide", () => {
    beforeEach(() => {
      requete = { user: { id: utilisateurId }, params: { id: "abc" } };
    });

    it("transmet une erreur 400 à next", async () => {
      await cancelMyReservation(requete, reponse, next);

      const erreur = next.mock.lastCall?.[0];
      expect(erreur?.status).toBe(400);
    });

    it("ne tente aucune annulation", async () => {
      await cancelMyReservation(requete, reponse, next);

      expect(cancelMyPendingReservation).not.toHaveBeenCalled();
    });
  });

  describe("obtenirReservationsConfirmees", () => {
    it("retourne la liste des réservations confirmées avec un code 200", async () => {
      const mockConfirmees = [reservationConfirmee];
      getConfirmedReservations.mockResolvedValue(mockConfirmees);

      await obtenirReservationsConfirmees(requete, reponse, next);

      expect(reponse.status).toHaveBeenCalledWith(200);
      expect(reponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            reservations: mockConfirmees,
            count: 1,
          },
        }),
      );
    });
  });
});
