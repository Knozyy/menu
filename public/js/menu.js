'use strict';

/**
 * Public menü: kategori çipleri için scroll-spy.
 * Görünümdeki bölüme göre aktif çipi günceller ve onu yatay olarak görünür tutar.
 * (Tıklamada kaydırma anchor + CSS scroll-behavior:smooth ile yapılır.)
 */
(function () {
  var nav = document.getElementById('catNav');
  if (!nav) return;

  var chips = Array.prototype.slice.call(nav.querySelectorAll('.cat-chip'));
  var sections = chips
    .map(function (chip) { return document.getElementById(chip.getAttribute('data-target')); })
    .filter(Boolean);
  if (!sections.length) return;

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
      entries.forEach(function (e) {
        if (e.isIntersecting) setActive(e.target.id);
      });
    },
    { rootMargin: '-120px 0px -65% 0px', threshold: 0 }
  );
  sections.forEach(function (s) { observer.observe(s); });
})();
