/* Арзан Ремонт — общий скрипт сайта */
(function () {
  'use strict';

  /* ---------- конверсии Google Ads: отдельный ярлык на каждый канал ---------- */
  var ADS_ID = 'AW-18499979618';
  var LABELS = {
    call: 'CALL_LABEL',
    whatsapp: 'WHATSAPP_LABEL'
  };
  /* события для Google Аналитики (GA4) */
  var GA_EVENTS = { call: 'CALL_LABEL', whatsapp: 'WHATSAPP_LABEL' };
  window.hcConv = function (kind) {
    try {
      if (typeof window.gtag === 'function') {
        if (LABELS[kind]) window.gtag('event', 'conversion', { send_to: ADS_ID + '/' + LABELS[kind] });
        if (GA_EVENTS[kind]) window.gtag('event', GA_EVENTS[kind], { link_page: location.pathname });
      }
    } catch (e) {}
    return true; /* переход по ссылке не перехватываем */
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-conv]') : null;
    if (a) window.hcConv(a.getAttribute('data-conv'));
  }, true);

  var doc = document.documentElement;
  var body = document.body;

  /* ---------- меню телефона ---------- */
  var menu = document.getElementById('menu');
  var lastFocus = null;
  function openMenu() {
    if (!menu) return;
    lastFocus = document.activeElement;
    menu.classList.add('on');
    menu.setAttribute('aria-hidden', 'false');
    doc.classList.add('lock');
    var x = menu.querySelector('.menu-x');
    if (x) setTimeout(function () { x.focus({ preventScroll: true }); }, 60);
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('on')) return;
    menu.classList.remove('on');
    menu.setAttribute('aria-hidden', 'true');
    doc.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-menu-open]').forEach(function (b) {
    b.addEventListener('click', openMenu);
  });
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target === menu || e.target.closest('[data-menu-close]')) { closeMenu(); return; }
      var a = e.target.closest('a');
      if (a) closeMenu();
    });
  }

  /* ---------- выпадающие списки в шапке ---------- */
  var hoverMQ = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };
  var dds = Array.prototype.slice.call(document.querySelectorAll('.dd'));
  function setDD(dd, open) {
    dd.classList.toggle('open', open);
    var b = dd.querySelector('.dd-btn');
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  dds.forEach(function (dd) {
    var btn = dd.querySelector('.dd-btn');
    dd.addEventListener('mouseenter', function () { if (hoverMQ.matches) setDD(dd, true); });
    dd.addEventListener('mouseleave', function () { if (hoverMQ.matches) setDD(dd, false); });
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      /* мышь уже открыла список наведением — клик его не закрывает */
      if (hoverMQ.matches) { setDD(dd, true); return; }
      setDD(dd, !dd.classList.contains('open'));
    });
  });
  document.addEventListener('click', function (e) {
    dds.forEach(function (dd) { if (!dd.contains(e.target)) setDD(dd, false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeMenu();
      dds.forEach(function (dd) { setDD(dd, false); });
    }
  });

  /* ---------- «Назад» ---------- */
  var back = document.querySelector('[data-back]');
  if (back) {
    back.addEventListener('click', function () {
      var here = location.href;
      var home = back.getAttribute('data-back');
      try { history.back(); } catch (e) {}
      setTimeout(function () { if (location.href === here) location.href = home; }, 350);
    });
  }

  /* ---------- «Наверх» и приглушение у подвала ---------- */
  var up = document.querySelector('[data-up]');
  if (up) {
    up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset || doc.scrollTop;
    if (up) up.classList.toggle('show', y > 400);
    var left = doc.scrollHeight - (y + window.innerHeight);
    body.classList.toggle('dim', left < 140 && doc.scrollHeight > window.innerHeight + 200);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  onScroll();

  /* ---------- в вопросах открыт только один ответ ---------- */
  var faqs = document.querySelectorAll('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
