export function validateReservation(req, res, next) {
  const { emplacementId, dateDebut, dateFin } = req.body ?? {};

  if (
    emplacementId == null ||
    String(emplacementId).trim() === '' ||
    !Number.isSafeInteger(Number(emplacementId)) ||
    Number(emplacementId) <= 0
  ) {
    return res.status(400).json({
      message: "Identifiant d'emplacement invalide"
    });
  }

  if (
    typeof dateDebut !== 'string' ||
    typeof dateFin !== 'string' ||
    dateDebut.trim() === '' ||
    dateFin.trim() === ''
  ) {
    return res.status(400).json({
      message: "Veuillez fournir les deux dates"
    });
  }

  if (
    !Number.isFinite(Date.parse(dateDebut)) ||
    !Number.isFinite(Date.parse(dateFin)) ||
    new Date(dateDebut) >= new Date(dateFin)
  ) {
    return res.status(400).json({
      message: "Les dates de réservation sont invalides"
    });
  }

  next();
}