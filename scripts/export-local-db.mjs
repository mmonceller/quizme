// Exports the old local SQLite database (data/quizgame.db) to a SQL file that can be
// imported into Cloudflare D1.
//
//   node scripts/export-local-db.mjs <temporary-password>
//
// Old accounts used bcrypt, which the Worker can't verify within the free plan's CPU budget,
// so every exported account gets <temporary-password> instead. Change it after logging in.
import { DatabaseSync } from 'node:sqlite';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const SOURCE = 'data/quizgame.db';
const OUT = 'data/export.sql';
const TABLES = ['users', 'groups', 'folders', 'quizzes', 'quiz_versions', 'quiz_shares', 'responses'];
const MAX_STATEMENT_BYTES = 100_000;
const ITERATIONS = 30_000; // must match server/src/services/passwords.ts

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Usage: node scripts/export-local-db.mjs <temporary-password (8+ characters)>');
  process.exit(1);
}

const b64url = (buf) => buf.toString('base64url');
function hashPassword(pw) {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(pw, salt, ITERATIONS, 32, 'sha256');
  return `pbkdf2$${ITERATIONS}$${b64url(salt)}$${b64url(hash)}`;
}

function literal(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

const db = new DatabaseSync(SOURCE, { readOnly: true });
const lines = ['PRAGMA defer_foreign_keys = true;'];
let oversized = 0;
let droppedImages = 0;

for (const table of TABLES) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  for (const row of rows) {
    if (table === 'users') {
      row.password_hash = hashPassword(password);
      if (row.avatar_url?.startsWith('/uploads/')) {
        row.avatar_url = null;
        droppedImages++;
      }
    }
    const cols = Object.keys(row);
    const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((c) => literal(row[c])).join(', ')});`;
    if (Buffer.byteLength(sql) > MAX_STATEMENT_BYTES) oversized++;
    lines.push(sql);
  }
  console.log(`${table.padEnd(14)} ${rows.length}`);
}

const imageRefs = db.prepare("SELECT COUNT(*) AS n FROM quizzes WHERE questions LIKE '%/uploads/%'").get().n;
writeFileSync(OUT, lines.join('\n') + '\n');
console.log(`\nWrote ${OUT}`);
if (droppedImages) console.warn(`Note: ${droppedImages} profile picture(s) were not exported; re-upload them.`);
if (imageRefs) console.warn(`Note: ${imageRefs} quiz(zes) reference uploaded images, which are not exported; re-add them.`);
if (oversized) console.warn(`Warning: ${oversized} row(s) exceed D1's 100 KB statement limit and will fail to import.`);
