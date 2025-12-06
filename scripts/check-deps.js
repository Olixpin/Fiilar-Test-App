#!/usr/bin/env node
/**
 * Dependency Version Checker for Monorepo
 *
 * This script checks for version mismatches of shared dependencies
 * across all packages in the monorepo to prevent runtime errors
 * caused by incompatible package versions.
 *
 * Usage: node scripts/check-deps.js
 */

const fs = require("fs");
const path = require("path");

// Shared dependencies that MUST have compatible versions across all packages
const CRITICAL_DEPS = [
  "react",
  "react-dom",
  "react-router-dom",
  "recharts",
  "lucide-react",
  "framer-motion",
  "zod",
];

// Color codes for terminal output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function findPackageJsonFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.name === "node_modules" || item.name === ".git") continue;

    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findPackageJsonFiles(fullPath));
    } else if (item.name === "package.json") {
      files.push(fullPath);
    }
  }

  return files;
}

function parseVersion(version) {
  if (!version) return null;
  // Remove ^ ~ >= <= > < = and extract version ranges
  return version
    .replace(/[\^~>=<]/g, "")
    .split("||")
    .map((v) => v.trim());
}

function versionsCompatible(v1, v2) {
  if (!v1 || !v2) return true;

  const versions1 = parseVersion(v1);
  const versions2 = parseVersion(v2);

  // Check if any version in v1 overlaps with any version in v2
  for (const ver1 of versions1) {
    for (const ver2 of versions2) {
      const major1 = ver1.split(".")[0];
      const major2 = ver2.split(".")[0];
      // Allow if major versions overlap or one accepts multiple majors
      if (major1 === major2) return true;
    }
  }

  // Check for flexible ranges like "^18.2.0 || ^19.0.0"
  if (v1.includes("||") || v2.includes("||")) {
    return true; // Flexible ranges are considered compatible
  }

  return false;
}

function main() {
  const rootDir = path.resolve(__dirname, "..");
  const packageFiles = findPackageJsonFiles(rootDir).filter(
    (f) =>
      !f.includes("node_modules") &&
      (f.includes("/apps/") ||
        f.includes("/libs/") ||
        f === path.join(rootDir, "package.json"))
  );

  console.log(
    `${colors.blue}🔍 Checking ${packageFiles.length} package.json files...${colors.reset}\n`
  );

  // Collect all versions of critical deps
  const depVersions = {};

  for (const file of packageFiles) {
    const pkg = JSON.parse(fs.readFileSync(file, "utf-8"));
    const pkgName = pkg.name || path.relative(rootDir, file);

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.peerDependencies,
      ...pkg.devDependencies,
    };

    for (const dep of CRITICAL_DEPS) {
      if (allDeps[dep]) {
        if (!depVersions[dep]) depVersions[dep] = [];
        depVersions[dep].push({
          package: pkgName,
          version: allDeps[dep],
          type: pkg.dependencies?.[dep]
            ? "dep"
            : pkg.peerDependencies?.[dep]
            ? "peer"
            : "dev",
        });
      }
    }
  }

  // Check for mismatches
  let hasErrors = false;
  let hasWarnings = false;

  for (const [dep, usages] of Object.entries(depVersions)) {
    if (usages.length <= 1) continue;

    const versions = [...new Set(usages.map((u) => u.version))];

    if (versions.length > 1) {
      // Check if versions are compatible
      let allCompatible = true;
      for (let i = 0; i < versions.length; i++) {
        for (let j = i + 1; j < versions.length; j++) {
          if (!versionsCompatible(versions[i], versions[j])) {
            allCompatible = false;
            break;
          }
        }
      }

      if (!allCompatible) {
        hasErrors = true;
        console.log(
          `${colors.red}❌ ${dep} - INCOMPATIBLE VERSIONS:${colors.reset}`
        );
      } else {
        hasWarnings = true;
        console.log(
          `${colors.yellow}⚠️  ${dep} - different versions (but compatible):${colors.reset}`
        );
      }

      for (const usage of usages) {
        console.log(`   ${usage.package}: ${usage.version} (${usage.type})`);
      }
      console.log("");
    }
  }

  // Summary
  console.log("─".repeat(50));
  if (hasErrors) {
    console.log(
      `${colors.red}❌ Found incompatible dependency versions!${colors.reset}`
    );
    console.log(
      "Please align versions across all packages to prevent runtime errors."
    );
    process.exit(1);
  } else if (hasWarnings) {
    console.log(
      `${colors.yellow}⚠️  Found version differences (but compatible)${colors.reset}`
    );
    console.log("Consider aligning versions for consistency.");
    process.exit(0);
  } else {
    console.log(
      `${colors.green}✅ All critical dependencies have compatible versions!${colors.reset}`
    );
    process.exit(0);
  }
}

main();
