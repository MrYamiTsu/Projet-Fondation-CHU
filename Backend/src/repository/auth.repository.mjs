import * as Auth from '../models/auth.mjs';

export async function findUserByEmail(email) {
    return await Auth.findUserByEmail(email);
}

export async function createUser(nom, prenom, email, passwordHash) {
    return await Auth.createUser(nom, prenom, email, passwordHash);
}

export async function updateProfile(userId, nom, prenom, email, passwordHash) {
    return await Auth.updateProfile(userId, nom, prenom, email, passwordHash);
}

export async function deleteUser(userId) {
    return await Auth.deleteUser(userId);
}
