import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Custom Vite plugin to emulate Vercel Serverless Functions in local development
const apiPlugin = () => ({
  name: 'api-serverless-dev-server',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/api/')) {
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const apiPath = urlObj.pathname;
        
        // Find corresponding file in api directory
        const filePath = path.resolve(__dirname, `.${apiPath}.ts`);
        
        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'error', msg: `API route ${apiPath} not found` }));
          return;
        }

        try {
          // Dynamically compile & load the TS module using Vite SSR
          const apiModule = await server.ssrLoadModule(filePath);
          const handler = apiModule.default;
          
          if (typeof handler !== 'function') {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'error', msg: `API route ${apiPath} does not export default function` }));
            return;
          }

          // Parse query params
          const query: Record<string, string> = {};
          urlObj.searchParams.forEach((value, key) => {
            query[key] = value;
          });

          // Parse body if method is POST/PUT
          let body = {};
          if (req.method === 'POST' || req.method === 'PUT') {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString();
            try {
              if (req.headers['content-type']?.includes('application/json')) {
                body = JSON.parse(rawBody);
              } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
                const params = new URLSearchParams(rawBody);
                const formBody: Record<string, string> = {};
                params.forEach((value, key) => {
                  formBody[key] = value;
                });
                body = formBody;
              } else {
                body = rawBody;
              }
            } catch (e) {
              body = rawBody;
            }
          }

          // Emulate VercelRequest and VercelResponse
          const mockReq = Object.assign(req, {
            query,
            body,
            cookies: {},
          });

          const mockRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code;
              return mockRes;
            },
            json(data: any) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(data));
              return mockRes;
            },
            send(data: any) {
              res.end(data);
              return mockRes;
            }
          });

          // Load env variables into process.env
          const env = loadEnv(server.config.mode, process.cwd(), '');
          Object.assign(process.env, env);

          // Run handler
          await handler(mockReq, mockRes);
        } catch (error: any) {
          console.error(`Error executing API ${apiPath}:`, error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'error', msg: error.message || 'Internal Server Error' }));
        }
      } else {
        next();
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Tối ưu chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-switch',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
          ],
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ]
        }
      }
    },
    // Target modern browsers
    target: 'esnext',
    minify: 'esbuild',
    // Tăng warning threshold để tránh warning chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  }
}));
