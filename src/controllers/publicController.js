'use strict';

const itemModel = require('../models/itemModel');

module.exports = {
  /**
   * Müşteri menüsü (QR ile açılan public sayfa).
   * Sadece stoktaki ürünleri içeren kategori ağacını render eder.
   * Sepet/sipariş/ödeme YOK — yalnızca görüntüleme.
   */
  menu(req, res) {
    const categories = itemModel.menuTree();
    res.render('public/menu', {
      categories,
      brand: res.locals.brand,
    });
  },
};
