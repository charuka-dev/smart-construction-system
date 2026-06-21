import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(__dirname, '../../cv/blueprint_to_model.py');

/**
 * Synchronously invoke the Python OpenCV pipeline on a blueprint image.
 * Returns parsed JSON: { rooms: [{ id, polygon: [[x,y],...], height }] }
 */
export function runBlueprintPipeline(imagePath) {
  return new Promise((resolve, reject) => {
    const args = [SCRIPT, imagePath];
    if (process.env.CV_MOCK === 'true') args.push('--mock');

    const py = spawn(process.env.PYTHON_BIN ?? 'python3', args);
    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (d) => { stdout += d.toString(); });
    py.stderr.on('data', (d) => { stderr += d.toString(); });
    py.on('error', reject);
    py.on('close', (code) => {
      if (code !== 0) return reject(new Error(`CV pipeline exited ${code}: ${stderr}`));
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(`Invalid CV output: ${e.message}\n${stdout}`));
      }
    });
  });
}
