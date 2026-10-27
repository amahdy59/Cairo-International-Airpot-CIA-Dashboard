const BASE_URL = process.env.DEPLOYMENT_URL || 'https://amahdy59.github.io/Cairo-International-Airpot-CIA-Dashboard/';
const EXPECTED_COMMIT = process.env.GITHUB_SHA;
const MAX_ATTEMPTS = Number.parseInt(process.env.MAX_ATTEMPTS || '12', 10);
const RETRY_DELAY_MS = Number.parseInt(process.env.RETRY_DELAY_MS || '5000', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timeout);
  }
}

async function verify() {
  if (!EXPECTED_COMMIT) throw new Error('GITHUB_SHA is required to verify the published revision.');
  const releaseUrl = new URL('release.json', BASE_URL);
  let html = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const [page, release] = await Promise.all([
        fetchWithTimeout(BASE_URL),
        fetchWithTimeout(releaseUrl),
      ]);
      if (page.ok && release.ok) {
        const manifest = await release.json();
        const candidate = await page.text();
        if (manifest.commit === EXPECTED_COMMIT && candidate.includes('id="root"')) {
          html = candidate;
          break;
        }
        console.log(`Attempt ${attempt}: published revision ${manifest.commit || 'missing'}; waiting for ${EXPECTED_COMMIT}.`);
      } else {
        console.log(`Attempt ${attempt}: page HTTP ${page.status}; release HTTP ${release.status}.`);
      }
    } catch (error) {
      console.log(`Attempt ${attempt}: ${error.message}`);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
  }

  if (!html) throw new Error(`Revision ${EXPECTED_COMMIT} did not appear at ${BASE_URL}.`);

  const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((url) => !/^(?:https?:|#|data:)/.test(url));

  for (const asset of new Set(assetUrls)) {
    const url = new URL(asset, BASE_URL);
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Published asset failed: ${url.href} (HTTP ${response.status}).`);
    console.log(`HTTP ${response.status}: ${url.href}`);
  }

  console.log(`Published revision ${EXPECTED_COMMIT} is accessible with ${new Set(assetUrls).size} linked assets.`);
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
