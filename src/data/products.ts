export type Product = {
  name: string;
  note?: string;
  price: number; // руб. за 1 кг
  photo?: string; // фото банки/канистры для подсказки при наведении в прайсе
};

export type ProductCategory = {
  slug: string;
  name: string;
  photo: string;
  desc: string;
  products: Product[];
};

// Ассортимент и цены — со старого сайта lkm-opt (страницы категорий).
export const CATEGORIES: ProductCategory[] = [
  {
    slug: 'gruntemal',
    name: 'Грунт-эмаль',
    photo: '/cat-gruntemal-v2.jpg',
    desc: 'Грунтование и финишное покрытие за один проход. Полиуретановые и эпоксидные системы для металлоконструкций.',
    products: [
      { name: 'Masscopur 15', note: 'Двухкомпонентная полиуретановая грунт-эмаль', price: 740 },
      { name: 'АКРУС Гидро', price: 790 },
      { name: 'АКРУС Эпокс С', note: 'Грунт-эмаль', price: 680 },
      { name: 'АКРУС Эпоцинк', price: 695 },
      { name: 'Армокот F100', note: 'Полисилоксановый материал', price: 530 },
      { name: 'Армокот S70', note: 'Полисилоксановый материал', price: 640 },
      { name: 'Армокот T700', price: 730 },
      { name: 'Армокот V500', price: 670 },
      { name: 'ВИНИКОР грунт-эмаль', price: 630 },
      { name: 'ВИНИКОР-норд', note: 'Холдинг ВМП', price: 670 },
      { name: 'ИЗОЛЭП-mastic', note: 'Толстослойная грунт-эмаль', price: 680 },
      { name: 'ЭМАКОУТ 7320', note: 'Грунт-эмаль · М ЛАК', price: 730 },
    ],
  },
  {
    slug: 'grunt',
    name: 'Грунт',
    photo: '/cat-grunt-v2.jpg',
    desc: 'Антикоррозионные грунтовки, в том числе цинкнаполненные — основа долговечного покрытия в агрессивных средах.',
    products: [
      { name: 'АЛПОЛ', price: 570 },
      { name: 'Армокот 01', note: 'Полисилоксановый материал', price: 495 },
      { name: 'Вектор 1025', price: 690 },
      { name: 'ВИНИКОР-061', price: 640 },
      { name: 'ЭМЛАК ПРАЙМЕР 262', note: 'Грунтовка', price: 750 },
      { name: 'ИЗОЛЭП-primer', price: 620 },
      { name: 'СпецПротект 006', note: 'Полиуретановая влагоотверждаемая грунтовка', price: 670 },
      { name: 'СпецПротект 007', note: 'Полиуретановая грунтовка', price: 680 },
      { name: 'ЦИНОЛ', price: 740 },
      { name: 'СпецПротект 008', note: 'Эпоксидная цинкосодержащая грунтовка', price: 690 },
      { name: 'СпецПротект 011', note: 'Эпоксидная грунтовка', price: 680 },
    ],
  },
  {
    slug: 'emal',
    name: 'Эмаль',
    photo: '/cat-emal-v2.jpg',
    desc: 'Атмосферостойкие финишные эмали, включая полисилоксановые составы для мостов и промышленных объектов.',
    products: [
      { name: 'АКРУС Лонг эмаль', price: 740 },
      { name: 'АКРУС Полиур', price: 680 },
      { name: 'ВИНИКОР-62 (Марка А)', price: 640 },
      { name: 'ИЗОЛЭП-mio', price: 760 },
      { name: 'ПОЛИТОН-УР', price: 590 },
      { name: 'ПОЛИТОН-УР (УФ)', price: 680 },
      { name: 'СпецПротект 109', note: 'Полиуретановая эмаль', price: 680 },
      { name: 'СпецПротект 112', note: 'Полиуретановая эмаль', price: 680 },
      { name: 'Эмаль MASSCOPUR 14', price: 800 },
      { name: 'ИЗОЛЭП-oil', note: 'Холдинг ВМП', price: 780 },
      { name: 'ЭМАКОУТ 5335', note: 'Эмаль · М ЛАК', price: 730 },
    ],
  },
  {
    slug: 'mastika',
    name: 'Мастика',
    photo: '/cat-mastika-v2.jpg',
    desc: 'Гидроизоляционные и защитные мастики для трубопроводов, кровли и подземных конструкций.',
    products: [
      { name: 'Мастика «Вектор 1214»', note: 'Антикоррозийная', price: 685 },
      { name: 'Мастика «Вектор 1236»', note: 'Антикоррозийная', price: 700 },
    ],
  },
];

export const PARTNERS = [
  { name: 'Газпром', logo: '/partners/gazprom.png' },
  { name: 'Лукойл', logo: '/partners/lukoil.png' },
  { name: 'РЖД', logo: '/partners/rzd.png' },
  { name: 'Норникель', logo: '/partners/nornickel.png' },
  { name: 'Ростех', logo: '/partners/rostec.png' },
  { name: 'Башнефть', logo: '/partners/bashneft.png' },
  { name: 'УГМК', logo: '/partners/ugmk.png' },
  { name: 'Росавтодор', logo: '/partners/rosavtodor.png' },
  { name: 'Металлоинвест', logo: '/partners/metalloinvest.png' },
  { name: 'Русская медная компания', logo: '/partners/rmk.png' },
];
