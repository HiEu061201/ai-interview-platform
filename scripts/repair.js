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

let repaired = 0;
let failed = 0;

console.log(`Repairing install state for target: ${target}\n`);

for (const op of state.operations || []) {
  if (op.kind === 'copy-file') {
    const dest = op.destinationPath;
    const src = op.sourcePath;
    
    let needsRepair = false;
    let reason = '';
    
    if (!fs.existsSync(dest)) {
      needsRepair = true;
      reason = 'missing';
    } else if (fs.existsSync(src)) {
      const srcContent = fs.readFileSync(src, 'utf8');
      const destContent = fs.readFileSync(dest, 'utf8');
      if (srcContent !== destContent) {
        needsRepair = true;
        reason = 'drifted';
      }
    }
    
    if (needsRepair) {
      if (fs.existsSync(src)) {
        try {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
          console.log(`[REPAIRED] (${reason}) ${dest}`);
          repaired++;
        } catch (e) {
          console.error(`[FAILED] Could not repair ${dest}: ${e.message}`);
          failed++;
        }
      } else {
        console.log(`[FAILED] Cannot repair ${dest}, source missing: ${src}`);
        failed++;
      }
    }
  } else if (op.kind === 'create-dir') {
    const dest = op.destinationPath || op.path;
    if (dest && !fs.existsSync(dest)) {
      try {
        fs.mkdirSync(dest, { recursive: true });
        console.log(`[REPAIRED] (missing dir) ${dest}`);
        repaired++;
      } catch (e) {
        console.error(`[FAILED] Could not create directory ${dest}: ${e.message}`);
        failed++;
      }
    }
  }
}

console.log(`\nRepair complete. Repaired: ${repaired}, Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
}
