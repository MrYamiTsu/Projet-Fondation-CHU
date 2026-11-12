import { describe, it, expect, vi, beforeEach } from "vitest";
import * as controller from "../../src/controllers/etage.controller.mjs";

const repo = vi.hoisted(() => ({
  getEtageById: vi.fn(),
  getAllEtageByHospital: vi.fn(),
  createEtage: vi.fn(),
  deleteEtage: vi.fn(),
}));

vi.mock("../../src/repository/etage.repository.mjs", () => repo);

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

// ============================================================
// getEtageById
// ============================================================
describe("controller.getEtageById", () => {
  it.each([
    ["une lettre", "abc"],
    ["zéro", "0"],
    ["négatif", "-5"],
    ["décimal", "1.5"],
    ["vide", ""],
    ["des espaces", "   "],
  ])("L'id est %s, donc elle retourne 400", async (_nom, id) => {
    await controller.getEtageById({ params: { id } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Veuillez fournir un id entier positif valide",
    });

    expect(repo.getEtageById).not.toHaveBeenCalled();
  });

  it("L'id est valide, donc elle retourne l'étage comme prévue", async () => {
    repo.getEtageById.mockResolvedValue({ id: 5 });

    await controller.getEtageById({ params: { id: "5" } }, res);

    expect(repo.getEtageById).toHaveBeenCalledWith(5);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ id: 5 });
  });

  it("L'id est valide mais inexistant, donc elle retourne 404", async () => {
    repo.getEtageById.mockResolvedValue(null);

    await controller.getEtageById({ params: { id: "99" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Étage non trouvé" });
  });

  it("500 si le repository échoue", async () => {
    repo.getEtageById.mockRejectedValue(new Error("DB down"));

    await controller.getEtageById({ params: { id: "5" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});

// ============================================================
// getAllEtageByHospital
// ============================================================
describe("controller.getAllEtageByHospital", () => {
  it.each([
    ["absent", undefined],
    ["vide", ""],
    ["des espaces", "   "],
    ["un nombre", 123],
    ["un tableau (?nom=a&nom=b)", ["a", "b"]],
  ])("Le nom est %s, donc retourne 400", async (_nom, nom) => {
    await controller.getAllEtageByHospital({ query: { nom } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Veuillez fournir un nom d'hôpital valide",
    });
    expect(repo.getAllEtageByHospital).not.toHaveBeenCalled();
  });

  it("Retourne la liste des étages pour un nom d'hôpital valide", async () => {
    const etages = [{ id: 1 }, { id: 2 }];
    repo.getAllEtageByHospital.mockResolvedValue(etages);

    await controller.getAllEtageByHospital({ query: { nom: "CHUL" } }, res);

    expect(repo.getAllEtageByHospital).toHaveBeenCalledWith("CHUL");
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(etages);
  });

  it("Retourne une liste vide si aucun étage n'est trouvé", async () => {
    repo.getAllEtageByHospital.mockResolvedValue([]);

    await controller.getAllEtageByHospital({ query: { nom: "CHUL" } }, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("500 si le repository échoue", async () => {
    repo.getAllEtageByHospital.mockRejectedValue(new Error("DB down"));

    await controller.getAllEtageByHospital({ query: { nom: "CHUL" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});

// ============================================================
// createEtage
// ============================================================
describe("controller.createEtage", () => {
  const etageValide = { hopital_id: 3, niveau: 2, nom: "Deuxième" };

  it.each([
    ["un texte", "3"],
    ["zéro", 0],
    ["négatif", -1],
    ["décimal", 1.5],
    ["NaN", NaN],
    ["null", null],
    ["absent", undefined],
  ])(
    "L'identifiant de l'hôpital est %s, donc retourne 400",
    async (_nom, hopital_id) => {
      await controller.createEtage({ body: { ...etageValide, hopital_id } }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Veuillez fournir un id d'hôpital entier positif valide",
      });
      expect(repo.createEtage).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["absent", undefined],
    ["null", null],
    ["un nombre", 42],
    ["vide", ""],
    ["des espaces", "   "],
  ])("Le nom est %s, donc retourne 400", async (_nom, nom) => {
    await controller.createEtage({ body: { ...etageValide, nom } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Veuillez fournir un nom d'étage valide",
    });
    expect(repo.createEtage).not.toHaveBeenCalled();
  });

  it.each([
    ["un texte", "2"],
    ["décimal", 1.5],
    ["NaN", NaN],
    ["null", null],
    ["absent", undefined],
  ])("Le niveau est %s, donc retourne 400", async (_nom, niveau) => {
    await controller.createEtage({ body: { ...etageValide, niveau } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Veuillez fournir un niveau d'étage entier valide",
    });
    expect(repo.createEtage).not.toHaveBeenCalled();
  });

  it("Tout est valide, donc retourne 201", async () => {
    const etageCree = { id: 1, ...etageValide };
    repo.createEtage.mockResolvedValue(etageCree);

    await controller.createEtage({ body: etageValide }, res);

    expect(repo.createEtage).toHaveBeenCalledWith(3, 2, "Deuxième");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(etageCree);
  });

  it("Le niveau est 0 (rez-de-chaussée), donc retourne 201", async () => {
    repo.createEtage.mockResolvedValue({ id: 1 });

    await controller.createEtage({ body: { ...etageValide, niveau: 0 } }, res);

    expect(repo.createEtage).toHaveBeenCalledWith(3, 0, "Deuxième");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("Le niveau est négatif (sous-sol), donc retourne 201", async () => {
    repo.createEtage.mockResolvedValue({ id: 1 });

    await controller.createEtage({ body: { ...etageValide, niveau: -2 } }, res);

    expect(repo.createEtage).toHaveBeenCalledWith(3, -2, "Deuxième");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("500 si le repository échoue", async () => {
    repo.createEtage.mockRejectedValue(new Error("DB down"));

    await controller.createEtage({ body: etageValide }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});

// ============================================================
// deleteEtage
// ============================================================
describe("controller.deleteEtage", () => {
  it.each([
    ["une lettre", "abc"],
    ["zéro", "0"],
    ["négatif", "-5"],
    ["décimal", "1.5"],
    ["vide", ""],
    ["des espaces", "   "],
  ])("Le id est %s, donc retourne 400", async (_nom, id) => {
    await controller.deleteEtage({ params: { id } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Veuillez fournir un id entier positif valide",
    });
    expect(repo.deleteEtage).not.toHaveBeenCalled();
  });

  it("Le id est valide et l'étage existe, donc retourne 200", async () => {
    repo.deleteEtage.mockResolvedValue({ id: 5 });

    await controller.deleteEtage({ params: { id: "5" } }, res);

    expect(repo.deleteEtage).toHaveBeenCalledWith(5);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ id: 5 });
  });

  it("L'étage n'existe pas, donc retourne 404", async () => {
    repo.deleteEtage.mockResolvedValue(undefined);

    await controller.deleteEtage({ params: { id: "99" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Étage non trouvé" });
  });

  it("500 si le repository échoue", async () => {
    repo.deleteEtage.mockRejectedValue(new Error("DB down"));

    await controller.deleteEtage({ params: { id: "5" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB down" });
  });
});
