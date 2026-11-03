import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = mkdtempSync(join(tmpdir(), "nhc-mongo-query-"));

try {
  execFileSync(process.execPath, [
    require.resolve("typescript/bin/tsc"),
    "app/features/MongoQueryConverter/utils/convert.ts",
    "app/features/MongoQueryConverter/utils/convert.test.ts",
    "--outDir", outputDirectory,
    "--target", "ES2022",
    "--module", "commonjs",
    "--moduleResolution", "node",
    "--esModuleInterop",
    "--strict",
    "--skipLibCheck",
  ], { cwd: root, stdio: "inherit" });
  execFileSync(process.execPath, ["--test", join(outputDirectory, "convert.test.js")], {
    cwd: root,
    stdio: "inherit",
  });
} catch (error) {
  process.exitCode = error.status || 1;
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
