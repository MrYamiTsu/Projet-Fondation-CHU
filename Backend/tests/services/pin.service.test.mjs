import { describe, it, expect, vi, beforeEach } from "vitest";
import * as pinService from "../../src/services/pin.service.mjs";

const pinRepo = vi.hoisted(() => ({
  createPin: vi.fn(),
  deletePin: vi.fn(),
  getEmplacementById: vi.fn(),
}));

const etageRepo = vi.hoisted(() => ({
  getEtageById: vi.fn(),
}));

vi.mock("../../src/repository/pin.repository.mjs", () => pinRepo);
vi.mock("../../src/repository/etage.repository.mjs", () => etageRepo);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("pinService.createPin", () => {
  it("rejette si etage_id n'est pas un entier valide", async () => {
    await expect(pinService.createPin("abc", 1, 0.5, 0.5)).rejects.toThrow(
      "Veuillez fournir un id d'étage entier positif valide",
    );
  });

  it("rejette si emplacement_id n'est pas un entier positif valide", async () => {
    await expect(pinService.createPin(1, -5, 0.5, 0.5)).rejects.toThrow(
      "Veuillez fournir un id d'emplacement entier positif valide",
    );
  });

  it("rejette si x n'est pas entre 0 et 1", async () => {
    await expect(pinService.createPin(1, 1, 1.5, 0.5)).rejects.toThrow(
      "Veuillez fournir une coordonnée x entre 0 et 1",
    );
  });

  it("rejette si y n'est pas entre 0 et 1", async () => {
    await expect(pinService.createPin(1, 1, 0.5, -0.1)).rejects.toThrow(
      "Veuillez fournir une coordonnée y entre 0 et 1",
    );
  });

  it("rejette 404 si l'étage n'existe pas", async () => {
    etageRepo.getEtageById.mockResolvedValue(null);

    await expect(pinService.createPin(99, 1, 0.5, 0.5)).rejects.toThrow(
      "Étage non trouvé",
    );
  });

  it("rejette 409 si l'étage n'a pas d'image", async () => {
    etageRepo.getEtageById.mockResolvedValue({ id: 1, image_url: null });

    await expect(pinService.createPin(1, 1, 0.5, 0.5)).rejects.toThrow(
      "Cet étage n'a pas d'image : impossible d'y placer un pin",
    );
  });

  it("rejette 404 si l'emplacement n'existe pas", async () => {
    etageRepo.getEtageById.mockResolvedValue({
      id: 1,
      hopital_id: 2,
      image_url: "https://example.com/plan.png",
    });
    pinRepo.getEmplacementById.mockResolvedValue(null);

    await expect(pinService.createPin(1, 999, 0.5, 0.5)).rejects.toThrow(
      "Emplacement non trouvé",
    );
  });

  it("crée le pin avec succès et enrichit les données", async () => {
    etageRepo.getEtageById.mockResolvedValue({
      id: 1,
      hopital_id: 2,
      image_url: "https://example.com/plan.png",
    });
    pinRepo.getEmplacementById.mockResolvedValue({
      id: 10,
      no_local_pavillon: "CHUL-RC-001",
      lieu_specifique: "Hall",
      valeur_toponymique: 50000,
      superficie: 100,
    });
    pinRepo.createPin.mockResolvedValue({
      id: 5,
      hopital_id: 2,
      etage_id: 1,
      emplacement_id: 10,
      x: 0.35,
      y: 0.45,
    });

    const result = await pinService.createPin(1, 10, 0.35, 0.45);

    expect(pinRepo.createPin).toHaveBeenCalledWith(2, 1, 10, 0.35, 0.45);
    expect(result.id).toBe(5);
    expect(result.no_local_pavillon).toBe("CHUL-RC-001");
    expect(result.lieu_specifique).toBe("Hall");
  });
});

describe("pinService.deletePin", () => {
  it("rejette si id n'est pas un entier valide", async () => {
    await expect(pinService.deletePin("invalid")).rejects.toThrow(
      "Veuillez fournir un id de pin entier positif valide",
    );
  });

  it("supprime le pin avec succès", async () => {
    pinRepo.deletePin.mockResolvedValue({ id: 5 });

    const result = await pinService.deletePin(5);
    expect(pinRepo.deletePin).toHaveBeenCalledWith(5);
    expect(result).toEqual({ id: 5 });
  });
});
