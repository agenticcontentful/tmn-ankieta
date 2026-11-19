// Adres skryptu Google Apps Script (Wdróż → Aplikacja internetowa). Wklej tutaj po wdrożeniu.
const ENDPOINT = '';

const QUESTIONS = [
  { id: 'q1', short: 'Posiłki dziennie', type: 'single',
    text: 'Ile mniej więcej posiłków jesz w ciągu dnia?',
    options: ['1–2', '3', '4', '5 lub więcej'] },
  { id: 'q2', short: 'Porcje owoców i warzyw', type: 'single',
    text: 'Ile porcji owoców i warzyw jesz w ciągu dnia?',
    hint: '1 porcja to mniej więcej garść, np. jabłko, marchewka albo miseczka sałaty.',
    options: ['0', '1–2', '3–4', '5 lub więcej'] },
  { id: 'q3', short: 'Pomijanie posiłków', type: 'single',
    text: 'Czy zdarza Ci się pomijać posiłki?',
    options: ['Nie', 'Tak'] },
  { id: 'q3b', short: 'Powody pomijania', type: 'multi', showIf: a => a.q3 === 'Tak',
    text: 'Dlaczego pomijasz posiłki?', hint: 'Możesz zaznaczyć kilka odpowiedzi.',
    options: ['Brak czasu', 'Brak apetytu', 'Chcę schudnąć', 'Zapominam', 'Nie mam nic pod ręką'],
    other: 'Inny powód' },
  { id: 'q4', short: 'Nawodnienie (1–5)', type: 'scale',
    text: 'Czy pijesz odpowiednią ilość wody? Jak oceniasz swoje nawodnienie?',
    low: 'Bardzo słabo', high: 'Bardzo dobrze' },
  { id: 'q5', short: 'Samodzielne gotowanie', type: 'single',
    text: 'Jak często przygotowujesz posiłki samodzielnie, zamiast kupować gotowe jedzenie lub zamawiać na mieście?',
    options: ['Nigdy', 'Rzadko', 'Czasami', 'Często', 'Zawsze'] },
  { id: 'q6', short: 'Wiedza o komponowaniu posiłków (1–5)', type: 'scale',
    text: 'Na ile czujesz, że masz wystarczającą wiedzę, aby samodzielnie komponować wartościowe posiłki?',
    low: 'Wcale', high: 'W pełni' },
  { id: 'q7', short: 'Planowanie posiłków (1–5)', type: 'scale',
    text: 'Jak dobrze radzisz sobie z planowaniem posiłków na cały dzień?',
    low: 'Bardzo słabo', high: 'Bardzo dobrze' },
  { id: 'q8', short: 'Gotowość do zmiany (1–5)', type: 'scale',
    text: 'Na ile chcesz wprowadzić jedną małą zmianę w swoim odżywianiu już teraz?',
    low: 'Wcale', high: 'Bardzo' },
  { id: 'q9', short: 'Chęć większej wiedzy', type: 'single',
    text: 'Czy chcesz mieć większą wiedzę na temat odżywiania?',
    options: ['Tak', 'Może', 'Nie'] },
  { id: 'q10', short: 'Najbardziej pomocne (2)', type: 'multi', exact: 2,
    text: 'Co byłoby dla Ciebie najbardziej pomocne?', hint: 'Wybierz 2 odpowiedzi.',
    options: ['Proste przepisy na szybkie posiłki', 'Pomysły na posiłki do pracy',
      'Gotowe przykłady jadłospisów na kilka dni', 'Jak odżywiać się podczas budowania masy mięśniowej',
      'Wskazówki dotyczące planowania zakupów i posiłków'] },
  { id: 'q11', short: 'Wsparcie dietetyczne w TMN', type: 'single',
    text: 'Czy interesuje Cię dodatkowe wsparcie dietetyczne w TMN?',
    options: ['Tak', 'Może', 'Nie'] },
];

const QUEUE_KEY = 'tmn-ankieta-kolejka';
const RESET_SECONDS = 8;

let answers = {};
let step = -1; // -1 = ekran startowy
let resetTimer = null;

const $ = s => document.querySelector(s);
const screen = $('#screen');

function visible() { return QUESTIONS.filter(q => !q.showIf || q.showIf(answers)); }

function render() {
  clearInterval(resetTimer);
  const qs = visible();
  const progress = $('#progress');
  if (step < 0) { progress.style.width = '0%'; $('#back').hidden = true; return renderIntro(); }
  if (step >= qs.length) { progress.style.width = '100%'; $('#back').hidden = true; return renderThanks(); }
  progress.style.width = ((step) / qs.length * 100) + '%';
  $('#back').hidden = false;
  renderQuestion(qs[step], step + 1, qs.length);
}

function renderIntro() {
  screen.innerHTML = `
    <div class="intro">
      <p class="eyebrow"><span class="rule"></span>Ankieta Train Me Now</p>
      <h1>Jak się <span class="bar">odżywiasz?</span></h1>
      <p class="lead">Kilka krótkich pytań o Twoje nawyki. Zajmie Ci to około 2 minut.<br>Ankieta jest anonimowa.</p>
      <button class="cta" id="start">Zaczynamy</button>
    </div>`;
  $('#start').onclick = () => { answers = {}; step = 0; render(); };
}

function renderQuestion(q, n, total) {
  const val = answers[q.id];
  let body = '';
  if (q.type === 'single') {
    body = `<div class="opts ${q.options.length > 4 ? 'opts-wide' : ''}">${q.options.map(o =>
      `<button class="opt ${val === o ? 'sel' : ''}" data-v="${o}">${o}</button>`).join('')}</div>`;
  } else if (q.type === 'scale') {
    body = `<div class="scale">${[1, 2, 3, 4, 5].map(v =>
      `<button class="opt num ${val === v ? 'sel' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="scale-labels"><span>1 = ${q.low}</span><span>5 = ${q.high}</span></div>`;
  } else {
    const sel = (val && val.items) || [];
    body = `<div class="opts opts-list">${q.options.map(o =>
      `<button class="opt check ${sel.includes(o) ? 'sel' : ''}" data-v="${o}"><span class="box"></span>${o}</button>`).join('')}
      ${q.other ? `<label class="other"><span>${q.other}:</span><input id="other" type="text" maxlength="120" placeholder="wpisz (opcjonalnie)" value="${(val && val.other) || ''}"></label>` : ''}</div>
      <button class="cta next" id="next" disabled>Dalej</button>`;
  }
  screen.innerHTML = `
    <div class="q">
      <p class="eyebrow"><span class="rule"></span>Pytanie ${n} z ${total}</p>
      <h2>${q.text}</h2>
      ${q.hint ? `<p class="hint">${q.hint}</p>` : ''}
      ${body}
    </div>`;

  if (q.type === 'multi') {
    const next = $('#next');
    const state = { items: [...((val && val.items) || [])], other: (val && val.other) || '' };
    const ok = () => q.exact ? state.items.length === q.exact : (state.items.length > 0 || state.other.trim());
    const sync = () => { next.disabled = !ok(); answers[q.id] = { ...state }; };
    screen.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const v = b.dataset.v, i = state.items.indexOf(v);
      if (i >= 0) state.items.splice(i, 1);
      else {
        if (q.exact && state.items.length >= q.exact) return flash(b);
        state.items.push(v);
      }
      b.classList.toggle('sel'); sync();
    });
    const other = $('#other');
    if (other) other.oninput = () => { state.other = other.value; sync(); };
    sync();
    next.onclick = () => { if (ok()) { step++; render(); } };
  } else {
    screen.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      screen.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel');
      answers[q.id] = q.type === 'scale' ? Number(b.dataset.v) : b.dataset.v;
      if (q.id === 'q3' && answers.q3 === 'Nie') delete answers.q3b;
      setTimeout(() => { step++; render(); }, 260);
    });
  }
}

function flash(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

function renderThanks() {
  submit(answers);
  let left = RESET_SECONDS;
  screen.innerHTML = `
    <div class="intro thanks">
      <p class="eyebrow"><span class="rule"></span>Gotowe</p>
      <h1>Dziękujemy <span class="bar">za odpowiedzi!</span></h1>
      <p class="lead">Ankieta zapisana. Możesz oddać tablet.</p>
      <button class="cta" id="again">Następna osoba (<span id="count">${left}</span>)</button>
    </div>`;
  $('#again').onclick = reset;
  resetTimer = setInterval(() => { left--; const c = $('#count'); if (c) c.textContent = left; if (left <= 0) reset(); }, 1000);
}

function reset() { clearInterval(resetTimer); answers = {}; step = -1; render(); }

function toRow(a) {
  const fmt = v => v == null ? '' : typeof v === 'object' ? [...v.items, v.other ? 'Inne: ' + v.other.trim() : ''].filter(Boolean).join('; ') : v;
  const row = { 'Data': new Date().toLocaleString('pl-PL') };
  QUESTIONS.forEach((q, i) => { row[q.short] = fmt(a[q.id]); });
  return row;
}

function loadQueue() { try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch { return []; } }
function saveQueue(q) { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {} }

function submit(a) {
  if (!ENDPOINT) { console.log('Tryb testowy, nie wysłano:', toRow(a)); return updateStatus(); }
  const q = loadQueue(); q.push(toRow(a)); saveQueue(q); flush();
}

async function flush() {
  if (!ENDPOINT) { updateStatus(); return; }
  let q = loadQueue();
  while (q.length && navigator.onLine) {
    try {
      await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(q[0]) });
      q.shift(); saveQueue(q);
    } catch { break; }
  }
  updateStatus();
}

function updateStatus() {
  const n = loadQueue().length, el = $('#status');
  el.textContent = !ENDPOINT ? 'Tryb testowy – odpowiedzi nie są wysyłane' : n ? `Czeka na wysłanie: ${n}` : '';
  el.hidden = !el.textContent;
}

$('#back').onclick = () => { if (step > 0) { step--; render(); } else reset(); };
window.addEventListener('online', flush);
setInterval(flush, 60000);
render(); flush();
