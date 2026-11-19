// Ankieta TMN: zapis odpowiedzi do tego arkusza.
// Wklej ten kod w Arkusz → Rozszerzenia → Apps Script, potem Wdróż → Nowe wdrożenie → Aplikacja internetowa
// (Wykonuj jako: Ja, Kto ma dostęp: Każdy).

const SHEET_NAME = 'Odpowiedzi';
const HEADERS = [
  'Data',
  'Posiłki dziennie',
  'Porcje owoców i warzyw',
  'Pomijanie posiłków',
  'Powody pomijania',
  'Nawodnienie (1–5)',
  'Samodzielne gotowanie',
  'Wiedza o komponowaniu posiłków (1–5)',
  'Planowanie posiłków (1–5)',
  'Gotowość do zmiany (1–5)',
  'Chęć większej wiedzy',
  'Najbardziej pomocne (2)',
  'Wsparcie dietetyczne w TMN',
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#F4D718');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    getSheet_().appendRow(HEADERS.map(h => data[h] === undefined ? '' : data[h]));
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Ankieta TMN działa.');
}

// Uruchom raz ręcznie (przycisk ▶ w edytorze), żeby utworzyć zakładkę z nagłówkami i nadać uprawnienia.
function setup() { getSheet_(); }
