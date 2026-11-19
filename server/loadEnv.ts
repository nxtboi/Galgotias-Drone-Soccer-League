import fs from 'fs';
import path from 'path';

// Load .env (if present) before any module reads process.env. Must be the first import in server.ts.
// Variables already set in the real environment win over the file.
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === 'function') {
  try {
    (process as any).loadEnvFile(envPath);
  } catch (err) {
    console.warn('[env] Could not load .env:', err);
  }
}
