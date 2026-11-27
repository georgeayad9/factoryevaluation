// Class visit forms (the school's classroom observation form and the workshop follow-up form with its safety check).
// Shared by the admin page (seniors fill them in) and the teacher page (teachers read their report).
// The form definitions come from the server (Hub.gs, HUB_FORMS), so the two pages always match.
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const word = (text, kind) => {
    const k = kind === 'mechanical' ? 'mechanical' : 'electrical';
    return String(text).replace(/\{k\}/g, k).replace(/\{K\}/g, k.charAt(0).toUpperCase() + k.slice(1));
  };
  const LETTER = { 4: 'E', 3: 'G', 2: 'S', 1: 'NI' };
  const SAFE = { yes: 'Yes', no: 'No', na: 'N/A' };

  // same calculation as the server (Hub.gs hubVisitScore)
  function score(forms, form, a) {
    const items = (a && a.items) || {};
    if (form === 'class') {
      let sum = 0, w = 0;
      const per = forms.class.domains.map(d => {
        const vals = d.items.map((_, i) => Number(items[d.id + '.' + (i + 1)])).filter(v => v >= 1 && v <= 4);
        const avg = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
        if (avg !== null) { sum += d.weight * avg; w += d.weight; }
        return { name: d.name, weight: d.weight, avg };
      });
      return { pct: w ? Math.round(sum / w / 4 * 1000) / 10 : null, avg: w ? Math.round(sum / w * 100) / 100 : null, per };
    }
    const vals = forms.workshop.items.map((_, i) => Number(items[String(i + 1)])).filter(v => v >= 1 && v <= 4);
    const avg = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
    return { pct: avg === null ? null : Math.round(avg / 4 * 1000) / 10, avg: avg === null ? null : Math.round(avg * 100) / 100, per: [] };
  }

  const CSS = `
.vForm h4{margin:18px 0 6px;font-size:15px}
.vForm .vDom{border:1px solid var(--line);border-radius:12px;margin:10px 0;overflow:hidden}
.vForm .vDomH{display:flex;justify-content:space-between;gap:8px;background:var(--brand-soft,#FFF3C4);padding:8px 12px;font-weight:600;font-size:14px}
.vForm .vDomH span{font-weight:500;color:var(--muted)}
.vForm .vIt{padding:9px 12px;border-top:1px solid var(--line)}
.vForm .vIt:first-of-type{border-top:0}
.vForm .vTx{font-size:14px;margin-bottom:6px}
.vForm .vRate{display:flex;flex-wrap:wrap;gap:6px}
.vForm .vRate label{display:inline-flex;align-items:center;gap:0;margin:0;cursor:pointer}
.vForm .vRate input{position:absolute;opacity:0;width:1px;height:1px}
.vForm .vRate span{display:inline-block;min-width:40px;text-align:center;padding:6px 9px;border:1px solid var(--line);border-radius:8px;font-size:13px;font-weight:600;background:var(--card);color:var(--ink)}
.vForm .vRate input:checked+span{background:#1d1d1d;color:var(--brand,#F7C948);border-color:#1d1d1d}
.vForm .vRate input:focus-visible+span{outline:2px solid var(--brand-dark,#D9A900)}
.vForm .vRate.safe input[value=no]:checked+span{background:#d32f2f;color:#fff;border-color:#d32f2f}
.vForm .vNote{width:100%;margin-top:6px;padding:7px 9px;font-size:13px}
.vForm .vStrat{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:4px 12px;font-size:13px}
.vForm .vStrat label{display:flex;gap:6px;align-items:center;margin:0;color:var(--ink)}
.vForm .vStrat input{width:auto;margin:0}
.vForm textarea{width:100%}
.vForm .vTexts label{display:block;font-size:13px;color:var(--muted);margin:10px 0 0}
.vForm .vTexts{margin-bottom:14px}
.vScore{position:sticky;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:10px 0;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;z-index:2}
.vScore b{font-size:18px}
.vRep table{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}
.vRep th{text-align:left;color:var(--muted);font-weight:600;font-size:12px;padding:6px 8px;border-bottom:1px solid var(--line)}
.vRep td{padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
.vRep td.r{text-align:center;font-weight:600;white-space:nowrap}
.vRep .big{font-size:26px;font-weight:700}
.vRep .head{display:flex;flex-wrap:wrap;gap:14px 24px;align-items:flex-end;margin:4px 0 10px}
.vRep .head div{font-size:13px;color:var(--muted)}
.vRep .head div b{display:block;color:var(--ink);font-size:14px}
.vRep .no{color:#d32f2f;font-weight:700}
.vRep .txt{margin:8px 0;font-size:14px}
.vRep .txt b{display:block;font-size:12.5px;color:var(--muted);margin-bottom:2px}
`;
  function addCss() {
    if (document.getElementById('visitCss')) return;
    const s = document.createElement('style'); s.id = 'visitCss'; s.textContent = CSS; document.head.appendChild(s);
  }

  // ----- the form, to fill in (admin page) -----
  // visit: { form, workshop, answers, strengths, improve, next }; onChange(score) is called on every change
  function editor(box, forms, visit, onChange) {
    addCss();
    const a = visit.answers || {}, items = a.items || {}, notes = a.notes || {}, safety = a.safety || {};
    const strat = a.strategies || [], kind = visit.workshop || 'electrical';
    const radios = (name, val, scale, cls) => `<div class="vRate ${cls || ''}">${scale.map(([v, label]) =>
      `<label title="${esc(label)}"><input type="radio" name="${name}" value="${v}" ${String(val) === String(v) ? 'checked' : ''}><span>${esc(cls === 'safe' ? label : (typeof v === 'number' && visit.form === 'workshop' ? LETTER[v] : (v === 'NO' ? 'N/O' : v)))}</span></label>`).join('')}</div>`;
    let html = '<div class="vForm">';
    if (visit.form === 'class') {
      const F = forms.class;
      html += `<p class="hint">4 Excellent · 3 Good · 2 Developing · 1 Needs improvement · N/O Not observed (not counted)</p>`;
      F.domains.forEach(d => {
        html += `<div class="vDom"><div class="vDomH">${esc(d.id + '. ' + d.name)} <span>${d.weight}%</span></div>`;
        d.items.forEach((t, i) => {
          const k = d.id + '.' + (i + 1);
          html += `<div class="vIt"><div class="vTx">${esc(t)}</div>${radios('it' + k, items[k], F.scale)}
            <input class="vNote" data-note="${k}" placeholder="Evidence / notes (optional)" value="${esc(notes[k] || '')}"></div>`;
        });
        html += '</div>';
      });
      html += `<h4>Teaching strategies used <span class="hint">(for reference, not scored)</span></h4><div class="vStrat">${F.strategies.map(s =>
        `<label><input type="checkbox" data-strat="${esc(s)}" ${strat.indexOf(s) !== -1 ? 'checked' : ''}> ${esc(s)}</label>`).join('')}</div>
        <input class="vNote" data-other placeholder="Other strategy" value="${esc(a.other || '')}">`;
    } else {
      const F = forms.workshop;
      html += `<div class="vRate" style="margin:4px 0 10px">${['electrical', 'mechanical'].map(k =>
        `<label><input type="radio" name="vKind" value="${k}" ${kind === k ? 'checked' : ''}><span>${k === 'electrical' ? 'Electrical workshop' : 'Mechanical workshop'}</span></label>`).join('')}</div>
        <p class="hint">E Excellent · G Good · S Satisfactory · NI Needs improvement</p><div class="vDom">`;
      F.items.forEach((t, i) => {
        const k = String(i + 1);
        html += `<div class="vIt"><div class="vTx">${i + 1}. <span data-word="${esc(t)}">${esc(word(t, kind))}</span></div>${radios('it' + k, items[k], F.scale)}</div>`;
      });
      html += `</div><h4>${esc(F.safetyTitle)} <span class="hint">(a “No” creates a safety task for the teacher)</span></h4><div class="vDom">`;
      F.safety.forEach((t, i) => {
        const k = String(i + 1);
        html += `<div class="vIt"><div class="vTx"><span data-word="${esc(t)}">${esc(word(t, kind))}</span></div>${radios('sf' + k, safety[k], [['yes', 'Yes'], ['no', 'No'], ['na', 'N/A']], 'safe')}</div>`;
      });
      html += '</div>';
    }
    const T = forms[visit.form].texts;
    html += `<div class="vTexts">${T.map(([k, label]) => `<label>${esc(label)}<textarea rows="2" data-text="${k}">${esc(visit[k] || '')}</textarea></label>`).join('')}</div></div>`;
    box.innerHTML = html;
    const fire = () => onChange && onChange(score(forms, visit.form, read(box, forms, visit).answers));
    box.addEventListener('change', e => {
      if (e.target.name === 'vKind') box.querySelectorAll('[data-word]').forEach(s => { s.textContent = word(s.dataset.word, e.target.value); });
      fire();
    });
    fire();
  }

  // reads the filled form back
  function read(box, forms, visit) {
    const items = {}, notes = {}, safety = {};
    box.querySelectorAll('input[type=radio]:checked').forEach(r => {
      if (r.name.indexOf('it') === 0) items[r.name.slice(2)] = r.value === 'NO' ? 'NO' : Number(r.value);
      if (r.name.indexOf('sf') === 0) safety[r.name.slice(2)] = r.value;
    });
    box.querySelectorAll('[data-note]').forEach(n => { if (n.value.trim()) notes[n.dataset.note] = n.value.trim(); });
    const kindEl = box.querySelector('input[name=vKind]:checked');
    const text = k => { const el = box.querySelector(`[data-text="${k}"]`); return el ? el.value.trim() : ''; };
    return {
      workshop: kindEl ? kindEl.value : '',
      answers: { items, notes, safety, strategies: [...box.querySelectorAll('[data-strat]:checked')].map(c => c.dataset.strat),
        other: (box.querySelector('[data-other]') || {}).value || '' },
      strengths: text('strengths'), improve: text('improve'), next: text('next')
    };
  }

  // ----- the finished report (both pages; also used for printing) -----
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = s => { if (!s) return ''; const [y, m, d] = s.slice(0, 10).split('-').map(Number); return `${DAYS[new Date(y, m - 1, d).getDay()]} ${d} ${MON[m - 1]} ${y}`; };
  function report(v, forms, prev) {
    addCss();
    const a = v.answers || {}, items = a.items || {}, notes = a.notes || {};
    const sc = score(forms, v.form, a);
    const F = forms[v.form];
    const title = v.form === 'workshop' ? word(F.title, v.workshop) : F.title;
    let html = `<div class="vRep"><div class="head">
      <div>Teacher<b>${esc(v.teacher)}</b></div><div>Date<b>${day(v.date)}${v.session ? ' · session ' + v.session : ''}</b></div>
      <div>Class<b>${esc(v.cls || '—')}</b></div><div>Observer<b>${esc(v.by)}</b></div>
      <div>Type<b>${v.planned === 'planned' ? 'Scheduled' : 'Unscheduled'}${v.follows ? ' · Follow-up' : ''}</b></div>
      <div>Result<b class="big">${sc.pct === null ? '—' : sc.pct + '%'}</b></div>
      ${prev && prev.score !== '' ? `<div>Previous visit<b>${prev.score}% (${day(prev.date)})</b></div>` : ''}</div>
      <div style="font-weight:600;margin-top:4px">${esc(title)}</div>`;
    if (v.form === 'class') {
      html += `<table><thead><tr><th>Area</th><th class="r">Weight</th><th class="r">Average (1–4)</th><th class="r">Weighted</th></tr></thead><tbody>${sc.per.map(p =>
        `<tr><td>${esc(p.name)}</td><td class="r">${p.weight}%</td><td class="r">${p.avg === null ? 'N/O' : p.avg.toFixed(2)}</td><td class="r">${p.avg === null ? '—' : (p.weight * p.avg / 4).toFixed(1)}</td></tr>`).join('')}
        <tr><td><b>Overall result</b></td><td class="r">100%</td><td class="r"><b>${sc.avg === null ? '—' : sc.avg.toFixed(2)}</b></td><td class="r"><b>${sc.pct === null ? '—' : sc.pct + '%'}</b></td></tr></tbody></table>
        <table><thead><tr><th>What was observed</th><th class="r">Rating</th><th>Evidence / notes</th></tr></thead><tbody>${F.domains.map(d => d.items.map((t, i) => {
          const k = d.id + '.' + (i + 1), r = items[k];
          return `<tr><td>${esc(t)}</td><td class="r">${r === undefined ? '' : r === 'NO' ? 'N/O' : r}</td><td>${esc(notes[k] || '')}</td></tr>`;
        }).join('')).join('')}</tbody></table>`;
      const st = (a.strategies || []).concat(a.other ? [a.other] : []);
      if (st.length) html += `<div class="txt"><b>Teaching strategies used</b>${esc(st.join(' · '))}</div>`;
    } else {
      html += `<table><thead><tr><th>#</th><th>Observation criteria</th><th class="r">Rating</th></tr></thead><tbody>${F.items.map((t, i) => {
        const r = items[String(i + 1)];
        return `<tr><td>${i + 1}</td><td>${esc(word(t, v.workshop))}</td><td class="r">${r ? LETTER[r] : ''}</td></tr>`;
      }).join('')}</tbody></table>
      <div style="font-weight:600;margin-top:12px">${esc(F.safetyTitle)}</div>
      <table><tbody>${F.safety.map((t, i) => {
        const r = (a.safety || {})[String(i + 1)];
        return `<tr><td>${esc(word(t, v.workshop))}</td><td class="r ${r === 'no' ? 'no' : ''}">${r ? SAFE[r] : ''}</td></tr>`;
      }).join('')}</tbody></table>`;
    }
    F.texts.forEach(([k, label]) => { if (v[k]) html += `<div class="txt"><b>${esc(label)}</b>${esc(v[k])}</div>`; });
    return html + '</div>';
  }

  window.VISIT = { editor, read, report, score, word, day };
})();
