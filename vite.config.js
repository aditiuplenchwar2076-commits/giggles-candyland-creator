import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/transform-baby')) {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.statusCode = 200;
            res.end();
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                // Ensure environment variables from .env and .env.local are loaded into process.env
                const env = loadEnv('development', process.cwd(), '');
                Object.assign(process.env, env);

                const parsedBody = body ? JSON.parse(body) : {};
                const { default: handler } = await server.ssrLoadModule('/api/transform-baby.js');

                const mockReq = {
                  method: req.method,
                  headers: req.headers,
                  body: parsedBody,
                  query: req.query || {},
                };

                const mockRes = {
                  statusCode: 200,
                  _headers: {},
                  setHeader(k, v) {
                    this._headers[k] = v;
                    res.setHeader(k, v);
                  },
                  status(code) {
                    this.statusCode = code;
                    res.statusCode = code;
                    return this;
                  },
                  json(data) {
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = this.statusCode || 200;
                    res.end(JSON.stringify(data));
                  },
                  send(data) {
                    res.statusCode = this.statusCode || 200;
                    res.end(data);
                  },
                  end() {
                    res.end();
                  },
                };

                await handler(mockReq, mockRes);
              } catch (err) {
                console.error('Dev API error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Dev Server Error', message: err.message }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
});
