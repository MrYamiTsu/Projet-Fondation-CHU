import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Readable } from 'node:stream'
import jwt from 'jsonwebtoken'

const query = vi.fn()
vi.mock('../api/_db.js', () => ({ default: { query: (...args) => query(...args) } }))

const { default: etages } = await import('../api/etages.js')
const { default: pins } = await import('../api/pins.js')
const { signer } = await import('../api/_cloudinary.js')

const SECRET = 'fondation_chu_secret_jwt_key_2026_super_secure'
const tokenUser = jwt.sign({ id: 7, role: 'user' }, SECRET)
const tokenAdmin = jwt.sign({ id: 1, role: 'admin' }, SECRET)

function reponse() {
  return {
    statusCode: 200,
    body: undefined,
    setHeader() {},
    status(c) { this.statusCode = c; return this },
    json(b) { this.body = b; return this },
    end() { return this },
  }
}

async function requeteMultipart({ route, token, fichier, method = 'PUT' }) {
  const form = new FormData()
  if (fichier) form.append('image', fichier, 'plan.png')
  const r = new Request('http://localhost/', { method: 'POST', body: form })
  const corps = Buffer.from(await r.arrayBuffer())

  const req = Readable.from([corps])
  req.method = method
  req.url = '/api/etages'
  req.headers = { 'content-type': r.headers.get('content-type') }
  if (token) req.headers.authorization = `Bearer ${token}`
  req.query = { route }
  return req
}

function requeteJson({ method, route, token, body }) {
  return {
    method,
    url: '/api/pins',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    query: route === undefined ? {} : { route },
    body,
  }
}

const fetchOriginal = globalThis.fetch

beforeEach(() => {
  query.mockReset()
  delete process.env.JWT_SECRET
  process.env.CLOUDINARY_CLOUD_NAME = 'demo'
  process.env.CLOUDINARY_API_KEY = 'cle'
  process.env.CLOUDINARY_API_SECRET = 'secret'
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  globalThis.fetch = fetchOriginal
})

describe('PUT /api/etages/:id/image', () => {
  it('envoie l’image à Cloudinary et enregistre l’URL', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 3, image_public_id: 'etages/ancienne' }] })
      .mockResolvedValueOnce({ rows: [{ id: 3, image_url: 'https://img/nouvelle.png' }] })
    globalThis.fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ secure_url: 'https://img/nouvelle.png', public_id: 'etages/nouvelle' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: 'ok' })))

    const req = await requeteMultipart({
      route: '3/image',
      token: tokenAdmin,
      fichier: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
    })
    const res = reponse()
    await etages(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body.image_url).toBe('https://img/nouvelle.png')
    expect(query.mock.calls[1][1]).toEqual(['https://img/nouvelle.png', 'etages/nouvelle', 3])

    const [urlUpload, optsUpload] = globalThis.fetch.mock.calls[0]
    expect(urlUpload).toBe('https://api.cloudinary.com/v1_1/demo/image/upload')
    expect(optsUpload.body.get('folder')).toBe('etages')
    expect(optsUpload.body.get('file')).toBeInstanceOf(Blob)

    expect(globalThis.fetch.mock.calls[1][0]).toBe('https://api.cloudinary.com/v1_1/demo/image/destroy')
    expect(globalThis.fetch.mock.calls[1][1].body.get('public_id')).toBe('etages/ancienne')
  })

  it('refuse un utilisateur non admin (403)', async () => {
    const req = await requeteMultipart({
      route: '3/image',
      token: tokenUser,
      fichier: new Blob([new Uint8Array([1])], { type: 'image/png' }),
    })
    const res = reponse()
    await etages(req, res)
    expect(res.statusCode).toBe(403)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('refuse un format non image (400)', async () => {
    const req = await requeteMultipart({
      route: '3/image',
      token: tokenAdmin,
      fichier: new Blob(['texte'], { type: 'text/plain' }),
    })
    const res = reponse()
    await etages(req, res)
    expect(res.statusCode).toBe(400)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('refuse une requête sans fichier (400)', async () => {
    const req = await requeteMultipart({ route: '3/image', token: tokenAdmin })
    const res = reponse()
    await etages(req, res)
    expect(res.statusCode).toBe(400)
  })

  it('refuse une image de plus de 4 Mo (413)', async () => {
    const req = await requeteMultipart({
      route: '3/image',
      token: tokenAdmin,
      fichier: new Blob([new Uint8Array(4 * 1024 * 1024 + 100 * 1024)], { type: 'image/png' }),
    })
    const res = reponse()
    await etages(req, res)
    expect(res.statusCode).toBe(413)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('supprime l’image Cloudinary si la mise à jour en BD échoue', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 3, image_public_id: null }] })
      .mockRejectedValueOnce(new Error('BD indisponible'))
    globalThis.fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ secure_url: 'u', public_id: 'etages/orpheline' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ result: 'ok' })))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const req = await requeteMultipart({
      route: '3/image',
      token: tokenAdmin,
      fichier: new Blob([new Uint8Array([1])], { type: 'image/jpeg' }),
    })
    const res = reponse()
    await etages(req, res)

    expect(res.statusCode).toBe(500)
    expect(globalThis.fetch.mock.calls[1][1].body.get('public_id')).toBe('etages/orpheline')
  })

  it('erreur claire si Cloudinary n’est pas configuré', async () => {
    delete process.env.CLOUDINARY_API_SECRET
    vi.spyOn(console, 'error').mockImplementation(() => {})
    query.mockResolvedValueOnce({ rows: [{ id: 3 }] })
    const req = await requeteMultipart({
      route: '3/image',
      token: tokenAdmin,
      fichier: new Blob([new Uint8Array([1])], { type: 'image/png' }),
    })
    const res = reponse()
    await etages(req, res)
    expect(res.statusCode).toBe(500)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/etages/:id/image', () => {
  it('retire l’image, supprime les pins de l’étage et l’image Cloudinary', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 3, image_public_id: 'etages/plan' }] })
      .mockResolvedValueOnce({ rows: [{ id: 3, image_url: null }] })
      .mockResolvedValueOnce({ rowCount: 2 })
    globalThis.fetch.mockResolvedValueOnce(new Response(JSON.stringify({ result: 'ok' })))

    const res = reponse()
    await etages(requeteJson({ method: 'DELETE', route: '3/image', token: tokenAdmin }), res)

    expect(res.statusCode).toBe(200)
    expect(query.mock.calls[2][0]).toContain('DELETE FROM pin_emplacement')
    expect(globalThis.fetch.mock.calls[0][1].body.get('public_id')).toBe('etages/plan')
  })

  it('404 si l’étage n’a pas d’image', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 3, image_public_id: null }] })
    const res = reponse()
    await etages(requeteJson({ method: 'DELETE', route: '3/image', token: tokenAdmin }), res)
    expect(res.statusCode).toBe(404)
  })
})

describe('api/pins', () => {
  const corps = { etage_id: 3, emplacement_id: 5, x: 0.25, y: 0.75 }

  it('POST crée le pin et renvoie les infos de l’emplacement (201)', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 3, hopital_id: 1, image_url: 'https://img' }] })
      .mockResolvedValueOnce({ rows: [{ id: 5, lieu_specifique: 'Hall' }] })
      .mockResolvedValueOnce({ rows: [{ id: 11, etage_id: 3, emplacement_id: 5 }] })

    const res = reponse()
    await pins(requeteJson({ method: 'POST', token: tokenAdmin, body: corps }), res)

    expect(res.statusCode).toBe(201)
    expect(res.body).toMatchObject({ id: 11, lieu_specifique: 'Hall' })
    expect(query.mock.calls[2][0]).toContain('ON CONFLICT (emplacement_id)')
    expect(query.mock.calls[2][1]).toEqual([1, 3, 5, 0.25, 0.75])
  })

  it('POST refuse un étage sans image (409)', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 3, hopital_id: 1, image_url: null }] })
    const res = reponse()
    await pins(requeteJson({ method: 'POST', token: tokenAdmin, body: corps }), res)
    expect(res.statusCode).toBe(409)
  })

  it('POST refuse des coordonnées hors de [0, 1] (400)', async () => {
    const res = reponse()
    await pins(requeteJson({ method: 'POST', token: tokenAdmin, body: { ...corps, x: 1.5 } }), res)
    expect(res.statusCode).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST refuse un non-admin (403)', async () => {
    const res = reponse()
    await pins(requeteJson({ method: 'POST', token: tokenUser, body: corps }), res)
    expect(res.statusCode).toBe(403)
  })

  it('DELETE /:id supprime le pin', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 11 }] })
    const res = reponse()
    await pins(requeteJson({ method: 'DELETE', route: '11', token: tokenAdmin }), res)
    expect(res.statusCode).toBe(200)
    expect(query.mock.calls[0][1]).toEqual([11])
  })

  it('DELETE /:id inconnu → 404', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const res = reponse()
    await pins(requeteJson({ method: 'DELETE', route: '99', token: tokenAdmin }), res)
    expect(res.statusCode).toBe(404)
  })
})

describe('signature Cloudinary', () => {
  it('suit le format documenté (paramètres triés + secret, SHA-1)', () => {
    expect(
      signer({ eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop', public_id: 'sample_image', timestamp: 1315060510 }, 'abcd'),
    ).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e')
  })
})
