/* Locale routing shared by the Portuguese and English entry points. */
(function () {
  'use strict';

  const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en') ||
    /\/en(?:\/|$)/.test(location.pathname);
  const pages = ['index.html', 'guia.html', 'gratuitos.html', 'como-usar.html'];
  const current = pages.find(page => location.pathname.endsWith('/' + page)) || 'index.html';

  function counterpart(lang) {
    const params = location.search || '';
    if (lang === 'en') return `en/${current}${params}`;
    return `../${current}${params}`;
  }

  function addLanguageSwitch() {
    const header = document.querySelector('.header-top');
    if (!header || header.querySelector('.language-switch')) return;
    const nav = document.createElement('nav');
    nav.className = 'language-switch';
    nav.setAttribute('aria-label', isEnglish ? 'Language' : 'Idioma');
    nav.innerHTML = isEnglish
      ? `<a href="${counterpart('pt')}" lang="pt-BR">Português</a><span aria-current="page">English</span>`
      : `<span aria-current="page">Português</span><a href="${counterpart('en')}" lang="en">English</a>`;
    header.appendChild(nav);
  }

  window.PANORAMA_LOCALE = {
    lang: isEnglish ? 'en' : 'pt-BR',
    isEnglish,
    currentPage: current
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addLanguageSwitch);
  else addLanguageSwitch();
})();
