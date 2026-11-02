export interface OptionItem {
  code: number;
  label: string;
  en: string;
  stopInterview?: boolean;
  exclusive?: boolean;
  hasOtherInput?: boolean;
  subQuestion?: string;
}

export interface SurveyLocation {
  id: number;
  name: string;
  shortCode: string;
  quotaTarget: number;
  en: string;
}

export const SURVEY_LOCATIONS: SurveyLocation[] = [
  { id: 1, name: '1. Cổng thành', shortCode: 'CT', quotaTarget: 120, en: '1. Castle Gate (Cổng thành)' },
  { id: 2, name: '2. Nhà thờ - Điểm 1', shortCode: 'NT1', quotaTarget: 120, en: '2. St. Denis Church - Point 1' },
  { id: 3, name: '3. Nhà thờ - Điểm 2', shortCode: 'NT2', quotaTarget: 120, en: '3. St. Denis Church - Point 2' },
  { id: 4, name: '4. Ga 12 (Mixed-use)', shortCode: 'G12', quotaTarget: 120, en: '4. Station 12 (Mixed-use)' },
  { id: 5, name: '5. Vòng xuyến', shortCode: 'VX', quotaTarget: 120, en: '5. Roundabout (Vòng xuyến)' },
];

export const S1_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Rồi (Từ 4 tiếng trở lên)', en: 'Yes (4 hours or more)' },
  { code: 2, label: 'Chưa (Dưới 4 tiếng)', en: 'No (Less than 4 hours)', stopInterview: true },
];

export const S2_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Có, cho cả nhóm', en: 'Yes, for the whole group' },
  { code: 2, label: 'Có, nhưng chỉ cho bản thân', en: 'Yes, for myself only' },
  { code: 3, label: 'Không, người khác chi trả hoàn toàn', en: 'No, someone else pays completely', stopInterview: true },
];

export const S3_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Nam', en: 'Male' },
  { code: 2, label: 'Nữ', en: 'Female' },
];

export const S4_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Dưới 18 tuổi', en: 'Under 18', stopInterview: true },
  { code: 2, label: '18 – 25 tuổi', en: '18 – 25 years old' },
  { code: 3, label: '26 – 35 tuổi', en: '26 – 35 years old' },
  { code: 4, label: '36 – 45 tuổi', en: '36 – 45 years old' },
  { code: 5, label: '46 – 55 tuổi', en: '46 – 55 years old' },
  { code: 6, label: 'Trên 55 tuổi', en: 'Over 55 years old' },
];

export const S5_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Việt Nam: TP. Đà Nẵng', en: 'Vietnam: Da Nang City' },
  { code: 2, label: 'Việt Nam: Miền Bắc', en: 'Vietnam: Northern Region' },
  { code: 3, label: 'Việt Nam: Miền Trung (trừ TP. Đà Nẵng)', en: 'Vietnam: Central Region (excl. Da Nang)' },
  { code: 4, label: 'Việt Nam: Miền Nam', en: 'Vietnam: Southern Region' },
  { code: 5, label: 'Hàn Quốc / South Korea', en: 'South Korea' },
  { code: 6, label: 'Ấn Độ / India', en: 'India' },
  { code: 7, label: 'Đông Nam Á (Thái Lan, Malaysia, Philippines,...)', en: 'Southeast Asia (Thailand, Malaysia, Philippines,...)' },
  { code: 8, label: 'Đông Bắc Á khác (Nhật Bản, Trung Quốc, Đài Loan,...)', en: 'Other Northeast Asia (Japan, China, Taiwan,...)' },
  { code: 9, label: 'Western countries – Europe/Americas/Australia', en: 'Western countries – Europe / Americas / Australia' },
  { code: 11, label: 'Nga / Russia (Nhóm ưu tiên Quota)', en: 'Russia / CIS' },
  { code: 10, label: 'Khác (ghi rõ)', en: 'Other (specify)', hasOtherInput: true },
];

export const S6_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Đi một mình / Solo traveler', en: 'Solo traveler' },
  { code: 2, label: 'Gia đình có trẻ em (dưới 12 tuổi)', en: 'Family with children (<12 years old)' },
  { code: 3, label: 'Gia đình người lớn / đa thế hệ (không có trẻ em <12 tuổi)', en: 'Adult / Multi-generational family (no children <12)' },
  { code: 4, label: 'Nhóm bạn / cặp đôi', en: 'Friends / Couple' },
  { code: 5, label: 'Đoàn khách / công ty', en: 'Tour group / Company MICE' },
];

export const S7_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Đi tự do / Tự túc', en: 'Independent / Self-guided traveler (FIT)' },
  { code: 2, label: 'Đi theo tour trọn gói của công ty lữ hành (đã gồm suất ăn trưa)', en: 'Package tour via travel agency (lunch included)' },
];

export const S8_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Lần đầu', en: 'First time' },
  { code: 2, label: 'Lần thứ 2', en: 'Second time' },
  { code: 3, label: 'Từ lần thứ 3 trở lên', en: '3rd time or more' },
];

export const S9_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Chỉ vé cáp treo', en: 'Cable car ticket only' },
  { code: 2, label: 'Combo cáp treo + buffet', en: 'Cable car + Buffet combo' },
  { code: 3, label: 'Combo cáp treo + voucher ẩm thực (mệnh giá 300.000đ)', en: 'Cable car + F&B Voucher combo (300,000 VND)' },
  { code: 4, label: 'Vé trong tour trọn gói', en: 'Included in package tour' },
  { code: 5, label: 'Gói/vé ưu đãi khác (First 18–25, giá địa phương,...)', en: 'Special promo ticket (First 18–25, local resident,...)' },
  { code: 6, label: 'Không rõ', en: 'Not sure' },
];

export const A1_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Dưới 150.000đ', en: 'Under 150,000 VND' },
  { code: 2, label: 'Từ 150.000 đến dưới 300.000đ', en: '150,000 – < 300,000 VND' },
  { code: 3, label: 'Từ 300.000 đến dưới 400.000đ', en: '300,000 – < 400,000 VND' },
  { code: 4, label: 'Từ 400.000 đến dưới 500.000đ', en: '400,000 – < 500,000 VND' },
  { code: 5, label: 'Từ 500.000 đến dưới 700.000đ', en: '500,000 – < 700,000 VND' },
  { code: 6, label: 'Từ 700.000 đến dưới 1.000.000đ', en: '700,000 – < 1,000,000 VND' },
  { code: 7, label: 'Từ 1.000.000đ trở lên', en: '1,000,000 VND or more' },
  { code: 8, label: 'Chưa dự trù / không nhớ', en: 'Did not budget / Cannot recall' },
];

export const A2_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Nhà hàng buffet (Bốn Mùa, Taiga, Bharata,...)', en: 'Buffet restaurant (Four Seasons, Taiga, Bharata,...)' },
  { code: 2, label: 'Nhà hàng gọi món (à la carte/set menu)', en: 'À la carte / Set menu restaurant' },
  { code: 3, label: 'Đồ ăn nhanh/món ăn nhẹ (xiên nướng, xúc xích,...)', en: 'Fast food / Snacks (grilled skewers, sausages,...)' },
  { code: 4, label: 'Bánh ngọt, kem, trái cây mang đi', en: 'Pastries, ice cream, takeaway fruit' },
  { code: 5, label: 'Cà phê, trà, nước giải khát, bia hoặc đồ uống pha chế', en: 'Coffee, tea, soft drinks, beer, or crafted beverages' },
  { code: 6, label: 'Mua đồ ăn, thức uống mang về làm quà', en: 'Packaged F&B souvenirs / gifts to take home' },
  { code: 7, label: 'Chưa sử dụng bất kỳ dịch vụ F&B nào (Mã loại trừ)', en: 'Have not used any F&B services today (Exclusive)', exclusive: true },
];

export const A3_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Đã ăn uống trước khi đến hoặc không có nhu cầu ăn uống', en: 'Ate before arriving or no need to eat/drink', subQuestion: 'A3.1' },
  { code: 2, label: 'Đã mang theo đồ ăn, thức uống', en: 'Brought own food and drinks' },
  { code: 3, label: 'Giá chưa phù hợp với ngân sách', en: 'Prices do not fit my budget', subQuestion: 'A3.2' },
  { code: 4, label: 'Chưa tìm thấy món ăn/thức uống phù hợp sở thích/văn hóa', en: 'Could not find food/drinks matching my taste/culture', subQuestion: 'A3.3' },
  { code: 5, label: 'Khó tìm điểm bán hoặc điểm bán không tiện trên hành trình', en: 'Outlets are hard to find or inconvenient along the route' },
  { code: 6, label: 'Thiếu thông tin/biển chỉ dẫn về các điểm bán F&B', en: 'Lack of information / signage for F&B outlets' },
  { code: 7, label: 'Lo ngại thời gian chờ đợi/xếp hàng lâu', en: 'Worried about long waiting / queueing times' },
  { code: 8, label: 'Đã có suất ăn trong vé/tour và không muốn chi thêm', en: 'Meal already included in ticket/tour and do not want to spend extra' },
  { code: 9, label: 'Lý do khác (ghi rõ)', en: 'Other reason (specify)', hasOtherInput: true },
];

export const A3_4_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Chắc chắn sẽ sử dụng', en: 'Definitely will use' },
  { code: 2, label: 'Có thể sẽ sử dụng', en: 'Might use' },
  { code: 3, label: 'Vẫn không sử dụng', en: 'Still will not use' },
];

export const A4_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Dưới 150.000đ', en: 'Under 150,000 VND' },
  { code: 2, label: 'Từ 150.000 đến dưới 300.000đ', en: '150,000 – < 300,000 VND' },
  { code: 3, label: 'Từ 300.000 đến dưới 400.000đ', en: '300,000 – < 400,000 VND' },
  { code: 4, label: 'Từ 400.000 đến dưới 500.000đ', en: '400,000 – < 500,000 VND' },
  { code: 5, label: 'Từ 500.000 đến dưới 700.000đ', en: '500,000 – < 700,000 VND' },
  { code: 6, label: 'Từ 700.000 đến dưới 1.000.000đ', en: '700,000 – < 1,000,000 VND' },
  { code: 7, label: 'Từ 1.000.000đ trở lên', en: '1,000,000 VND or more' },
  { code: 8, label: 'Không xác định được (không biết giá suất ăn đã bao gồm → hỏi A4.1)', en: 'Cannot determine (do not know included meal price → ask A4.1)' },
];

export const A4_1_OPTIONS: OptionItem[] = [
  { code: 0, label: '0đ (Chưa chi thêm ngoài suất ăn trong vé/tour)', en: '0 VND (No extra spend beyond ticket/tour meal)' },
  { code: 1, label: 'Dưới 50.000đ', en: 'Under 50,000 VND' },
  { code: 2, label: 'Từ 50.000 đến dưới 100.000đ', en: '50,000 – < 100,000 VND' },
  { code: 3, label: 'Từ 100.000 đến dưới 200.000đ', en: '100,000 – < 200,000 VND' },
  { code: 4, label: 'Từ 200.000 đến dưới 300.000đ', en: '200,000 – < 300,000 VND' },
  { code: 5, label: 'Từ 300.000 đến dưới 500.000đ', en: '300,000 – < 500,000 VND' },
  { code: 6, label: 'Từ 500.000đ trở lên', en: '500,000 VND or more' },
];

export interface A5CategoryRow {
  a2Code: number;
  key: string;
  label: string;
  en: string;
}

// Khắc phục bất cập 2: Đầy đủ cả 6 dòng tương ứng với A2 (bao gồm Nhà hàng buffet nếu chọn A2=1)
export const A5_ROWS: A5CategoryRow[] = [
  { a2Code: 1, key: 'buffet', label: 'Nhà hàng buffet (Bốn Mùa, Taiga, Bharata,...)', en: 'Buffet restaurant' },
  { a2Code: 2, key: 'alacarte', label: 'Gọi món (à la carte/set menu)', en: 'À la carte / Set menu' },
  { a2Code: 3, key: 'fastfood', label: 'Đồ ăn nhanh/món ăn nhẹ', en: 'Fast food / Snacks' },
  { a2Code: 4, key: 'pastry', label: 'Bánh ngọt/kem/trái cây', en: 'Pastries / Ice cream / Fruit' },
  { a2Code: 5, key: 'beverage', label: 'Đồ uống (cà phê, trà, bia, nước giải khát)', en: 'Beverages (coffee, tea, beer, soft drinks)' },
  { a2Code: 6, key: 'souvenir', label: 'Đồ ăn/thức uống mua về làm quà', en: 'F&B gifts to take home' },
];

export const A5_COLUMNS: OptionItem[] = [
  { code: 1, label: 'Dưới 100.000đ', en: '< 100k' },
  { code: 2, label: '100.000 – <250.000đ', en: '100k – <250k' },
  { code: 3, label: '250.000 – <350.000đ', en: '250k – <350k' },
  { code: 4, label: '350.000 – <500.000đ', en: '350k – <500k' },
  { code: 5, label: 'Từ 500.000đ', en: '≥ 500k' },
];

export const A6_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Đặt trước chuyến đi (khi mua vé/tour online hoặc qua đại lý)', en: 'Booked before the trip (online or via agency)' },
  { code: 2, label: 'Ngay khi đến khu du lịch/lên trạm cáp treo', en: 'Right upon arriving at the resort / cable car station' },
  { code: 3, label: 'Đến giờ ăn cố định (khoảng 11:30 – 13:30)', en: 'At fixed meal times (around 11:30 – 13:30)' },
  { code: 4, label: 'Bắt đầu cảm thấy đói/khát hoặc mệt mỏi trên đường đi', en: 'When feeling hungry, thirsty, or tired along the way' },
  { code: 5, label: 'Khi nhìn thấy hình ảnh món ăn/biển quảng cáo/khuyến mại bắt mắt', en: 'When seeing attractive food visuals / signage / promos' },
  { code: 6, label: 'Khi được nhân viên giới thiệu', en: 'When recommended by staff' },
  { code: 7, label: 'Khi đi ngang qua điểm bán tiện lợi, không phải chờ đợi', en: 'When passing by a convenient outlet with no waiting line' },
  { code: 8, label: 'Khác (ghi rõ)', en: 'Other (specify)', hasOtherInput: true },
];

export const A7_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Có', en: 'Yes' },
  { code: 2, label: 'Có thể, tùy sản phẩm và mức giá', en: 'Maybe, depending on product and price' },
  { code: 3, label: 'Không (Chuyển thẳng sang Phần B)', en: 'No (Skip to Section B)' },
];

export const A8_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Dưới 50.000đ', en: 'Under 50,000 VND' },
  { code: 2, label: 'Từ 50.000 đến dưới 100.000đ', en: '50,000 – < 100,000 VND' },
  { code: 3, label: 'Từ 100.000 đến dưới 200.000đ', en: '100,000 – < 200,000 VND' },
  { code: 4, label: 'Từ 200.000 đến dưới 300.000đ', en: '200,000 – < 300,000 VND' },
  { code: 5, label: 'Từ 300.000 đến dưới 500.000đ', en: '300,000 – < 500,000 VND' },
  { code: 6, label: 'Từ 500.000đ trở lên', en: '500,000 VND or more' },
];

export const B1_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Ẩm thực địa phương (món đặc trưng Đà Nẵng – Quảng Nam)', en: 'Local cuisine (Da Nang – Quang Nam specialties)' },
  { code: 2, label: 'Ẩm thực quê hương của Anh/Chị (món quen thuộc quốc gia/vùng miền)', en: 'Home-country / regional comfort food' },
  { code: 3, label: 'Ẩm thực quốc tế (Âu, Nhật, Hàn, Ấn,...)', en: 'International cuisine (Western, Japanese, Korean, Indian,...)' },
  { code: 4, label: 'Ẩm thực cao cấp (Fine dining)', en: 'Premium / Fine dining cuisine' },
  { code: 5, label: 'Ẩm thực chay (Vegetarian)', en: 'Vegetarian cuisine' },
  { code: 6, label: 'Ẩm thực healthy, tốt cho sức khỏe', en: 'Healthy / Wellness food' },
  { code: 7, label: 'Đồ ăn nhanh (burger, gà rán, xiên que nướng,...)', en: 'Fast food (burgers, fried chicken, grilled skewers,...)' },
  { code: 8, label: 'Bánh ngọt, bánh mì tươi, kem và món tráng miệng', en: 'Pastries, fresh bakery, ice cream & desserts' },
  { code: 9, label: 'Cà phê, trà, nước trái cây tươi và đồ uống pha chế', en: 'Coffee, tea, fresh juices & crafted drinks' },
  { code: 10, label: 'Combo đồ ăn và thức uống', en: 'Food & beverage value combos' },
  { code: 11, label: 'Quà tặng ẩm thực đóng gói đặc trưng Bà Nà', en: 'Packaged Ba Na specialty F&B gifts' },
  { code: 12, label: 'Khác (ghi rõ)', en: 'Other (specify)', hasOtherInput: true },
];

export const B2_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Buffet đa dạng món ăn', en: 'All-you-can-eat Buffet with diverse dishes' },
  { code: 2, label: 'Nhà hàng gọi món, phục vụ tại bàn', en: 'À la carte restaurant with table service' },
  { code: 3, label: 'Quầy bán đồ ăn nhanh, nhận món nhanh', en: 'Quick-service fast food counter' },
  { code: 4, label: 'Kiosk/quầy mang đi trên hành trình tham quan', en: 'Grab-and-go kiosk along the sightseeing route' },
  { code: 5, label: 'Combo đồ ăn và thức uống giá trọn gói', en: 'All-in-one Food & Drink combo' },
  { code: 6, label: 'Xe đẩy hoặc điểm bán lưu động tại khu vực đông khách', en: 'Food carts / mobile stalls at busy areas' },
  { code: 7, label: 'Không có ưu tiên cụ thể (Mã loại trừ)', en: 'No specific preference (Exclusive)', exclusive: true },
];

export const B3_1_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Không/ít cay', en: 'Non-spicy / Mild' },
  { code: 2, label: 'Cay vừa', en: 'Medium spicy' },
  { code: 3, label: 'Nhiều cay', en: 'Very spicy' },
  { code: 4, label: 'Không quan trọng', en: 'Does not matter' },
];

export const B3_2_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Thanh nhẹ', en: 'Light / Subtle flavor' },
  { code: 2, label: 'Đậm vị', en: 'Rich / Bold flavor' },
  { code: 3, label: 'Không quan trọng', en: 'Does not matter' },
];

export const B3_3_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Món nóng', en: 'Hot dishes' },
  { code: 2, label: 'Món lạnh', en: 'Cold / Chilled items' },
  { code: 3, label: 'Cả hai / không quan trọng', en: 'Both / Does not matter' },
];

export interface B4ProductRow {
  key: 'buffet' | 'alacarte' | 'fastfood' | 'beverage' | 'pastry';
  label: string;
  en: string;
  options: OptionItem[];
}

export const B4_ROWS: B4ProductRow[] = [
  {
    key: 'buffet',
    label: 'Buffet / người lớn',
    en: 'Buffet / adult',
    options: [
      { code: 1, label: 'Dưới 300.000đ', en: '< 300k' },
      { code: 2, label: '300.000 – 399.000đ', en: '300k – 399k' },
      { code: 3, label: '400.000 – 499.000đ', en: '400k – 499k' },
      { code: 4, label: '500.000đ trở lên', en: '≥ 500k' },
      { code: 5, label: 'Không có nhu cầu', en: 'No need' },
    ],
  },
  {
    key: 'alacarte',
    label: 'À la carte / người lớn',
    en: 'À la carte / adult',
    options: [
      { code: 1, label: 'Dưới 300.000đ', en: '< 300k' },
      { code: 2, label: '300.000 – 399.000đ', en: '300k – 399k' },
      { code: 3, label: '400.000 – 499.000đ', en: '400k – 499k' },
      { code: 4, label: '500.000đ trở lên', en: '≥ 500k' },
      { code: 5, label: 'Không có nhu cầu', en: 'No need' },
    ],
  },
  {
    key: 'fastfood',
    label: 'Đồ ăn nhanh / một phần',
    en: 'Fast food / portion',
    options: [
      { code: 1, label: 'Dưới 50.000đ', en: '< 50k' },
      { code: 2, label: '50.000 – 79.000đ', en: '50k – 79k' },
      { code: 3, label: '80.000 – 119.000đ', en: '80k – 119k' },
      { code: 4, label: '120.000đ trở lên', en: '≥ 120k' },
      { code: 5, label: 'Không có nhu cầu', en: 'No need' },
    ],
  },
  {
    key: 'beverage',
    label: 'Đồ uống / một ly',
    en: 'Beverage / cup',
    options: [
      { code: 1, label: 'Dưới 30.000đ', en: '< 30k' },
      { code: 2, label: '30.000 – 49.000đ', en: '30k – 49k' },
      { code: 3, label: '50.000 – 69.000đ', en: '50k – 69k' },
      { code: 4, label: '70.000đ trở lên', en: '≥ 70k' },
      { code: 5, label: 'Không có nhu cầu', en: 'No need' },
    ],
  },
  {
    key: 'pastry',
    label: 'Bánh ngọt, kem / một phần',
    en: 'Pastry or Ice cream / portion',
    options: [
      { code: 1, label: 'Dưới 30.000đ', en: '< 30k' },
      { code: 2, label: '30.000 – 49.000đ', en: '30k – 49k' },
      { code: 3, label: '50.000 – 79.000đ', en: '50k – 79k' },
      { code: 4, label: '80.000đ trở lên', en: '≥ 80k' },
      { code: 5, label: 'Không có nhu cầu', en: 'No need' },
    ],
  },
];

export const B4_PERCEPTION_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Đắt', en: 'Expensive' },
  { code: 2, label: 'Hợp lý', en: 'Reasonable' },
  { code: 3, label: 'Rẻ', en: 'Cheap' },
];

export interface B5ServqualItem {
  key: 'B5_1' | 'B5_2' | 'B5_3' | 'B5_4' | 'B5_5' | 'B5_6';
  code: string;
  dimension: string;
  label: string;
  en: string;
}

export const B5_ITEMS: B5ServqualItem[] = [
  {
    key: 'B5_1',
    code: 'B5.1',
    dimension: 'Tính hữu hình',
    label: 'Vệ sinh quầy kệ, không gian chỗ ngồi thoáng mát, sạch sẽ',
    en: 'Tangibles: Clean counters, airy and clean seating space',
  },
  {
    key: 'B5_2',
    code: 'B5.2',
    dimension: 'Chất lượng',
    label: 'Hương vị món ăn ngon, hợp khẩu vị, trình bày hấp dẫn',
    en: 'Quality: Delicious taste, suits palate, appealing presentation',
  },
  {
    key: 'B5_3',
    code: 'B5.3',
    dimension: 'Sự tin cậy',
    label: 'Niêm yết giá công khai, an toàn vệ sinh thực phẩm',
    en: 'Reliability: Clear price listing, food safety & hygiene',
  },
  {
    key: 'B5_4',
    code: 'B5.4',
    dimension: 'Thái độ & Phản hồi',
    label: 'Nhân viên thân thiện, thời gian chờ lấy món nhanh',
    en: 'Responsiveness: Friendly staff, fast serving time',
  },
  {
    key: 'B5_5',
    code: 'B5.5',
    dimension: 'Sự thấu cảm',
    label: 'Có thực đơn riêng cho Trẻ em / Món chay / Khách quốc tế',
    en: 'Empathy: Dedicated menus for Kids / Vegetarian / International guests',
  },
  {
    key: 'B5_6',
    code: 'B5.6',
    dimension: 'Tiện lợi',
    label: 'Vị trí điểm bán dễ tìm dọc hành trình tham quan',
    en: 'Convenience: Easy-to-find outlets along the sightseeing route',
  },
];

export const C1_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Buổi sáng trước 10:30 (cần điểm ăn sáng/cà phê)', en: 'Morning before 10:30 (breakfast / morning coffee)' },
  { code: 2, label: 'Khoảng 10:30 – 14:00 (giờ ăn trưa chính)', en: 'Around 10:30 – 14:00 (main lunch hours)' },
  { code: 3, label: 'Khoảng 14:00 – 16:00 (xế chiều: kem, bánh ngọt, trà/cà phê nghỉ chân)', en: 'Around 14:00 – 16:00 (afternoon break: ice cream, pastry, tea/coffee)' },
  { code: 4, label: 'Khoảng 16:00 – 17:30 (ăn nhẹ/mua nước trước khi xuống cáp treo)', en: 'Around 16:00 – 17:30 (light snack / drink before taking cable car down)' },
  { code: 5, label: 'Sau 17:30 (tiệc tối/đồ ăn đêm)', en: 'After 17:30 (dinner / night dining)' },
  { code: 6, label: 'Mua rải rác liên tục khi thấy điểm bán tiện đường', en: 'Spontaneously throughout the trip when passing convenient outlets' },
];

export const C2_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Món/khẩu phần cho trẻ em', en: 'Kids menu / child-sized portions' },
  { code: 2, label: 'Món chay (Vegetarian)', en: 'Vegetarian food' },
  { code: 3, label: 'Món mềm, dễ ăn cho người lớn tuổi', en: 'Soft, easy-to-digest food for seniors' },
  { code: 4, label: 'Kiêng/dị ứng thực phẩm (hải sản, đậu phộng, gluten,...)', en: 'Food allergies / restrictions (seafood, peanuts, gluten,...)' },
  { code: 5, label: 'Thực phẩm Halal (dành cho khách Hồi giáo)', en: 'Halal-certified food' },
  { code: 6, label: 'Khác (ghi rõ)', en: 'Other (specify)', hasOtherInput: true },
  { code: 7, label: 'Không có nhu cầu đặc biệt (Mã loại trừ)', en: 'No special dietary needs (Exclusive)', exclusive: true },
];

export const C3_OPTIONS: OptionItem[] = [
  { code: 1, label: 'Bổ sung biển chỉ dẫn điểm bán và thực đơn', en: 'Add more directional signage and menu boards' },
  { code: 2, label: 'Công khai giá bán rõ ràng, dễ quan sát', en: 'Display prices clearly and visibly' },
  { code: 3, label: 'Rút ngắn thời gian xếp hàng và nhận món', en: 'Shorten queueing and food pickup waiting times' },
  { code: 4, label: 'Bổ sung điểm bán nhanh trên hành trình', en: 'Add more grab-and-go kiosks along the route' },
  { code: 5, label: 'Tăng số lượng chỗ ngồi hoặc khu vực nghỉ chân', en: 'Increase seating capacity and rest areas' },
  { code: 6, label: 'Bổ sung combo tiết kiệm', en: 'Offer more value meal combos' },
  { code: 7, label: 'Có nhiều lựa chọn phù hợp cho trẻ em', en: 'More kid-friendly food choices' },
  { code: 8, label: 'Bổ sung món chay/lựa chọn cho nhu cầu ăn uống đặc biệt', en: 'More vegetarian / special-diet options (Halal, allergy-free)' },
  { code: 9, label: 'Đa dạng hóa món ăn và đồ uống', en: 'Diversify food and beverage variety' },
  { code: 10, label: 'Cải thiện chất lượng, hương vị và độ ổn định của món ăn', en: 'Improve taste, quality, and consistency of dishes' },
  { code: 11, label: 'Tăng tiện ích thanh toán (QR, thẻ quốc tế, ví điện tử)', en: 'Enhance payment convenience (QR, international cards, e-wallets)' },
  { code: 12, label: 'Khác (ghi rõ)', en: 'Other (specify)', hasOtherInput: true },
  { code: 13, label: 'Không có đề xuất (Mã loại trừ)', en: 'No suggestions (Exclusive)', exclusive: true },
];

export interface SurveyResponseData {
  id: string;
  surveyCode: string;
  surveyDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  durationSeconds: number;
  locationId: number;
  interviewerUid: string;
  interviewerName: string;
  interviewerEmail: string;
  giftName: string;
  status: 'completed' | 'screenout';
  screenoutReason?: string;
  syncedToCloud?: boolean;
  createdAtIso: string;

  // Phần S
  S1: number | null;
  S2: number | null;
  S3: number | null;
  S4: number | null;
  S5: number | null;
  S5_other: string;
  S6: number | null;
  S7: number | null;
  S8: number | null;
  S9: number | null;

  // Phần A
  A1: number | null;
  A1_locked: boolean;
  A2: number[];
  // Nhánh chưa dùng F&B (A2 = [7])
  A3: number[];
  A3_other: string;
  A3_1: string;
  A3_2: string;
  A3_3: string;
  A3_4: number | null;
  // Nhánh đã dùng F&B (A2 có 1..6)
  A4: number | null;
  A4_1: number | null;
  A5: Record<string, number | null>;
  A6: number[];
  A6_other: string;
  A7: number | null;
  A8: number | null;

  // Phần B
  B1: number[];
  B1_other: string;
  B2: number[];
  B3_1: number | null;
  B3_2: number | null;
  B3_3: number | null;
  B4: {
    buffet: number | null;
    alacarte: number | null;
    fastfood: number | null;
    beverage: number | null;
    pastry: number | null;
  };
  B5: {
    B5_1: number | null;
    B5_2: number | null;
    B5_3: number | null;
    B5_4: number | null;
    B5_5: number | null;
    B5_6: number | null;
  };

  // Phần C
  C1: number[];
  C2: number[];
  C2_other: string;
  C3: number[];
  C3_other: string;
  C4_note: string;

  // Dữ liệu cho các câu hỏi mở rộng / câu hỏi con do Admin thêm mới
  customAnswers?: Record<string, number | number[] | string | null>;
  otherInputs?: Record<string, string>;
}

const BUILTIN_SINGLE_KEYS = new Set([
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'S6',
  'S7',
  'S8',
  'S9',
  'A1',
  'A3_4',
  'A4',
  'A4_1',
  'A7',
  'A8',
  'B3_1',
  'B3_2',
  'B3_3',
]);

const BUILTIN_MULTI_KEYS = new Set(['A2', 'A3', 'A6', 'B1', 'B2', 'C1', 'C2', 'C3']);

const BUILTIN_TEXT_KEYS = new Set([
  'S5_other',
  'A3_other',
  'A3_1',
  'A3_2',
  'A3_3',
  'A6_other',
  'B1_other',
  'C2_other',
  'C3_other',
  'C4_note',
]);

export function getSingleAnswer(data: SurveyResponseData, qKey: string): number | null {
  if (BUILTIN_SINGLE_KEYS.has(qKey)) {
    const val = (data as unknown as Record<string, unknown>)[qKey];
    return typeof val === 'number' ? val : null;
  }
  const cVal = data.customAnswers?.[qKey];
  return typeof cVal === 'number' ? cVal : null;
}

export function getMultiAnswer(data: SurveyResponseData, qKey: string): number[] {
  if (BUILTIN_MULTI_KEYS.has(qKey)) {
    const val = (data as unknown as Record<string, unknown>)[qKey];
    return Array.isArray(val) ? (val as number[]) : [];
  }
  const cVal = data.customAnswers?.[qKey];
  return Array.isArray(cVal) ? (cVal as number[]) : [];
}

export function getTextAnswer(data: SurveyResponseData, qKey: string): string {
  if (BUILTIN_TEXT_KEYS.has(qKey)) {
    const val = (data as unknown as Record<string, unknown>)[qKey];
    return typeof val === 'string' ? val : '';
  }
  const cVal = data.customAnswers?.[qKey];
  return typeof cVal === 'string' ? cVal : '';
}

export function getOtherInputAnswer(data: SurveyResponseData, qKey: string): string {
  const legacyKey = `${qKey}_other`;
  if (BUILTIN_TEXT_KEYS.has(legacyKey)) {
    const val = (data as unknown as Record<string, unknown>)[legacyKey];
    if (typeof val === 'string' && val) return val;
  }
  return data.otherInputs?.[qKey] || '';
}

export function setSingleAnswer(
  prev: SurveyResponseData,
  qKey: string,
  val: number | null
): SurveyResponseData {
  if (BUILTIN_SINGLE_KEYS.has(qKey)) {
    return { ...prev, [qKey]: val };
  }
  return {
    ...prev,
    customAnswers: {
      ...(prev.customAnswers || {}),
      [qKey]: val,
    },
  };
}

export function setMultiAnswer(
  prev: SurveyResponseData,
  qKey: string,
  val: number[]
): SurveyResponseData {
  if (BUILTIN_MULTI_KEYS.has(qKey)) {
    return { ...prev, [qKey]: val };
  }
  return {
    ...prev,
    customAnswers: {
      ...(prev.customAnswers || {}),
      [qKey]: val,
    },
  };
}

export function setTextAnswer(
  prev: SurveyResponseData,
  qKey: string,
  val: string
): SurveyResponseData {
  if (BUILTIN_TEXT_KEYS.has(qKey)) {
    return { ...prev, [qKey]: val };
  }
  return {
    ...prev,
    customAnswers: {
      ...(prev.customAnswers || {}),
      [qKey]: val,
    },
  };
}

export function setOtherInputAnswer(
  prev: SurveyResponseData,
  qKey: string,
  val: string
): SurveyResponseData {
  const legacyKey = `${qKey}_other`;
  const nextOtherInputs = {
    ...(prev.otherInputs || {}),
    [qKey]: val,
  };
  if (BUILTIN_TEXT_KEYS.has(legacyKey)) {
    return {
      ...prev,
      [legacyKey]: val,
      otherInputs: nextOtherInputs,
    };
  }
  return {
    ...prev,
    otherInputs: nextOtherInputs,
  };
}

/**
 * Lấy điểm đánh giá (1..5) cho một dòng cụ thể `rowCode` trong câu hỏi Likert nhiều dòng `qKey`.
 * Đồng bộ ngược hoàn toàn với `B5.B5_1 .. B5.B5_6`.
 */
export function getLikertRowAnswer(
  data: SurveyResponseData,
  qKey: string,
  rowCode: number
): number | null {
  const rowKey = `${qKey}__${rowCode}`;
  const customVal = data.customAnswers?.[rowKey];
  if (typeof customVal === 'number') {
    return customVal;
  }
  if (qKey === 'B5' && rowCode >= 1 && rowCode <= 6) {
    const b5Key = `B5_${rowCode}` as keyof SurveyResponseData['B5'];
    const b5Val = data.B5?.[b5Key];
    if (typeof b5Val === 'number') {
      return b5Val;
    }
  }
  if (rowCode === 1) {
    const legacySingle = data.customAnswers?.[qKey];
    if (typeof legacySingle === 'number') {
      return legacySingle;
    }
  }
  return null;
}

/**
 * Ghi điểm đánh giá (1..5) cho một dòng cụ thể `rowCode` trong câu hỏi Likert nhiều dòng `qKey`.
 */
export function setLikertRowAnswer(
  prev: SurveyResponseData,
  qKey: string,
  rowCode: number,
  score: number | null
): SurveyResponseData {
  const rowKey = `${qKey}__${rowCode}`;
  const nextCustomAnswers = {
    ...(prev.customAnswers || {}),
    [rowKey]: score,
  };
  if (qKey === 'B5' && rowCode >= 1 && rowCode <= 6) {
    const b5Key = `B5_${rowCode}` as keyof SurveyResponseData['B5'];
    return {
      ...prev,
      B5: {
        ...prev.B5,
        [b5Key]: score,
      },
      customAnswers: nextCustomAnswers,
    };
  }
  return {
    ...prev,
    customAnswers: nextCustomAnswers,
  };
}

export function createEmptySurveyResponse(
  interviewerUid: string,
  interviewerName: string,
  interviewerEmail: string,
  locationId: number,
  giftName: string,
  sequenceNumber = 1,
  codePrefix = 'BN',
  customLocations: SurveyLocation[] = SURVEY_LOCATIONS
): SurveyResponseData {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const loc = customLocations.find((l) => l.id === locationId)?.shortCode || 'BN';
  const seqStr = String(sequenceNumber).padStart(3, '0');
  const randSuffix = String(Math.floor(10 + Math.random() * 89));
  const cleanPrefix = (codePrefix || 'BN').trim().toUpperCase();

  return {
    id: `SRV_${yyyy}${mm}${dd}_${loc}_${Date.now()}_${randSuffix}`,
    surveyCode: `${cleanPrefix}-${dd}${mm}-${loc}-${seqStr}`,
    surveyDate: `${yyyy}-${mm}-${dd}`,
    startTime: `${hh}:${min}:${ss}`,
    endTime: '',
    durationSeconds: 0,
    locationId,
    interviewerUid,
    interviewerName,
    interviewerEmail,
    giftName,
    status: 'completed',
    syncedToCloud: false,
    createdAtIso: now.toISOString(),

    S1: null,
    S2: null,
    S3: null,
    S4: null,
    S5: null,
    S5_other: '',
    S6: null,
    S7: null,
    S8: null,
    S9: null,

    A1: null,
    A1_locked: false,
    A2: [],
    A3: [],
    A3_other: '',
    A3_1: '',
    A3_2: '',
    A3_3: '',
    A3_4: null,
    A4: null,
    A4_1: null,
    A5: {
      buffet: null,
      alacarte: null,
      fastfood: null,
      pastry: null,
      beverage: null,
      souvenir: null,
    },
    A6: [],
    A6_other: '',
    A7: null,
    A8: null,

    B1: [],
    B1_other: '',
    B2: [],
    B3_1: null,
    B3_2: null,
    B3_3: null,
    B4: {
      buffet: null,
      alacarte: null,
      fastfood: null,
      beverage: null,
      pastry: null,
    },
    B5: {
      B5_1: null,
      B5_2: null,
      B5_3: null,
      B5_4: null,
      B5_5: null,
      B5_6: null,
    },

    C1: [],
    C2: [],
    C2_other: '',
    C3: [],
    C3_other: '',
    C4_note: '',
    customAnswers: {},
    otherInputs: {},
  };
}

export interface CustomQuestionCsvMeta {
  key: string;
  section?: string;
  title: string;
  type: 'single' | 'multi' | 'likert' | 'text';
  likertScale?: string[];
  hasOtherInput?: boolean;
  isSubQuestion?: boolean;
  parentQuestionKey?: string;
  options: (OptionItem & { rowCode?: string; hasOtherInput?: boolean })[];
}

export interface CsvExportOptions {
  delimiter?: ',' | ';';
  valueMode?: 'code_and_label' | 'code_only' | 'label_only';
  multiSelectSeparator?: string;
  locations?: SurveyLocation[];
  questionOptionsMap?: Record<string, OptionItem[]>;
  /** Danh sách đầy đủ các câu hỏi theo thứ tự cấu hình (bao gồm cả câu mặc định và câu Admin thêm mới) */
  allQuestionsInOrder?: CustomQuestionCsvMeta[];
  /** Tương thích ngược với tham số cũ */
  customQuestions?: CustomQuestionCsvMeta[];
  /** Có xuất dòng mô tả câu hỏi đầy đủ ở dòng tiêu đề thứ 2 của CSV hay không (mặc định: true) */
  includeQuestionTitleRow?: boolean;
}

export type ReportSectionId =
  | 'META'
  | 'PHẦN S'
  | 'PHẦN A'
  | 'PHẦN B'
  | 'PHẦN C'
  | 'MỞ RỘNG';

export interface StructuredReportColumn {
  /** Mã biến chuẩn phục vụ phân tích SPSS / Excel / Python */
  code: string;
  /** Nhãn tiêu đề đầy đủ của câu hỏi / tiêu chí */
  label: string;
  /** Phân nhóm cấu trúc trong báo cáo */
  section: ReportSectionId;
  /** Hàm trích xuất giá trị của 1 phiếu khảo sát ở cột này */
  getValue: (r: SurveyResponseData, rowIndex: number) => string | number;
}

export interface StructuredDetailField {
  code: string;
  label: string;
  value: string;
  isEmpty: boolean;
}

export interface StructuredDetailSection {
  section: ReportSectionId;
  sectionTitle: string;
  fields: StructuredDetailField[];
}

const DEFAULT_LIKERT_IMPORTANCE_SCALE = [
  'Rất không quan trọng',
  'Không quan trọng',
  'Bình thường',
  'Quan trọng',
  'Cực kỳ quan trọng',
];

const FALLBACK_BUILTIN_QUESTIONS: CustomQuestionCsvMeta[] = [
  { key: 'S1', section: 'PHẦN S', title: 'S1. Thời gian tham quan tại Bà Nà Hills hôm nay đã đạt từ 4 tiếng trở lên chưa?', type: 'single', options: S1_OPTIONS },
  { key: 'S2', section: 'PHẦN S', title: 'S2. Anh/Chị có trực tiếp chi trả chi phí ăn uống hôm nay không?', type: 'single', options: S2_OPTIONS },
  { key: 'S3', section: 'PHẦN S', title: 'S3. Giới tính', type: 'single', options: S3_OPTIONS },
  { key: 'S4', section: 'PHẦN S', title: 'S4. Độ tuổi', type: 'single', options: S4_OPTIONS },
  { key: 'S5', section: 'PHẦN S', title: 'S5. Nơi sinh sống / Quốc tịch', type: 'single', options: S5_OPTIONS },
  { key: 'S6', section: 'PHẦN S', title: 'S6. Đi cùng ai trong chuyến đi hôm nay', type: 'single', options: S6_OPTIONS },
  { key: 'S7', section: 'PHẦN S', title: 'S7. Hình thức chuyến đi', type: 'single', options: S7_OPTIONS },
  { key: 'S8', section: 'PHẦN S', title: 'S8. Số lần đến Sun World Ba Na Hills', type: 'single', options: S8_OPTIONS },
  { key: 'S9', section: 'PHẦN S', title: 'S9. Loại vé / Gói sản phẩm sử dụng hôm nay', type: 'single', options: S9_OPTIONS },
  { key: 'A1', section: 'PHẦN A', title: 'A1. Ngân sách dự kiến chi cho ăn uống trên 1 người (VNĐ/người)', type: 'single', options: A1_OPTIONS },
  { key: 'A2', section: 'PHẦN A', title: 'A2. Dịch vụ ăn uống đã sử dụng tại Bà Nà Hills hôm nay', type: 'multi', options: A2_OPTIONS },
  { key: 'A3', section: 'PHẦN A', title: 'A3. Lý do chưa sử dụng dịch vụ ẩm thực tại Bà Nà Hills hôm nay', type: 'multi', options: A3_OPTIONS },
  { key: 'A3_1', section: 'PHẦN A', title: 'A3.1. Anh/Chị đã ăn ở đâu trước khi lên Bà Nà?', type: 'text', options: [] },
  { key: 'A3_2', section: 'PHẦN A', title: 'A3.2. Mức giá hợp lý Anh/Chị sẵn sàng chi cho 1 bữa ăn/đồ uống (VNĐ/người)?', type: 'text', options: [] },
  { key: 'A3_3', section: 'PHẦN A', title: 'A3.3. Món ăn hoặc dịch vụ ẩm thực cụ thể mà Anh/Chị mong muốn có?', type: 'text', options: [] },
  { key: 'A3_4', section: 'PHẦN A', title: 'A3.4. Nếu các yếu tố trên được cải thiện, khả năng Anh/Chị sử dụng F&B tại Bà Nà?', type: 'single', options: A3_4_OPTIONS },
  { key: 'A4', section: 'PHẦN A', title: 'A4. Tổng chi phí ăn uống thực tế bình quân 1 người hôm nay (VNĐ/người)', type: 'single', options: A4_OPTIONS },
  { key: 'A4_1', section: 'PHẦN A', title: 'A4.1. Số tiền thực tế đã chi thêm ngoài suất ăn trong vé/tour (1 người)', type: 'single', options: A4_1_OPTIONS },
  { key: 'A6', section: 'PHẦN A', title: 'A6. Thời điểm quyết định mua đồ ăn/thức uống hôm nay', type: 'multi', options: A6_OPTIONS },
  { key: 'A7', section: 'PHẦN A', title: 'A7. Sẵn sàng chi thêm để mua đặc sản/quà ẩm thực mang về?', type: 'single', options: A7_OPTIONS },
  { key: 'A8', section: 'PHẦN A', title: 'A8. Mức dự kiến chi cho quà ẩm thực mang về (1 người)', type: 'single', options: A8_OPTIONS },
  { key: 'B1', section: 'PHẦN B', title: 'B1. Nhóm sản phẩm ẩm thực quan tâm / ưu tiên nhất tại Bà Nà Hills', type: 'multi', options: B1_OPTIONS },
  { key: 'B2', section: 'PHẦN B', title: 'B2. Hình thức phục vụ ưu tiên nhất', type: 'multi', options: B2_OPTIONS },
  { key: 'B3_1', section: 'PHẦN B', title: 'B3.1. Khẩu vị ưu tiên — Độ cay', type: 'single', options: B3_1_OPTIONS },
  { key: 'B3_2', section: 'PHẦN B', title: 'B3.2. Khẩu vị ưu tiên — Độ đậm vị', type: 'single', options: B3_2_OPTIONS },
  { key: 'B3_3', section: 'PHẦN B', title: 'B3.3. Khẩu vị ưu tiên — Nhiệt độ món', type: 'single', options: B3_3_OPTIONS },
  {
    key: 'B5',
    section: 'PHẦN B',
    title: 'B5. Mức độ quan trọng của các yếu tố khi quyết định sử dụng F&B (Khung SERVQUAL)',
    type: 'likert',
    likertScale: DEFAULT_LIKERT_IMPORTANCE_SCALE,
    options: B5_ITEMS.map((item, idx) => ({
      code: idx + 1,
      rowCode: item.code,
      label: `${item.dimension}: ${item.label}`,
      en: item.en,
    })),
  },
  { key: 'C1', section: 'PHẦN C', title: 'C1. Khung giờ phát sinh nhu cầu ăn uống cao nhất tại Bà Nà Hills', type: 'multi', options: C1_OPTIONS },
  { key: 'C2', section: 'PHẦN C', title: 'C2. Nhu cầu ăn uống đặc biệt của đoàn/nhóm khách', type: 'multi', options: C2_OPTIONS },
  { key: 'C3', section: 'PHẦN C', title: 'C3. Yếu tố cần ưu tiên cải thiện nhất để nâng cao trải nghiệm ẩm thực', type: 'multi', options: C3_OPTIONS },
];

/**
 * Xây dựng danh sách toàn bộ các cột báo cáo có cấu trúc đầy đủ nhất (100% thông tin khảo sát).
 * Đảm bảo không bỏ sót bất kỳ trường định danh, câu hỏi gốc, ma trận A5/B4, bảng Likert nhiều dòng (B5 và câu mới),
 * câu hỏi con, ô nhập "Khác (ghi rõ)" hay dữ liệu mở rộng nào.
 */
export function buildStructuredReportColumns(
  responses: SurveyResponseData[],
  opts?: CsvExportOptions
): StructuredReportColumn[] {
  const valueMode = opts?.valueMode || 'code_and_label';
  const multiSep = opts?.multiSelectSeparator || '; ';
  const locs = opts?.locations || SURVEY_LOCATIONS;
  const qMap = opts?.questionOptionsMap || {};

  const formatSingleWithList = (code: number | null | undefined, list: OptionItem[]): string => {
    if (code === null || code === undefined) return '';
    if (valueMode === 'code_only') return String(code);
    const found = list.find((o) => o.code === code);
    if (!found) return String(code);
    return valueMode === 'label_only' ? found.label : `${code} - ${found.label}`;
  };

  const formatSingle = (qKey: string, code: number | null, fallbackOpts: OptionItem[]): string => {
    const list = qMap[qKey] && qMap[qKey].length > 0 ? qMap[qKey] : fallbackOpts;
    return formatSingleWithList(code, list);
  };

  const formatMulti = (qKey: string, codes: number[], fallbackOpts: OptionItem[]): string => {
    if (!Array.isArray(codes) || codes.length === 0) return '';
    if (valueMode === 'code_only') return codes.join(multiSep.trim() || ';');
    const list = qMap[qKey] && qMap[qKey].length > 0 ? qMap[qKey] : fallbackOpts;
    return codes
      .map((c) => {
        const found = list.find((o) => o.code === c);
        if (!found) return String(c);
        return valueMode === 'label_only' ? found.label : `${c} - ${found.label}`;
      })
      .join(multiSep);
  };

  const formatLikertScore = (score: number | null, scaleLabels?: string[]): string => {
    if (score === null || score === undefined) return '';
    const labels =
      Array.isArray(scaleLabels) && scaleLabels.length === 5
        ? scaleLabels
        : DEFAULT_LIKERT_IMPORTANCE_SCALE;
    if (valueMode === 'code_only') return String(score);
    const label = labels[score - 1];
    if (!label) return String(score);
    return valueMode === 'label_only' ? label : `${score} - ${label}`;
  };

  // Chuẩn bị danh sách câu hỏi theo thứ tự cấu trúc
  const configuredQuestions: CustomQuestionCsvMeta[] = [];
  const seenQKeys = new Set<string>();

  const sourceList =
    opts?.allQuestionsInOrder && opts.allQuestionsInOrder.length > 0
      ? opts.allQuestionsInOrder
      : FALLBACK_BUILTIN_QUESTIONS;

  sourceList.forEach((q) => {
    if (!seenQKeys.has(q.key)) {
      seenQKeys.add(q.key);
      configuredQuestions.push(q);
    }
  });

  // Đảm bảo tất cả câu hỏi gốc luôn có mặt kể cả khi thiếu trong tham số truyền vào
  FALLBACK_BUILTIN_QUESTIONS.forEach((fb) => {
    if (!seenQKeys.has(fb.key)) {
      seenQKeys.add(fb.key);
      configuredQuestions.push(fb);
    }
  });

  // Bổ sung các customQuestions truyền qua thuộc tính cũ nếu chưa có
  (opts?.customQuestions || []).forEach((cq) => {
    if (!seenQKeys.has(cq.key)) {
      seenQKeys.add(cq.key);
      configuredQuestions.push(cq);
    }
  });

  const cols: StructuredReportColumn[] = [];

  // ============================================================================
  // 1. NHÓM THÔNG TIN ĐỊNH DANH & QUẢN LÝ PHIÊN KHẢO SÁT (16 CỘT)
  // ============================================================================
  cols.push(
    {
      code: 'STT',
      label: '[ĐỊNH DANH] Số thứ tự bản ghi',
      section: 'META',
      getValue: (_r, idx) => idx + 1,
    },
    {
      code: 'ID_He_Thong',
      label: '[ĐỊNH DANH] Mã ID bản ghi hệ thống',
      section: 'META',
      getValue: (r) => r.id || '',
    },
    {
      code: 'Ma_Phieu',
      label: '[ĐỊNH DANH] Mã phiếu khảo sát',
      section: 'META',
      getValue: (r) => r.surveyCode || '',
    },
    {
      code: 'Trang_Thai_Phieu',
      label: '[ĐỊNH DANH] Trạng thái hoàn thành phiếu',
      section: 'META',
      getValue: (r) => {
        if (valueMode === 'code_only') return r.status === 'completed' ? 1 : 0;
        if (valueMode === 'label_only') {
          return r.status === 'completed' ? 'Hoàn thành hợp lệ' : 'Dừng sàng lọc (Screen-out)';
        }
        return r.status === 'completed'
          ? '1 - Hoàn thành hợp lệ (Completed)'
          : '0 - Dừng sàng lọc (Screen-out)';
      },
    },
    {
      code: 'Ly_Do_Screenout',
      label: '[ĐỊNH DANH] Lý do dừng sàng lọc (nếu Screen-out)',
      section: 'META',
      getValue: (r) => r.screenoutReason || '',
    },
    {
      code: 'Ngay_KS',
      label: '[ĐỊNH DANH] Ngày khảo sát (YYYY-MM-DD)',
      section: 'META',
      getValue: (r) => r.surveyDate || '',
    },
    {
      code: 'Gio_BD',
      label: '[ĐỊNH DANH] Giờ bắt đầu phỏng vấn',
      section: 'META',
      getValue: (r) => r.startTime || '',
    },
    {
      code: 'Gio_KT',
      label: '[ĐỊNH DANH] Giờ kết thúc phỏng vấn',
      section: 'META',
      getValue: (r) => r.endTime || '',
    },
    {
      code: 'Thoi_Luong_Giay',
      label: '[ĐỊNH DANH] Thời lượng thực hiện (Giây)',
      section: 'META',
      getValue: (r) => r.durationSeconds ?? 0,
    },
    {
      code: 'Thoi_Luong_Phut',
      label: '[ĐỊNH DANH] Thời lượng thực hiện (Phút)',
      section: 'META',
      getValue: (r) =>
        typeof r.durationSeconds === 'number'
          ? Number((r.durationSeconds / 60).toFixed(2))
          : 0,
    },
    {
      code: 'Ma_Diem_KS',
      label: '[ĐỊNH DANH] Mã vị trí khảo sát',
      section: 'META',
      getValue: (r) => r.locationId ?? '',
    },
    {
      code: 'Ten_Diem_KS',
      label: '[ĐỊNH DANH] Tên điểm khảo sát tại Bà Nà Hills',
      section: 'META',
      getValue: (r) => {
        const locObj = locs.find((l) => l.id === r.locationId);
        return locObj ? locObj.name : `Điểm #${r.locationId}`;
      },
    },
    {
      code: 'Ten_PVV',
      label: '[ĐỊNH DANH] Họ tên Phỏng vấn viên (PVV)',
      section: 'META',
      getValue: (r) => r.interviewerName || '',
    },
    {
      code: 'Email_PVV',
      label: '[ĐỊNH DANH] Email tài khoản Phỏng vấn viên',
      section: 'META',
      getValue: (r) => r.interviewerEmail || '',
    },
    {
      code: 'Qua_Tang',
      label: '[ĐỊNH DANH] Quà tặng đáp viên',
      section: 'META',
      getValue: (r) => r.giftName || '',
    },
    {
      code: 'Dong_Bo_Cloud',
      label: '[ĐỊNH DANH] Trạng thái đồng bộ Cloud Firestore',
      section: 'META',
      getValue: (r) => (r.syncedToCloud ? 'Đã đồng bộ Cloud' : 'Lưu cục bộ máy'),
    }
  );

  // ============================================================================
  // 2. DUYỆT TOÀN BỘ CÂU HỎI THEO THỨ TỰ CẤU TRÚC (PHẦN S, A, B, C & MỞ RỘNG)
  // ============================================================================
  let insertedA5Matrix = false;
  let insertedB4Matrix = false;

  const appendA5MatrixColumns = () => {
    if (insertedA5Matrix) return;
    insertedA5Matrix = true;
    A5_ROWS.forEach((row) => {
      cols.push({
        code: `A5_${row.key}`,
        label: `[PHẦN A] A5 (${row.label}) - Mức chi tiêu bình quân 1 người`,
        section: 'PHẦN A',
        getValue: (r) => formatSingleWithList(r.A5?.[row.key], A5_COLUMNS),
      });
    });
  };

  const appendB4MatrixColumns = () => {
    if (insertedB4Matrix) return;
    insertedB4Matrix = true;
    B4_ROWS.forEach((row) => {
      cols.push({
        code: `B4_${row.key}`,
        label: `[PHẦN B] B4 (${row.label}) - Cảm nhận mức giá hiện tại (1: Đắt, 2: Hợp lý, 3: Rẻ)`,
        section: 'PHẦN B',
        getValue: (r) => {
          const val = r.B4?.[row.key];
          if (val === null || val === undefined) return '';
          return formatSingleWithList(val, [
            ...B4_PERCEPTION_OPTIONS,
            ...row.options.filter((o) => o.code > 3),
          ]);
        },
      });
    });
  };

  const legacyOtherKeys = new Set(['S5', 'A3', 'A6', 'B1', 'C2', 'C3']);

  configuredQuestions.forEach((q) => {
    const sec: ReportSectionId =
      q.section === 'PHẦN S' ||
      q.section === 'PHẦN A' ||
      q.section === 'PHẦN B' ||
      q.section === 'PHẦN C'
        ? q.section
        : q.key.startsWith('S')
        ? 'PHẦN S'
        : q.key.startsWith('A')
        ? 'PHẦN A'
        : q.key.startsWith('B')
        ? 'PHẦN B'
        : 'PHẦN C';

    const subPrefix = q.parentQuestionKey ? `(Câu con của ${q.parentQuestionKey}) ` : '';

    if (q.type === 'likert') {
      const scaleLabels =
        Array.isArray(q.likertScale) && q.likertScale.length === 5
          ? q.likertScale
          : DEFAULT_LIKERT_IMPORTANCE_SCALE;

      const rowOpts =
        Array.isArray(q.options) && q.options.length > 0
          ? q.options
          : q.key === 'B5'
          ? B5_ITEMS.map((item, idx) => ({
              code: idx + 1,
              rowCode: item.code,
              label: `${item.dimension}: ${item.label}`,
              en: item.en,
            }))
          : [];

      rowOpts.forEach((rowOpt, idx) => {
        const rowNum = rowOpt.code || idx + 1;
        const displayRowCode = rowOpt.rowCode || `${q.key.replace('_', '.')}.${rowNum}`;
        const safeColCode = displayRowCode.replace(/[^a-zA-Z0-9_]/g, '_');

        cols.push({
          code: safeColCode,
          label: `[${sec}] ${subPrefix}${displayRowCode} - ${rowOpt.label} (Thang Likert 1-5)`,
          section: sec,
          getValue: (r) => {
            const score = getLikertRowAnswer(r, q.key, rowNum);
            return formatLikertScore(score, scaleLabels);
          },
        });
      });

      // Cột điểm trung bình cộng của bảng Likert nhiều dòng này
      cols.push({
        code: `${q.key}_Diem_TB`,
        label: `[${sec}] ${q.key} - Điểm trung bình cộng các tiêu chí (Mean Score / 5.0)`,
        section: sec,
        getValue: (r) => {
          const scores = rowOpts
            .map((ro, idx) => getLikertRowAnswer(r, q.key, ro.code || idx + 1))
            .filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
          if (scores.length === 0) return '';
          const avg = scores.reduce((acc, cur) => acc + cur, 0) / scores.length;
          return Number(avg.toFixed(2));
        },
      });
    } else if (q.type === 'single') {
      cols.push({
        code: q.key,
        label: `[${sec}] ${subPrefix}${q.title}`,
        section: sec,
        getValue: (r) => formatSingle(q.key, getSingleAnswer(r, q.key), q.options),
      });

      // Sau S5 xuất thêm cột Phân khúc thị trường (Nội địa / Quốc tế)
      if (q.key === 'S5') {
        cols.push({
          code: 'S5_Phan_Khuc_Khach',
          label: '[PHẦN S] Phân khúc thị trường khách (Nội địa / Quốc tế)',
          section: 'PHẦN S',
          getValue: (r) => {
            const s5 = getSingleAnswer(r, 'S5');
            if (s5 === null) return '';
            const isDom = s5 >= 1 && s5 <= 4;
            if (valueMode === 'code_only') return isDom ? 1 : 2;
            if (valueMode === 'label_only') return isDom ? 'Khách Nội địa' : 'Khách Quốc tế';
            return isDom ? '1 - Khách Nội địa' : '2 - Khách Quốc tế';
          },
        });
      }

      // Sau A1 xuất thêm trạng thái khóa ngân sách dự kiến A1
      if (q.key === 'A1') {
        cols.push({
          code: 'A1_Da_Khoa',
          label: '[PHẦN A] A1 - Trạng thái khóa ngân sách dự kiến',
          section: 'PHẦN A',
          getValue: (r) => (r.A1_locked ? 'Đã khóa (Locked)' : 'Chưa khóa'),
        });
      }
    } else if (q.type === 'multi') {
      cols.push({
        code: q.key,
        label: `[${sec}] ${subPrefix}${q.title}`,
        section: sec,
        getValue: (r) => formatMulti(q.key, getMultiAnswer(r, q.key), q.options),
      });

      cols.push({
        code: `${q.key}_So_Lua_Chon`,
        label: `[${sec}] ${q.key} - Số lượng phương án đã chọn`,
        section: sec,
        getValue: (r) => {
          const arr = getMultiAnswer(r, q.key);
          return arr.length > 0 ? arr.length : '';
        },
      });

      // Sau A2 xuất thêm cột Phân nhóm Đã dùng F&B vs Chưa dùng F&B
      if (q.key === 'A2') {
        cols.push({
          code: 'A2_Trang_Thai_FnB',
          label: '[PHẦN A] Phân nhóm hành vi sử dụng dịch vụ F&B (Đã dùng vs Chưa dùng)',
          section: 'PHẦN A',
          getValue: (r) => {
            const a2 = getMultiAnswer(r, 'A2');
            if (!a2 || a2.length === 0) return '';
            const notUsed = a2.includes(7);
            if (valueMode === 'code_only') return notUsed ? 0 : 1;
            if (valueMode === 'label_only') {
              return notUsed ? 'Chưa sử dụng F&B' : 'Đã sử dụng F&B';
            }
            return notUsed ? '0 - Chưa sử dụng F&B (A2=7)' : '1 - Đã sử dụng F&B (A2=1..6)';
          },
        });
      }
    } else {
      // Câu hỏi tự luận (text)
      cols.push({
        code: q.key,
        label: `[${sec}] ${subPrefix}${q.title}`,
        section: sec,
        getValue: (r) => getTextAnswer(r, q.key),
      });
    }

    // Kiểm tra xem câu hỏi này có phương án "Khác (ghi rõ)" hoặc dữ liệu otherInputs hay không
    const hasOtherOpt =
      legacyOtherKeys.has(q.key) ||
      q.hasOtherInput ||
      (Array.isArray(q.options) && q.options.some((o) => o.hasOtherInput)) ||
      responses.some((r) => Boolean(getOtherInputAnswer(r, q.key)));

    if (hasOtherOpt && q.type !== 'text' && q.type !== 'likert') {
      cols.push({
        code: `${q.key}_Khac`,
        label: `[${sec}] ${q.key} - Nội dung ghi rõ "Khác"`,
        section: sec,
        getValue: (r) => getOtherInputAnswer(r, q.key),
      });
    }

    // Đính kèm Ma trận A5 ngay sau A4_1 (hoặc sau A4 nếu A4_1 không nằm liền kề)
    if (q.key === 'A4_1') {
      appendA5MatrixColumns();
    }
    // Đính kèm Ma trận B4 ngay sau B3_3
    if (q.key === 'B3_3') {
      appendB4MatrixColumns();
    }
  });

  if (!insertedA5Matrix) appendA5MatrixColumns();
  if (!insertedB4Matrix) appendB4MatrixColumns();

  // Cột C4_GhiChuMo luôn nằm cuối Phần C
  cols.push({
    code: 'C4_GhiChuMo',
    label: '[PHẦN C] C4. Ý kiến đóng góp mở / Ghi chú bổ sung của đáp viên',
    section: 'PHẦN C',
    getValue: (r) => r.C4_note || '',
  });

  // ============================================================================
  // 3. QUÉT BỔ SUNG DỮ LIỆU MỞ RỘNG TRONG customAnswers / otherInputs (ĐẢM BẢO 0% SÓT)
  // ============================================================================
  const exportedColCodes = new Set(cols.map((c) => c.code));
  const extraCustomKeys = new Set<string>();
  const extraOtherKeys = new Set<string>();

  responses.forEach((r) => {
    if (r.customAnswers) {
      Object.keys(r.customAnswers).forEach((k) => {
        // Nếu là dòng Likert dạng qKey__rowCode đã được xuất qua câu Likert thì bỏ qua
        if (k.includes('__')) {
          const [qKey, rCodeStr] = k.split('__');
          const standardCode = `${qKey}_${rCodeStr}`;
          if (exportedColCodes.has(standardCode) || seenQKeys.has(qKey)) return;
        }
        if (!seenQKeys.has(k) && !exportedColCodes.has(k)) {
          extraCustomKeys.add(k);
        }
      });
    }
    if (r.otherInputs) {
      Object.keys(r.otherInputs).forEach((k) => {
        if (!exportedColCodes.has(`${k}_Khac`)) {
          extraOtherKeys.add(k);
        }
      });
    }
  });

  extraCustomKeys.forEach((k) => {
    cols.push({
      code: `Custom_${k}`,
      label: `[MỞ RỘNG] Câu hỏi bổ sung (${k})`,
      section: 'MỞ RỘNG',
      getValue: (r) => {
        const v = r.customAnswers?.[k];
        if (v === null || v === undefined) return '';
        return Array.isArray(v) ? v.join(multiSep) : String(v);
      },
    });
  });

  extraOtherKeys.forEach((k) => {
    cols.push({
      code: `${k}_Khac`,
      label: `[MỞ RỘNG] ${k} - Nội dung ghi rõ "Khác"`,
      section: 'MỞ RỘNG',
      getValue: (r) => getOtherInputAnswer(r, k),
    });
  });

  return cols;
}

/**
 * Trích xuất toàn bộ thông tin câu trả lời của 1 phiếu khảo sát thành các Phân nhóm rõ ràng
 * để hiển thị trong Modal "Xem chi tiết phiếu khảo sát" (100% trường dữ liệu).
 */
export function getStructuredResponseDetailSections(
  response: SurveyResponseData,
  opts?: CsvExportOptions
): StructuredDetailSection[] {
  const columns = buildStructuredReportColumns([response], {
    ...opts,
    valueMode: 'code_and_label',
  });

  const sectionTitleMap: Record<ReportSectionId, string> = {
    META: '1. Thông tin Định danh & Phiên khảo sát',
    'PHẦN S': '2. Phần S — Sàng lọc & Nhân khẩu học',
    'PHẦN A': '3. Phần A — Hành vi Chi tiêu & Sử dụng Dịch vụ F&B (Gồm Ma trận A5)',
    'PHẦN B': '4. Phần B — Nhu cầu, Khẩu vị, Cảm nhận Giá (B4) & Đánh giá SERVQUAL (B5)',
    'PHẦN C': '5. Phần C — Kỳ vọng Khung giờ, Nhu cầu Đặc biệt & Đề xuất Cải thiện',
    'MỞ RỘNG': '6. Câu hỏi Mở rộng & Dữ liệu Bổ sung',
  };

  const sectionOrder: ReportSectionId[] = [
    'META',
    'PHẦN S',
    'PHẦN A',
    'PHẦN B',
    'PHẦN C',
    'MỞ RỘNG',
  ];

  const grouped: Record<ReportSectionId, StructuredDetailField[]> = {
    META: [],
    'PHẦN S': [],
    'PHẦN A': [],
    'PHẦN B': [],
    'PHẦN C': [],
    'MỞ RỘNG': [],
  };

  columns.forEach((col) => {
    if (col.code === 'STT') return;
    const rawVal = col.getValue(response, 0);
    const strVal = rawVal === null || rawVal === undefined ? '' : String(rawVal).trim();
    const cleanLabel = col.label.replace(/^\[[^\]]+\]\s*/, '');
    grouped[col.section].push({
      code: col.code,
      label: cleanLabel,
      value: strVal,
      isEmpty: strVal === '',
    });
  });

  return sectionOrder
    .filter((sec) => grouped[sec].length > 0)
    .map((sec) => ({
      section: sec,
      sectionTitle: sectionTitleMap[sec],
      fields: grouped[sec],
    }));
}

/**
 * Xuất báo cáo CSV chuẩn UTF-8 BOM với cấu trúc 2 dòng tiêu đề:
 * - Dòng 1: Mã biến chuẩn (VD: S1, A2, A5_buffet, B4_buffet, B5_1...)
 * - Dòng 2: [Phần] Nội dung câu hỏi / tiêu chí đầy đủ bằng tiếng Việt
 */
export function exportResponsesToCsv(
  responses: SurveyResponseData[],
  opts?: CsvExportOptions
): void {
  const delimiter = opts?.delimiter || ',';
  const multiSep = opts?.multiSelectSeparator || '; ';
  const includeTitleRow = opts?.includeQuestionTitleRow !== false;

  const cols = buildStructuredReportColumns(responses, opts);

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = Array.isArray(val) ? val.join(multiSep) : String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerCodeRow = cols.map((c) => escapeCsv(c.code)).join(delimiter);
  const headerLabelRow = cols.map((c) => escapeCsv(c.label)).join(delimiter);

  const dataRows = responses.map((r, idx) =>
    cols.map((c) => escapeCsv(c.getValue(r, idx))).join(delimiter)
  );

  const allLines = includeTitleRow
    ? [headerCodeRow, headerLabelRow, ...dataRows]
    : [headerCodeRow, ...dataRows];

  const csvContent = '\uFEFF' + allLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BaNaHills_FnB_Survey_FullStructured_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Xuất Báo cáo Excel (.xls) có định dạng bảng biểu, phân nhóm màu sắc theo từng Phần khảo sát
 * (Định danh, Phần S, Phần A + Ma trận A5, Phần B + Ma trận B4 & Likert B5, Phần C),
 * hiển thị đầy đủ 100% thông tin khảo sát.
 */
export function exportResponsesToExcel(
  responses: SurveyResponseData[],
  opts?: CsvExportOptions
): void {
  const cols = buildStructuredReportColumns(responses, opts);

  const escapeHtml = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const sectionMeta: Record<
    ReportSectionId,
    { title: string; bgHeader: string; bgSubHeader: string; textColor: string }
  > = {
    META: {
      title: 'NHÓM 1: THÔNG TIN ĐỊNH DANH & QUẢN LÝ PHIÊN KHẢO SÁT',
      bgHeader: '#1e293b',
      bgSubHeader: '#334155',
      textColor: '#ffffff',
    },
    'PHẦN S': {
      title: 'NHÓM 2: PHẦN S — SÀNG LỌC & NHÂN KHẨU HỌC ĐÁP VIÊN',
      bgHeader: '#991b1b',
      bgSubHeader: '#b91c1c',
      textColor: '#ffffff',
    },
    'PHẦN A': {
      title: 'NHÓM 3: PHẦN A — HÀNH VI TIÊU DÙNG, CHI TIÊU F&B & MA TRẬN A5',
      bgHeader: '#0369a1',
      bgSubHeader: '#0284c7',
      textColor: '#ffffff',
    },
    'PHẦN B': {
      title: 'NHÓM 4: PHẦN B — KHẨU VỊ, CẢM NHẬN GIÁ (B4) & MA TRẬN LIKERT SERVQUAL (B5)',
      bgHeader: '#047857',
      bgSubHeader: '#059669',
      textColor: '#ffffff',
    },
    'PHẦN C': {
      title: 'NHÓM 5: PHẦN C — KỲ VỌNG KHUNG GIỜ, NHU CẦU ĐẶC BIỆT & ĐỀ XUẤT CẢI THIỆN',
      bgHeader: '#6d28d9',
      bgSubHeader: '#7c3aed',
      textColor: '#ffffff',
    },
    'MỞ RỘNG': {
      title: 'NHÓM 6: CÂU HỎI MỞ RỘNG BỔ SUNG',
      bgHeader: '#b45309',
      bgSubHeader: '#d97706',
      textColor: '#ffffff',
    },
  };

  // Tính colspan cho từng nhóm Section liên tiếp
  const sectionSpans: { section: ReportSectionId; count: number }[] = [];
  cols.forEach((c) => {
    const last = sectionSpans[sectionSpans.length - 1];
    if (last && last.section === c.section) {
      last.count += 1;
    } else {
      sectionSpans.push({ section: c.section, count: 1 });
    }
  });

  const completedCount = responses.filter((r) => r.status === 'completed').length;
  const screenoutCount = responses.filter((r) => r.status === 'screenout').length;
  const nowStr = new Date().toLocaleString('vi-VN');

  const sectionGroupRowHtml = sectionSpans
    .map((sp) => {
      const style = sectionMeta[sp.section];
      return `<th colspan="${sp.count}" style="background:${style.bgHeader};color:${style.textColor};font-weight:bold;font-size:11pt;padding:8px 10px;border:1px solid #cbd5e1;text-align:center;">${escapeHtml(
        style.title
      )}</th>`;
    })
    .join('');

  const codeRowHtml = cols
    .map((c) => {
      const style = sectionMeta[c.section];
      return `<th style="background:${style.bgSubHeader};color:#ffffff;font-weight:bold;font-family:Consolas,monospace;font-size:10pt;padding:6px 8px;border:1px solid #cbd5e1;text-align:center;white-space:nowrap;">${escapeHtml(
        c.code
      )}</th>`;
    })
    .join('');

  const labelRowHtml = cols
    .map((c) => {
      const cleanLabel = c.label.replace(/^\[[^\]]+\]\s*/, '');
      return `<th style="background:#f1f5f9;color:#0f172a;font-weight:bold;font-size:9.5pt;padding:8px;border:1px solid #cbd5e1;text-align:left;min-width:150px;vertical-align:top;">${escapeHtml(
        cleanLabel
      )}</th>`;
    })
    .join('');

  const bodyRowsHtml = responses
    .map((r, idx) => {
      const rowBg = r.status === 'screenout' ? '#fffbeb' : idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cells = cols
        .map((c) => {
          const val = c.getValue(r, idx);
          const isNumeric = typeof val === 'number';
          return `<td style="background:${rowBg};color:#0f172a;font-size:9.5pt;padding:6px 8px;border:1px solid #e2e8f0;vertical-align:top;${
            isNumeric ? 'text-align:right;mso-number-format:\'0\\.00\';' : 'mso-number-format:\'\\@\';'
          }">${escapeHtml(val)}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>DuLieuKhaoSat_FnB_BaNa</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
</head>
<body style="font-family:Arial,sans-serif;">
  <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;">
    <tr>
      <td colspan="${cols.length}" style="background:#b91c1c;color:#ffffff;font-size:14pt;font-weight:bold;padding:12px;">
        BÁO CÁO DỮ LIỆU KHẢO SÁT NHU CẦU &amp; HÀNH VI TIÊU DÙNG F&amp;B TẠI SUN WORLD BA NA HILLS (CẤU TRÚC ĐẦY ĐỦ 100%)
      </td>
    </tr>
    <tr>
      <td colspan="${cols.length}" style="background:#fef2f2;color:#7f1d1d;font-size:10pt;padding:8px;">
        <b>Thời điểm kết xuất:</b> ${escapeHtml(nowStr)} &nbsp;|&nbsp;
        <b>Tổng số phiếu:</b> ${responses.length} phiếu &nbsp;|&nbsp;
        <b>Phiếu hoàn thành hợp lệ (Completed):</b> ${completedCount} phiếu &nbsp;|&nbsp;
        <b>Phiếu dừng sàng lọc (Screen-out):</b> ${screenoutCount} phiếu &nbsp;|&nbsp;
        <b>Tổng số trường dữ liệu (Cột):</b> ${cols.length} cột
      </td>
    </tr>
    <tr>${sectionGroupRowHtml}</tr>
    <tr>${codeRowHtml}</tr>
    <tr>${labelRowHtml}</tr>
    ${bodyRowsHtml}
  </table>
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BaoCao_KhaoSat_FnB_BaNaHills_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

