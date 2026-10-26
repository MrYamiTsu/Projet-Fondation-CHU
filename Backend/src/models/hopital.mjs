import pool from '../db.mjs';

export async function findHospitalById(id) {
  const request = `
    SELECT *
    FROM hospital
    WHERE id = $1
  `;

const result = await pool.query(request, [id]);

  return result.rows;
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
