import type {
  PractitionerOverviewItem,
  SessionOverviewContent,
} from '#shared/types/session'

function practitioner(
  id: string,
  name: string,
  englishName: string | undefined,
  regionKeys: string[],
  methodKeys: string[],
  order: number,
): PractitionerOverviewItem {
  return {
    id,
    name,
    englishName,
    slug: `prototype-practitioner-${id}`,
    regionKeys,
    methodKeys,
    summary: '此為版面與互動驗證用的示意摘要，不代表正式服務內容或專業資格。',
    order,
    isPublished: true,
  }
}

export const sessionOverviewFixture: SessionOverviewContent = {
  pageTitle: '尋找\n執行師',
  intro: '依服務地區與方法，找到適合進一步了解的執行師。可複選條件，結果會立即更新。',
  resultsHeading: '執行師名錄',
  emptyMessage: '目前沒有已發布的執行師資料，請稍後再回來查看。',
  noMatchesMessage: '目前沒有符合條件的執行師，請清除部分篩選後再試一次。',
  prototypeNotice: '本頁姓名、地區與服務方法皆為前端示意資料。',
  regions: [
    { key: 'north', label: '北部', order: 1 },
    { key: 'central', label: '中部', order: 2 },
    { key: 'south', label: '南部', order: 3 },
  ],
  methods: [
    { key: 'rebalance', label: '身心再平衡按摩', order: 1 },
    { key: 'biodynamic-craniosacral', label: '生物動能頭薦骨', order: 2 },
    { key: 'facial', label: '日式臉部按摩', order: 3 },
    { key: 'human-design', label: '人類圖', order: 4 },
  ],
  practitioners: [
    practitioner('01', '林若安', 'An', ['north'], ['rebalance', 'biodynamic-craniosacral'], 1),
    practitioner('02', '周以澄', 'Cheng', ['central'], ['biodynamic-craniosacral', 'facial'], 2),
    practitioner('03', '陳映禾', 'Ingrid', ['south'], ['rebalance', 'human-design'], 3),
    practitioner('04', '許靜之', 'Shizhi', ['north', 'central'], ['facial', 'biodynamic-craniosacral'], 4),
    practitioner('05', '江予晴', 'Haruka', ['north'], ['rebalance', 'facial', 'human-design'], 5),
    practitioner('06', '沈言希', 'Yen', ['south'], ['biodynamic-craniosacral'], 6),
    practitioner('07', '黃書寧', 'Ning', ['central', 'south'], ['rebalance', 'human-design'], 7),
    practitioner('08', '梁心柔', undefined, ['north'], ['facial'], 8),
    practitioner('09', '葉知行', 'Chih', ['central'], ['biodynamic-craniosacral', 'rebalance'], 9),
    practitioner('10', '蘇宛庭', 'Ting', ['south'], ['facial', 'human-design'], 10),
    practitioner('11', '方予真', 'Jane', ['north', 'south'], ['biodynamic-craniosacral', 'human-design'], 11),
    practitioner('12', '蔡明澄', 'Ming', ['central'], ['rebalance', 'facial'], 12),
  ],
}

export const emptySessionOverviewFixture: SessionOverviewContent = {
  ...sessionOverviewFixture,
  practitioners: [],
}
