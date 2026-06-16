'use strict';

/**
 * Panel için ilerlemeli iyileştirmeler (CSP uyumlu — inline handler yok).
 *  - Ürün listesinde arama/kategori filtresinin otomatik gönderimi
 *  - Toplu seçim çubuğu (seç/hepsini seç/temizle, taşı, sil)
 *  - Tekil ürün silme onayı
 *  - Ürün formunda görsel önizleme + Yükle/URL sekmeleri + stok açıklaması
 */
(function () {
  // ---------- Ürün listesi: filtre otomatik gönderimi ----------
  var filterForm = document.getElementById('filterForm');
  if (filterForm) {
    var cat = document.getElementById('filterCat');
    if (cat) cat.addEventListener('change', function () { filterForm.submit(); });
    var search = filterForm.querySelector('input[name="q"]');
    if (search) {
      var timer;
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { filterForm.submit(); }, 450);
      });
    }
  }

  // ---------- Toplu seçim ----------
  var bulkForm = document.getElementById('bulkForm');
  if (bulkForm) {
    var checks = function () { return Array.prototype.slice.call(bulkForm.querySelectorAll('.row-check')); };
    var bar = document.getElementById('bulkBar');
    var countEl = document.getElementById('bulkCount');
    var selectAll = document.getElementById('selectAll');
    var actionField = document.getElementById('bulkActionField');

    function refresh() {
      var sel = checks().filter(function (c) { return c.checked; });
      if (countEl) countEl.textContent = sel.length;
      if (bar) bar.style.display = sel.length ? 'flex' : 'none';
      if (selectAll) {
        var all = checks();
        selectAll.checked = all.length > 0 && sel.length === all.length;
      }
    }

    checks().forEach(function (c) { c.addEventListener('change', refresh); });
    if (selectAll) {
      selectAll.addEventListener('change', function () {
        checks().forEach(function (c) { c.checked = selectAll.checked; });
        refresh();
      });
    }

    var bulkClear = document.getElementById('bulkClear');
    if (bulkClear) bulkClear.addEventListener('click', function () {
      checks().forEach(function (c) { c.checked = false; });
      if (selectAll) selectAll.checked = false;
      refresh();
    });

    var bulkMove = document.getElementById('bulkMove');
    if (bulkMove) bulkMove.addEventListener('change', function () {
      if (!bulkMove.value) return;
      if (actionField) actionField.value = 'move';
      bulkForm.submit();
    });

    var bulkDelete = document.getElementById('bulkDelete');
    if (bulkDelete) bulkDelete.addEventListener('click', function (e) {
      var n = checks().filter(function (c) { return c.checked; }).length;
      if (!n || !confirm(n + ' ürün silinsin mi?')) { e.preventDefault(); return; }
      if (actionField) actionField.value = 'delete';
    });

    refresh();
  }

  // ---------- Tekil silme ----------
  var deleteForm = document.getElementById('deleteForm');
  if (deleteForm) {
    document.querySelectorAll('.row-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-name') || '';
        if (!confirm(name + ' — silinsin mi?')) return;
        deleteForm.action = '/admin/products/' + btn.getAttribute('data-id') + '/delete';
        deleteForm.submit();
      });
    });
  }

  // ---------- Ürün formu: görsel önizleme + sekmeler ----------
  var preview = document.getElementById('imgPreview');
  if (preview) {
    var placeholder = document.getElementById('imgPlaceholder');
    var fileInput = document.getElementById('fileInput');
    var urlInput = document.getElementById('urlInput');
    var fileLabel = document.getElementById('fileLabel');
    var tabUpload = document.getElementById('tabUpload');
    var tabUrl = document.getElementById('tabUrl');
    var paneUpload = document.getElementById('paneUpload');
    var paneUrl = document.getElementById('paneUrl');

    var ACTIVE = 'background:var(--surface);color:var(--accent);box-shadow:var(--shadow-sm)';
    var IDLE = 'background:transparent;color:var(--muted)';
    var TAB_BASE = 'height:32px;padding:0 14px;border:none;border-radius:8px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;flex:1;';

    function setPreview(src) {
      if (src) {
        preview.style.backgroundImage = 'url(' + src + ')';
        preview.style.backgroundColor = 'var(--surface-2)';
        if (placeholder) placeholder.style.display = 'none';
      } else {
        preview.style.backgroundImage = 'none';
        if (placeholder) placeholder.style.display = '';
      }
    }

    function selectMode(mode) {
      var up = mode === 'upload';
      if (paneUpload) paneUpload.style.display = up ? '' : 'none';
      if (paneUrl) paneUrl.style.display = up ? 'none' : '';
      if (tabUpload) tabUpload.style.cssText = TAB_BASE + (up ? ACTIVE : IDLE);
      if (tabUrl) tabUrl.style.cssText = TAB_BASE + (up ? IDLE : ACTIVE);
      // Diğer moddaki değeri temizle ki sunucu hangi kaynağı kullanacağını bilsin
      if (up && urlInput) urlInput.value = '';
      if (!up && fileInput) fileInput.value = '';
    }

    if (tabUpload) tabUpload.addEventListener('click', function () { selectMode('upload'); });
    if (tabUrl) tabUrl.addEventListener('click', function () { selectMode('url'); });

    if (fileInput) fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      if (fileLabel) fileLabel.textContent = f.name;
      var rd = new FileReader();
      rd.onload = function () { setPreview(rd.result); };
      rd.readAsDataURL(f);
    });

    if (urlInput) urlInput.addEventListener('input', function () {
      setPreview(urlInput.value.trim());
    });
  }

  // ---------- Stok açıklaması (anahtarla birlikte güncellenir) ----------
  var availInput = document.getElementById('availInput');
  var availDesc = document.getElementById('availDesc');
  if (availInput && availDesc) {
    availInput.addEventListener('change', function () {
      availDesc.textContent = availInput.checked
        ? availDesc.getAttribute('data-on')
        : availDesc.getAttribute('data-off');
    });
  }
})();
