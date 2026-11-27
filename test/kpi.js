// Teacher KPIs: one monthly sheet per teacher, 100 points (60 technical + 40 assessments).
// Shared by the admin page (seniors) and the board page. For now the scores are empty:
// they will be filled in by future updates (automatic parts) and by the seniors and the board.
(function () {
  const KPIS = [
    { id: 'stAtt', pts: 12, who: 'auto',
      en: 'Student attendance', ar: 'حضور الطلاب',
      ruleEn: "Exact attendance % in the teacher's own sessions (late counts as present). 100% = 12 · 75–99% = 9 · 50–74% = 5 · below 50% = 0.",
      ruleAr: 'نسبة حضور الطلاب الفعلية في حصص المعلم (التأخير يُحسب حضورًا). ١٠٠٪ = ١٢ · من ٧٥ إلى ٩٩٪ = ٩ · من ٥٠ إلى ٧٤٪ = ٥ · أقل من ٥٠٪ = صفر.' },
    { id: 'tAtt', pts: 7, who: 'board',
      en: 'Teacher attendance', ar: 'حضور المعلم',
      ruleEn: '0 absent days = 7 · 1 day = 6 · 2 days = 5 · 3 days = 4 · 4 days or more = 0. Entered by the board.',
      ruleAr: 'بدون غياب = ٧ · يوم واحد = ٦ · يومان = ٥ · ٣ أيام = ٤ · ٤ أيام فأكثر = صفر. يُدخله مجلس الإدارة.' },
    { id: 'rep', pts: 7, who: 'auto',
      en: 'Reporting & system', ar: 'التقارير والالتزام بالنظام',
      ruleEn: 'Done on time: grades recorded, monthly plan, lesson preparation, questions or exams submitted, daily or weekly work plan, capstone follow-up, the agreed workshop custody system.',
      ruleAr: 'الالتزام في المواعيد: رصد الدرجات، الخطة الشهرية، التحضيرات، تسليم الأسئلة أو الامتحانات، الالتزام بجداول العمل (الخطة اليومية أو الأسبوعية)، متابعة الكابستون، الالتزام بالنظام المتفق عليه في عهدة الورش.' },
    { id: 'extra', pts: 7, who: 'seniors',
      en: 'Extra activities', ar: 'الأنشطة الإضافية',
      ruleEn: 'Idea + execution = 7 · idea only = 5 · none = 0.',
      ruleAr: 'فكرة + تنفيذ = ٧ · فكرة فقط = ٥ · لا يوجد = صفر.' },
    { id: 'beh', pts: 7, who: 'seniors',
      en: 'Behaviour, attitude & communication', ar: 'السلوك والاتجاهات والتواصل',
      ruleEn: "The seniors' judgement, with a comment, based on the month's conduct notes.",
      ruleAr: 'تقدير السينيورز مع تعليق، بناءً على ملاحظات السلوك خلال الشهر.' },
    { id: 'comp', pts: 20, who: 'seniors',
      en: 'EVA competencies & values', ar: 'جدارات وقيم إيفا',
      ruleEn: "The seniors' judgement, with a comment: teamwork, EVA's core values, initiatives that improve student outcomes and support the school.",
      ruleAr: 'تقدير السينيورز مع تعليق: العمل الجماعي، قيم إيفا الأساسية، المبادرات التي تحسّن نتائج الطلاب وتدعم تطوير المدرسة.' }
  ];
  const ASSESS = { id: 'assess', pts: 40, who: 'later',
    en: 'Assessments', ar: 'التقييمات',
    ruleEn: "Share of the teacher's students (classes from the timetable) who pass the competency assessment on the first try. All of them = 40. The bands will be set with the vice dean.",
    ruleAr: 'نسبة طلاب المعلم (الفصول حسب الجدول) الناجحين في تقييم الجدارة من المحاولة الأولى. نجاح الجميع = ٤٠. تُحدَّد الشرائح لاحقًا مع الوكيل.' };

  const TEACHER_AR = {
    'george ayad': 'جورج عياد', 'ramy nabih': 'رامي نبيه', 'maria morcos': 'ماريا مرقس',
    'dalia mahmoud': 'داليا محمود', 'sufian abdalla': 'سفيان عبدالله', 'jan ossama': 'جان اسامة'
  };
  const T = {
    en: { title: 'Teacher KPIs', month: 'Month', teacher: 'Teacher', technical: 'Technical', total: 'Total',
      rules: 'How each KPI is scored', soon: 'Scores will be filled in by future updates.',
      open: 'Open until {d}', locked: 'Locked on {d}',
      auto: 'Automatic', board: 'Board', seniors: 'Seniors', later: 'Later',
      period: 'Monthly. A month can be edited until the 10th of the next month, then it is locked.',
      who: 'Filled by', points: 'points', none: 'No teachers found. Add them in Setup.',
      note: 'Technical KPIs: 60 points. Assessments: 40 points. Total: 100.' },
    ar: { title: 'مؤشرات أداء المعلمين', month: 'الشهر', teacher: 'المعلم', technical: 'الفني', total: 'الإجمالي',
      rules: 'طريقة احتساب كل مؤشر', soon: 'ستُضاف الدرجات في تحديثات قادمة.',
      open: 'مفتوح حتى {d}', locked: 'أُغلق في {d}',
      auto: 'تلقائي', board: 'مجلس الإدارة', seniors: 'السينيورز', later: 'لاحقًا',
      period: 'شهري. يمكن التعديل على الشهر حتى يوم ١٠ من الشهر التالي، ثم يُغلق.',
      who: 'يُدخله', points: 'درجة', none: 'لا يوجد معلمون. أضفهم من صفحة الإعداد.',
      note: 'المؤشرات الفنية: ٦٠ درجة. التقييمات: ٤٠ درجة. الإجمالي: ١٠٠.' }
  };
  const MONTHS = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  };
  const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

  const CSS = `
.kpiWrap{direction:inherit}
.kpiHead{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between;margin-bottom:6px}
.kpiHead h2{margin:0;font-size:20px}
.kpiHead select{min-width:170px}
.kpiStatus{font-size:13px;color:var(--muted,#6b6b6b);margin:2px 0 12px}
.kpiStatus b{color:var(--ink,#1d1d1d)}
.kpiScroll{overflow-x:auto;border:1px solid var(--line,var(--border,#e8e2cf));border-radius:12px}
.kpiT{width:100%;border-collapse:collapse;font-size:13px;min-width:860px}
.kpiT th{background:var(--brand-soft,#FFF3C4);font-weight:600;text-align:center;padding:8px 6px;vertical-align:bottom;border-bottom:1px solid var(--line,var(--border,#e8e2cf))}
.kpiT th .pts{display:block;font-size:12px;color:var(--muted,#6b6b6b);font-weight:500;margin-top:2px}
.kpiT th .who{display:inline-block;margin-top:5px;font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:999px}
.who.auto{background:#e6f4ea;color:#17652a}.who.board{background:#e3edfb;color:#0c447c}
.who.seniors{background:#fde7d9;color:#8a3a0c}.who.later{background:#ececec;color:#555}
.kpiT th.tName,.kpiT td.tName{text-align:start;padding-inline-start:12px;min-width:150px}
.kpiT td{text-align:center;padding:10px 6px;border-bottom:1px solid var(--line,var(--border,#e8e2cf));color:var(--muted,#6b6b6b)}
.kpiT td.tName{color:var(--ink,#1d1d1d);font-weight:600}
.kpiT td.tName small{display:block;font-weight:400;color:var(--muted,#6b6b6b);font-size:12px}
.kpiT .sum{background:rgba(247,201,72,.12);font-weight:600}
.kpiT tr:last-child td{border-bottom:0}
.kpiSoon{font-size:13px;color:var(--muted,#6b6b6b);margin:10px 2px 18px}
.kpiRules{margin-top:6px}
.kpiRules h3{font-size:16px;margin:0 0 4px}
.kpiRules .period{font-size:13px;color:var(--muted,#6b6b6b);margin:0 0 10px}
.kpiRule{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;padding:11px 0;border-top:1px solid var(--line,var(--border,#e8e2cf))}
.kpiRule .p{font-weight:700;font-size:18px;min-width:40px;text-align:center}
.kpiRule .p small{display:block;font-size:10.5px;font-weight:500;color:var(--muted,#6b6b6b)}
.kpiRule b{font-size:14px}
.kpiRule .who{margin-inline-start:8px;font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:999px}
.kpiRule p{margin:3px 0 0;font-size:13px;color:var(--muted,#6b6b6b);line-height:1.5}
@media print{.kpiHead select{display:none}.kpiScroll{overflow:visible;border:0}}
`;
  function addCss() {
    if (document.getElementById('kpiCss')) return;
    const s = document.createElement('style'); s.id = 'kpiCss'; s.textContent = CSS; document.head.appendChild(s);
  }

  // months of the school year so far (Sep to now), newest first
  function monthList(now) {
    const out = [], startY = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    for (let d = new Date(startY, 8, 1); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) out.push(new Date(d));
    return out.reverse();
  }

  const state = { month: null };

  // container: element to draw into; opts: { teachers: [names], lang: 'en'|'ar', now: Date }
  function render(container, opts) {
    addCss();
    const lang = opts.lang === 'ar' ? 'ar' : 'en', t = T[lang], now = opts.now || new Date();
    const months = monthList(now);
    if (!state.month || !months.some(m => +m === +state.month)) state.month = months[0];
    const m = state.month;
    const lockDay = new Date(m.getFullYear(), m.getMonth() + 1, 10);
    const fmt = d => d.getDate() + ' ' + MONTHS[lang][d.getMonth()] + ' ' + d.getFullYear();
    const status = (now <= new Date(lockDay.getFullYear(), lockDay.getMonth(), lockDay.getDate(), 23, 59) ? t.open : t.locked).replace('{d}', fmt(lockDay));
    const name = n => lang === 'ar' && TEACHER_AR[n.trim().toLowerCase()] ? TEACHER_AR[n.trim().toLowerCase()] : n;
    const sub = n => lang === 'ar' ? (TEACHER_AR[n.trim().toLowerCase()] ? n : '') : (TEACHER_AR[n.trim().toLowerCase()] || '');
    const head = k => `<th><span>${esc(k[lang])}</span><span class="pts">${k.pts}</span><span class="who ${k.who}">${t[k.who]}</span></th>`;
    const teachers = (opts.teachers || []).slice();
    const empty = '<td>—</td>';

    container.innerHTML = `<div class="kpiWrap" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
      <div class="kpiHead">
        <h2>${t.title}</h2>
        <label>${t.month} <select class="kpiMonth">${months.map((d, i) =>
          `<option value="${i}" ${+d === +m ? 'selected' : ''}>${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}</option>`).join('')}</select></label>
      </div>
      <div class="kpiStatus"><b>${MONTHS[lang][m.getMonth()]} ${m.getFullYear()}</b> · ${status} · ${t.note}</div>
      <div class="kpiScroll"><table class="kpiT">
        <thead><tr><th class="tName">${t.teacher}</th>${KPIS.map(head).join('')}
          <th class="sum"><span>${t.technical}</span><span class="pts">60</span></th>${head(ASSESS)}
          <th class="sum"><span>${t.total}</span><span class="pts">100</span></th></tr></thead>
        <tbody>${teachers.length ? teachers.map(n => `<tr><td class="tName">${esc(name(n))}${sub(n) ? `<small>${esc(sub(n))}</small>` : ''}</td>${KPIS.map(() => empty).join('')}<td class="sum">—</td>${empty}<td class="sum">—</td></tr>`).join('')
          : `<tr><td class="tName" colspan="10">${t.none}</td></tr>`}</tbody>
      </table></div>
      <p class="kpiSoon">${t.soon}</p>
      <div class="kpiRules">
        <h3>${t.rules}</h3>
        <p class="period">${t.period}</p>
        ${KPIS.concat([ASSESS]).map(k => `<div class="kpiRule"><div class="p">${k.pts}<small>${t.points}</small></div>
          <div><b>${esc(k[lang])}</b><span class="who ${k.who}">${t.who}: ${t[k.who]}</span>
          <p>${esc(lang === 'ar' ? k.ruleAr : k.ruleEn)}</p></div></div>`).join('')}
      </div>
    </div>`;
    container.querySelector('.kpiMonth').onchange = e => { state.month = months[+e.target.value]; render(container, opts); };
  }

  window.KPI = { render, KPIS, ASSESS };
})();
