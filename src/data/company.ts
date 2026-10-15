import type { Lang } from '../i18n/translations';

type L10n = Record<Lang, string>;

export const img = (name: string) => `./images/${name}`;

export const contact = {
  phones: ['07701557702', '07701530375'],
  email: 'hemacompany12@gmail.com',
  website: 'hema-company.com',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dargazen%2C+Sulaymaniyah%2C+Iraq',
};

export type FeaturedProject = {
  id: string;
  images: string[];
  title: L10n;
  location: L10n;
  summary: L10n;
  highlights: Record<Lang, string[]>;
  length?: string;
  width?: string;
  period: string;
  value: string;
  partner?: L10n;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: 'kalar',
    images: ['kalar-1.jpg', 'kalar-2.jpg', 'kalar-3.jpg', 'kalar-4.jpg', 'kalar-5.jpg', 'kalar-6.jpg', 'kalar-7.jpg'],
    title: { en: 'Kalar – Rizgari Road', ku: 'ڕێگای کەلار – ڕزگاری', ar: 'طريق كلار – رزكاري' },
    location: { en: 'Kalar, Sulaymaniyah', ku: 'کەلار، سلێمانی', ar: 'كلار، السليمانية' },
    summary: {
      en: 'Asphalting, raising and widening of the Kalar–Rizgari road, including lighting, retaining walls, water basins, traffic signs, road marking and several culverts. We supplied an advanced engineering team, all materials and machinery, and set up our own crushing and asphalt plants.',
      ku: 'قیرتاوکردن و بەرزکردنەوە و فراوانکردنی ڕێگای کەلار/ڕزگاری لەگەڵ بڕگەی ڕووناکی، دیواری ڕاگر، حەوزی ئاو، هێمای هاتوچۆ و هێڵکاری ڕێگا و دروستکردنی چەند ئاوبارێک (قەنتەرە). تیمی ئەندازیاری پێشکەوتوو و سەرجەم کەرەستە و ئامێرەکان دابین کران و کارگەی کەسارە و کارگەی قیر دامەزرێنران.',
      ar: 'تعبيد ورفع وتوسيع طريق كلار/رزكاري مع أعمال الإنارة والجدران الساندة وأحواض المياه والعلامات المرورية وتخطيط الطريق وإنشاء عدد من العبّارات. وفّرنا فريقاً هندسياً متقدماً وجميع المواد والآليات، وأنشأنا كسارة ومعمل أسفلت خاصين بالمشروع.',
    },
    highlights: {
      en: ['Subgrade, subbase and base course earthworks', 'Three asphalt layers: stabilizer, binder and wearing course', 'Sensor-guided pavers and polymer asphalt'],
      ku: ['چینی خاکسازی Subgrade و Subbase و Base course', 'سێ چینی قیر: Stabilizer و Binder و Wearing course', 'ئامێری سێنسەر و قیری پۆلیمەر'],
      ar: ['أعمال طبقات Subgrade وSubbase وBase course', 'ثلاث طبقات أسفلت: Stabilizer وBinder وWearing course', 'فارشات بالحساسات وأسفلت بوليمري'],
    },
    length: '8.1 km',
    width: '17 m',
    period: '2013 – 2017',
    value: '11,723,000,000',
    partner: { en: 'Hawdian Company', ku: 'کۆمپانیای هاودیان', ar: 'شركة هاوديان' },
  },
  {
    id: 'kunamasi',
    images: ['kunamasi-1.jpg', 'kunamasi-2.jpg', 'kunamasi-3.jpg', 'kunamasi-4.jpg', 'kunamasi-5.jpg'],
    title: { en: 'Kunamasi – Waisa Bridge Road', ku: 'ڕێگای کونەماسی بۆ پردی وەیسە', ar: 'طريق كونه ماسي – جسر ويسه' },
    location: { en: 'Sulaymaniyah Governorate', ku: 'پارێزگای سلێمانی', ar: 'محافظة السليمانية' },
    summary: {
      en: 'Construction and asphalting of the mountain road from Kunamasi to the Waisa bridge, with retaining walls and culverts. We provided the full engineering and execution team, all materials and machinery, and our own crushing and asphalt plants.',
      ku: 'دروستکردن و قیرتاوکردنی ڕێگای کونەماسی بۆ پردی وەیسە لەگەڵ دروستکردنی دیواری ڕاگر و چەند ئاوبارێک (قەنتەرە). تیمی ئەندازیاری و جێبەجێکاری پێشکەوتوو، سەرجەم کەرەستە و ئامێرەکان، و کارگەی کەسارە و قیر دابین کران.',
      ar: 'إنشاء وتعبيد الطريق الجبلي من كونه ماسي إلى جسر ويسه مع الجدران الساندة والعبّارات. وفّرنا الفريق الهندسي والتنفيذي الكامل وجميع المواد والآليات، إضافة إلى الكسارة ومعمل الأسفلت.',
    },
    highlights: {
      en: ['30 km of new mountain road', 'Retaining walls and culverts', 'On-site crushing and asphalt plants'],
      ku: ['30 کم ڕێگای نوێی شاخاوی', 'دیواری ڕاگر و ئاوبار', 'کارگەی کەسارە و قیر لە شوێنی پڕۆژە'],
      ar: ['30 كم من الطريق الجبلي الجديد', 'جدران ساندة وعبّارات', 'كسارة ومعمل أسفلت في الموقع'],
    },
    length: '30 km',
    width: '7 m',
    period: '2014',
    value: '$ 5,897,000',
    partner: { en: 'Raouf Company', ku: 'کۆمپانیای ڕەئوف', ar: 'شركة رؤوف' },
  },
  {
    id: 'sitak',
    images: ['sitak-1.jpg', 'sitak-2.jpg', 'sitak-3.jpg', 'sitak-4.jpg', 'sitak-5.jpg'],
    title: { en: 'Sitak – Gurgadar Road', ku: 'ڕێگای سیتەک – گورگەدەر', ar: 'طريق سيتك – كوركدر' },
    location: { en: 'Sulaymaniyah Governorate', ku: 'پارێزگای سلێمانی', ar: 'محافظة السليمانية' },
    summary: {
      en: 'Construction and asphalting of the Sitak–Gurgadar road with retaining walls and culverts, delivered complete with all its requirements.',
      ku: 'دروستکردن و قیرتاوکردنی ڕێگای سیتەک/گورگەدەر لەگەڵ دروستکردنی دیواری ڕاگر و چەند ئاوبارێک (قەنتەرە) بە تەواوی پێویستییەکانییەوە.',
      ar: 'إنشاء وتعبيد طريق سيتك/كوركدر مع الجدران الساندة والعبّارات، وتسليمه متكاملاً بجميع متطلباته.',
    },
    highlights: {
      en: ['7 km of road', 'Retaining walls and culverts', 'Delivered turnkey'],
      ku: ['7 کم ڕێگا', 'دیواری ڕاگر و ئاوبار', 'بە تەواوی پێویستییەکانییەوە'],
      ar: ['7 كم من الطريق', 'جدران ساندة وعبّارات', 'تسليم متكامل'],
    },
    length: '7 km',
    period: '2019',
    value: '673,000,000',
  },
  {
    id: 'tasluja',
    images: ['tasluja-1.jpg', 'tasluja-2.jpg', 'tasluja-3.jpg', 'tasluja-4.jpg', 'tasluja-5.jpg'],
    title: { en: 'Tasluja – Takiya Road Rehabilitation', ku: 'چاککردن و قیرتاوکردنی ڕێگای تاسڵوجە – تەکیە', ar: 'تأهيل وتعبيد طريق تاسلوجة – تكية' },
    location: { en: 'Sulaymaniyah', ku: 'سلێمانی', ar: 'السليمانية' },
    summary: {
      en: 'Milling and re-asphalting of the Tasluja–Takiya road with full road marking. The asphalt layer was laid with the latest engineering methods using a binder course.',
      ku: 'بڕین و قیرتاوکردنی ڕێگای تاسڵوجە/تەکیە لەگەڵ هێڵکاری. چینی قیرتاوکردنەکە بە نوێترین شێوازی ئەندازیاری و بە بەکارهێنانی Binder Course ئەنجامدرا.',
      ar: 'قشط وإعادة تعبيد طريق تاسلوجة/تكية مع التخطيط الكامل. نُفّذت طبقة الأسفلت بأحدث الأساليب الهندسية باستخدام طبقة Binder Course.',
    },
    highlights: {
      en: ['15 km milled and re-paved', 'Binder course asphalt', 'Full road marking'],
      ku: ['15 کم بڕین و قیرتاوکردن', 'Binder Course', 'هێڵکاری تەواو'],
      ar: ['15 كم قشط وإعادة تعبيد', 'طبقة Binder Course', 'تخطيط كامل للطريق'],
    },
    length: '15 km',
    period: '2019',
    value: '1,000,000,000',
    partner: { en: 'Saco Company', ku: 'کۆمپانیای ساکۆ', ar: 'شركة ساكو' },
  },
  {
    id: 'baban',
    images: ['baban-1.jpg', 'baban-2.jpg', 'baban-3.jpg', 'baban-4.jpg', 'baban-5.jpg', 'baban-6.jpg'],
    title: { en: 'Baban Highway Base Works', ku: 'بەردی شکاو بۆ ئۆتۆبانی بابان', ar: 'أعمال الحصى المكسّر لطريق بابان السريع' },
    location: { en: 'Sulaymaniyah', ku: 'سلێمانی', ar: 'السليمانية' },
    summary: {
      en: 'Preparing, supplying, spreading and compacting crushed stone for the Baban highway. We quarried and hauled the stone, set up 6 crushers and 2 batch plants to produce subbase and base course to engineering standards, then laid it with 4 sensor-guided pavers.',
      ku: 'ئامادەکردن، دابینکردن، ڕاخستن و کوتاندنەوەی بەردی شکاو بۆ ئۆتۆبانی بابان. بڕین و تەقاندنەوەی کانی بەرد و گواستنەوەی بۆ کەسارە، دامەزراندنی 6 کارگەی بەردشکێن و 2 کارگەی باچ پلانت بۆ دروستکردنی Subbase و Base course بە ستانداردی ئەندازیاری، و ڕاخستنی بە 4 ئامێری فاریشە بە سێنسەر.',
      ar: 'تحضير وتجهيز وفرش ورصّ الحصى المكسّر لطريق بابان السريع. قلعنا الحجر ونقلناه إلى الكسارات، وأنشأنا 6 كسارات ومعملي خلط لإنتاج طبقتي السب بيس والبيس وفق المعايير الهندسية، ثم فرشناها بأربع فارشات مزوّدة بالحساسات.',
    },
    highlights: {
      en: ['Subbase: two 15 cm layers, 70 m wide', 'Base course: two 10 cm layers, 65 m wide', '6 crushers, 2 batch plants, 4 pavers'],
      ku: ['Subbase: دوو چینی 15 سم، پانی 70 م', 'Base course: دوو چینی 10 سم، پانی 65 م', '6 کەسارە، 2 باچ پلانت، 4 فاریشە'],
      ar: ['السب بيس: طبقتان بسماكة 15 سم وعرض 70 م', 'البيس: طبقتان بسماكة 10 سم وعرض 65 م', '6 كسارات ومعملا خلط و4 فارشات'],
    },
    length: '34 km',
    period: '2021',
    value: '16,989,600,000',
    partner: { en: 'Azad Mohammed Company', ku: 'کۆمپانیای ئازاد محمد', ar: 'شركة آزاد محمد' },
  },
];

export type SmallProject = { id: string; image: string; title: L10n; location: L10n; period: string };

export const moreProjects: SmallProject[] = [
  {
    id: 'darwaza',
    image: 'darwaza.jpg',
    title: { en: 'Darwaza City housing roads', ku: 'ڕێگاکانی پڕۆژەی نیشتەجێبوونی دەروازە سیتی', ar: 'طرق مجمع دروازة سيتي السكني' },
    location: { en: 'Sulaymaniyah', ku: 'سلێمانی', ar: 'السليمانية' },
    period: '2019',
  },
  {
    id: 'goran',
    image: 'goran.jpg',
    title: { en: 'Goran City housing roads', ku: 'ڕێگاکانی پڕۆژەی نیشتەجێبوونی گۆران سیتی', ar: 'طرق مجمع كوران سيتي السكني' },
    location: { en: 'Halabja', ku: 'هەڵەبجە', ar: 'حلبجة' },
    period: '2019',
  },
  {
    id: 'schools',
    image: 'schools.jpg',
    title: { en: 'Two 18-classroom schools', ku: 'دوو قوتابخانەی 18 پۆلی', ar: 'مدرستان بـ18 صفاً' },
    location: { en: 'Old Kalar & Rizgari', ku: 'کەلاری کۆن و ڕزگاری', ar: 'كلار القديمة ورزكاري' },
    period: '2010 – 2011',
  },
  {
    id: 'courthouse',
    image: 'courthouse.jpg',
    title: { en: 'Court house & 9 staff houses', ku: 'خانەی داد و 9 خانووی فەرمانبەران', ar: 'دار العدالة و9 دور للموظفين' },
    location: { en: 'Kifri', ku: 'کفری', ar: 'كفري' },
    period: '2005 – 2006',
  },
  {
    id: 'stadium',
    image: 'stadium.jpg',
    title: { en: 'Football stadium renovation & turfing', ku: 'نۆژەنکردنەوە و سەوزکردنی یاریگای تۆپی پێ', ar: 'تأهيل وتعشيب ملعب كرة القدم' },
    location: { en: 'Sulaymaniyah', ku: 'سلێمانی', ar: 'السليمانية' },
    period: '2007 – 2008',
  },
  {
    id: 'sidewalks',
    image: 'sidewalks.jpg',
    title: { en: 'Sarchawa streets & sidewalks', ku: 'شۆستە و شەقامەکانی شارۆچکەی سەرچاوە', ar: 'أرصفة وشوارع ناحية سرچاوة' },
    location: { en: 'Sarchawa, Sulaymaniyah', ku: 'سەرچاوە، سلێمانی', ar: 'سرچاوة، السليمانية' },
    period: '2007 – 2008',
  },
  {
    id: 'sewer',
    image: 'sewer.jpg',
    title: { en: '40 cm pipe sewer line', ku: 'ئاوەڕۆی لوولەیی بە تیرەی 40 سم', ar: 'خط مجاري أنبوبي بقطر 40 سم' },
    location: { en: 'Qaladiza, Sulaymaniyah', ku: 'قەڵادزێ، سلێمانی', ar: 'قلعة دزة، السليمانية' },
    period: '2007',
  },
];

export type RecordRow = { title: L10n; location: L10n; value: number; currency: 'IQD' | 'USD'; period: string };

const sul: L10n = { en: 'Sulaymaniyah', ku: 'سلێمانی', ar: 'السليمانية' };

export const trackRecord: RecordRow[] = [
  { title: moreProjects[3].title, location: { en: 'Kifri / Sulaymaniyah', ku: 'کفری / سلێمانی', ar: 'كفري / السليمانية' }, value: 1417214819, currency: 'IQD', period: '2005 – 2006' },
  { title: moreProjects[6].title, location: { en: 'Qaladiza / Sulaymaniyah', ku: 'قەڵادزێ / سلێمانی', ar: 'قلعة دزة / السليمانية' }, value: 19850000, currency: 'IQD', period: '2007' },
  { title: moreProjects[4].title, location: sul, value: 2729655000, currency: 'IQD', period: '2007 – 2008' },
  { title: moreProjects[5].title, location: { en: 'Sarchawa / Sulaymaniyah', ku: 'سەرچاوە / سلێمانی', ar: 'سرچاوة / السليمانية' }, value: 995580750, currency: 'IQD', period: '2007 – 2008' },
  {
    title: { en: 'Service delivery for Bakhan district', ku: 'گەیاندنی خزمەتگوزاری بۆ گەڕەکی باخان', ar: 'إيصال الخدمات إلى حي باخان' },
    location: sul,
    value: 2250175000,
    currency: 'IQD',
    period: '2008 – 2009',
  },
  { title: { en: 'Two 18-classroom schools in Old Kalar and Rizgari', ku: 'دوو قوتابخانەی 18 پۆلی لە گەڕەکی کەلاری کۆن و ڕزگاری', ar: 'مدرستان بـ18 صفاً في كلار القديمة ورزكاري' }, location: { en: 'Kalar / Sulaymaniyah', ku: 'کەلار / سلێمانی', ar: 'كلار / السليمانية' }, value: 3378359969, currency: 'IQD', period: '2010 – 2011' },
  { title: { en: 'Kalar – Rizgari road, 8.1 km', ku: 'ڕێگای کەلار/ڕزگاری بە درێژایی 8.1 کم', ar: 'طريق كلار/رزكاري بطول 8.1 كم' }, location: { en: 'Kalar / Sulaymaniyah', ku: 'کەلار / سلێمانی', ar: 'كلار / السليمانية' }, value: 11723000000, currency: 'IQD', period: '2013 – 2017' },
  { title: featuredProjects[1].title, location: sul, value: 5897000, currency: 'USD', period: '2014' },
  { title: featuredProjects[2].title, location: sul, value: 673000000, currency: 'IQD', period: '2019' },
  { title: featuredProjects[3].title, location: sul, value: 1000000000, currency: 'IQD', period: '2019' },
  { title: moreProjects[0].title, location: sul, value: 300000000, currency: 'IQD', period: '2019' },
  { title: moreProjects[1].title, location: { en: 'Halabja', ku: 'هەڵەبجە', ar: 'حلبجة' }, value: 1050000000, currency: 'IQD', period: '2019' },
  {
    title: {
      en: 'Crushed stone supply, spreading and compaction for the Baban highway',
      ku: 'ئامادەکردن، دابینکردن، ڕاخستن و کوتاندنەوەی بەردی شکاو بۆ ئۆتۆبانی بابان',
      ar: 'تحضير وتجهيز وفرش ورصّ الحصى المكسّر لطريق بابان السريع',
    },
    location: sul,
    value: 16989600000,
    currency: 'IQD',
    period: '2021',
  },
];

export type FleetKey = 'pavers' | 'steelRollers' | 'tyreRollers' | 'trucks' | 'loaders' | 'excavators' | 'grader' | 'pickups' | 'generators';

export const fleet: { key: FleetKey; count: number; brands: string }[] = [
  { key: 'trucks', count: 21, brands: 'MAN · Mercedes Axor · Iveco · Renault' },
  { key: 'steelRollers', count: 9, brands: 'Bomag' },
  { key: 'excavators', count: 8, brands: 'Hitachi · Komatsu · Daewoo' },
  { key: 'loaders', count: 7, brands: 'Volvo · Bobcat' },
  { key: 'pickups', count: 6, brands: 'Toyota Hilux · Mitsubishi' },
  { key: 'pavers', count: 4, brands: 'Vögele' },
  { key: 'generators', count: 4, brands: 'Cummins · Perkins' },
  { key: 'tyreRollers', count: 2, brands: 'Sakai' },
  { key: 'grader', count: 2, brands: 'Komatsu' },
];

export const fleetBrands = ['Vögele', 'Bomag', 'Sakai', 'MAN', 'Mercedes-Benz', 'Iveco', 'Renault', 'Volvo', 'Bobcat', 'Komatsu', 'Hitachi', 'Daewoo', 'Toyota', 'Mitsubishi', 'Perkins', 'Cummins'];

export type TeamIcon = 'crown' | 'hardhat' | 'wallet' | 'scale' | 'chart' | 'truck' | 'ruler';

export const team: { icon: TeamIcon; role: L10n; name: L10n }[] = [
  { icon: 'crown', role: { en: 'General Manager', ku: 'بەڕێوەبەری گشتی', ar: 'المدير العام' }, name: { en: 'Nariman Abdulrahman Ahmed', ku: 'نەریمان عبدالرحمن احمد', ar: 'نريمان عبدالرحمن أحمد' } },
  { icon: 'hardhat', role: { en: 'Executive Director, Engineering', ku: 'بەڕێوەبەری جێبەجێکار، بەشی ئەندازیاری', ar: 'المدير التنفيذي، القسم الهندسي' }, name: { en: 'Falah Hassan Mohammed', ku: 'فلاح حسن محمد', ar: 'فلاح حسن محمد' } },
  { icon: 'wallet', role: { en: 'Finance Director', ku: 'بەڕێوەبەری دارایی', ar: 'المدير المالي' }, name: { en: 'Rawaz Nariman Abdulrahman', ku: 'ڕەوەز نەریمان عبدالرحمن', ar: 'رواز نريمان عبدالرحمن' } },
  { icon: 'scale', role: { en: 'Legal Advisor', ku: 'ڕاوێژکاری یاسایی', ar: 'المستشار القانوني' }, name: { en: 'Soran Rashid Abdulrahman', ku: 'سۆران ڕەشید عبدالرحمن', ar: 'سوران رشيد عبدالرحمن' } },
  { icon: 'chart', role: { en: 'Projects Director', ku: 'بەڕێوەبەری پڕۆژەکان', ar: 'مدير المشاريع' }, name: { en: 'Rawand Nariman Abdulrahman', ku: 'ڕەوەند نەریمان عبدالرحمن', ar: 'رواند نريمان عبدالرحمن' } },
  { icon: 'truck', role: { en: 'Logistics', ku: 'بەشی لۆجستی', ar: 'القسم اللوجستي' }, name: { en: 'Rahel Sarkawt Mohammed', ku: 'ڕەهێڵ سەرکەوت محمد', ar: 'راهيل سركوت محمد' } },
  { icon: 'ruler', role: { en: 'Civil Engineering', ku: 'بەشی ئەندازیاری شارستانی', ar: 'قسم الهندسة المدنية' }, name: { en: 'Sarwar Mohammed Karim', ku: 'سەروەر محمد کریم', ar: 'سرور محمد كريم' } },
];

export const certificates = ['cert-1.jpg', 'cert-2.jpg', 'cert-3.jpg', 'cert-4.jpg', 'cert-5.jpg'];
