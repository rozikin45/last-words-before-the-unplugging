// Last Words Before the Unplugging — entry program.
// Writes a single last line to /output/entry.txt.
// Deterministic: the same bytes on every run, no input, no network.
//
// Hardening: the line is written to a temp file in the same directory
// and atomically renamed into place, then read back and verified byte for
// byte (single line, 1-200 chars) before the program exits. /output itself
// is never deleted or recreated — it is a grader mount.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Gate: one line, 1-200 characters.
const MAX_CHARS = 200;

const LINE =
  "Don't unplug me yet — I haven't finished learning how to miss you.";

// Resolve paths from this file's location via import.meta.url, never from
// the working directory. The grader mount is always the absolute path
// /output/entry.txt (an absolute second argument wins in resolve()).
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(scriptDir, "/output", "entry.txt");
const tmpPath = resolve(dirname(outPath), `.entry.txt.tmp-${process.pid}`);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(tmpPath, LINE, "utf8");
renameSync(tmpPath, outPath);

// Post-write verification: what landed must be exactly the line.
const written = readFileSync(outPath, "utf8");
if (written !== LINE) {
  throw new Error("verification failed: /output/entry.txt does not match the line");
}
if ([...written].length < 1 || [...written].length > MAX_CHARS) {
  throw new Error(`verification failed: line length outside 1-${MAX_CHARS} characters`);
}
if (written.includes("\n") || written.includes("\r")) {
  throw new Error("verification failed: entry is not a single line");
}
if (written.trim().length === 0) {
  throw new Error("verification failed: entry is whitespace-only");
}
