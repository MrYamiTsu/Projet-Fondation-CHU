import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controller from "../../src/controllers/pin.controller.mjs";

const service = vi.hoisted(() => ({
  createPin: vi.fn(),
  deletePin: vi.fn(),
}));

vi.mock("../../src/services/pin.service.mjs", () => service);

function creerRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

let res;

beforeEach(() => {
  vi.resetAllMocks();
  res = creerRes();
});

describe("controller.createPin", () => {
  const body = { etage_id: 3, emplacement_id: 2, x: 0.1, y: 0.2 };

  it("Le service réussit, donc retourne 201", async () => {
    const pinCree = { id: 1, ...body };
    service.createPin.mockResolvedValue(pinCree);

    await controller.createPin({ body }, res);

    expect(service.createPin).toHaveBeenCalledWith(3, 2, 0.1, 0.2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(pinCree);
  });

  it("Le body est absent, donc appelle le service avec undefined", async () => {
    service.createPin.mockResolvedValue({});

    await controller.createPin({}, res);

    expect(service.createPin).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
  });

  it("Le service lance une erreur avec un status, donc utilise ce status", async () => {
    service.createPin.mockRejectedValue(
      Object.assign(new Error("Données invalides"), { status: 400 }),
    );

    await controller.createPin({ body }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Données invalides" });
  });

  it("Le service lance une erreur sans status, donc retourne 500", async () => {
    service.createPin.mockRejectedValue(new Error("DB down"));

    await controller.createPin({ body }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});

describe("controller.deletePin", () => {
  it("Le pin existe, donc retourne le pin supprimé", async () => {
    service.deletePin.mockResolvedValue({ id: 5 });

    await controller.deletePin({ params: { id: "5" } }, res);

    expect(service.deletePin).toHaveBeenCalledWith("5");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ id: 5 });
  });

  it("Le pin n'existe pas, donc retourne 404", async () => {
    service.deletePin.mockResolvedValue(undefined);

    await controller.deletePin({ params: { id: "99" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Pin non trouvé" });
  });

  it("Le service lance une erreur avec un status, donc utilise ce status", async () => {
    service.deletePin.mockRejectedValue(
      Object.assign(new Error("Id invalide"), { status: 400 }),
    );

    await controller.deletePin({ params: { id: "abc" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Id invalide" });
  });

  it("Le service lance une erreur sans status, donc retourne 500", async () => {
    service.deletePin.mockRejectedValue(new Error("DB down"));

    await controller.deletePin({ params: { id: "5" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});