/**
 * portal-parsers.cjs
 * Per-portal parsery HTML → ustrukturyzowane dane ofert
 * Używane przez pipeline po Playwright browser_snapshot
 */

// ─── Profil Mateusza ──────────────────────────────────────────────────────────

const SKILLS_HIGH = ['react', 'react.js', 'typescript', 'javascript', 'kotlin', 'rest api', 'prompt engineering', 'genai', 'gen ai', 'gpt-4', 'claude', 'llm'];
const SKILLS_MED  = ['spring boot', 'spring', 'sql', 'node.js', 'node', 'rabbitmq', 'docker', 'java', 'ci/cd'];
const SALARY_MIN  = parseInt(process.env.USER_SALARY_MIN || '21000');

// ─── Parser JustJoin.it ───────────────────────────────────────────────────────
// Selektory zweryfikowane 2026-06-18 na live DOM
// Użycie: const jobs = await parseJustJoinFromPage(page)  ← wymaga Playwright page
// Fallback: parseJustJoin(html) ← tylko URL-e z HTML

// Funkcja do uruchomienia wewnątrz page.evaluate() — wyciąga wszystkie karty z DOM
function extractJustJoinCardsScript() {
  const cards = document.querySelectorAll('[data-index]');
  const jobs = [];

  cards.forEach(card => {
    // URL + tytuł — stabilna klasa semantyczna
    const titleLink = card.querySelector('a.offer_list_offer_title_link, a[href*="/job-offer/"]');
    const url    = titleLink?.href || null;
    const role   = titleLink?.title?.replace(/^View offer\s*/i, '').trim()
                || titleLink?.textContent?.trim() || null;

    // Company — pierwsza <p> w karcie
    const paragraphs = [...card.querySelectorAll('p')];
    const company = paragraphs[0]?.textContent?.trim() || null;

    // Lokalizacja — druga <p>
    const location = paragraphs[1]?.textContent?.trim() || null;

    // Work mode — szukaj tekstu Remote/Hybrid w paragrafach
    const allText = [...card.querySelectorAll('p, span')].map(e => e.textContent.trim());
    let workMode = 'onsite';
    if (allText.some(t => /^remote$/i.test(t))) workMode = 'remote';
    else if (allText.some(t => /^hybrid$/i.test(t))) workMode = 'hybrid';

    // Salary — span z cyframi i myślnikiem, np. "13 000 - 16 000"
    const salarySpan = [...card.querySelectorAll('span')].find(s => /\d[\d\s]+[-–]\s*\d/.test(s.textContent));
    const salaryText = salarySpan?.textContent?.trim() || null;
    const salaryClean = (salaryText || '').replace(/\s/g, '');
    const salaryMatch = salaryClean.match(/(\d+)[–\-](\d+)/);
    const salaryMin = salaryMatch ? parseInt(salaryMatch[1]) : 0;
    const salaryMax = salaryMatch ? parseInt(salaryMatch[2]) : 0;

    // Typ kontraktu — B2B / UoP
    const contractSpan = [...card.querySelectorAll('span')].find(s => /^(B2B|UoP|kontrakt)$/i.test(s.textContent.trim()));
    const salaryType = contractSpan?.textContent?.trim() || 'unknown';

    // Skills — div.MuiBox-root z krótkim tekstem (1-3 słowa, nie lokalizacja)
    const skipWords = new Set(['new', 'remote', 'hybrid', 'onsite', 'b2b', 'uop', 'mid', 'senior', 'junior', 'lead']);
    const skills = [...card.querySelectorAll('div')]
      .map(d => d.children.length === 0 ? d.textContent.trim() : null)
      .filter(t => t && t.length > 1 && t.length < 25 && !skipWords.has(t.toLowerCase()) && !/^\d/.test(t))
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 10);

    // Seniority z tekstu karty
    const senioritySpan = allText.find(t => /^(junior|mid|senior|lead|principal)$/i.test(t));
    const seniority = senioritySpan?.toLowerCase() || 'unknown';

    if (url) {
      jobs.push({ url, role, company, location, workMode, salaryMin, salaryMax, salaryType, skills, seniority, englishRequired: 'unknown', description: '', source: 'justjoin' });
    }
  });

  return jobs;
}

// Async — używa Playwright page object
async function parseJustJoinFromPage(page) {
  await page.waitForSelector('[data-index]', { timeout: 15000 });
  await page.waitForTimeout(1500);
  const scriptStr = extractJustJoinCardsScript.toString();
  return await page.evaluate(new Function(`return (${scriptStr})()`));
}

// Fallback — tylko URL-e z surowego HTML (bez JS render)
function parseJustJoin(html) {
  const urls = [...html.matchAll(/href="(https:\/\/justjoin\.it\/job-offer\/[^"]+)"/g)]
    .map(m => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);
  return urls.map(url => ({
    url,
    company: extractCompanyFromUrl(url),
    role: extractRoleFromUrl(url),
    salaryMin: 0, salaryMax: 0, salaryType: 'unknown',
    workMode: 'unknown', englishRequired: 'unknown',
    skills: [], description: '', source: 'justjoin'
  }));
}

// ─── Parser TheProtocol.it ────────────────────────────────────────────────────
// Struktura: JSON w <script type="application/ld+json"> lub API response

function parseTheProtocol(html) {
  const jobs = [];

  // TheProtocol embeduje JSON-LD
  const ldJsonRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;

  while ((match = ldJsonRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'JobPosting') {
        jobs.push(normalizeJsonLdJob(data, 'theprotocol'));
      } else if (Array.isArray(data)) {
        data.filter(d => d['@type'] === 'JobPosting').forEach(d => {
          jobs.push(normalizeJsonLdJob(d, 'theprotocol'));
        });
      }
    } catch (e) { /* skip malformed */ }
  }

  // Fallback: wyciągnij URL-e ofert
  if (jobs.length === 0) {
    const urlRegex = /href="(https:\/\/theprotocol\.it\/szczegoly\/praca\/[^"]+)"/g;
    const urls = [...html.matchAll(urlRegex)].map(m => m[1]);
    const unique = [...new Set(urls)];
    unique.forEach(url => {
      jobs.push({
        url,
        company: '',
        role: extractRoleFromUrl(url),
        salaryMin: 0,
        salaryMax: 0,
        salaryType: 'unknown',
        workMode: 'unknown',
        englishRequired: 'unknown',
        skills: [],
        description: '',
        source: 'theprotocol'
      });
    });
  }

  return jobs;
}

function normalizeJsonLdJob(data, source) {
  const salaryRange = data.baseSalary?.value;
  const salaryMin = salaryRange?.minValue || 0;
  const salaryMax = salaryRange?.maxValue || 0;

  const descText = (data.description || '').toLowerCase();
  let englishRequired = 'none';
  if (/\bc2\b|native/.test(descText))        englishRequired = 'c2';
  else if (/\bc1\b|fluent/.test(descText))   englishRequired = 'c1';
  else if (/\bb2\b/.test(descText))          englishRequired = 'b2';
  else if (/\bb1\b/.test(descText))          englishRequired = 'b1';
  else if (/english.*optional/.test(descText)) englishRequired = 'optional';

  const location = data.jobLocation?.address?.addressLocality || '';
  const workMode = data.jobLocationType === 'TELECOMMUTE' ? 'remote'
    : location.toLowerCase().includes('hybrid') ? 'hybrid'
    : 'onsite';

  return {
    url: data.url || data['@id'] || '',
    company: data.hiringOrganization?.name || '',
    role: data.title || '',
    salaryMin,
    salaryMax,
    salaryType: salaryRange?.currency === 'PLN' ? 'B2B' : 'unknown',
    workMode,
    englishRequired,
    skills: extractSkillsFromText(data.description || ''),
    description: (data.description || '').replace(/<[^>]*>/g, '').slice(0, 300),
    source
  };
}

// ─── Parser NoFluffJobs ───────────────────────────────────────────────────────

function parseNoFluffJobs(html) {
  const jobs = [];

  // NoFluffJobs API response lub listing page
  const apiDataMatch = html.match(/window\.__NFJ_INITIAL_DATA__\s*=\s*({[\s\S]*?});/);
  if (apiDataMatch) {
    try {
      const data = JSON.parse(apiDataMatch[1]);
      const postings = data.postings || data.items || [];
      postings.forEach(p => {
        jobs.push({
          url: `https://nofluffjobs.com/pl/job/${p.url || p.id}`,
          company: p.name || p.company?.name || '',
          role: p.title || '',
          salaryMin: p.salary?.from || 0,
          salaryMax: p.salary?.to || 0,
          salaryType: p.salary?.type || 'B2B',
          workMode: p.remote ? 'remote' : 'onsite',
          englishRequired: detectEnglishFromText(p.requirements?.join(' ') || ''),
          skills: (p.technology || []).concat(p.requirements || []).slice(0, 10),
          description: (p.description || '').slice(0, 300),
          source: 'nofluffjobs'
        });
      });
    } catch (e) { /* fallback */ }
  }

  return jobs;
}

// ─── Parser mock-portal.html (do testów) ─────────────────────────────────────

function parseMockPortal(html) {
  const jobs = [];
  const articleRegex = /<article[^>]+class="job-offer"([^>]*)>/g;
  let match;

  while ((match = articleRegex.exec(html)) !== null) {
    const attrs = match[1];
    const get = name => {
      const m = attrs.match(new RegExp(`data-${name}="([^"]*)"`));
      return m ? m[1] : '';
    };
    jobs.push({
      url:             get('url'),
      company:         get('company'),
      role:            get('role'),
      salaryMin:       parseInt(get('salary-min')) || 0,
      salaryMax:       parseInt(get('salary-max')) || 0,
      salaryType:      get('salary-type'),
      workMode:        get('work-mode'),
      englishRequired: get('english'),
      skills:          get('skills').split(',').map(s => s.trim()).filter(Boolean),
      description:     get('description'),
      source:          'mock'
    });
  }
  return jobs;
}

// ─── Helpery ──────────────────────────────────────────────────────────────────

function extractCompanyFromUrl(url) {
  // justjoin.it/job-offer/company-name-role-city → "company name"
  const slug = url.split('/job-offer/')[1] || '';
  return slug.split('-').slice(0, 2).join(' ');
}

function extractRoleFromUrl(url) {
  const slug = (url.split('/job-offer/')[1] || url.split('/praca/')[1] || '').replace(/,oferta,.*/, '');
  return slug.split('-').filter(w => !/^(warszawa|remote|js|ts)$/.test(w)).slice(1, 5).join(' ');
}

function extractSkillsFromText(text) {
  const known = [...SKILLS_HIGH, ...SKILLS_MED];
  const found = [];
  const textL = text.toLowerCase();
  known.forEach(skill => {
    if (textL.includes(skill)) found.push(skill);
  });
  return found;
}

function detectEnglishFromText(text) {
  const t = text.toLowerCase();
  if (/\bc2\b|native/.test(t))        return 'c2';
  if (/\bc1\b|fluent|zaawan/.test(t)) return 'c1';
  if (/\bb2\b/.test(t))               return 'b2';
  if (/\bb1\b/.test(t))               return 'b1';
  if (/optional|mile/.test(t))        return 'optional';
  return 'none';
}

// ─── Routing — wybierz parser po URL ──────────────────────────────────────────

function parsePortal(url, html) {
  if (url.includes('justjoin.it'))    return parseJustJoin(html);
  if (url.includes('theprotocol.it')) return parseTheProtocol(html);
  if (url.includes('nofluffjobs.com'))return parseNoFluffJobs(html);
  if (url.includes('mockportal.pl') || url.includes('mock-portal')) return parseMockPortal(html);
  // Fallback: próbuj JSON-LD
  return parseTheProtocol(html); // JSON-LD parser jest najbardziej generyczny
}

module.exports = {
  parsePortal,
  parseJustJoin,
  parseJustJoinFromPage,
  extractJustJoinCardsScript,
  parseTheProtocol,
  parseNoFluffJobs,
  parseMockPortal,
  extractSkillsFromText,
  detectEnglishFromText,
  SKILLS_HIGH,
  SKILLS_MED
};

// ─── Szybki test jeśli uruchomiony bezpośrednio ───────────────────────────────

if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const html = fs.readFileSync(path.join(__dirname, 'mock-portal.html'), 'utf8');
  const jobs = parseMockPortal(html);
  console.log(`\nParser test — mock-portal.html:`);
  console.log(`  Znaleziono: ${jobs.length} ofert\n`);
  jobs.forEach((j, i) => {
    console.log(`  ${i+1}. ${j.company} — ${j.role}`);
    console.log(`     salary: ${j.salaryMin}-${j.salaryMax} ${j.salaryType} | ${j.workMode} | eng: ${j.englishRequired}`);
    console.log(`     skills: ${j.skills.join(', ')}`);
  });
}
