// Minutes of meeting (MoM): one report layout shared by the admin page, the teacher page and the board.
// The meetings come from the server (Meetings.gs). window.MEET = { report, label, day, TYPES }.
(function () {
  const esc = t => String(t == null ? '' : t).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const L = {
    en: { weekly: 'Weekly meeting', department: 'Department meeting', safety: 'Safety meeting', parents: 'Parents meeting', other: 'Meeting',
      date: 'Date', time: 'Time', place: 'Place', by: 'Chaired by', present: 'Attended', absent: 'Absent', guests: 'Guests',
      agenda: 'Agenda', topic: 'Topic', notes: 'Discussion', decision: 'Decision', actions: 'Action items', action: 'Action',
      who: 'Who', due: 'Due', status: 'Status', team: 'Whole team', done: 'Done', pending: 'Open', overdue: 'Overdue', cancelled: 'Cancelled',
      prev: 'Open actions from the last meeting', join: 'Join on Microsoft Teams', none: 'None', noMinutes: 'No minutes were written.',
      progress: '{d} of {n} actions done' },
    ar: { weekly: 'اجتماع أسبوعي', department: 'اجتماع القسم', safety: 'اجتماع السلامة', parents: 'اجتماع أولياء الأمور', other: 'اجتماع',
      date: 'التاريخ', time: 'الوقت', place: 'المكان', by: 'برئاسة', present: 'الحضور', absent: 'الغياب', guests: 'الضيوف',
      agenda: 'جدول الأعمال', topic: 'الموضوع', notes: 'المناقشة', decision: 'القرار', actions: 'المهام المطلوبة', action: 'المهمة',
      who: 'المسؤول', due: 'الموعد', status: 'الحالة', team: 'الفريق كله', done: 'تمت', pending: 'مفتوحة', overdue: 'متأخرة', cancelled: 'ملغاة',
      prev: 'مهام مفتوحة من الاجتماع السابق', join: 'الانضمام عبر Microsoft Teams', none: 'لا يوجد', noMinutes: 'لم يُكتب محضر.',
      progress: 'تم {d} من {n} مهام' }
  };
  const TYPES = ['weekly', 'department', 'safety', 'parents', 'other'];
  const label = (k, lang) => (L[lang] || L.en)[k] || L.en[k] || k;
  const DAYS = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = (s, lang) => {
    if (!s) return '';
    const [y, m, d] = s.slice(0, 10).split('-').map(Number), w = new Date(y, m - 1, d).getDay();
    return lang === 'ar' ? `${DAYS.ar[w]} ${d}/${m}/${y}` : `${DAYS.en[w]} ${d} ${MON[m - 1]} ${y}`;
  };
  const first = n => String(n || '').split(' ')[0];

  const CSS = `
.mRep{font-size:14px;line-height:1.5}
.mRep .mHead{display:flex;flex-wrap:wrap;gap:10px 26px;margin:2px 0 12px}
.mRep .mHead div{font-size:12.5px;color:var(--muted,#666)}.mRep .mHead b{display:block;font-size:14px;color:var(--ink,#1d1d1d)}
.mRep h4{margin:16px 0 6px;font-size:14px}
.mRep .ppl{display:flex;flex-wrap:wrap;gap:6px}
.mRep .ppl span{font-size:12.5px;padding:3px 10px;border-radius:99px;background:#E6F4EA;color:#17652A}
.mRep .ppl span.a{background:#F4F4F5;color:#52525B;text-decoration:line-through}
.mRep .ppl span.g{background:#EEF4FF;color:#1E40AF}
.mRep .mTopic{border:1px solid var(--line,#e4e4e7);border-radius:12px;padding:10px 12px;margin:0 0 8px}
.mRep .mTopic b{display:block}
.mRep .mTopic .n{white-space:pre-wrap;margin-top:4px}
.mRep .mTopic .d{margin-top:6px;padding:6px 10px;border-radius:8px;background:#FEF6DA;color:#18181B;white-space:pre-wrap}
.mRep .mTopic .d i{font-style:normal;font-weight:600;margin-inline-end:6px}
.mRep table{width:100%;border-collapse:collapse;font-size:13px}
.mRep th{text-align:start;font-size:12px;color:var(--muted,#666);font-weight:600;padding:6px 8px;border-bottom:1px solid var(--line,#e4e4e7)}
.mRep td{padding:7px 8px;border-bottom:1px solid var(--line,#e4e4e7);vertical-align:top}
.mRep .st{font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:99px;white-space:nowrap}
.mRep .st.done{background:#E6F4EA;color:#17652A}.mRep .st.pending{background:#F4F4F5;color:#3F3F46}.mRep .st.overdue{background:#FEE2E2;color:#991B1B}.mRep .st.cancelled{background:#F4F4F5;color:#9CA3AF}
.mRep .mPrev{border:1px dashed var(--line,#d4d4d8);border-radius:12px;padding:8px 12px;margin:10px 0}
.mRep .join{display:inline-flex;align-items:center;gap:8px;margin:4px 0 8px;padding:9px 14px;border-radius:10px;background:#4B53BC;color:#fff !important;text-decoration:none;font-weight:600;font-size:14px}
[data-theme="dark"] .mRep .mTopic .d{background:#2A2414;color:#F4F4F5}
[data-theme="dark"] .mRep .ppl span{background:#16351F;color:#9FE0B0}[data-theme="dark"] .mRep .ppl span.a{background:#26262D;color:#A1A1AA}[data-theme="dark"] .mRep .ppl span.g{background:#1E2A44;color:#C7D7FE}
`;
  function addCss() {
    if (document.getElementById('meetCss')) return;
    const s = document.createElement('style'); s.id = 'meetCss'; s.textContent = CSS; document.head.appendChild(s);
  }
  const who = (w, lang) => w === 'ALL' ? label('team', lang) : esc(w);
  const actionTable = (list, lang) => `<table><thead><tr><th>${label('action', lang)}</th><th>${label('who', lang)}</th><th>${label('due', lang)}</th><th>${label('status', lang)}</th></tr></thead><tbody>${
    list.map(a => `<tr><td>${esc(a.text)}</td><td>${who(a.who, lang)}${a.who === 'ALL' && a.people && a.people.length ? ` <span style="color:var(--muted,#666);font-size:12px">(${a.doneCount}/${a.people.length})</span>` : ''}</td><td style="white-space:nowrap">${day(a.due, lang)}</td><td><span class="st ${a.status}">${label(a.status, lang)}</span></td></tr>`).join('')}</tbody></table>`;

  // m: a meeting from the server. opts: { lang, prev: show the previous meeting's open actions, join: show the Teams button }
  function report(m, opts) {
    addCss();
    const o = opts || {}, lang = o.lang || 'en';
    let h = `<div class="mRep" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><div class="mHead">
      <div>${label('date', lang)}<b>${day(m.date, lang)}</b></div>
      ${m.time ? `<div>${label('time', lang)}<b>${esc(m.time)}</b></div>` : ''}
      ${m.place ? `<div>${label('place', lang)}<b>${esc(m.place)}</b></div>` : ''}
      <div>${label('by', lang)}<b>${esc(m.by)}</b></div>
      ${m.actions && m.actions.length ? `<div>${label('actions', lang)}<b>${label('progress', lang).replace('{d}', m.actionsDone).replace('{n}', m.actions.length)}</b></div>` : ''}</div>`;
    if (o.join && m.link) h += `<a class="join" href="${esc(m.link)}" target="_blank" rel="noopener noreferrer">${label('join', lang)} ↗</a>`;
    if (o.prev && m.previous && m.previous.open.length) h += `<div class="mPrev"><h4 style="margin-top:4px">${label('prev', lang)} (${day(m.previous.date, lang)})</h4>${actionTable(m.previous.open, lang)}</div>`;
    if (m.status !== 'minuted') {
      if (m.agenda && m.agenda.length) h += `<h4>${label('agenda', lang)}</h4><ol style="margin:0;padding-inline-start:20px">${m.agenda.map(a => `<li>${esc(a)}</li>`).join('')}</ol>`;
      return h + '</div>';
    }
    h += `<h4>${label('present', lang)}</h4><div class="ppl">${(m.present || []).map(p => `<span>${esc(p)}</span>`).join('') || `<i>${label('none', lang)}</i>`}${
      m.guests ? m.guests.split(/[,،\n]/).map(g => g.trim()).filter(Boolean).map(g => `<span class="g">${esc(g)}</span>`).join('') : ''}</div>`;
    if (m.absent && m.absent.length) h += `<h4>${label('absent', lang)}</h4><div class="ppl">${m.absent.map(p => `<span class="a">${esc(p)}</span>`).join('')}</div>`;
    h += `<h4>${label('agenda', lang)}</h4>` + ((m.minutes || []).length ? m.minutes.map((t, i) => `<div class="mTopic"><b>${i + 1}. ${esc(t.topic)}</b>${t.notes ? `<div class="n">${esc(t.notes)}</div>` : ''}${t.decision ? `<div class="d"><i>${label('decision', lang)}:</i>${esc(t.decision)}</div>` : ''}</div>`).join('') : `<p>${label('noMinutes', lang)}</p>`);
    if (m.actions && m.actions.length) h += `<h4>${label('actions', lang)}</h4>` + actionTable(m.actions, lang);
    return h + '</div>';
  }

  window.MEET = { report, label, day, TYPES, first };
})();
