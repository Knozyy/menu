'use strict';

const itemModel = require('../models/itemModel');
const categoryModel = require('../models/categoryModel');

module.exports = {
  index(req, res) {
    const prodCount = itemModel.countAll();
    const catCount = categoryModel.all().length;
    const availCount = itemModel.countAvailable();
    const avg = Math.round(itemModel.avgPrice());
    const availPct = prodCount ? Math.round((availCount / prodCount) * 100) : 0;

    const byCategory = itemModel.countsByCategory();
    const maxCat = Math.max(1, ...byCategory.map((c) => c.count));
    const catBars = byCategory.map((c) => ({
      name: c.name,
      count: c.count,
      pct: Math.round((c.count / maxCat) * 100),
    }));

    res.render('admin/dashboard', {
      stats: {
        catCount,
        prodCount,
        availCount,
        availPct,
        avg,
        outCount: prodCount - availCount,
      },
      catBars,
      recent: itemModel.recent(5),
      pageTitle: res.locals.t.nav_dashboard,
      pageSub: res.locals.t.admin_panel,
      activeNav: 'dashboard',
    });
  },
};
