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
.vWiz{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start}
.vRail{flex:1 1 250px;max-width:300px;min-width:0;display:flex;flex-direction:column;gap:12px;position:sticky;top:76px}
.vOverall{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.vOverall .l{font-size:12.5px;color:var(--muted)}
.vOverall .n b{font-size:32px;letter-spacing:-.02em}.vOverall .n span{color:var(--muted);font-size:15px}
.vOverall .p{font-size:13px;font-weight:600;color:var(--brand-dark,#9A7400)}
.vOverall .bar{height:8px;border-radius:99px;background:var(--line);margin-top:10px;overflow:hidden}
.vOverall .bar i{display:block;height:100%;width:0;background:var(--brand,#F7C948);border-radius:99px;transition:width .2s}
.vSteps{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;display:flex;flex-direction:column}
.vSteps button{display:flex;justify-content:space-between;gap:8px;align-items:center;text-align:left;border:0;background:transparent;color:var(--ink);font:inherit;font-size:14px;padding:11px 12px;border-radius:9px;cursor:pointer;min-height:44px}
.vSteps button:hover{background:var(--bg)}
.vSteps button.on{background:var(--brand-soft,#FEF6DA);font-weight:600}
.vSteps button b{font-weight:600;color:var(--muted);white-space:nowrap}
.vSteps button.done b{color:var(--ink)}
.vSteps button b.bad{color:#d32f2f}
.vPane{flex:3 1 460px;min-width:0;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px 24px;scroll-margin-top:80px}
.vStepH{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px}
.vStepH h3{margin:0;font-size:20px;letter-spacing:-.01em}
.vStepH span{font-size:13px;color:var(--muted)}.vStepH span b{font-weight:600;color:var(--ink)}
.vScale{margin:6px 0 4px;font-size:13px;color:var(--muted)}
.vIt{padding:18px 0;border-bottom:1px solid var(--line)}
.vTx{font-size:15px;margin-bottom:10px;line-height:1.45}
.vRate{display:grid;grid-template-columns:repeat(var(--n,5),minmax(0,1fr));gap:6px}
.vRate.n5{--n:5}.vRate.n4{--n:4}.vRate.n3{--n:3}.vRate.n2{--n:2}
.vRate label{margin:0;cursor:pointer;display:block}
.vRate input{position:absolute;opacity:0;width:1px;height:1px}
.vRate span{display:flex;align-items:center;justify-content:center;height:48px;border:1px solid var(--line);border-radius:10px;font-size:16px;font-weight:600;background:var(--card);color:var(--ink)}
.vRate label:hover span{border-color:var(--muted)}
.vRate input:checked+span{background:#18181B;color:#F7C948;border-color:#18181B;font-weight:700}
.vRate input:focus-visible+span{outline:2px solid var(--brand-dark,#D9A900);outline-offset:2px}
.vRate.safe input[value=no]:checked+span{background:#d32f2f;color:#fff;border-color:#d32f2f}
.vRate.safe input[value=yes]:checked+span{background:#17652a;color:#fff;border-color:#17652a}
.vKind{margin:16px 0 6px}.vKind span{font-size:14px}
.vAddNote{border:0;background:none;padding:10px 0 0;font:inherit;font-size:13px;font-weight:600;color:var(--brand-dark,#9A7400);cursor:pointer}
.vNote{width:100%;box-sizing:border-box;margin-top:10px;height:42px;padding:0 12px;font-size:14px;border-radius:10px}
.vPane h4{margin:20px 0 10px;font-size:15px}.vPane h4 span{font-weight:400;color:var(--muted);font-size:13px}
.vChips{display:flex;flex-wrap:wrap;gap:8px}
.vChips label{margin:0;cursor:pointer}
.vChips input{position:absolute;opacity:0;width:1px;height:1px}
.vChips span{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border:1px solid var(--line);border-radius:99px;font-size:14px;color:var(--ink);background:var(--card)}
.vChips input:checked+span{background:#18181B;color:#fff;border-color:#18181B}
.vChips input:focus-visible+span{outline:2px solid var(--brand-dark,#D9A900)}
.vTexts label{display:block;font-size:13px;color:var(--muted);margin:16px 0 0}
.vTexts textarea{width:100%;box-sizing:border-box;margin-top:6px;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px}
.vNav{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:22px}
.vNav .btn{min-height:44px}
.vDone{font-size:13px;color:var(--muted)}
@media (max-width:760px){
 .vRail{position:static;max-width:none;flex-basis:100%}
 .vSteps{flex-direction:row;overflow-x:auto;gap:4px}
 .vSteps button{flex:0 0 auto;flex-direction:column;align-items:flex-start;gap:2px;font-size:13px}
 .vPane{padding:18px 16px;flex-basis:100%}
 .vWiz{gap:12px}
 .vRate span{height:52px}
}
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

  // ----- the form, to fill in (admin page): one area at a time -----
  // visit: { form, workshop, answers, strengths, improve, next }; onChange(score) is called on every change
  const band = p => p === null ? '' : p >= 85 ? 'Excellent' : p >= 70 ? 'Good' : p >= 50 ? 'Developing' : 'Needs improvement';
  function editor(box, forms, visit, onChange) {
    addCss();
    const a = visit.answers || {}, items = a.items || {}, notes = a.notes || {}, safety = a.safety || {};
    const strat = a.strategies || [], kind = visit.workshop || 'electrical';
    const isClass = visit.form === 'class', F = forms[visit.form];
    const rate = (name, val, scale, safe) => `<div class="vRate n${scale.length}${safe ? ' safe' : ''}">${scale.map(([v, label]) => {
      const txt = safe ? label : (typeof v === 'number' && !isClass ? LETTER[v] : (v === 'NO' ? 'N/O' : v));
      return `<label title="${esc(label)}"><input type="radio" name="${name}" value="${v}" ${String(val) === String(v) ? 'checked' : ''}><span>${esc(txt)}</span></label>`;
    }).join('')}</div>`;
    const noteBox = k => `<div class="vNoteWrap">${notes[k] ? '' : '<button type="button" class="vAddNote">+ Evidence / note</button>'}
      <input class="vNote" data-note="${k}" placeholder="Evidence / note (optional)" value="${esc(notes[k] || '')}" ${notes[k] ? '' : 'hidden'}></div>`;
    const item = (text, inner, word) => `<div class="vIt"><div class="vTx">${word ? `<span data-word="${esc(text)}">${esc(hubWordFor(text, kind))}</span>` : esc(text)}</div>${inner}</div>`;
    // the steps
    const steps = [];
    if (isClass) {
      F.domains.forEach(d => steps.push({ key: 'd' + d.id, name: d.id + ' · ' + d.name, weight: d.weight,
        body: `<p class="vScale">4 Excellent · 3 Good · 2 Developing · 1 Needs improvement · N/O not counted</p>` +
          d.items.map((t, i) => { const k = d.id + '.' + (i + 1); return item(t, rate('it' + k, items[k], F.scale) + noteBox(k)); }).join(''),
        keys: d.items.map((_, i) => d.id + '.' + (i + 1)) }));
      steps.push({ key: 'fb', name: 'Strategies & feedback', body:
        `<h4>Teaching strategies used <span>(not scored)</span></h4><div class="vChips">${F.strategies.map(s =>
          `<label><input type="checkbox" data-strat="${esc(s)}" ${strat.indexOf(s) !== -1 ? 'checked' : ''}><span>${esc(s)}</span></label>`).join('')}</div>
         <input class="vNote" data-other placeholder="Other strategy" value="${esc(a.other || '')}">` });
    } else {
      const half = Math.ceil(F.items.length / 2);
      const crit = (from, to) => F.items.slice(from, to).map((t, j) => { const i = from + j, k = String(i + 1);
        return item(t, rate('it' + k, items[k], F.scale), true).replace('<div class="vTx">', `<div class="vTx"><b>${i + 1}.</b> `); }).join('');
      steps.push({ key: 'w1', name: `Criteria 1–${half}`, keys: F.items.slice(0, half).map((_, i) => String(i + 1)),
        body: `<div class="vRate n2 vKind">${['electrical', 'mechanical'].map(k => `<label><input type="radio" name="vKind" value="${k}" ${kind === k ? 'checked' : ''}><span>${k === 'electrical' ? 'Electrical workshop' : 'Mechanical workshop'}</span></label>`).join('')}</div>
          <p class="vScale">E Excellent · G Good · S Satisfactory · NI Needs improvement</p>` + crit(0, half) });
      steps.push({ key: 'w2', name: `Criteria ${half + 1}–${F.items.length}`, keys: F.items.slice(half).map((_, i) => String(half + i + 1)),
        body: `<p class="vScale">E Excellent · G Good · S Satisfactory · NI Needs improvement</p>` + crit(half, F.items.length) });
      steps.push({ key: 'sf', name: 'Safety check', safety: F.safety.map((_, i) => String(i + 1)),
        body: `<p class="vScale">Each “No” creates a safety task for the teacher, due in 3 days.</p>` + F.safety.map((t, i) =>
          item(t, rate('sf' + (i + 1), safety[String(i + 1)], [['yes', 'Yes'], ['no', 'No'], ['na', 'N/A']], true), true)).join('') });
      steps.push({ key: 'fb', name: 'Feedback', body: '' });
    }
    const texts = `<div class="vTexts">${F.texts.map(([k, label]) => `<label>${esc(label)}<textarea rows="3" data-text="${k}">${esc(visit[k] || '')}</textarea></label>`).join('')}</div>`;
    steps[steps.length - 1].body += texts;

    box.innerHTML = `<div class="vWiz">
      <aside class="vRail">
        <div class="vOverall"><div class="l">Overall${isClass ? ' (weighted)' : ''}</div><div class="n"><b data-ov>—</b> <span>/ 4</span></div>
          <div class="p" data-pct></div><div class="bar"><i data-bar></i></div></div>
        <nav class="vSteps" aria-label="Areas">${steps.map((s, i) => `<button type="button" data-go="${i}"><span>${esc(s.name)}</span><b data-st="${i}"></b></button>`).join('')}</nav>
      </aside>
      <section class="vPane">${steps.map((s, i) => `<div class="vStep" data-step="${i}" ${i ? 'hidden' : ''}>
        <div class="vStepH"><h3>${esc(s.name)}</h3>${s.weight ? `<span>Weight ${s.weight}%<b data-sc="${i}"></b></span>` : ''}</div>
        ${s.body}
        <div class="vNav">${i ? `<button type="button" class="btn alt" data-go="${i - 1}">← ${esc(steps[i - 1].name.replace(/^\d+ · /, ''))}</button>` : '<span></span>'}
          ${i < steps.length - 1 ? `<button type="button" class="btn save" data-go="${i + 1}">Next: ${esc(steps[i + 1].name.replace(/^\d+ · /, ''))} →</button>` : '<span class="vDone">Last step. Press “Send report” at the top when you are ready.</span>'}</div>
      </div>`).join('')}</section></div>`;

    let cur = 0;
    const go = i => {
      cur = i;
      box.querySelectorAll('.vStep').forEach(s => { s.hidden = Number(s.dataset.step) !== i; });
      box.querySelectorAll('.vSteps [data-go]').forEach(b => b.classList.toggle('on', Number(b.dataset.go) === i));
      const pane = box.querySelector('.vPane'); if (pane) pane.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    const refresh = () => {
      const r = read(box, forms, visit), sc = score(forms, visit.form, r.answers);
      box.querySelector('[data-ov]').textContent = sc.avg === null ? '—' : sc.avg.toFixed(2);
      box.querySelector('[data-pct]').textContent = sc.pct === null ? 'Nothing rated yet' : sc.pct + '% · ' + band(sc.pct);
      box.querySelector('[data-bar]').style.width = (sc.pct || 0) + '%';
      steps.forEach((s, i) => {
        const el = box.querySelector(`[data-st="${i}"]`), scEl = box.querySelector(`[data-sc="${i}"]`);
        let txt = '', done = false;
        if (isClass && s.weight) {
          const p = sc.per.find(x => x.name === F.domains[i].name);
          const rated = s.keys.filter(k => r.answers.items[k] !== undefined).length;
          done = rated === s.keys.length;
          txt = rated === 0 ? '—' : done ? (p.avg === null ? 'N/O' : p.avg.toFixed(2)) : `${rated} of ${s.keys.length}`;
          if (scEl) scEl.textContent = p.avg === null ? '' : ' · area score ' + p.avg.toFixed(2);
        } else if (s.keys) {
          const rated = s.keys.filter(k => r.answers.items[k] !== undefined).length;
          done = rated === s.keys.length; txt = rated === 0 ? '—' : `${rated} of ${s.keys.length}`;
        } else if (s.safety) {
          const vals = s.safety.map(k => r.answers.safety[k]).filter(Boolean), nos = vals.filter(v => v === 'no').length;
          done = vals.length === s.safety.length; txt = nos ? `${nos} No` : vals.length ? `${vals.length} of ${s.safety.length}` : '—';
          el.classList.toggle('bad', nos > 0);
        } else {
          const n = ['strengths', 'improve', 'next'].filter(k => r[k]).length;
          done = n === 3; txt = n ? `${n} of 3` : '—';
        }
        el.textContent = txt; el.parentElement.classList.toggle('done', done);
      });
      onChange && onChange(sc, r);
    };
    box.onclick = e => {
      const g = e.target.closest('[data-go]'); if (g) { go(Number(g.dataset.go)); return; }
      const n = e.target.closest('.vAddNote'); if (n) { const inp = n.parentElement.querySelector('.vNote'); inp.hidden = false; n.remove(); inp.focus(); }
    };
    box.onchange = e => {
      if (e.target.name === 'vKind') box.querySelectorAll('[data-word]').forEach(s => { s.textContent = hubWordFor(s.dataset.word, e.target.value); });
      refresh();
    };
    box.oninput = e => { if (e.target.matches('textarea,.vNote')) refresh(); };
    go(0); refresh();
  }
  const hubWordFor = (t, k) => word(t, k);

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
