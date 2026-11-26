// Fridge Roast — the bot drops one roast line into entry.txt and this
// little script ferries it into the output folder, trimmed and counted.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 200;

function resolveDirs() {
  return {
    from: process.env.MAKEFUN_BOT_DIR ?? "/bot",
    to: process.env.MAKEFUN_OUTPUT_DIR ?? "/output",
  };
}

function withoutFinalNewline(raw: string): string {
  return raw.endsWith("\n") ? raw.slice(0, raw.length - 1) : raw;
}

function die(message: string): never {
  console.error(message);
  process.exit(1);
}

function main(): void {
  const { from, to } = resolveDirs();
  const inputPath = join(from, "entry.txt");
  const outputPath = join(to, "entry.txt");

  mkdirSync(to, { recursive: true });
  copyFileSync(inputPath, outputPath);

  // The file's last newline is just the editor's line ending, not a
  // character of the roast, so exactly one of them comes off.
  const entry = withoutFinalNewline(readFileSync(outputPath, "utf8"));

  // Empty entries and over-budget entries both fail: check the empty
  // case first, then the length cap, so the error names the real issue.
  if (entry.length === 0) {
    die("Error: entry.txt is empty.");
  }
  if (entry.length > MAX_CHARS) {
    die(`Error: entry is ${entry.length} characters, over the ${MAX_CHARS} character limit.`);
  }

  console.log(`Character count: ${entry.length}`);
  console.log(entry);
}

main();
