'use strict';

/**
 * Çeviri tablosu — tasarımdaki dize seti birebir taşındı.
 * Aktif dil session'da tutulur (req.session.lang); şablonlarda `t.xxx` ile kullanılır.
 */
const STRINGS = {
  tr: {
    // login
    login_title: 'Yönetici Girişi', login_sub: 'Menü yönetim paneli',
    username: 'Kullanıcı adı', username_ph: 'admin', password: 'Şifre',
    login_btn: 'Giriş Yap', login_err: 'Kullanıcı adı veya şifre hatalı.',
    demo_hint: 'demo: admin / 1234',
    // shell
    admin_panel: 'Yönetim Paneli', admin_name: 'Admin', role: 'Yönetici', logout: 'Çıkış',
    nav_dashboard: 'Panel',
    // dashboard
    dash_welcome: 'Tekrar hoş geldiniz,', recent_products: 'Son Ürünler', view_all: 'Tümü',
    quick_add: 'Hızlı Ekle', quick_add_sub: 'Menüye yeni ürün ekleyin.', add_product: 'Ürün Ekle',
    by_category: 'Kategoriye Göre', categories: 'Kategoriler', products: 'Ürünler',
    avg_price: 'Ort. Fiyat', total_categories: 'Toplam Kategori', total_products: 'Toplam Ürün',
    available_products: 'Stokta',
    // categories
    drag_hint: 'sırala', new_category: 'Yeni Kategori', new_category_sub: 'Menüye yeni bölüm ekleyin.',
    category_name: 'Kategori adı', category_ph: 'Örn. Kahvaltılıklar', add_category: 'Kategori Ekle',
    save: 'Kaydet', cancel: 'İptal',
    // products
    search_ph: 'Ürün ara…', all_categories: 'Tüm kategoriler', move_to: 'Şuraya taşı…',
    delete: 'Sil', clear: 'Temizle', selected_suffix: ' ürün seçildi',
    col_product: 'Ürün', col_category: 'Kategori', col_price: 'Fiyat', col_status: 'Durum', col_actions: 'İşlem',
    no_products: 'Ürün bulunamadı', no_products_sub: 'Filtreyi değiştirin veya yeni ürün ekleyin.',
    items_suffix: ' ürün',
    // form
    back: 'Geri', image: 'Görsel', upload: 'Dosya Yükle', via_url: 'URL', no_image: 'görsel yok',
    choose_file: 'Dosya seç', image_optional: 'Görsel zorunlu değildir. Dosya veya URL — biri yeterli.',
    category: 'Kategori', category_move_hint: 'Ürünü başka kategoriye taşımak için seçimi değiştirin.',
    product_name: 'Ürün adı', product_name_ph: 'Örn. Karışık Izgara', description: 'Açıklama',
    description_ph: 'Kısa açıklama (opsiyonel)', price: 'Fiyat (₺)', in_stock: 'Stokta / Mevcut',
    save_product: 'Kaydet', edit_product: 'Ürünü Düzenle', new_product: 'Yeni Ürün',
    avail_on: 'Müşteriler bu ürünü görebilir.', avail_off: 'Ürün menüde gizlenir.',
    st_available: 'Stokta', st_out: 'Tükendi',
    // çok dilli alanlar (admin)
    name_en_label: 'İngilizce ad', desc_en_label: 'İngilizce açıklama',
    cat_name_en_label: 'İngilizce kategori adı',
    en_optional: 'Opsiyonel — boşsa menüde Türkçesi gösterilir.',
    product_name_en_ph: 'e.g. Mixed Grill', category_en_ph: 'e.g. Breakfast',
    // QR
    nav_qr: 'QR Kod', qr_sub: 'Menü karekodu',
    qr_menu_url: 'Menü adresi', qr_update: 'Güncelle',
    qr_hint: 'Müşteriler bu karekodu okutunca menüye ulaşır. İndirip masa kartı/poster olarak yazdırın.',
    qr_download_png: 'PNG indir', qr_download_svg: 'SVG indir', qr_print: 'Yazdır',
    qr_card_scan: 'Menümüz için okutun', qr_card_brandless: 'Dijital Menü',
    // misc
    menu_sections: 'Menü bölümleri', all_menu_items: 'Tüm menü ürünleri',
  },
  en: {
    login_title: 'Admin Sign In', login_sub: 'Menu management panel',
    username: 'Username', username_ph: 'admin', password: 'Password',
    login_btn: 'Sign In', login_err: 'Incorrect username or password.',
    demo_hint: 'demo: admin / 1234',
    admin_panel: 'Admin Panel', admin_name: 'Admin', role: 'Manager', logout: 'Log out',
    nav_dashboard: 'Dashboard',
    dash_welcome: 'Welcome back,', recent_products: 'Recent Products', view_all: 'View all',
    quick_add: 'Quick Add', quick_add_sub: 'Add a new item to the menu.', add_product: 'Add Product',
    by_category: 'By Category', categories: 'Categories', products: 'Products',
    avg_price: 'Avg. Price', total_categories: 'Total Categories', total_products: 'Total Products',
    available_products: 'In stock',
    drag_hint: 'sort', new_category: 'New Category', new_category_sub: 'Add a new menu section.',
    category_name: 'Category name', category_ph: 'e.g. Breakfast', add_category: 'Add Category',
    save: 'Save', cancel: 'Cancel',
    search_ph: 'Search products…', all_categories: 'All categories', move_to: 'Move to…',
    delete: 'Delete', clear: 'Clear', selected_suffix: ' selected',
    col_product: 'Product', col_category: 'Category', col_price: 'Price', col_status: 'Status', col_actions: 'Actions',
    no_products: 'No products found', no_products_sub: 'Change the filter or add a new product.',
    items_suffix: ' items',
    back: 'Back', image: 'Image', upload: 'Upload', via_url: 'URL', no_image: 'no image',
    choose_file: 'Choose a file', image_optional: 'Image is optional. A file or a URL — either is fine.',
    category: 'Category', category_move_hint: 'Change the selection to move the item to another category.',
    product_name: 'Product name', product_name_ph: 'e.g. Mixed Grill', description: 'Description',
    description_ph: 'Short description (optional)', price: 'Price (₺)', in_stock: 'In stock / Available',
    save_product: 'Save', edit_product: 'Edit Product', new_product: 'New Product',
    avail_on: 'Customers can see this item.', avail_off: 'Item is hidden from the menu.',
    st_available: 'In stock', st_out: 'Sold out',
    name_en_label: 'English name', desc_en_label: 'English description',
    cat_name_en_label: 'English category name',
    en_optional: 'Optional — Turkish is shown on the menu if left empty.',
    product_name_en_ph: 'e.g. Mixed Grill', category_en_ph: 'e.g. Breakfast',
    nav_qr: 'QR Code', qr_sub: 'Menu QR code',
    qr_menu_url: 'Menu URL', qr_update: 'Update',
    qr_hint: 'Customers reach the menu by scanning this QR code. Download it and print as a table card or poster.',
    qr_download_png: 'Download PNG', qr_download_svg: 'Download SVG', qr_print: 'Print',
    qr_card_scan: 'Scan to view our menu', qr_card_brandless: 'Digital Menu',
    menu_sections: 'Menu sections', all_menu_items: 'All menu items',
  },
};

function resolveLang(lang) {
  return lang === 'en' ? 'en' : 'tr';
}

module.exports = {
  STRINGS,
  resolveLang,
  t(lang) {
    return STRINGS[resolveLang(lang)];
  },
  /** Fiyatı yerel biçimde formatlar: 85 → "85 ₺" */
  formatPrice(value, lang) {
    const locale = resolveLang(lang) === 'tr' ? 'tr-TR' : 'en-US';
    return Number(value).toLocaleString(locale) + ' ₺';
  },
};
