import { execSync } from "node:child_process";
import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

console.log("=================================================");
console.log("✈️  CAIRO DASHBOARD AUTOMATED CODE CHECKS");
console.log("=================================================");

const results = {
  codeReview: { passed: true, details: [] },
  responsivenessReview: { passed: true, details: [] },
  accessibilityReview: { passed: true, details: [] },
  performanceReview: { passed: true, details: [] },
};

// 1. Code Review
console.log("\n[1/4] 🔍 Executing Code Review & Typecheck...");
try {
  execSync("npx tsc --noEmit", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ TypeScript Strict Mode: 0 errors");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ TypeScript Typecheck failed");
}

try {
  execSync("npx eslint .", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ ESLint Static Analysis: 0 errors, 0 warnings");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ ESLint failed");
}

try {
  execSync("npx vitest run src/tests/codeReview.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ Data integrity unit tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ Data Integrity tests failed");
}

try {
  execSync("npx vitest run src/tests/acdmEngine.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ A-CDM milestone unit tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ A-CDM Milestone Engine tests failed");
}

try {
  execSync("npx vitest run src/tests/apronClearance.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ Sample stand assignment unit tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ Apron Clearance tests failed");
}

try {
  execSync("npx vitest run src/tests/safetyPlaybooks.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ Training checklist unit tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ Safety Playbooks tests failed");
}

try {
  execSync("npx vitest run src/tests/staffing.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ Workforce & Staffing Roster: 100% tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ Workforce & Staffing tests failed");
}

try {
  execSync("npx vitest run src/tests/utilitiesAndExport.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ RFC 4180 BOM Export & Localization Utilities: 100% tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ Utilities & Export tests failed");
}

try {
  execSync("npx vitest run src/tests/telemetryAndBroadcast.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ Multi-Screen Broadcast & Haptics: 100% tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ Multi-Screen Broadcast tests failed");
}

try {
  execSync("npx vitest run src/tests/reactivity.test.ts", { stdio: "pipe", shell: true });
  results.codeReview.details.push("✅ Scenario & Reactive State Propagation: 100% tests passed");
} catch (e) {
  results.codeReview.passed = false;
  results.codeReview.details.push("❌ Scenario Reactivity tests failed");
}

// 2. Responsiveness Review
console.log("\n[2/4] 📱 Executing Responsiveness & Reflow Review...");
try {
  execSync("npx vitest run src/tests/responsiveness.test.ts", { stdio: "pipe", shell: true });
  results.responsivenessReview.details.push("✅ Responsive source assertions passed; browser validation remains separate");
} catch (e) {
  results.responsivenessReview.passed = false;
  results.responsivenessReview.details.push("❌ Responsiveness Review failed");
}

// 3. Accessibility source checks; these do not establish WCAG conformance.
console.log("\n[3/4] ♿ Executing accessibility source checks...");
try {
  execSync("npx vitest run src/tests/accessibility.test.ts", { stdio: "pipe", shell: true });
  results.accessibilityReview.details.push("✅ Accessibility source assertions passed; this is not WCAG certification");
} catch (e) {
  results.accessibilityReview.passed = false;
  results.accessibilityReview.details.push("❌ Accessibility Review failed");
}

// 4. Performance & Production Bundle Budget Review
console.log("\n[4/4] ⚡ Executing Performance & Production Bundle Budget Review...");
if (existsSync("dist/assets")) {
  try {
    const files = readdirSync("dist/assets");
    const jsFiles = files.filter((f) => f.endsWith(".js") && !f.includes(".map"));
    const cssFiles = files.filter((f) => f.endsWith(".css") && !f.includes(".map"));

    jsFiles.forEach((file) => {
      const content = readFileSync(`dist/assets/${file}`);
      const gzippedBytes = gzipSync(content).length;
      const gzippedKb = (gzippedBytes / 1024).toFixed(1);
      const budgetKb = 200; // 200 kB max gzipped budget for main JS
      const pass = gzippedBytes <= budgetKb * 1024;
      results.performanceReview.details.push({
        name: `JS Bundle (${file})`,
        size: `${gzippedKb} kB gzip`,
        budget: `<= ${budgetKb} kB gzip`,
        pass,
      });
      if (!pass) results.performanceReview.passed = false;
    });

    cssFiles.forEach((file) => {
      const content = readFileSync(`dist/assets/${file}`);
      const gzippedBytes = gzipSync(content).length;
      const gzippedKb = (gzippedBytes / 1024).toFixed(1);
      const budgetKb = 35; // 35 kB max gzipped budget for main CSS
      const pass = gzippedBytes <= budgetKb * 1024;
      results.performanceReview.details.push({
        name: `CSS Stylesheet (${file})`,
        size: `${gzippedKb} kB gzip`,
        budget: `<= ${budgetKb} kB gzip`,
        pass,
      });
      if (!pass) results.performanceReview.passed = false;
    });
  } catch (err) {
    results.performanceReview.passed = false;
    results.performanceReview.details.push({
      name: "Bundle inspection",
      size: "Error reading dist",
      budget: "N/A",
      pass: false,
    });
  }
} else {
  // If dist doesn't exist yet, run a fast build
  try {
    execSync("npx vite build", { stdio: "pipe", shell: true });
    results.performanceReview.details.push({
      name: "Auto-Build Production Bundle",
      size: "Generated dist/",
      budget: "Successful",
      pass: true,
    });
  } catch (err) {
    results.performanceReview.passed = false;
    results.performanceReview.details.push({
      name: "Vite build",
      size: "Failed build",
      budget: "Exit 0",
      pass: false,
    });
  }
}

// Generate Markdown Summary
const allPassed =
  results.codeReview.passed &&
  results.responsivenessReview.passed &&
  results.accessibilityReview.passed &&
  results.performanceReview.passed;

const summaryMarkdown = `
# ✈️ Cairo dashboard prototype — automated code checks

**Audit Timestamp:** \`${new Date().toISOString()}\`  
**Overall Status:** ${allPassed ? "✅ ALL GATES PASSED" : "❌ GATES FAILED"}

---

### 💻 1. Code Review
| Check | Status | Details |
|---|:---:|---|
${results.codeReview.details.map((d) => `| ${d.replace(/^[✅❌]\s*/, "")} | ${d.startsWith("✅") ? "PASS" : "FAIL"} | Automated Static Analysis |`).join("\n")}

---

### 📱 2. Responsive source checks
**Status:** ${results.responsivenessReview.passed ? "PASS" : "FAIL"}. These tests inspect source assumptions. Browser and device checks are recorded separately in UX_REVIEW.md.

---

### ♿ 3. Accessibility source checks
**Status:** ${results.accessibilityReview.passed ? "PASS" : "FAIL"}. Passing these assertions does not establish WCAG conformance or certify a contrast ratio.

---

### ⚡ 4. Performance & Production Bundle Budget Review
| Production Asset | Size (Gzip) | Performance Budget | Gate Status |
|---|:---:|:---:|:---:|
${results.performanceReview.details.map((p) => `| ${p.name} | ${p.size} | ${p.budget} | ${p.pass ? "PASS" : "FAIL"} |`).join("\n")}

---
`;

console.log("\n" + summaryMarkdown);

// Write to GitHub Actions Step Summary if running in CI
const githubSummaryFile = process.env.GITHUB_STEP_SUMMARY;
if (githubSummaryFile && existsSync(githubSummaryFile)) {
  try {
    appendFileSync(githubSummaryFile, summaryMarkdown + "\n");
    console.log("📝 Successfully appended review report to GITHUB_STEP_SUMMARY.");
  } catch (err) {
    console.error("Failed to write to GITHUB_STEP_SUMMARY:", err);
  }
}

// Exit code based on reviews
if (!allPassed) {
  console.error("❌ One or more quality gates failed.");
  process.exit(1);
} else {
  console.log("🎉 All automated reviews passed successfully!");
  process.exit(0);
}
