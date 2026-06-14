const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const targetIndex = args.indexOf('--target');
if (targetIndex === -1 || !args[targetIndex + 1]) {
  console.error('Missing --target argument');
  process.exit(1);
}
const target = args[targetIndex + 1];

const statePath = path.join(__dirname, '..', '.agent', 'ecc-install-state.json');
if (!fs.existsSync(statePath)) {
  console.error('Install state not found:', statePath);
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
if (state.target && state.target.target !== target) {
  console.warn(`Warning: State target '${state.target.target}' does not match requested target '${target}'`);
}

let missing = 0;
let drifted = 0;
let ok = 0;

console.log(`Diagnosing install state for target: ${target}\n`);

for (const op of state.operations || []) {
  if (op.kind === 'copy-file') {
    const dest = op.destinationPath;
    const src = op.sourcePath;
    if (!fs.existsSync(dest)) {
      console.log(`[MISSING] ${dest}`);
      missing++;
      continue;
    }
    
    // Check drift if source exists
    if (fs.existsSync(src)) {
      const srcContent = fs.readFileSync(src, 'utf8');
      const destContent = fs.readFileSync(dest, 'utf8');
      if (srcContent !== destContent) {
        console.log(`[DRIFTED] ${dest}`);
        drifted++;
      } else {
        ok++;
      }
    } else {
      console.log(`[WARNING] Source missing for ${dest} (${src})`);
    }
  } else if (op.kind === 'create-dir') {
    const dest = op.destinationPath || op.path;
    if (dest && !fs.existsSync(dest)) {
      console.log(`[MISSING DIR] ${dest}`);
      missing++;
    } else {
      ok++;
    }
  }
}

console.log(`\nDiagnosis complete. OK: ${ok}, Missing: ${missing}, Drifted: ${drifted}`);
if (missing > 0 || drifted > 0) {
  console.log(`Run 'node scripts/repair.js --target ${target}' to fix.`);
  process.exit(1);
} else {
  console.log('Everything is up to date.');
}
