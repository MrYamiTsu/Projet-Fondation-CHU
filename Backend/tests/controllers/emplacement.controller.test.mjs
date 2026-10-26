// - describe : regroupe des tests (comme un dossier)
// - it       : définit UN test
// - expect   : sert à vérifier un résultat
// - vi       : boîte à outils pour créer des mocks (fausses fonctions)
// - beforeEach : code exécuté avant CHAQUE test
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import du model pour faire comme un controller normal
import * as modele from '../../src/models/emplacement.mjs';

// On importe les controllers à tester (les vraies fonctions, pas des mocks).
import {
  getPlotByLieu, // controller : recherche par lieu
  getPlotById,    // controller : recherche par id
  getAllPlots,                // controller : liste de tous les emplacements
} from '../../src/controllers/emplacement.controller.mjs';

// Mocking du modèle : on remplace les vraies fonctions par des fausses.
// Cela permet de tester le controller sans toucher à la base de données.
vi.mock('../../src/models/emplacement.mjs', () => ({
  // Chaque vi.fn() est une fausse fonction : Donc on choisi se
  // qu'elle est sensé retourné pour chaque test.
  findPlotByLieu: vi.fn(),
  findPlotByDescription: vi.fn(),
  findPlotById: vi.fn(),
  findAllPlots: vi.fn(),
}));



// Fonction qui fabrique un faux objet "res".
// Un controller écrit res.status(200).json(...) : deux appels enchaînés.
const creerRes = () => {
  const res = {};
  // res.status est une fausse fonction qui retourne "res" (permet le chaînage).
  res.status = vi.fn().mockReturnValue(res);
  // res.json est une fausse fonction qui retourne aussi "res".
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// Regoupement de touts les tests du controller "emplacement.controller".
describe('emplacement.controller', () => {
  let res;  // le faux res
  let next; // le faux next

  // beforeEach s'exécute avant CHAQUE test (it) de ce groupe.
  beforeEach(() => {
    // remet à zéro l'historique des appels de tous les mocks, utile pour le workflow GitHub Actions.
    vi.clearAllMocks();
    //nouveau faux res à chaque fois.
    res = creerRes();
    //nouveau faux next à chaque fois.
    next = vi.fn();
  });


  // Test pour getPlotByLieu
  // entrée invalide / lieu trouvé / lieu non trouvé (suggestions) / erreur de la base
  describe('getPlotByLieu', () => {
    // test 1 à 3 : entrée invalide -> tout les cas doivent renvoyer une erreur 400.
    it.each([
      // Chaque ligne = [nom du cas, valeur du lieu à tester]
      ['absent', undefined],            
      ['vide', ''],                     
      ['uniquement des espaces', '   ']
    // %s sera remplacé par le 1er élément de la ligne (le nom du cas).
    // (_nom, lieu) : on reçoit les 2 éléments de la ligne.
    // "_nom" commence par _ car on ne s'en sert pas dans le test.
    ])('400 si le lieu est %s', async (_nom, lieu) => {

      // appelle le controller avec un faux req contenant ce lieu.
      await getPlotByLieu({ query: { lieu } }, res, next);

      // On récupère l'erreur passée à next :
      // next.mock.calls = liste des appels de next
      // [0] = le 1er appel, [0] = son 1er argument (l'erreur)
      const erreur = next.mock.calls[0][0];

      // vérifie que c'est bien un objet Error.
      expect(erreur).toBeInstanceOf(Error);
      // vérifie que son champ status vaut 400 (mauvaise requête).
      expect(erreur.status).toBe(400);

      // vérifie qu'on n'est pas allé chercher dans la base (entrée invalide).
      expect(modele.findPlotByLieu).not.toHaveBeenCalled();
      // vérifie que le controller n'a envoyé aucune réponse lui-même.
      expect(res.json).not.toHaveBeenCalled();
    });


    // TEST 4 et 5 : cas normal, des résultats sont trouvés même avec des espaces.
    it('200 avec les emplacements trouvés (lieu nettoyé par trim)', async () => {
      // Test 5 : Un emplacement est trouvé.
      const emplacements = [{ id: 1 }];
      // mockResolvedValue : la fausse fonction réussit et retourne ces données
      modele.findPlotByLieu.mockResolvedValue(emplacements);

      // Test 5: Vérification du trim 
      await getPlotByLieu(
        { query: { lieu: '  Aile A  ' } }, // faux req
        res,                               // faux res
        next                               // faux next
      );

      // vérifie que le modèle a été appelé avec le lieu sans les espaces.
      expect(modele.findPlotByLieu).toHaveBeenCalledWith('Aile A');
      // vérifie que le controller n'a pas lancé de recherche par description (puisque lieu trouvé).
      expect(modele.findPlotByDescription).not.toHaveBeenCalled();
      // vérifie que le controller a répondu avec le code 200.
      expect(res.status).toHaveBeenCalledWith(200);
      // vérifie que le corps de la réponse est la liste des emplacements trouvé avec le lieu.
      expect(res.json).toHaveBeenCalledWith(emplacements);
      // vérifie que aucune erreur n'a été signalée.
      expect(next).not.toHaveBeenCalled();
    });

    // test 6 : aucun lieu trouvé -> suggestions par description
    it('si aucun lieu trouvé, retourne les suggestions par description', async () => {
      // les suggestions que la recherche par description va retourner.
      const suggestions = [{ id: 7, description: 'Près de l’aile A' }];
      // La recherche par lieu ne trouve rien : tableau vide.
      modele.findPlotByLieu.mockResolvedValue([]);
      // La recherche par description trouve des suggestions.
      modele.findPlotByDescription.mockResolvedValue(suggestions);

      // on appelle le controller.
      await getPlotByLieu({ query: { lieu: 'aile' } }, res, next);

      // vérifie que le controller a bien lancé la recherche par description avec le même mot.
      expect(modele.findPlotByDescription).toHaveBeenCalledWith(
        'aile'
      );
      // vérifie que la réponse est 200.
      expect(res.status).toHaveBeenCalledWith(200);
      // vérifie que le corps contient les suggestions (et non un tableau vide).
      expect(res.json).toHaveBeenCalledWith(suggestions);
    });

    // test 7 : la base de données plante
    it('transmet l’erreur à next si le modèle échoue', async () => {
      // on crée une erreur qui simule une panne de la base.
      const erreur = new Error('DB down');
      // la fausse fonction échoue avec cette erreur
      modele.findPlotByLieu.mockRejectedValue(erreur);

      // on appelle le controller.
      await getPlotByLieu({ query: { lieu: 'aile' } }, res, next);

      // le catch du controller a transmis l'erreur à next.
      expect(next).toHaveBeenCalledWith(erreur);
      // aucune réponse normale n'a été envoyée.
      expect(res.json).not.toHaveBeenCalled();
    });
  });


  // Test pour getPlotById
  // id invalide / id valide trouvé / introuvable (404) / erreur de la base
  describe('getPlotById', () => {
    // tests 8 à 13 : id invalide -> erreur 400
    it.each([
      ['une lettre', 'abc'], 
      ['zéro', '0'],         
      ['négatif', '-5'],     
      ['décimal', '1.5'],   
      ['vide', ''],          
      ['des espaces', '   '],
    ])('400 si l’id est %s', async (_nom, id) => {

      // appelle le controller avec un faux req contenant cet id.
      await getPlotById({ params: { id } }, res, next);

      // l'erreur passée à next a le status 400.
      expect(next.mock.calls[0][0].status).toBe(400);
      // VÉRIFIER : la base n'a pas été interrogée.
      expect(modele.findPlotById).not.toHaveBeenCalled();
    });

    // test 14 : cas normal, l'emplacement existe
    it('200 et appelle le modèle avec un nombre', async () => {
      // le faux modèle retourne un emplacement.
      modele.findPlotById.mockResolvedValue({ id: 5 });

      // appelle le controller avec un id valide.
      await getPlotById({ params: { id: '5' } }, res, next);

      // vérifier que le modèle a reçu le NOMBRE 5 et non le texte '5'
      // (le controller fait Number(id)).
      expect(modele.findPlotById).toHaveBeenCalledWith(5);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 5 });
    });

    // test 15 : l'emplacement n'existe pas
    it('404 si l’emplacement n’existe pas', async () => {
      // le modèle retourne null quand rien n'est trouvé.
      modele.findPlotById.mockResolvedValue(null);

      // id valide mais inexistant.
      await getPlotById({ params: { id: '99' } }, res, next);
    
      // erreur 404 transmise à next.
      expect(next.mock.calls[0][0].status).toBe(404);
      // pas de réponse normale envoyée.
      expect(res.json).not.toHaveBeenCalled();
    });

    // test 16 : la base de données plante (comme le test 7)
    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.findPlotById.mockRejectedValue(erreur);

      // id valide, mais le modèle plante.
      await getPlotById({ params: { id: '5' } }, res, next);
      // l'erreur a été transmise à next.
      expect(next).toHaveBeenCalledWith(erreur);
    });
  });


  // Test pour getAllPlots
  // succès / erreur de la base
  // =================================================================
  describe('getAllPlots', () => {

    // test 17 : cas normal
    it('200 avec tous les emplacements', async () => {
      // le faux modèle retourne 10 emplacements.
      const emplacements = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }];
      modele.findAllPlots.mockResolvedValue(emplacements);

      // ce controller n'utilise pas req, on passe donc un objet vide {}. 
      await getAllPlots({}, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      // le corps est la liste complète.
      expect(res.json).toHaveBeenCalledWith(emplacements);
    });

    // test 18 : la base de données plante
    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.findAllPlots.mockRejectedValue(erreur);

      await getAllPlots({}, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
    });
  });
});