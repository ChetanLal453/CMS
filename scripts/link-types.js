const fs = require('fs');
const path = require('path');

// Resolve repository root directory (parent of scripts/)
const repoRoot = path.resolve(__dirname, '..');
const targetTypes = path.join(repoRoot, 'curvemetricswebsite', 'node_modules', '@types');
const linkDir = path.join(repoRoot, 'node_modules');
const linkPath = path.join(linkDir, '@types');

function linkTypes() {
  if (!fs.existsSync(targetTypes)) {
    console.warn(`[link-types] Target types directory not found at: ${targetTypes}`);
    return;
  }

  // Ensure root node_modules exists
  if (!fs.existsSync(linkDir)) {
    fs.mkdirSync(linkDir, { recursive: true });
  }

  // Check if linkPath already exists
  try {
    const lstat = fs.lstatSync(linkPath);
    try {
      // Ensure target is accessible (not a dangling symlink)
      fs.statSync(linkPath);
      console.log(`[link-types] Valid @types junction already exists at: ${linkPath}`);
      return;
    } catch {
      console.warn(`[link-types] Stale @types link detected at ${linkPath}, removing...`);
      fs.unlinkSync(linkPath);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`[link-types] Error inspecting ${linkPath}:`, err.message);
      return;
    }
  }

  // Create junction (type 'junction' is Windows directory junction, requires no admin privileges)
  try {
    fs.symlinkSync(targetTypes, linkPath, 'junction');
    console.log(`[link-types] Successfully created junction: ${linkPath} -> ${targetTypes}`);
  } catch (err) {
    console.error(`[link-types] Failed to create junction:`, err.message);
  }
}

linkTypes();
