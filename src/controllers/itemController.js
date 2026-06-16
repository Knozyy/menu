'use strict';

const itemModel = require('../models/itemModel');
const categoryModel = require('../models/categoryModel');

/** Form gövdesini doğrulayıp temiz bir veri nesnesine indirger. */
function parseItemBody(req) {
  const body = req.body || {};
  const name = (body.name || '').trim();
  const description = (body.description || '').trim();
  const price = parseFloat(body.price);
  const category_id = Number(body.category_id);
  const is_available = body.is_available === '1' ? 1 : 0;

  // Görsel: yüklenen dosya öncelikli, yoksa URL alanı
  let image_url = (body.image_url || '').trim();
  if (req.file) {
    image_url = '/uploads/' + req.file.filename;
  }

  return { name, description, price, category_id, is_available, image_url };
}

function validate(data, lang) {
  if (!data.name) return lang === 'tr' ? 'Ürün adı gerekli.' : 'Product name is required.';
  if (Number.isNaN(data.price) || data.price < 0)
    return lang === 'tr' ? 'Geçerli bir fiyat girin.' : 'Enter a valid price.';
  if (!data.category_id || !categoryModel.findById(data.category_id))
    return lang === 'tr' ? 'Geçerli bir kategori seçin.' : 'Select a valid category.';
  return null;
}

module.exports = {
  list(req, res) {
    const q = (req.query.q || '').trim();
    const filterCat = req.query.cat && req.query.cat !== 'all' ? Number(req.query.cat) : null;
    const items = itemModel.list({ q, categoryId: filterCat });
    const categories = categoryModel.all();

    res.render('admin/products', {
      items,
      categories,
      q,
      filterCat: req.query.cat || 'all',
      pageTitle: res.locals.t.products,
      pageSub: res.locals.t.all_menu_items,
      activeNav: 'products',
    });
  },

  newForm(req, res) {
    const categories = categoryModel.all();
    res.render('admin/product-form', {
      item: { id: null, category_id: categories[0] ? categories[0].id : null, name: '', description: '', price: '', image_url: '', is_available: 1 },
      categories,
      error: null,
      formAction: '/admin/products',
      pageTitle: res.locals.t.new_product,
      pageSub: '',
      activeNav: 'products',
    });
  },

  editForm(req, res) {
    const item = itemModel.findById(Number(req.params.id));
    if (!item) return res.redirect('/admin/products');
    res.render('admin/product-form', {
      item,
      categories: categoryModel.all(),
      error: null,
      formAction: '/admin/products/' + item.id,
      pageTitle: res.locals.t.edit_product,
      pageSub: '',
      activeNav: 'products',
    });
  },

  create(req, res) {
    const data = parseItemBody(req);
    const error = validate(data, res.locals.lang);
    if (error) {
      return res.status(400).render('admin/product-form', {
        item: { ...data, id: null },
        categories: categoryModel.all(),
        error,
        formAction: '/admin/products',
        pageTitle: res.locals.t.new_product,
        pageSub: '',
        activeNav: 'products',
      });
    }
    itemModel.create(data);
    res.redirect('/admin/products');
  },

  update(req, res) {
    const id = Number(req.params.id);
    const existing = itemModel.findById(id);
    if (!existing) return res.redirect('/admin/products');

    const data = parseItemBody(req);
    // Yeni dosya/URL gelmediyse mevcut görseli koru
    if (!req.file && !data.image_url) data.image_url = existing.image_url;

    const error = validate(data, res.locals.lang);
    if (error) {
      return res.status(400).render('admin/product-form', {
        item: { ...data, id },
        categories: categoryModel.all(),
        error,
        formAction: '/admin/products/' + id,
        pageTitle: res.locals.t.edit_product,
        pageSub: '',
        activeNav: 'products',
      });
    }
    itemModel.update(id, data);
    res.redirect('/admin/products');
  },

  remove(req, res) {
    itemModel.remove(Number(req.params.id));
    res.redirect('/admin/products');
  },

  /** Toplu işlem: sil veya başka kategoriye taşı (panel bulk bar). */
  bulk(req, res) {
    const ids = []
      .concat(req.body.ids || [])
      .map(Number)
      .filter(Boolean);

    if (ids.length) {
      if (req.body.action === 'delete') {
        itemModel.removeMany(ids);
      } else if (req.body.action === 'move' && req.body.move_to) {
        const target = Number(req.body.move_to);
        if (categoryModel.findById(target)) itemModel.moveMany(ids, target);
      }
    }
    res.redirect('/admin/products');
  },
};
