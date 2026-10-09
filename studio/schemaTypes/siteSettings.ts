import { defineField, defineType } from 'sanity'
import { isEmail, isHttpsUrl, isNavigation, isPhoneUri, siteNavigationItems, siteSettingsId } from '../../web/shared/utils/siteSettingsContract.ts'

export { siteSettingsId }
export const siteSettings = defineType({
  name: 'siteSettings', title: '全站共用設定', type: 'document',
  groups: [
    { name: 'brand', title: '品牌識別', default: true },
    { name: 'navigation', title: '全站導覽' },
    { name: 'messages', title: '品牌訊息' },
    { name: 'contact', title: '聯絡與社群' },
    { name: 'legal', title: '版權資訊' },
  ],
  validation: Rule => Rule.custom((_value, context) => context.document?._id?.replace(/^drafts\./, '') === siteSettingsId || '請使用「全站共用設定」單例入口。'),
  fields: [
    defineField({ name: 'brandName', title: '品牌名稱', type: 'string', group: 'brand', validation: Rule => Rule.required().min(2).max(20) }),
    defineField({ name: 'brandDestination', title: '品牌首頁', type: 'string', group: 'brand', initialValue: '/', readOnly: true, validation: Rule => Rule.required().custom(value => value === '/' || '品牌入口須為 /。') }),
    defineField({ name: 'brandLogo', title: 'Header Logo', type: 'image', group: 'brand', description: '頁首使用。選填，缺圖時呈現品牌名稱。', options: { hotspot: false } }),
    defineField({ name: 'footerLogo', title: 'Footer Logo', type: 'image', group: 'brand', description: '頁尾獨立設定，建議使用適合樹皮棕背景的淺色版本；未填時顯示品牌名稱。', options: { hotspot: false } }),
    defineField({
      name: 'navigationItems', title: '全站導覽', type: 'array', group: 'navigation',
      description: 'Header、Banner、Footer 共用。第一版固定五項及順序；新增目的頁須先修改產品規格。',
      initialValue: siteNavigationItems.map((item, index) => ({ _key: `nav-${index}`, label: item.label, destination: item.href })),
      validation: Rule => Rule.required().length(5).custom(value => isNavigation(value) || '請保留已確認的五項名稱、順序及路徑。'),
      of: [{ type: 'object', name: 'siteNavigationItem', fields: [
        { name: 'label', title: '名稱', type: 'string', validation: Rule => Rule.required().min(2).max(8) },
        { name: 'destination', title: '站內路徑', type: 'string', validation: Rule => Rule.required() },
        { name: 'accessibleLabel', title: '輔助說明', type: 'string', description: '只有可見名稱不足以說明用途時填寫。', validation: Rule => Rule.max(30) },
      ], preview: { select: { title: 'label', subtitle: 'destination' } } }],
    }),
    defineField({ name: 'brandMessages', title: '品牌訊息', type: 'object', group: 'messages', validation: Rule => Rule.required(), fields: [
      { name: 'englishStatement', title: '英文主張', type: 'text', rows: 3, validation: Rule => Rule.required().min(20).max(80) },
      { name: 'closingStatement', title: '中文收束句', type: 'string', validation: Rule => Rule.min(10).max(28) },
    ] }),
    defineField({ name: 'contact', title: '聯絡方式', type: 'object', group: 'contact', fields: [
      { name: 'address', title: '公開地址', type: 'string', validation: Rule => Rule.min(10).max(60) },
      { name: 'email', title: '公開 Email', type: 'string', validation: Rule => Rule.custom(value => value === undefined || isEmail(value) || '請填寫有效 Email。') },
      { name: 'phone', title: '電話', type: 'object', fields: [
        { name: 'display', title: '顯示電話', type: 'string', validation: Rule => Rule.required().min(8).max(25) },
        { name: 'href', title: '撥號連結', type: 'string', description: '格式：tel:+國碼與號碼，不能有空白。', validation: Rule => Rule.required().custom(value => isPhoneUri(value) || '請填寫 tel:+ 國際電話格式。') },
      ] },
    ] }),
    defineField({ name: 'socialLinks', title: '社群入口', type: 'array', group: 'contact', validation: Rule => Rule.max(4).custom(value => !value || new Set(value.map(item => (item as { label?: string }).label)).size === value.length || '社群名稱不得重複。'), of: [{ type: 'object', name: 'siteSocialLink', fields: [
      { name: 'label', title: '名稱', type: 'string', validation: Rule => Rule.required().min(2).max(20) },
      { name: 'href', title: 'HTTPS 網址', type: 'url', validation: Rule => Rule.required().custom(value => isHttpsUrl(value) || '請提供有效 HTTPS 網址，不能使用占位連結。') },
    ], preview: { select: { title: 'label', subtitle: 'href' } } }] }),
    defineField({ name: 'legal', title: '版權資訊', type: 'object', group: 'legal', validation: Rule => Rule.required(), fields: [
      { name: 'copyrightText', title: '版權聲明', type: 'string', description: '請填入已核准完整文字；不自動加入年份。', validation: Rule => Rule.required().min(10).max(100) },
    ] }),
  ],
  preview: { select: { subtitle: 'brandName' }, prepare: ({ subtitle }) => ({ title: '全站共用設定', subtitle }) },
})
