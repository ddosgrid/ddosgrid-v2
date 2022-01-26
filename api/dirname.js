import { fileURLToPath } from 'url';
import { dirname as pdirname } from 'path';

export default function dirname () {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = pdirname(__filename);
  return __dirname
}
