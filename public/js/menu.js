'use strict';

/**
 * Bistro Modern public menü etkileşimleri (CSP uyumlu, inline handler yok):
 *  - Kategori çipleri için scroll-spy + tıklayınca yumuşak kaydırma
 *  - Alt navigasyon: Menü (yukarı) · Ara (arama aç/kapa) · Kategoriler (yukarı) · Tema (form)
 *  - Canlı arama: yemek kartlarını filtreler, boş bölümleri gizler
 */
(function () {
  var nav = document.getElementById('catNav');
  var chips = nav ? Array.prototype.slice.call(nav.querySelectorAll('.chip')) : [];

  // ---------- scroll-spy ----------
  if (chips.length) {
    var sections = chips
      .map(function (chip) { return document.getElementById(chip.getAttribute('data-target')); })
      .filter(Boolean);

    function setActive(id) {
      chips.forEach(function (chip) {
        var on = chip.getAttribute('data-target') === id;
        chip.classList.toggle('active', on);
        if (on) {
          var left = chip.offsetLeft - (nav.clientWidth - chip.clientWidth) / 2;
          nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
        }
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-140px 0px -68% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  // ---------- arama ----------
  var searchWrap = document.getElementById('searchWrap');
  var searchInput = document.getElementById('dishSearch');
  var noResults = document.getElementById('noResults');
  var dishes = Array.prototype.slice.call(document.querySelectorAll('[data-dish]'));
  var catSections = Array.prototype.slice.call(document.querySelectorAll('[data-cat]'));

  function applyFilter(q) {
    q = (q || '').trim().toLowerCase();
    var anyVisible = false;
    dishes.forEach(function (d) {
      var show = !q || d.getAttribute('data-name').indexOf(q) !== -1;
      d.style.display = show ? '' : 'none';
      if (show) anyVisible = true;
    });
    // boş kategori bölümlerini gizle
    catSections.forEach(function (sec) {
      var hasVisible = Array.prototype.some.call(sec.querySelectorAll('[data-dish]'), function (d) {
        return d.style.display !== 'none';
      });
      sec.style.display = hasVisible ? '' : 'none';
    });
    if (noResults) noResults.style.display = anyVisible ? 'none' : 'block';
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () { applyFilter(searchInput.value); });
  }

  // ---------- alt navigasyon ----------
  function openSearch() {
    if (!searchWrap) return;
    searchWrap.classList.add('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (searchInput) setTimeout(function () { searchInput.focus(); }, 250);
  }
  function closeSearch() {
    if (searchWrap) searchWrap.classList.remove('open');
  }

  document.querySelectorAll('.tab[data-act]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var act = btn.getAttribute('data-act');
      if (act === 'top') {
        closeSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (act === 'cats') {
        closeSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (act === 'search') {
        if (searchWrap && searchWrap.classList.contains('open')) closeSearch();
        else openSearch();
      }
    });
  });
})();
