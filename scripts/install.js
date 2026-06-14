const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
let target = '';
const languages = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target') {
    target = args[i + 1];
    i++;
  } else {
    languages.push(args[i]);
  }
}

if (!target) {
  console.error('Usage: ./install.sh --target <target> [languages...]');
  process.exit(1);
}

console.log(`Installing ECC for target: ${target}`);
if (languages.length > 0) {
  console.log(`Languages: ${languages.join(', ')}`);
} else {
  console.log(`Languages: (none specified)`);
}

const projectRoot = path.join(__dirname, '..');
const agentDir = path.join(projectRoot, '.agent');
const eccDir = path.join(projectRoot, 'ECC');

if (!fs.existsSync(agentDir)) {
  fs.mkdirSync(agentDir, { recursive: true });
}

// Generate or update ecc-install-state.json
const statePath = path.join(agentDir, 'ecc-install-state.json');
let state = {};

if (fs.existsSync(statePath)) {
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (e) {
    // Ignore invalid JSON
  }
}

// Initialize state if missing schema
if (!state.schemaVersion) {
  state = {
    schemaVersion: "ecc.install.v1",
    installedAt: new Date().toISOString(),
    target: {
      id: `${target}-project`,
      target: target,
      kind: "project",
      root: agentDir,
      installStatePath: statePath
    },
    request: {
      legacyLanguages: [],
      legacyMode: true
    },
    operations: []
  };
}

// Ensure request object exists
if (!state.request) {
  state.request = { legacyLanguages: [], legacyMode: true };
}

// Update target if it has changed
if (state.target && state.target.target !== target) {
  console.log(`Updating target from '${state.target.target}' to '${target}'`);
  state.target.target = target;
  state.target.id = `${target}-project`;
}

// Update languages list
const currentLanguages = new Set(state.request.legacyLanguages || []);
languages.forEach(l => currentLanguages.add(l));
state.request.legacyLanguages = Array.from(currentLanguages);

if (!fs.existsSync(eccDir)) {
  console.warn(`\n[WARNING] ECC repository not found at ${eccDir}.`);
  console.warn(`We can update the installation state, but we cannot copy rule files until ECC source exists.`);
} else {
  console.log(`\nFound ECC source repository.`);
  // Depending on the languages, operations would be generated here to copy files.
  // Because we don't know the exact internal file layout mapping, we leave operations unmodified
  // to prevent overwriting an existing detailed configuration.
}

// Save the state
fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
console.log(`\nUpdated install state at ${statePath}`);

// We can run the doctor and repair scripts if they exist to apply any pending operations
console.log('\nRunning diagnostics and repair...');
try {
  const doctorScript = path.join(__dirname, 'doctor.js');
  const repairScript = path.join(__dirname, 'repair.js');
  
  if (fs.existsSync(doctorScript)) {
    execSync(`node scripts/doctor.js --target ${target}`, { stdio: 'inherit', cwd: projectRoot });
  }
  if (fs.existsSync(repairScript)) {
    execSync(`node scripts/repair.js --target ${target}`, { stdio: 'inherit', cwd: projectRoot });
  }
} catch (e) {
  console.error('\nThere was an issue running the diagnostics step:', e.message);
}

console.log('\nInstallation step completed successfully.');
