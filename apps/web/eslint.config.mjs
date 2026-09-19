import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    extends: [...nextCoreWebVitals],
    rules: {
      // Existing state hydration and modal-reset effects intentionally synchronize
      // browser/local state after mount. Keep the behavior while upgrading React.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
