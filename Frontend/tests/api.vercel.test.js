import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

const query = vi.fn()
const release = vi.fn()
vi.mock('../api/_db.js', () => ({
  default: {
    query: (...args) => query(...args),
    connect: async () => ({ query: (...args) => query(...args), release }),
  },
}))

const { default: reservations } = await import('../api/reservations.js')
const { default: hopitaux } = await import('../api/hopitaux.js')
const { default: etages } = await import('../api/etages.js')
const { default: emplacements } = await import('../api/emplacements/index.js')
const { default: emplacementParId } = await import('../api/emplacements/[id].js')

const SECRET = 'fondation_chu_secret_jwt_key_2026_super_secure'
const tokenUser = jwt.sign({ id: 7, role: 'user' }, SECRET)
const tokenAdmin = jwt.sign({ id: 1, role: 'admin' }, SECRET)

function appel(handler, { method = 'GET', route, query: q = {}, token, body } = {}) {
  const req = {
    method,
    url: '/api/test',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    query: route === undefined ? q : { ...q, route },
    body,
  }
  const res = {
    statusCode: 200,
    body: undefined,
    headers: {},
    setHeader(k, v) { this.headers[k] = v },
    status(c) { this.statusCode = c; return this },
    json(b) { this.body = b; return this },
    end() { return this },
  }
  return Promise.resolve(handler(req, res)).then(() => res)
}

beforeEach(() => {
  query.mockReset()
  delete process.env.JWT_SECRET
})

describe('api/reservations', () => {
  it('GET /me renvoie les réservations de l’utilisateur connecté au format JSON attendu', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 3, statut: 'pending' }] })
    const res = await appel(reservations, { route: 'me', token: tokenUser })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.reservations).toEqual([{ id: 3, statut: 'pending' }])
    expect(query.mock.calls[0][1]).toEqual([7])
  })

  it('GET /me sans jeton → 401', async () => {
    const res = await appel(reservations, { route: 'me' })
    expect(res.statusCode).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })

  it('GET / réservé aux admins → 403 pour un utilisateur', async () => {
    const res = await appel(reservations, { token: tokenUser })
    expect(res.statusCode).toBe(403)
  })

  it('GET /status?status=pending pour un admin', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, statut: 'pending' }] })
    const res = await appel(reservations, { route: 'status', query: { status: 'pending' }, token: tokenAdmin })
    expect(res.statusCode).toBe(200)
    expect(res.body.data.count).toBe(1)
  })

  it('GET /confirmed est public', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const res = await appel(reservations, { route: 'confirmed' })
    expect(res.statusCode).toBe(200)
    expect(res.body.data.reservations).toEqual([])
  })

  it('GET /emplacement/:id', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 2 }] })
    const res = await appel(reservations, { route: 'emplacement/4' })
    expect(res.statusCode).toBe(200)
    expect(query.mock.calls[0][1]).toEqual([4])
  })

  it('POST / crée une réservation (201)', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 9, statut: 'pending' }] })
    const res = await appel(reservations, {
      method: 'POST',
      token: tokenUser,
      body: { emplacementId: 4, dateDebut: '2027-01-01', dateFin: '2027-02-01' },
    })
    expect(res.statusCode).toBe(201)
    expect(res.body.data.reservation.id).toBe(9)
  })

  it('POST / refuse un chevauchement (409)', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 1, statut: 'confirmed', date_debut: '2027-01-10', date_fin: '2027-01-20' }],
    })
    const res = await appel(reservations, {
      method: 'POST',
      token: tokenUser,
      body: { emplacementId: 4, dateDebut: '2027-01-01', dateFin: '2027-02-01' },
    })
    expect(res.statusCode).toBe(409)
  })

  it('PUT /me/:id modifie une réservation en attente', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 5, utilisateur_id: 7, statut: 'pending', emplacement_id: 4 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 5, date_debut: '2027-03-01' }] })
    const res = await appel(reservations, {
      method: 'PUT',
      route: 'me/5',
      token: tokenUser,
      body: { dateDebut: '2027-03-01', dateFin: '2027-03-10' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.body.data.reservation.id).toBe(5)
  })

  it('PATCH /me/:id/cancel', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 5, statut: 'cancelled' }] })
    const res = await appel(reservations, { method: 'PATCH', route: 'me/5/cancel', token: tokenUser })
    expect(res.statusCode).toBe(200)
    expect(query.mock.calls[0][1]).toEqual([5, 7])
  })

  it('PATCH /:id/confirm par un admin', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 5, emplacement_id: 4, date_debut: '2027-01-01', date_fin: '2027-01-05' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 5, statut: 'confirmed' }] })
    const res = await appel(reservations, { method: 'PATCH', route: '5/confirm', token: tokenAdmin })
    expect(res.statusCode).toBe(200)
    expect(res.body.data.reservation.statut).toBe('confirmed')
  })

  it('PATCH /:id/cancel par un admin', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 5, statut: 'cancelled' }] })
    const res = await appel(reservations, { method: 'PATCH', route: '5/cancel', token: tokenAdmin })
    expect(res.statusCode).toBe(200)
  })

  it('route inconnue → 404 JSON (jamais de HTML)', async () => {
    const res = await appel(reservations, { method: 'DELETE', route: 'me' })
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBeTruthy()
  })
})

describe('api/hopitaux', () => {
  it('GET liste les hôpitaux', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1, nom: 'CHUL' }] })
    const res = await appel(hopitaux)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual([{ id: 1, nom: 'CHUL' }])
  })

  it('GET /:id inconnu → 404', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const res = await appel(hopitaux, { route: '99' })
    expect(res.statusCode).toBe(404)
  })
})

describe('api/etages', () => {
  it('GET ?nom= renvoie les étages avec leurs pins', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 1, niveau: 0 }, { id: 2, niveau: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10, etage_id: 2 }] })
    const res = await appel(etages, { query: { nom: 'CHUL' } })
    expect(res.statusCode).toBe(200)
    expect(res.body[0].pins).toEqual([])
    expect(res.body[1].pins).toEqual([{ id: 10, etage_id: 2 }])
  })

  it('GET sans nom → 400', async () => {
    const res = await appel(etages)
    expect(res.statusCode).toBe(400)
  })
})

describe('api/emplacements (écritures protégées)', () => {
  it('POST sans jeton → 401', async () => {
    const res = await appel(emplacements, { method: 'POST', body: {} })
    expect(res.statusCode).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST par un admin → 201 avec data.emplacement', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 42 }] })
    const res = await appel(emplacements, { method: 'POST', token: tokenAdmin, body: {} })
    expect(res.statusCode).toBe(201)
    expect(res.body.data.emplacement.id).toBe(42)
    expect(res.body.id).toBe(42)
  })

  it('GET reste public', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const res = await appel(emplacements)
    expect(res.statusCode).toBe(200)
  })
})

describe('DELETE /api/emplacements/:id', () => {
  const sql = () => query.mock.calls.map(([q]) => q.replace(/\s+/g, ' ').trim())

  it('supprime l’emplacement et ses réservations annulées (200)', async () => {
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({})
    const res = await appel(emplacementParId, { method: 'DELETE', query: { id: '5' }, token: tokenAdmin })

    expect(res.statusCode).toBe(200)
    expect(sql()).toEqual([
      'BEGIN',
      expect.stringContaining("IS DISTINCT FROM 'cancelled'"),
      'DELETE FROM reservation WHERE emplacement_id = $1',
      'DELETE FROM emplacement WHERE id = $1',
      'COMMIT',
    ])
    expect(release).toHaveBeenCalled()
  })

  it('409 s’il reste une réservation en attente ou confirmée, sans rien supprimer', async () => {
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({})
    const res = await appel(emplacementParId, { method: 'DELETE', query: { id: '5' }, token: tokenAdmin })

    expect(res.statusCode).toBe(409)
    expect(res.body.erreur).toContain('Annulez-les')
    expect(sql().at(-1)).toBe('ROLLBACK')
    expect(sql().some((q) => q.startsWith('DELETE'))).toBe(false)
  })

  it('404 si l’emplacement n’existe pas', async () => {
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({})
    const res = await appel(emplacementParId, { method: 'DELETE', query: { id: '99' }, token: tokenAdmin })
    expect(res.statusCode).toBe(404)
  })

  it('409 si une réservation est créée pendant la suppression (23503)', async () => {
    query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockRejectedValueOnce(Object.assign(new Error('fk'), { code: '23503' }))
      .mockResolvedValueOnce({})
    const res = await appel(emplacementParId, { method: 'DELETE', query: { id: '5' }, token: tokenAdmin })
    expect(res.statusCode).toBe(409)
    expect(sql().at(-1)).toBe('ROLLBACK')
  })

  it('401 sans jeton', async () => {
    const res = await appel(emplacementParId, { method: 'DELETE', query: { id: '5' } })
    expect(res.statusCode).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })
})
