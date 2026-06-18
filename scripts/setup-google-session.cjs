/**
 * setup-google-session.cjs
 * Otwiera przeglądarkę → logujesz się → ZAMKNIJ PRZEGLĄDARKĘ → zapisuje sesję
 */

require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '../.google-session.json');

(async () => {
  console.log('\n═══════════════════════════════════════');
  console.log('  SETUP GOOGLE SESSION');
  console.log('═══════════════════════════════════════\n');
  console.log('1. Za chwilę otworzy się przeglądarka');
  console.log('2. Zaloguj się przez Google na JustJoin.it');
  console.log('3. ZAMKNIJ przeglądarkę — sesja zapisze się automatycznie\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  await page.goto('https://justjoin.it', { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('✅ Przeglądarka otwarta. Zaloguj się, potem ZAMKNIJ okno.\n');

  // Czekaj aż użytkownik zamknie przeglądarkę
  await new Promise(resolve => browser.on('disconnected', resolve));

  console.log('Przeglądarka zamknięta. Zapisuję sesję...');

  // Spróbuj zapisać — context może być już zamknięty
  try {
    const storageState = await context.storageState();
    fs.writeFileSync(SESSION_FILE, JSON.stringify(storageState, null, 2));
    const domains = [...new Set(storageState.cookies.map(c => c.domain))];
    console.log(`\n✅ Sesja zapisana: ${SESSION_FILE}`);
    console.log(`   Cookies: ${storageState.cookies.length} | Domains: ${domains.join(', ')}\n`);
    if (storageState.cookies.length === 0) {
      console.log('⚠️  Brak cookies — nie byłeś zalogowany gdy zamknąłeś przeglądarkę.');
      process.exit(1);
    }
    console.log('Gotowe! Pipeline użyje tej sesji.\n');
  } catch (e) {
    console.log('⚠️  Nie udało się zapisać sesji:', e.message);
    console.log('   Upewnij się że byłeś zalogowany przed zamknięciem.\n');
    process.exit(1);
  }

  process.exit(0);
})();
