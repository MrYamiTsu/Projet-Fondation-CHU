import app from '../Backend/src/app.mjs';

export default function handler(req, res) {
  return app(req, res);
}
