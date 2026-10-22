
import pool from '../db.mjs';

export async function findHospitalById(id) {
  const request = `
    SELECT *
    FROM hospital
    WHERE id = $1
  `;

  const result = await pool.query(request, [id]);

  return result.rows[0];
}


export async function findAllHospitals() {
  const request = `
    SELECT *
    FROM hospital
    ORDER BY id
  `;

  const result = await pool.query(request);

  return result.rows;
}


export async function findHospitalEmplacements(id) {
  const request = `
    SELECT emplacement.*
    FROM emplacement
    WHERE composante_id = $1
    ORDER BY id
  `;

  const result = await pool.query(request, [id]);

  return result.rows;
}


export async function createHospital(acronyme, nom) {
  const request = `
    INSERT INTO hospital (acronyme, nom)
    VALUES ($1, $2)
    RETURNING *
  `;

  const result = await pool.query(request, [acronyme, nom]);

  return result.rows[0];
}


export async function updateHospital(id, acronyme, nom) {
  const request = `
    UPDATE hospital
    SET acronyme = $1,
        nom = $2
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(request, [acronyme, nom, id]);

  return result.rows[0];
}
