import { createHash } from 'node:crypto';
import { HttpError } from './_http.js';

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Variables CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET manquantes');
    throw new HttpError(500, 'Stockage des images non configuré');
  }
  return { cloudName, apiKey, apiSecret };
}

export function signer(params, apiSecret) {
  const chaine = Object.keys(params)
    .sort()
    .map((cle) => `${cle}=${params[cle]}`)
    .join('&');
  return createHash('sha1').update(chaine + apiSecret).digest('hex');
}

async function appeler(action, params, fichier) {
  const { cloudName, apiKey, apiSecret } = config();
  const signes = { ...params, timestamp: Math.floor(Date.now() / 1000) };

  const form = new FormData();
  for (const [cle, valeur] of Object.entries(signes)) {
    form.append(cle, String(valeur));
  }
  form.append('api_key', apiKey);
  form.append('signature', signer(signes, apiSecret));
  if (fichier) {
    form.append('file', new Blob([fichier.buffer], { type: fichier.type }), fichier.name || 'image');
  }

  const reponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/${action}`, {
    method: 'POST',
    body: form,
  });
  const resultat = await reponse.json().catch(() => ({}));

  if (!reponse.ok || resultat.error) {
    const erreur = new Error(resultat.error?.message || `Cloudinary HTTP ${reponse.status}`);
    erreur.status = 502;
    throw erreur;
  }
  return resultat;
}

export function uploadImage(fichier, dossier) {
  return appeler('upload', { folder: dossier, allowed_formats: 'jpg,jpeg,png,webp' }, fichier);
}

export function deleteImage(publicId) {
  return appeler('destroy', { public_id: publicId, invalidate: 'true' });
}
