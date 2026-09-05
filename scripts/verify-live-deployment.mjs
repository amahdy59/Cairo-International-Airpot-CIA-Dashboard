const BASE_URL = process.env.DEPLOYMENT_URL || 'https://amahdy59.github.io/Cairo-International-Airpot-CIA-Dashboard/';
const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS || '8', 10);
const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || '4000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function verify() {
  console.log('=====================================================');
  console.log('✈️  CAIRO AOCC LIVE PRODUCTION DEPLOYMENT AUTO-CHECKER');
  console.log('=====================================================');
  console.log(`Target URL: ${BASE_URL}\n`);

  // Optional: check GitHub Actions status if accessible
  try {
    const runRes = await fetch('https://api.github.com/repos/amahdy59/Cairo-International-Airpot-CIA-Dashboard/actions/runs?per_page=1', {
      headers: { 'User-Agent': 'CI-Deployment-Autochecker' }
    });
    if (runRes.ok) {
      const runData = await runRes.json();
      const run = runData.workflow_runs?.[0];
      if (run) {
        console.log('=== 1. GITHUB ACTIONS LATEST RUN ===');
        console.log('Run ID:', run.id);
        console.log('Commit SHA:', run.head_sha.substring(0, 7));
        console.log('Status:', run.status, '| Conclusion:', run.conclusion);
        console.log('Updated At:', run.updated_at, '\n');
      }
    }
  } catch {
    // GitHub API optional; continue to direct live HTTP audit
  }

  console.log('=== 2. LIVE DEPLOYMENT ASSET AUDIT ===');
  let html = '';
  let indexRes = null;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    process.stdout.write(`[Attempt ${attempt}/${MAX_ATTEMPTS}] Polling ${BASE_URL}... `);
    try {
      indexRes = await fetchWithTimeout(BASE_URL);
      if (indexRes.status === 200) {
        html = await indexRes.text();
        if (html.includes('id="root"')) {
          console.log('✅ HTTP 200 OK (Root container verified)');
          break;
        } else {
          console.log('⚠️ HTTP 200 received but root container missing. Retrying...');
        }
      } else {
        console.log(`⚠️ HTTP ${indexRes.status}. Retrying...`);
      }
    } catch (e) {
      console.log(`⚠️ Network error: ${e.message}. Retrying...`);
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  if (!html || !html.includes('id="root"')) {
    console.error(`\n❌ FAILED: Live deployment at ${BASE_URL} failed health check after ${MAX_ATTEMPTS} attempts.`);
    process.exit(1);
  }

  console.log('\n--- 🔍 AUDITING LINKED PRODUCTION ASSETS ---');
  const regex = /(?:src|href)=["']([^"']+)["']/g;
  const assets = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('data:')) {
      assets.add(url);
    }
  }

  console.log(`Discovered ${assets.size} linked production assets:`);
  let errors = 0;

  for (const asset of assets) {
    const fullUrl = new URL(asset, BASE_URL).href;
    try {
      const aRes = await fetchWithTimeout(fullUrl);
      const cType = aRes.headers.get('content-type');
      const cLen = aRes.headers.get('content-length');
      if (aRes.status === 200) {
        console.log(`  ✅ [200 OK] ${asset} (${cType}, ${cLen || 'chunked'} bytes)`);
        if (asset.endsWith('.js')) {
          const code = await aRes.text();
          const hasPulse = code.includes('AOCC NOMINAL') || code.includes('ExecutivePulseBar') || code.includes('DRILL ACTIVE');
          const hasSettings = code.includes('Executive Controls') || code.includes('Tactile Earcons') || code.includes('Cairo Tower ATC');
          const hasStaffing = code.includes('RAMP-ALPHA-1') || code.includes('useStaffingRoster');
          console.log(`     -> ExecutivePulseBar: ${hasPulse ? '✅ Verified' : '❌ Missing'}`);
          console.log(`     -> Consolidated Settings: ${hasSettings ? '✅ Verified' : '❌ Missing'}`);
          console.log(`     -> Staffing & Roster: ${hasStaffing ? '✅ Verified' : '❌ Missing'}`);
        }
      } else {
        console.error(`  ❌ [${aRes.status}] ${asset} at ${fullUrl}`);
        errors++;
      }
    } catch (e) {
      console.error(`  ❌ [Network Error] ${asset}:`, e.message);
      errors++;
    }
  }

  console.log('\n=====================================================');
  if (errors === 0) {
    console.log('🎉 LIVE DEPLOYMENT VERIFIED: 100% HEALTHY WITH ZERO ISSUES!');
    console.log('=====================================================');
    process.exit(0);
  } else {
    console.error(`❌ DEPLOYMENT ISSUES DETECTED: ${errors} asset(s) failed.`);
    console.log('=====================================================');
    process.exit(1);
  }
}

verify().catch(e => {
  console.error('Fatal audit error:', e);
  process.exit(1);
});
