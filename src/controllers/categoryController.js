'use strict';

const categoryModel = require('../models/categoryModel');

module.exports = {
  list(req, res) {
    const categories = categoryModel.allWithCounts();
    res.render('admin/categories', {
      categories,
      editId: req.query.edit ? Number(req.query.edit) : null,
      warn: req.query.warn || null,
      pageTitle: res.locals.t.categories,
      pageSub: res.locals.t.menu_sections,
      activeNav: 'categories',
    });
  },

  create(req, res) {
    const name = (req.body.name || '').trim();
    const nameEn = (req.body.name_en || '').trim();
    if (name) categoryModel.create(name, nameEn);
    res.redirect('/admin/categories');
  },

  rename(req, res) {
    const name = (req.body.name || '').trim();
    const nameEn = (req.body.name_en || '').trim();
    if (name) categoryModel.rename(Number(req.params.id), name, nameEn);
    res.redirect('/admin/categories');
  },

  remove(req, res) {
    const id = Number(req.params.id);
    const cat = categoryModel.findById(id);
    if (!cat) return res.redirect('/admin/categories');

    // RESTRICT: içinde ürün varsa silme, kullanıcıya uyarı göster
    const count = categoryModel.countItems(id);
    if (count > 0) {
      const lang = res.locals.lang;
      const msg =
        lang === 'tr'
          ? `“${cat.name}” kategorisinde ${count} ürün var. Silmeden önce bu ürünleri başka kategoriye taşıyın veya silin.`
          : `“${cat.name}” has ${count} product(s). Move or delete them before removing this category.`;
      return res.redirect('/admin/categories?warn=' + encodeURIComponent(msg));
    }

    categoryModel.remove(id);
    res.redirect('/admin/categories');
  },

  move(req, res) {
    const id = Number(req.params.id);
    const dir = req.params.dir === 'up' ? -1 : 1;
    const cats = categoryModel.all();
    const idx = cats.findIndex((c) => c.id === id);
    const target = cats[idx + dir];
    if (target) categoryModel.swapOrder(id, target.id);
    res.redirect('/admin/categories');
  },
};
