/*
 * ETLab MITS Reskin — content.js (clean rewrite)
 * Auto-hide sidebar · Month-switching calendar · Dark/Light · Cached scraper
 */
'use strict';

const BASE_URL = 'https://mits.etlab.app';

const SKW = {
  'attendance':['attendance','present','absent','percentage'],
  'results':['results','marks','grades','cgpa','sgpa','score'],
  'timetable':['timetable','schedule','routine','periods'],
  'assignments':['assignments','homework','submission','due'],
  'study materials':['materials','notes','pdf','books','syllabus'],
  'materials':['materials','notes','pdf','books','syllabus'],
  'user manual':['manual','guide','help'],
  'hostel attendance':['hostel','warden','hostel attendance'],
  'accounts':['fees','accounts','tuition','payment'],
  'certificates':['certificate','bonafide','scholarship'],
  'gate pass':['gate pass','out pass','security'],
};

let _cachedLinks=null, _avatarCache=null, _cachedUserName='', _theme='light', _globalClicked=false;
let _calYear=new Date().getFullYear(), _calMonth=new Date().getMonth(), _calAbsent=new Set(), _calEl=null;
let _hostelAbsentMonth=new Date().getMonth(), _hostelAbsentYear=new Date().getFullYear();
let _origSidebarHTML=null; // saved before reskin so we can restore
let _isInitialLoad=true;


const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DHDRS=['S','M','T','W','T','F','S'];
const HMAP = {
  // Jan 2026
  '2026-1-1':'New Year', '2026-1-26':'Republic Day',
  '2026-01-01':'New Year', '2026-01-26':'Republic Day',
  // Feb 2026
  '2026-2-15':'Maha Shivratri', '2026-02-15':'Maha Shivratri',
  // Mar 2026
  '2026-3-4':'Holi', '2026-3-26':'Maundy Thursday', '2026-3-27':'Good Friday',
  '2026-03-04':'Holi', '2026-03-26':'Maundy Thursday', '2026-03-27':'Good Friday',
  // Apr 2026
  '2026-4-5':'Easter', '2026-4-14':'Vishu', '2026-4-15':'Ambedkar Jayanti',
  '2026-04-05':'Easter', '2026-04-14':'Vishu', '2026-04-15':'Ambedkar Jayanti',
  // May 2026
  '2026-5-1':'May Day', '2026-05-01':'May Day',
  // Jun 2026
  '2026-6-6':'Bakrid', '2026-06-06':'Bakrid',
  // Jul 2026
  '2026-7-6':'Muharram', '2026-7-24':'Karkidaka Vavu',
  '2026-07-06':'Muharram', '2026-07-24':'Karkidaka Vavu',
  // Aug 2026
  '2026-8-12':'Karkidaka Vavu', '2026-8-13':'1st Internal', '2026-8-14':'1st Internal',
  '2026-8-15':'Independence Day', '2026-8-17':'1st Internal', '2026-8-22':'Onam',
  '2026-8-23':'Onam', '2026-8-24':'Onam', '2026-8-25':'Onam', '2026-8-26':'Onam',
  '2026-8-27':'Onam', '2026-8-28':'Onam', '2026-8-29':'Sree Krishna Jayanthi', '2026-8-30':'Onam',
  '2026-08-12':'Karkidaka Vavu', '2026-08-13':'1st Internal', '2026-08-14':'1st Internal',
  '2026-08-15':'Independence Day', '2026-08-17':'1st Internal', '2026-08-22':'Onam',
  '2026-08-23':'Onam', '2026-08-24':'Onam', '2026-08-25':'Onam', '2026-08-26':'Onam',
  '2026-08-27':'Onam', '2026-08-28':'Onam', '2026-08-29':'Sree Krishna Jayanthi', '2026-08-30':'Onam',
  // Sep 2026
  '2026-9-1':'Thiruvonam', '2026-9-3':'Sree Narayana Guru Jayanthi', '2026-9-5':'Milad-i-Sherif', '2026-9-21':'Sree Narayana Guru Samadhi',
  '2026-09-01':'Thiruvonam', '2026-09-03':'Sree Narayana Guru Jayanthi', '2026-09-05':'Milad-i-Sherif', '2026-09-21':'Sree Narayana Guru Samadhi',
  // Oct 2026
  '2026-10-2':'Gandhi Jayanti', '2026-10-19':'Mahanavami', '2026-10-20':'Vijayadasami',
  // Nov 2026
  '2026-11-8':'Deepavali',
  // Dec 2026
  '2026-12-25':'Christmas'
};

const SUN_ICO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
const MOON_ICO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

const esc=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const absUrl=p=>/^https?:/i.test(p||'')?p:BASE_URL+(p||'');
const isDash=()=>{const p=location.pathname;return p==='/'||p==='/student'||p==='/student/'||p.includes('/dashboard')||p.includes('/user/dashboard');};
const getPrefs=cb=>{try{chrome.storage.local.get({starredTiles:[],tileColors:{}},d=>cb(d.starredTiles||[],d.tileColors||{}));}catch(e){cb([],{});}};
const savePrefs=(s,c,cb)=>{try{chrome.storage.local.set({starredTiles:s,tileColors:c},cb);}catch(e){if(cb)cb();}};

function nq(q){const s=(q||'').toLowerCase().trim();if(!s)return'';if(/attend/.test(s))return'attendance';if(/result|mark|grade|cgpa/.test(s))return'results';if(/assign/.test(s))return'assignments';if(/timetab|sched/.test(s))return'timetable';if(/mater|note|pdf/.test(s))return'materials';if(/fee|acc/.test(s))return'accounts';if(/hostel/.test(s))return'hostel attendance';return s;}

function ico(t){t=(t||'').toLowerCase();
  if(t.includes('dashboard')||t.includes('home'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>';
  if(t.includes('hostel attend'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
  if(t.includes('attend'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
  if(t.includes('timetable')||t.includes('schedule'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
  if(t.includes('assign'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
  if(t.includes('material')||t.includes('note')||t.includes('manual'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>';
  if(t.includes('result')||t.includes('cgpa'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>';
  if(t.includes('account')||t.includes('fee')||t.includes('wallet'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16"/><path d="M1 10h22"/></svg>';
  if(t.includes('certificate'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><path d="M7 7h10M7 12h10M7 17h6"/></svg>';
  if(t.includes('gate'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  if(t.includes('quiz')||t.includes('exam'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>';
  if(t.includes('hostel leave'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
  if(t.includes('placement'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
  if(t.includes('profile'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  if(t.includes('message'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  if(t.includes('logout'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
  if(t.includes('password')||t.includes('reset'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  if(t.includes('live')||t.includes('video'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14"/></svg>';
  if(t.includes('project'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
  if(t.includes('circular'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  if(t.includes('activity'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>';
  if(t.includes('club'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  if(t.includes('mooc'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>';
  if(t.includes('remark'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  if(t.includes('survey'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';
  if(t.includes('challenge'))return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  return'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
}

// ── THEME ─────────────────────────────────────────────────────
function syncTheme(theme){
  _theme=(theme==='dark')?'dark':'light';
  document.documentElement.classList.toggle('etlab-reskin-light',_theme==='light');
  const pill=document.querySelector('#rk-theme-pill');
  if(pill) pill.innerHTML='<span class="rk-tp-ico">'+(_theme==='dark'?SUN_ICO:MOON_ICO)+'</span>';
}
function cycleTheme(){
  const n=_theme==='dark'?'light':'dark';
  syncTheme(n);
  try{chrome.storage.local.set({theme:n});}catch(e){}
}

// ── SIDEBAR ───────────────────────────────────────────────────
function reskinSidebar(){
  const sb=document.querySelector('#sidebar,.sidebar,#main-container>.sidebar');
  if(!sb||sb.querySelector('.rk-sb-peek'))return;
  // Save original sidebar HTML before we destroy it
  if(!_origSidebarHTML) _origSidebarHTML=sb.innerHTML;
  sb.classList.add('etlab-reskin-sidebar');

  let userName='',logoutHref='/user/logout',profileHref='/student/profile';
  const uNav=document.querySelector('#user-nav,.user-nav,.nav-user');
  if(uNav){
    const tog=uNav.querySelector('a.dropdown-toggle,.user-info,#user_info,.dropdown-toggle');
    if(tog){
      const cl=tog.cloneNode(true);
      cl.querySelectorAll('span.badge,i,svg,img').forEach(e=>e.remove());
      const raw=cl.textContent.replace(/logout|message|sent items|inbox/gi,'').trim();
      const clean=raw.replace(/[^a-zA-Z\s.]/g,'').replace(/\s+/g,' ').trim();
      if(clean.length>2){userName=clean;_cachedUserName=clean;}
    }
    uNav.querySelectorAll('a[href]').forEach(a=>{
      const h=a.getAttribute('href')||'',tx=a.textContent.trim().toLowerCase();
      if(h.includes('logout')||tx.includes('logout'))logoutHref=h;
      if(h.includes('profile')||h.includes('user/view'))profileHref=h;
    });
    uNav.style.display='none';
  }

  const linkMap = {};
  if (_origSidebarHTML) {
    const temp = document.createElement('div');
    temp.innerHTML = _origSidebarHTML;
    temp.querySelectorAll('a[href]').forEach(a => {
      const text = a.textContent.trim().toLowerCase();
      const href = a.getAttribute('href') || '';
      if (href) {
        if (text.includes('dashboard') || text.includes('home')) linkMap['dashboard'] = href;
        else if (text.includes('attendance')) linkMap['attendance'] = href;
        else if (text.includes('result') || text.includes('cgpa')) linkMap['results'] = href;
        else if (text.includes('timetable') || text.includes('schedule') || text.includes('time table')) linkMap['timetable'] = href;
        else if (text.includes('assignment')) linkMap['assignments'] = href;
        else if (text.includes('material') || text.includes('study')) linkMap['materials'] = href;
        else if (text.includes('manual') || text.includes('guide')) linkMap['manual'] = href;
      }
    });
  }

  const NAV=[
    {t:'Dashboard',h:linkMap['dashboard'] || '/user/dashboard'},
    {t:'Attendance',h:linkMap['attendance'] || '/student/attendance'},
    {t:'Results',h:linkMap['results'] || '/student/results'},
    {t:'TimeTable',h:linkMap['timetable'] || '/student/timetable'},
    {t:'Assignments',h:linkMap['assignments'] || '/student/assignments'},
    {t:'Materials',h:linkMap['materials'] || '/student/materials'},
    {t:'User Manual',h:linkMap['manual'] || '/student/usermanual'},
  ];
  const cur=location.pathname;
  const curBase=cur.replace(/\/+\d+$/,'').replace(/\/+$/,'')||'/';
  const isAct=h=>{
    const base=h.split('?')[0].replace(/\/+\d+$/,'').replace(/\/+$/,'')||'/';
    return cur===h||curBase===base||curBase.startsWith(base+'/');
  };

  const navHtml=NAV.map(l=>{
    const active=isAct(l.h)?' rk-sb-active':'';
    return '<a href="'+esc(l.h)+'" class="rk-sb-link'+active+'">'
      +'<span class="rk-sb-ico">'+ico(l.t)+'</span>'
      +'<span class="rk-sb-lbl">'+esc(l.t)+'</span>'
      +'</a>';
  }).join('');

  sb.innerHTML=
    '<div class="rk-sb-peek">'
      +'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">'
        +'<path d="M3 12h18M3 6h18M3 18h18"/>'
      +'</svg>'
    +'</div>'
    +'<div class="rk-sb-inner">'
      +'<a href="'+esc(profileHref)+'" class="rk-sb-profile">'
        +'<div class="rk-sb-avatar" id="rk-sb-avatar">'+(userName?userName.charAt(0).toUpperCase():'S')+'</div>'
        +'<span class="rk-sb-username">'+esc(userName||'Student')+'</span>'
      +'</a>'
      +'<div class="rk-sb-actions">'
        +'<a href="/user/changepassword" class="rk-sb-act">'+ico('password')+'<span>Reset Password</span></a>'
        +'<a href="'+esc(logoutHref)+'" class="rk-sb-act rk-sb-logout">'+ico('logout')+'<span>Logout</span></a>'
      +'</div>'
      +'<div class="rk-sb-sep"></div>'
      +'<nav class="rk-sb-nav">'+navHtml+'</nav>'
    +'</div>';

  _loadAvatar(sb,userName);
}

function _loadAvatar(sb,uName){
  const li=document.querySelector('#user-nav img,.user-nav img,img.profile_img,img.profile-pic,img.avatar,img[src*="user_photo"]');
  const ls=li?.getAttribute('src')?.trim();
  if(ls&&/avatar|profile|user|photo/i.test(ls)&&!/icon|logo|banner/i.test(ls)){_setAvatar(sb,absUrl(ls));return;}
  if(_avatarCache?.url){_setAvatar(sb,_avatarCache.url);return;}
  fetch(BASE_URL+'/student/profile',{credentials:'include',cache:'no-store'})
    .then(r=>r.ok?r.text():'')
    .then(html=>{
      if(!html)return;
      const doc=new DOMParser().parseFromString(html,'text/html');
      const pick=doc.querySelector('img#photo,img.profile_img,img.profile-pic,img.avatar,img[src*="users/"],img[src*="user_photo"],img[src*="profile"]');
      let url=pick?.getAttribute('src')||'';
      if(!url){
        doc.querySelectorAll('img[src]').forEach(img=>{
          const s=img.getAttribute('src')||'';
          if(/\/(users|profile|upload|avatar|student|photos?)/i.test(s)&&/\.(jpg|jpeg|png|webp)/i.test(s)&&!/logo|icon|banner/i.test(s)){
            if(!url||s.length<url.length)url=s;
          }
        });
      }
      if(url){const full=absUrl(url);_avatarCache={url:full};_setAvatar(sb,full);}
    }).catch(()=>{});
}
function _setAvatar(sb,url){
  const av=sb.querySelector('#rk-sb-avatar');
  if(av)av.innerHTML='<img src="'+esc(url)+'" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">';
}

// ── HOSTEL & CALENDAR DATA SCRAPER ────────────────────────────
let _calCache = {}; // key: "year-month" -> { absents: Set, holidays: Map }
let _calLoading = {}; // key: "year-month" -> Promise

function parseHostelAbsentFromDoc(doc) {
  const days = new Set();
  if (!doc) return days;

  const container = doc.querySelector('.calendar-container, .calendar, #calendar, .widget-main');
  if (!container) return days;

  container.querySelectorAll('td, div, li, p, span').forEach(el => {
    if (el.children.length > 2) return;
    const text = el.textContent.trim();
    if (!text || text.length > 40) return;

    const m = text.match(/^(\d{1,2})\s*absent/i) || text.match(/^(\d{1,2})\b[\s\S]{0,10}\babsent\b/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= 31) days.add(n);
    }
  });

  return days;
}

async function fetchHostelAbsentFor(year, month) {
  try {
    const baseRes = await fetch(BASE_URL + '/hostel/student/viewhostelattendance', {credentials: 'include', cache: 'no-store'});
    if (!baseRes.ok) return new Set();
    const htmlText = await baseRes.text();
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');

    if (doc.querySelector('input[name*="LoginForm"]') || doc.title.toLowerCase().includes('login')) {
      return new Set();
    }

    const baseDays = parseHostelAbsentFromDoc(doc);
    if (baseDays.size > 0) return baseDays;
    
    const form = doc.querySelector('form[action*="viewhostelattendance"], form[action*="attendance"], form');
    let targetUrl = BASE_URL + '/hostel/student/viewhostelattendance';
    let method = 'GET';
    let params = new URLSearchParams();
    
    if (form) {
      const actionAttr = form.getAttribute('action');
      if (actionAttr) targetUrl = absUrl(actionAttr);
      method = (form.getAttribute('method') || 'GET').toUpperCase();
      
      form.querySelectorAll('input, select').forEach(el => {
        const name = el.getAttribute('name');
        if (!name) return;
        let val = el.value || '';
        if (/month/i.test(name)) val = String(month + 1);
        else if (/year/i.test(name)) val = String(year);
        params.append(name, val);
      });
    } else {
      params.append('month', String(month + 1));
      params.append('year', String(year));
    }
    
    let fetchUrl = targetUrl;
    let fetchOpts = { credentials: 'include' };
    if (method === 'POST') {
      fetchOpts.method = 'POST';
      fetchOpts.body = params;
    } else {
      fetchUrl = targetUrl + '?' + params.toString();
    }
    
    const r = await fetch(fetchUrl, fetchOpts);
    if (!r.ok) return new Set();
    
    const resDoc = new DOMParser().parseFromString(await r.text(), 'text/html');
    return parseHostelAbsentFromDoc(resDoc);
  } catch(e) {
    return new Set();
  }
}

function isCleanEvent(t) {
  if (!t || t.length < 2) return false;
  if (/absent|present|notification|click|see the|view/i.test(t)) return false;
  return true;
}

function parseCollegeDoc(doc, data) {
  if (!doc) return;

  // 1. jQuery UI Datepicker calendar (.ui-datepicker-inline, .ui-datepicker-calendar)
  doc.querySelectorAll('.ui-datepicker-calendar, .ui-datepicker-inline table, .ui-datepicker table').forEach(table => {
    table.querySelectorAll('tbody td, tr td').forEach(td => {
      const a = td.querySelector('a, span');
      const text = (a ? a.textContent : td.textContent).trim();
      const dayNum = parseInt(text, 10);
      if (!dayNum || isNaN(dayNum) || dayNum < 1 || dayNum > 31) return;

      const title = td.getAttribute('title') || a?.getAttribute('title') || td.getAttribute('data-event') || '';
      if (isCleanEvent(title)) {
        data.holidays[dayNum] = title.trim();
      }

      if (/absent|danger|bg-red/i.test(td.className)) {
        data.collegeAbsents.add(dayNum);
      }
    });
  });

  // 2. Standard calendar tables
  doc.querySelectorAll('table.calendar, table.cal, table[class*="cal"], .widget-main table, .calendar-table').forEach(table => {
    table.querySelectorAll('tbody td, tr td').forEach(td => {
      if (td.closest('thead, tfoot')) return;
      const textContent = td.textContent.replace(/\s+/g, ' ').trim();
      const m = textContent.match(/^(\d{1,2})\b/);
      if (!m) return;
      const dayNum = parseInt(m[1], 10);
      if (dayNum < 1 || dayNum > 31) return;

      const hasAbsentClass = /absent|danger|bg-red/i.test(td.className);
      const hasAbsentBadge = !!td.querySelector('.badge-danger, .label-danger, .absent');
      if (hasAbsentClass || hasAbsentBadge) {
        data.collegeAbsents.add(dayNum);
      }

      let eventText = '';
      const evEl = td.querySelector('a, em, span[class*="event"], div[class*="event"], .badge, .label');
      if (evEl && isCleanEvent(evEl.textContent)) {
        eventText = evEl.textContent.trim();
      } else {
        const raw = textContent.replace(new RegExp('^' + dayNum), '').trim();
        if (isCleanEvent(raw)) {
          eventText = raw;
        }
      }

      if (isCleanEvent(eventText)) {
        data.holidays[dayNum] = eventText;
      }
    });
  });
}

async function fetchCollegeCalendarFor(year, month) {
  const data = { holidays: {}, collegeAbsents: new Set() };
  const m1 = month + 1;

  for (const key in HMAP) {
    const parts = key.split('-').map(Number);
    if (parts.length === 3) {
      const [hY, hM, hD] = parts;
      if (hY === year && hM === m1) {
        data.holidays[hD] = HMAP[key];
      }
    }
  }

  // Always parse the live page DOM first (has current ETLab data)
  if (isDash()) {
    parseCollegeDoc(document, data);
  }

  const padMonth = String(m1).padStart(2, '0');
  const urls = [
    BASE_URL + '/user/dashboard?date=' + year + '-' + padMonth + '-01',
    BASE_URL + '/user/dashboard?month=' + m1 + '&year=' + year,
    BASE_URL + '/student?month=' + m1 + '&year=' + year,
    BASE_URL + '/ktuacademics/student/academiccalendar'
  ];

  for (const url of urls) {
    try {
      const r = await fetch(url, { credentials: 'include', cache: 'no-store' });
      if (r.ok) {
        const text = await r.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        parseCollegeDoc(doc, data);
      }
    } catch(e) {}
  }

  return data;
}

async function fetchEventsAndAbsentsFor(year, month, forceRefresh) {
  const key = year + '-' + month;
  if (!forceRefresh && _calCache[key]) return _calCache[key];
  if (_calLoading[key]) return _calLoading[key];

  _calLoading[key] = (async () => {
    const data = { absents: new Set(), collegeAbsents: new Set(), holidays: {} };

    try {
      const [collegeData, hostelAbsents] = await Promise.all([
        fetchCollegeCalendarFor(year, month),
        fetchHostelAbsentFor(year, month)
      ]);

      data.holidays = collegeData.holidays || {};
      data.collegeAbsents = collegeData.collegeAbsents || new Set();
      data.absents = hostelAbsents || new Set();
    } catch(e) {}

    _calCache[key] = data;
    delete _calLoading[key];
    return data;
  })();

  return _calLoading[key];
}

function prefetchSurroundingMonths(currentYear, currentMonth) {
  // Disabled: Current month only
}

// ── CALENDAR ──────────────────────────────────────────────────
let _calSelectedDay = null;

function buildCalGrid(year,month){
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const prevMonthDays=new Date(year,month,0).getDate();
  const grid=[];let week=[];

  // Previous month trailing days for top row
  for(let i=firstDay-1;i>=0;i--){
    week.push({ d: prevMonthDays - i, other: true });
  }

  // Current month days
  for(let d=1;d<=daysInMonth;d++){
    week.push({ d: d, other: false });
    if(week.length===7){grid.push(week);week=[];}
  }

  // Next month leading days
  if(week.length){
    let nextD=1;
    while(week.length<7){
      week.push({ d: nextD++, other: true });
    }
    grid.push(week);
  }
  return grid;
}

function renderCalMonth(el, forceRefresh){
  if(!el)return;
  const now=new Date(),todayD=now.getDate(),todayM=now.getMonth(),todayY=now.getFullYear();
  if (_calYear === undefined || _calYear === null) {
    _calYear = todayY;
    _calMonth = todayM;
  }
  const grid=buildCalGrid(_calYear,_calMonth);
  const key = _calYear + '-' + _calMonth;
  const cache = _calCache[key];
  const isLoading = !!_calLoading[key];

  let rows='';
  grid.forEach(week=>{
    rows+='<tr>';
    week.forEach(cell=>{
      if(cell.other){
        rows+='<td class="rk-cc rk-other-month"><b>'+cell.d+'</b></td>';
        return;
      }
      const n=cell.d;
      const isToday=n===todayD&&_calMonth===todayM&&_calYear===todayY;
      const isSelected=_calSelectedDay===n;
      const hol=cache?.holidays?.[n] || null;
      const cabsent=cache?.collegeAbsents?.has(n) || false;
      const habsent=cache?.absents?.has(n) || false;
      let cls='rk-cc';
      if(isToday)cls+=' today';
      if(isSelected)cls+=' selected';
      if(hol||cabsent||habsent)cls+=' event';

      let inner = '<b>'+n+'</b>';
      if(hol) inner += '<em>'+esc(hol)+'</em>';
      if(cabsent) inner += '<em class="abs">College Absent</em>';
      if(habsent) inner += '<em class="abs">Hostel Absent</em>';

      rows+='<td class="'+cls+'" data-day="'+n+'" role="button" title="Click to view details">'+inner+'</td>';
    });
    rows+='</tr>';
  });

  const titleSuffix = isLoading ? ' <span style="font-size:0.68rem;font-weight:normal;color:var(--text-m)">⌛</span>' : '';

  el.innerHTML=
    '<div class="rk-cal-h">'
      +'<span class="rk-cal-title">'+MONTHS[_calMonth]+' '+_calYear+titleSuffix+'</span>'
    +'</div>'
    +'<div class="rk-cal-leg">'
      +'<span><i class="rk-dot-today"></i>Today</span>'
      +'<span><i class="rk-dot-abs"></i>Holiday/Absent</span>'
    +'</div>'
    +'<table class="rk-cal"><thead><tr>'+DHDRS.map(d=>'<th>'+d+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="rk-cal-preview" id="rk-cal-preview"></div>';

  const previewEl = el.querySelector('#rk-cal-preview');

  const updatePreview = (day) => {
    if (!previewEl) return;
    if (!day) {
      previewEl.innerHTML = '';
      previewEl.classList.remove('rk-cp-open');
      return;
    }
    const dateObj = new Date(_calYear, _calMonth, day);
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = dayNames[dateObj.getDay()];
    const isToday = day === todayD && _calMonth === todayM && _calYear === todayY;
    const hol = cache?.holidays?.[day] || null;
    const cabsent = cache?.collegeAbsents?.has(day) || false;
    const habsent = cache?.absents?.has(day) || false;
    const isSunday = dateObj.getDay() === 0;

    let itemsHtml = '';
    if (hol) {
      itemsHtml += '<div class="rk-cp-item rk-cp-hol"><svg class="rk-cp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><div><b>Holiday:</b> '+esc(hol)+'</div></div>';
    }
    if (cabsent) {
      itemsHtml += '<div class="rk-cp-item rk-cp-abs"><svg class="rk-cp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><div><b>College Attendance:</b> Marked Absent</div></div>';
    }
    if (habsent) {
      itemsHtml += '<div class="rk-cp-item rk-cp-habs"><svg class="rk-cp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg><div><b>Hostel Attendance:</b> Marked Absent / Leave</div></div>';
    }
    if (isSunday && !hol) {
      itemsHtml += '<div class="rk-cp-item rk-cp-weekend"><svg class="rk-cp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><div><b>Weekend:</b> College Holiday</div></div>';
    }
    if (!hol && !cabsent && !habsent && !isSunday) {
      itemsHtml += '<div class="rk-cp-item rk-cp-regular"><svg class="rk-cp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><div><b>College Working Day:</b> Regular classes</div></div>';
    }

    const todayBadge = isToday ? '<span class="rk-cp-today-tag">Today</span>' : '';

    previewEl.innerHTML =
      '<div class="rk-cp-header">'
        +'<div class="rk-cp-title-wrap">'
          +'<span class="rk-cp-date">'+dayName+', '+day+' '+MONTHS[_calMonth]+' '+_calYear+'</span>'
          +todayBadge
        +'</div>'
        +'<button type="button" class="rk-cp-close" title="Close preview">&#x2715;</button>'
      +'</div>'
      +'<div class="rk-cp-list">'+itemsHtml+'</div>';

    previewEl.classList.add('rk-cp-open');

    previewEl.querySelector('.rk-cp-close')?.addEventListener('click', () => {
      _calSelectedDay = null;
      el.querySelectorAll('td.rk-cc.selected').forEach(td => td.classList.remove('selected'));
      updatePreview(null);
    });
  };

  if (_calSelectedDay) {
    updatePreview(_calSelectedDay);
  }

  el.querySelectorAll('td.rk-cc[data-day]').forEach(td => {
    td.addEventListener('click', () => {
      const d = parseInt(td.getAttribute('data-day'), 10);
      if (_calSelectedDay === d) {
        _calSelectedDay = null;
        td.classList.remove('selected');
        updatePreview(null);
      } else {
        _calSelectedDay = d;
        el.querySelectorAll('td.rk-cc.selected').forEach(cell => cell.classList.remove('selected'));
        td.classList.add('selected');
        updatePreview(d);
      }
    });
  });

  if (forceRefresh || (!cache && !isLoading)) {
    fetchEventsAndAbsentsFor(_calYear, _calMonth, forceRefresh).then(() => {
      renderCalMonth(el, false);
    });
  }
}

function renderCal(el){_calEl=el;renderCalMonth(el, true);}

// ── STATS: ATTENDANCE & ACTIVITY POINTS ───────────────────────
function renderStats(el){
  el.innerHTML=
    '<div class="rk-att-panel">'
      +'<div class="rk-att-header">'
        +'<span class="rk-att-title">Attendance</span>'
        +'<span class="rk-att-percent" id="rk-att-pct">--%</span>'
      +'</div>'
      +'<div class="rk-att-track"><div class="rk-att-fill" id="rk-att-bar"></div></div>'
      +'<div class="rk-att-footer">'
        +'<span class="rk-att-status" id="rk-att-status">Loading...</span>'
      +'</div>'
      +'<div class="rk-att-month-drop" id="rk-att-month-drop"></div>'
    +'</div>'
    +'<div class="rk-act-panel">'
      +'<div class="rk-att-header">'
        +'<span class="rk-att-title">Activity Points</span>'
        +'<span class="rk-act-percent" id="rk-act-pts">-- / 100</span>'
      +'</div>'
      +'<div class="rk-att-track"><div class="rk-att-fill rk-act-fill" id="rk-act-bar"></div></div>'
      +'<div class="rk-att-footer">'
        +'<span class="rk-act-status" id="rk-act-status">Loading points...</span>'
      +'</div>'
    +'</div>';

  const setDisplay=(tillPct, monthPct, monthLabel)=>{
    const p=Math.min(Math.max(Math.round(tillPct),0),100);
    const pE=el.querySelector('#rk-att-pct'),bE=el.querySelector('#rk-att-bar'),sE=el.querySelector('#rk-att-status');
    const dropEl=el.querySelector('#rk-att-month-drop');
    if(pE)pE.textContent=p+'%';
    if(bE){bE.style.width=p+'%';bE.style.background=p>=85?'#10b981':p>=75?'#f59e0b':'#ef4444';}
    if(sE){
      sE.textContent=p>=85?'Good Standing':p>=75?'Warning':'Critical';
      sE.style.color=p>=85?'var(--green-t)':p>=75?'var(--amber-t)':'var(--red-t)';
    }
    if(dropEl && monthPct!==null){
      const mp=Math.min(Math.max(Math.round(monthPct),0),100);
      const mColor=mp>=85?'#10b981':mp>=75?'#f59e0b':'#ef4444';
      dropEl.innerHTML=
        '<div class="rk-att-month-row">'
          +'<span class="rk-att-month-label">'+(monthLabel||'This Month')+'</span>'
          +'<span class="rk-att-month-val" style="color:'+mColor+'">'+mp+'%</span>'
        +'</div>'
        +'<div class="rk-att-month-track"><div class="rk-att-month-fill" style="width:'+mp+'%;background:'+mColor+'"></div></div>';
    }
  };

  const setActivityDisplay=(earned, target)=>{
    const pts=Math.max(0, earned);
    const tgt=target||100;
    const pct=Math.min(100, Math.round((pts/tgt)*100));
    const ptsEl=el.querySelector('#rk-act-pts');
    const barEl=el.querySelector('#rk-act-bar');
    const stEl=el.querySelector('#rk-act-status');
    if(ptsEl) ptsEl.textContent = pts + ' / ' + tgt;
    if(barEl){
      barEl.style.width = pct + '%';
      barEl.style.background = pts>=tgt ? '#10b981' : pts>=50 ? '#8b5cf6' : '#f59e0b';
    }
    if(stEl){
      if(pts >= tgt){
        stEl.textContent = '100 Point Target Reached 🎉';
        stEl.style.color = 'var(--green-t)';
      }else{
        stEl.textContent = (tgt - pts) + ' points remaining to 100';
        stEl.style.color = 'var(--text-m)';
      }
    }
  };

  // 1. Fetch live attendance
  fetch(BASE_URL+'/ktuacademics/student/attendance',{credentials:'include', cache:'no-store'}).then(r=>r.text()).then(html=>{
    const doc=new DOMParser().parseFromString(html,'text/html');
    let tillPct=null, monthPct=null, monthLabel='This Month';

    const footerCells = doc.querySelectorAll('table#itsthetable > tfoot th, table#itsthetable > tfoot td, table#itsthetable tfoot th, table#itsthetable tfoot td');
    footerCells.forEach(cell=>{
      const text = cell.textContent.trim();
      const tillMatch = text.match(/%\s*Till\s+(\w+)\s*[\n\r]+\s*(\d{1,3}(?:\.\d+)?)\s*%/i);
      if(tillMatch){
        tillPct = parseFloat(tillMatch[2]);
        monthLabel = 'Till ' + tillMatch[1];
      }
      const monthMatch = text.match(/%\s*For\s+the\s+month\s*[\n\r]+\s*(\d{1,3}(?:\.\d+)?)\s*%/i);
      if(monthMatch){
        monthPct = parseFloat(monthMatch[1]);
      }
    });

    if(tillPct===null){
      const tfoot = doc.querySelector('table#itsthetable tfoot, table tfoot');
      if(tfoot){
        const tfText = tfoot.textContent;
        const tillM = tfText.match(/Till\s+(\w+)\s*[:\s]*(\d{1,3}(?:\.\d+)?)\s*%/i);
        if(tillM) { tillPct = parseFloat(tillM[2]); monthLabel = 'Till ' + tillM[1]; }
        const monM = tfText.match(/For\s+the\s+month\s*[:\s]*(\d{1,3}(?:\.\d+)?)\s*%/i);
        if(monM) monthPct = parseFloat(monM[1]);
        if(tillPct===null){
          const allPcts = [...tfText.matchAll(/(\d{1,3}(?:\.\d+)?)\s*%/g)].map(m=>parseFloat(m[1])).filter(v=>v>=0&&v<=100);
          if(allPcts.length>=2){ monthPct=allPcts[0]; tillPct=allPcts[1]; }
          else if(allPcts.length===1){ tillPct=allPcts[0]; }
        }
      }
    }

    if(tillPct===null){
      doc.querySelectorAll('tr,div,p,span,th,td').forEach(row=>{
        if(tillPct!==null) return;
        const txt=row.textContent.replace(/\s+/g,' ').trim();
        if(/total\s*(attendance|percentage)|overall|aggregate/i.test(txt)){
          const m=txt.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
          if(m&&parseFloat(m[1])<=100) tillPct=parseFloat(m[1]);
        }
      });
    }

    setDisplay(tillPct??0, monthPct, monthLabel);
  }).catch(()=>setDisplay(0,null,null));

  // 2. Fetch live KTU activity points
  const actUrls = ['/activity/studentactivitypoint', '/ktuacademics/student/activitypoints', '/student/profile'];
  const fetchActivity = (idx = 0) => {
    if(idx >= actUrls.length){
      setActivityDisplay(0, 100);
      return;
    }
    fetch(BASE_URL + actUrls[idx], {credentials:'include', cache:'no-store'}).then(r => r.text()).then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      let total = null;

      // Check for total points rows/cells
      doc.querySelectorAll('tr, div, p, span, th, td, b').forEach(el => {
        if(total !== null) return;
        const txt = el.textContent.trim();
        const m = txt.match(/(?:Total|Earned|Approved|Cumulative)\s*(?:Activity)?\s*Points?\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
        if(m) total = parseFloat(m[1]);
      });

      // If in a table with points column, sum up or find footer
      if(total === null){
        const footers = doc.querySelectorAll('tfoot td, tfoot th, tr.total td');
        footers.forEach(f => {
          if(total !== null) return;
          const m = f.textContent.trim().match(/^(\d+(?:\.\d+)?)$/);
          if(m) total = parseFloat(m[1]);
        });
      }

      if(total !== null){
        setActivityDisplay(Math.round(total), 100);
      } else if(idx + 1 < actUrls.length) {
        fetchActivity(idx + 1);
      } else {
        setActivityDisplay(0, 100);
      }
    }).catch(() => {
      if(idx + 1 < actUrls.length) fetchActivity(idx + 1);
      else setActivityDisplay(0, 100);
    });
  };
  fetchActivity(0);
}



// ── FALLBACK LINKS ────────────────────────────────────────────
const FALLBACK_LINKS=[
  {title:'Attendance',href:'/student/attendance'},
  {title:'Results & CGPA',href:'/student/results'},
  {title:'Timetable',href:'/student/timetable'},
  {title:'Assignments',href:'/student/assignments'},
  {title:'Study Materials',href:'/student/materials'},
  {title:'Academic Analysis',href:'/ktuacademics/student/studentacademics'},
  {title:'Activity Points',href:'/activity/studentactivitypoint'},
  {title:'Hostel Attendance',href:'/hostel/student/viewhostelattendance'},
  {title:'Hostel Leaves',href:'/hostel/student/applyleave/25050'},
  {title:'Accounts & Fees',href:'/fees/student/pay?ft=Y2Z6V2VQN0dNQ1RzaWFSc3M0bnNYUT09'},
  {title:'Certificate Request',href:'/certificate/default/RequestCertificate'},
  {title:'Challenge Courses',href:'/challengecourse/student/courses'},
  {title:'Circulars',href:'/student/circulars'},
  {title:'My Clubs',href:'/club/default/clubstudent'},
  {title:'Downloads',href:'/certificate/certificateform/downloadcertificate'},
  {title:'Exam Schedule',href:'/student/examschedule'},
  {title:'Exam / Quiz',href:'/quiz/student'},
  {title:'Gate Pass',href:'/user/viewgatepassrequest'},
  {title:'Grievance',href:'/grievance/user/grievance'},
  {title:'Homeworks',href:'/student/homework'},
  {title:'Laboratory',href:'/laboratary/default/laboratary'},
  {title:'Live Class',href:'/livetv/default/live'},
  {title:'Module Test',href:'/student/moduletest'},
  {title:'MOOC Certificates',href:'/mooc/mooccertificates'},
  {title:'MOOC Registration',href:'/mooc/moocregistrations'},
  {title:'Online Video Class',href:'/ktuacademics/student/onlinevideolink'},
  {title:'Placements',href:'/student/dashboardplacement'},
  {title:'Program Outcomes',href:'/student/programoutcome'},
  {title:'Project',href:'/student/projects'},
  {title:'Question Bank',href:'/questionbank/student/materials'},
  {title:'Remarks',href:'/student/remarks'},
  {title:'Series Exam',href:'/student/seriesexam'},
  {title:'Subject',href:'/student/subject'},
  {title:'Survey',href:'/survey/user/viewall'},
  {title:'Tutorials',href:'/student/tutorial'},
  {title:'Video Lectures',href:'/video/default/videos'},
  {title:'Wallet',href:'/wallet/student/index?type=Y2Z6V2VQN0dNQ1RzaWFSc3M0bnNYUT09'},
  {title:'End Semester Exam',href:'/universityexam/student/dashboard'},
  {title:'User Manual',href:'/student/usermanual'},
];

// ── THEMED GREETER ───────────────────────────────────────────
function getGreetingHtml(name){
  const now=new Date();
  const hr=now.getHours();
  const timeWord=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const cleanName=(name&&name.trim().length>1)?name.trim().split(/\s+/)[0]:'';
  const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayName=dayNames[now.getDay()];
  const dateStr=dayName+', '+now.getDate()+' '+MONTHS[now.getMonth()];

  return '<div class="rk-greeter-main">'
    +'<div class="rk-greeter-salute">'+timeWord+(cleanName?', <span class="rk-greeter-name">'+esc(cleanName)+'</span>':'')+'</div>'
    +'<div class="rk-greeter-date">'+dateStr+'</div>'
    +'</div>';
}

// ── TILE CATEGORIZATION ───────────────────────────────────────
function getTileCategory(title, href){
  const t=((title||'')+' '+(href||'')).toLowerCase();
  if(/hostel|mess|leave/i.test(t)) return 'hostel';
  if(/placement|career|nss|club|activity|sport|mooc|internship|project/i.test(t)) return 'extra';
  if(/account|fee|pay|receipt|certificate|gate pass|circular|grievance|feedback|manual|profile|password|survey|wallet|download/i.test(t)) return 'college';
  return 'academic'; // default: study materials, assignments, homework, timetable, results, syllabus, exam, etc.
}

// ── DASHBOARD TILES ───────────────────────────────────────────
function extractDashboard(){
  if(!isDash())return;
  if(!_cachedLinks){
    const scraped=[];
    document.querySelectorAll('a[href]').forEach(a=>{
      if(a.closest('#sidebar,.sidebar,.etlab-reskin-sidebar,#rk-wrap'))return;
      const href=a.getAttribute('href')||'';
      if(!href||href==='#'||href.startsWith('javascript:'))return;
      const titleEl=a.querySelector('.title,span,p');
      let title=(titleEl?titleEl.textContent:a.textContent).replace(/[\u2606\u2605\u25cf\u2715\u25c9]/g,'').replace(/\s+/g,' ').trim();
      if(!title||title.length<2||title.length>50)return;
      if(/^(x|view|home|dashboard|logout|login|messages|sent items|profile)$/i.test(title))return;
      const half=Math.floor(title.length/2);
      if(title.length>6&&title.slice(0,half)===title.slice(half))title=title.slice(0,half).trim();
      if(!scraped.some(l=>l.href===href||l.title.toLowerCase()===title.toLowerCase()))scraped.push({href,title});
    });
    _cachedLinks=scraped.length>5?scraped:FALLBACK_LINKS;
  }

  document.getElementById('rk-wrap')?.remove();
  document.querySelectorAll('#breadcrumbs,.breadcrumbs,.page-header,[class*="space-"],.ui-sortable').forEach(e=>{e.style.display='none';});
  const container=document.querySelector('.main-content,#page-content,.page-content,#content,.span9,.col-md-9,.container-fluid');
  if(!container)return;
  Array.from(container.children).forEach(c=>{if(c.id!=='rk-wrap')c.style.display='none';});

  const wrap=document.createElement('div');
  wrap.id='rk-wrap';
  container.insertBefore(wrap,container.firstChild);

  getPrefs((starred,colors)=>{
    const sorted=[..._cachedLinks].sort((a,b)=>{
      const as=starred.includes(a.href),bs=starred.includes(b.href);
      if(as&&!bs)return-1;if(!as&&bs)return 1;
      return a.title.localeCompare(b.title);
    });

    const tilesHtml=sorted.map(l=>{
      const COLOR_CLASSES = {
        '#2563eb': 'blue',
        '#10b981': 'green',
        '#f59e0b': 'amber',
        '#ec4899': 'pink',
        '#8b5cf6': 'purple',
        '#06b6d4': 'cyan'
      };

      const isStar=starred.includes(l.href);
      const cc=colors[l.href]||'';
      const clrClass=COLOR_CLASSES[cc] ? ' rk-c-' + COLOR_CLASSES[cc] : '';
      const cStyle=cc && !COLOR_CLASSES[cc] ? 'border-left-color:'+cc+'!important;' : '';
      const cat=getTileCategory(l.title, l.href);

      return '<a href="'+esc(l.href)+'"'
        +' class="rk-tile'+(isStar?' starred':'')+clrClass+'"'
        +' data-t="'+esc(l.title.toLowerCase())+'"'
        +' data-k="'+esc(l.href)+'"'
        +' data-cat="'+esc(cat)+'"'
        +' style="'+cStyle+'">'
        +'<span class="rk-tile-ico">'+ico(l.title)+'</span>'
        +'<span class="rk-tile-name">'+esc(l.title)+'</span>'
        +'<span class="rk-tile-acts">'
          +'<button type="button" class="rk-abtn rk-star'+(isStar?' rk-on':'')+'" data-k="'+esc(l.href)+'">'+(isStar?'\u2605':'\u2606')+'</button>'
          +'<button type="button" class="rk-abtn rk-clr" data-k="'+esc(l.href)+'">\u25cf</button>'
          +'<span class="rk-pal">'
            +'<i class="rk-sw" data-c="#2563eb" style="background:#2563eb"></i>'
            +'<i class="rk-sw" data-c="#10b981" style="background:#10b981"></i>'
            +'<i class="rk-sw" data-c="#f59e0b" style="background:#f59e0b"></i>'
            +'<i class="rk-sw" data-c="#ec4899" style="background:#ec4899"></i>'
            +'<i class="rk-sw" data-c="#8b5cf6" style="background:#8b5cf6"></i>'
            +'<i class="rk-sw" data-c="#06b6d4" style="background:#06b6d4"></i>'
            +'<i class="rk-sw rk-sw-reset" data-c="">&#x2715;</i>'
          +'</span>'
        +'</span>'
      +'</a>';
    }).join('');

    wrap.innerHTML=
      '<div class="rk-greeter">'
        +getGreetingHtml(_cachedUserName)
      +'</div>'
      +'<div class="rk-search-wrap">'
        +'<div class="rk-search">'
          +'<div class="rk-search-badge">'
            +'<svg class="rk-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">'
              +'<circle cx="11" cy="11" r="7"/><path d="m21 21-5-5"/>'
            +'</svg>'
          +'</div>'
          +'<svg class="rk-search-scoop" viewBox="0 0 84 50" preserveAspectRatio="none">'
            +'<path d="M 84,6 C 68,6 58,15 54,25 C 49,38 39,40 32,40 C 22,40 16,38 12,28 C 9,20 5,22 4,28 C 2,36 4,46 14,50 L 84,50 Z"/>'
          +'</svg>'
          +'<div class="rk-search-body">'
            +'<input type="text" id="rk-sinput" placeholder="Search..." autocomplete="off" spellcheck="false">'
            +'<button type="button" id="rk-sx" class="rk-sx" aria-label="Clear">&#x2715;</button>'
          +'</div>'
        +'</div>'
      +'</div>'
      +'<div class="rk-layout">'
        +'<div class="rk-tiles-col"><div class="rk-tiles" id="rk-tiles">'+tilesHtml+'</div></div>'
        +'<div class="rk-side-col">'
          +'<div class="rk-card" id="rk-cal"></div>'
          +'<div class="rk-card" id="rk-stats"></div>'
        +'</div>'
      +'</div>';

    const inp=wrap.querySelector('#rk-sinput');
    const xBtn=wrap.querySelector('#rk-sx');
    const badge=wrap.querySelector('.rk-search-badge');
    if(badge) badge.addEventListener('click',()=>focusSearchPop());

    const doFilter=()=>{
      const q=(inp.value||'').toLowerCase().trim();
      const nqv=nq(q);
      xBtn.style.display=q?'flex':'none';
      wrap.querySelectorAll('.rk-tile').forEach(t=>{
        const tt=t.getAttribute('data-t')||'';
        if(!q){t.classList.remove('rk-hidden');return;}
        const kws=SKW[tt]||[tt];
        const ok=tt.includes(q)||tt.includes(nqv)||kws.some(k=>k.includes(q)||q.includes(k));
        t.classList.toggle('rk-hidden',!ok);
      });
    };
    inp.addEventListener('input',doFilter);
    xBtn.addEventListener('click',()=>{inp.value='';doFilter();inp.focus();});

    if(location.hash==='#search'||location.search.includes('focus=search')){
      setTimeout(()=>{
        focusSearchPop();
        if(location.hash==='#search') history.replaceState(null,'',location.pathname+location.search);
      },150);
    }

    wrap.querySelectorAll('.rk-star').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const k=btn.getAttribute('data-k');
        let ns=[...starred];
        if(ns.includes(k))ns=ns.filter(x=>x!==k);else ns.push(k);
        savePrefs(ns,colors,extractDashboard);
      });
    });

    wrap.querySelectorAll('.rk-clr').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const pal=btn.nextElementSibling;if(!pal)return;
        const open=pal.classList.contains('rk-pal-open');
        wrap.querySelectorAll('.rk-pal').forEach(p=>p.classList.remove('rk-pal-open'));
        if(!open)pal.classList.add('rk-pal-open');
      });
    });

    wrap.querySelectorAll('.rk-sw').forEach(sw=>{
      sw.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const tile=sw.closest('.rk-tile');if(!tile)return;
        const k=tile.getAttribute('data-k');
        const c=sw.getAttribute('data-c');
        const nc={...colors};
        if(c)nc[k]=c;else delete nc[k];
        savePrefs(starred,nc,extractDashboard);
      });
    });

    if(!_globalClicked){
      _globalClicked=true;
      document.addEventListener('click',e=>{
        if(!e.target.closest('.rk-tile-acts'))
          document.querySelectorAll('.rk-pal').forEach(p=>p.classList.remove('rk-pal-open'));
      });
    }

    const cal=wrap.querySelector('#rk-cal');
    renderCal(cal);
    prefetchSurroundingMonths(_calYear, _calMonth);
    renderStats(wrap.querySelector('#rk-stats'));
  });
}

// ── FOOTER ────────────────────────────────────────────────────
function removeFooter(){
  document.querySelectorAll('.footer,#footer').forEach(e=>e.remove());
  document.querySelectorAll('body>div>div').forEach(e=>{
    if(e.textContent?.includes('Etuwa Concepts')||e.textContent?.includes('Page Generated'))e.remove();
  });
}

// ── APPLY / UNAPPLY ───────────────────────────────────────────
function apply(){
  document.documentElement.classList.add('etlab-reskin-on');
  document.body?.classList.add('etlab-reskin-on');
  document.body?.classList.toggle('rk-dash-page',isDash());
  // Always re-apply the stored theme so dark/light persists across toggles
  syncTheme(_theme);
  reskinSidebar();
  removeFooter();
  if(isDash())extractDashboard();
  addDashToggle();
}

// ── DASHBOARD TOGGLE BUTTON (circular, spins on click) ────────
function addDashToggle(){
  let wrap=document.getElementById('rk-toggle-wrap');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='rk-toggle-wrap';

    // Floating Pill Menu (slides out behind toggle button on hover)
    const pillMenu=document.createElement('div');
    pillMenu.id='rk-pill-menu';

    // Search button
    const searchBtn=document.createElement('button');
    searchBtn.id='rk-pill-search';
    searchBtn.className='rk-pill-btn';
    searchBtn.type='button';
    searchBtn.title='Search (Ctrl+K)';
    searchBtn.innerHTML=
      '<span class="rk-tp-ico">'
        +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">'
          +'<circle cx="11" cy="11" r="7"/><path d="m21 21-5-5"/>'
        +'</svg>'
      +'</span>';
    searchBtn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      focusSearchPop();
    });
    pillMenu.appendChild(searchBtn);

    // Separator 1
    const sep1=document.createElement('span');
    sep1.className='rk-pill-sep';
    pillMenu.appendChild(sep1);

    // Home button
    const homeBtn=document.createElement('a');
    homeBtn.id='rk-pill-home';
    homeBtn.className='rk-pill-btn';
    homeBtn.href='/user/dashboard';
    homeBtn.title='Dashboard';
    homeBtn.innerHTML=
      '<span class="rk-tp-ico">'
        +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">'
          +'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
          +'<polyline points="9 22 9 12 15 12 15 22"/>'
        +'</svg>'
      +'</span>';
    pillMenu.appendChild(homeBtn);

    // Separator 2
    const sep2=document.createElement('span');
    sep2.className='rk-pill-sep';
    pillMenu.appendChild(sep2);

    // Theme toggle button
    const themeBtn=document.createElement('button');
    themeBtn.id='rk-theme-pill';
    themeBtn.className='rk-pill-btn';
    themeBtn.type='button';
    themeBtn.title='Toggle Theme';
    themeBtn.innerHTML='<span class="rk-tp-ico">'+(_theme==='dark'?SUN_ICO:MOON_ICO)+'</span>';
    themeBtn.addEventListener('click',e=>{
      e.stopPropagation();
      cycleTheme();
      themeBtn.innerHTML='<span class="rk-tp-ico">'+(_theme==='dark'?SUN_ICO:MOON_ICO)+'</span>';
    });
    pillMenu.appendChild(themeBtn);

    wrap.appendChild(pillMenu);

    // Main toggle button
    const btn=document.createElement('button');
    btn.id='rk-page-toggle';
    btn.type='button';
    btn.setAttribute('role', 'checkbox');
    btn.title='Toggle ETLab Reskin';

    let imgUrl = '';
    try {
      imgUrl = chrome.runtime.getURL('icons/toggle.png');
    } catch(e) {}

    if (imgUrl) {
      btn.innerHTML = '<img src="' + esc(imgUrl) + '" alt="Toggle Reskin" class="rk-toggle-img">';
    } else {
      btn.innerHTML = '<span style="font-size:20px;font-weight:bold;color:#3b82f6;">✦</span>';
    }

    btn.addEventListener('click',()=>{
      const img = btn.querySelector('.rk-toggle-img');
      if (img) {
        img.classList.remove('rk-spin');
        void img.offsetWidth;
        img.classList.add('rk-spin');
      } else {
        btn.classList.remove('rk-spin');
        void btn.offsetWidth;
        btn.classList.add('rk-spin');
      }

      try{
        chrome.storage.local.get({reskinEnabled:true},r=>{
          const next=!r.reskinEnabled;
          chrome.storage.local.set({reskinEnabled:next});
        });
      }catch(e){
        const state=document.documentElement.classList.contains('etlab-reskin-on');
        if(state)unapply();else apply();
      }
    });

    const animatedEl = btn.querySelector('.rk-toggle-img') || btn;
    animatedEl.addEventListener('animationend', () => {
      animatedEl.classList.remove('rk-spin');
    });

    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  // Update state
  const btn=wrap.querySelector('#rk-page-toggle');
  const themeBtn=wrap.querySelector('#rk-theme-pill');
  const isActive=document.documentElement.classList.contains('etlab-reskin-on');
  if(btn) btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  if(themeBtn){
    themeBtn.innerHTML='<span class="rk-tp-ico">'+(_theme==='dark'?SUN_ICO:MOON_ICO)+'</span>';
  }
}

function unapply(){
  document.documentElement.classList.remove('etlab-reskin-on','etlab-reskin-light');
  document.body?.classList.remove('etlab-reskin-on','rk-dash-page');

  // Remove dashboard wrapper and restore hidden content
  document.getElementById('rk-wrap')?.remove();
  const container=document.querySelector('.main-content,#page-content,.page-content,#content,.span9,.col-md-9,.container-fluid');
  if(container)Array.from(container.children).forEach(c=>{c.style.display='';});
  document.querySelectorAll('#breadcrumbs,.breadcrumbs,.page-header,[class*="space-"],.ui-sortable').forEach(e=>{e.style.display='';});
  document.querySelectorAll('.footer,#footer').forEach(e=>{e.style.display='';});

  // Restore user nav
  const userNav=document.querySelector('#user-nav,.user-nav,.nav-user');
  if(userNav)userNav.style.display='';

  // Restore original sidebar by replacing innerHTML with saved copy
  const sidebar=document.querySelector('#sidebar,.sidebar,#main-container>.sidebar');
  if(sidebar){
    sidebar.classList.remove('etlab-reskin-sidebar');
    if(_origSidebarHTML){
      sidebar.innerHTML=_origSidebarHTML;
    } else {
      // Fallback: just remove our injected elements and unhide the rest
      sidebar.querySelector('.rk-sb-peek')?.remove();
      sidebar.querySelector('.rk-sb-inner')?.remove();
      Array.from(sidebar.children).forEach(c=>{c.style.display='';});
      sidebar.querySelectorAll('.nav-list,.submenu,.sidebar-shortcuts,.sidebar-toggle').forEach(el=>{el.style.display='';});
    }
  }

  // Refresh dashboard toggle button styles so it stays styled for off state
  addDashToggle();
}

function focusSearchPop(){
  const searchWrap=document.querySelector('.rk-search-wrap');
  const inp=document.getElementById('rk-sinput');
  if(searchWrap&&inp){
    searchWrap.classList.remove('rk-search-pop');
    void searchWrap.offsetWidth;
    searchWrap.classList.add('rk-search-pop');
    searchWrap.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>{
      inp.focus();
      inp.select();
    },60);
    setTimeout(()=>{
      searchWrap.classList.remove('rk-search-pop');
    },600);
  }else{
    location.href='/user/dashboard';
  }
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    focusSearchPop();
  }else if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
    e.preventDefault();
    focusSearchPop();
  }
});

// ── INIT ──────────────────────────────────────────────────────
function init(){
  if(!location.hostname.endsWith('etlab.app'))return;
  // Clear all cached data so fresh ETLab values are fetched on every page load
  _calCache = {};
  _calLoading = {};

  // Read stored preferences FIRST, then apply with correct theme
  // This prevents the light-mode flash on pages where user chose dark
  try{
    chrome.storage.local.get({reskinEnabled:true,theme:'dark'},r=>{
      // Set theme before apply() so the first render is correct
      _theme = (r.theme === 'light') ? 'light' : 'dark';
      syncTheme(_theme);
      if(r.reskinEnabled !== false){
        apply();
      }
      _isInitialLoad=false;
    });
    chrome.storage.onChanged.addListener((changes,area)=>{
      if(area!=='local')return;
      if('reskinEnabled' in changes)changes.reskinEnabled.newValue?apply():unapply();
      if('theme' in changes)syncTheme(changes.theme.newValue);
    });
  }catch(e){
    // Fallback if chrome.storage is unavailable — apply with default theme
    apply();
  }
}

document.readyState==='loading'
  ?document.addEventListener('DOMContentLoaded',init)
  :init();
