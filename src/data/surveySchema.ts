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
  title: string;
  type: 'single' | 'multi' | 'text';
  options: OptionItem[];
}

export interface CsvExportOptions {
  delimiter?: ',' | ';';
  valueMode?: 'code_and_label' | 'code_only' | 'label_only';
  multiSelectSeparator?: string;
  locations?: SurveyLocation[];
  questionOptionsMap?: Record<string, OptionItem[]>;
  customQuestions?: CustomQuestionCsvMeta[];
}

export function exportResponsesToCsv(
  responses: SurveyResponseData[],
  opts?: CsvExportOptions
): void {
  const delimiter = opts?.delimiter || ',';
  const valueMode = opts?.valueMode || 'code_only';
  const multiSep = opts?.multiSelectSeparator || '; ';
  const locs = opts?.locations || SURVEY_LOCATIONS;
  const qMap = opts?.questionOptionsMap || {};

  const formatSingle = (qKey: string, code: number | null, fallbackOpts: OptionItem[]) => {
    if (code === null || code === undefined) return '';
    if (valueMode === 'code_only') return String(code);
    const list = qMap[qKey] || fallbackOpts;
    const found = list.find((o) => o.code === code);
    if (!found) return String(code);
    return valueMode === 'label_only' ? found.label : `${code} - ${found.label}`;
  };

  const formatMulti = (qKey: string, codes: number[], fallbackOpts: OptionItem[]) => {
    if (!Array.isArray(codes) || codes.length === 0) return '';
    if (valueMode === 'code_only') return codes.join(multiSep.trim() || ';');
    const list = qMap[qKey] || fallbackOpts;
    return codes
      .map((c) => {
        const found = list.find((o) => o.code === c);
        if (!found) return String(c);
        return valueMode === 'label_only' ? found.label : `${c} - ${found.label}`;
      })
      .join(multiSep);
  };

  const headers = [
    'ID',
    'Ma_Phieu',
    'Ngay_KS',
    'Gio_BD',
    'Gio_KT',
    'Thoi_Luong_Giay',
    'Diem_KS',
    'Ten_PVV',
    'Email_PVV',
    'Qua_Tang',
    'Trang_Thai',
    'Ly_Do_Dung',
    'S1_ThamQuan4h',
    'S2_ChiTra',
    'S3_GioiTinh',
    'S4_DoTuoi',
    'S5_QuocTich',
    'S5_Khac',
    'Nguon_Khach',
    'S6_NhomDiCung',
    'S7_HinhThucChuyenDi',
    'S8_SoLanDen',
    'S9_GoiVe',
    'A1_ChiTieuDuKien',
    'A2_DichVuDaDung',
    'A3_LyDoChuaDung',
    'A3_Khac',
    'A3_1_DaAnODau',
    'A3_2_GiaSanSangChi',
    'A3_3_MonMongMuon',
    'A3_4_KhaNangSuDung',
    'A4_ChiTieuThucTe',
    'A4_1_ChiThemThucTe',
    'A5_Buffet',
    'A5_Alacarte',
    'A5_Fastfood',
    'A5_BanhKem',
    'A5_DoUong',
    'A5_QuaMangVe',
    'A6_ThoiDiemQuyetDinh',
    'A6_Khac',
    'A7_SanSangChiThem',
    'A8_MucDuKienChiThem',
    'B1_SanPhamQuanTam',
    'B1_Khac',
    'B2_HinhThucPhucVu',
    'B3_1_DoCay',
    'B3_2_HuongVi',
    'B3_3_NhietDo',
    'B4_GiaBuffet',
    'B4_GiaAlacarte',
    'B4_GiaFastfood',
    'B4_GiaDoUong',
    'B4_GiaBanhKem',
    'B5_1_HuuHinh',
    'B5_2_ChatLuong',
    'B5_3_TinCay',
    'B5_4_ThaiDo',
    'B5_5_ThauCam',
    'B5_6_TienLoi',
    'C1_KhungGioNhuCau',
    'C2_NhuCauDacBiet',
    'C2_Khac',
    'C3_DeXuatCaiThien',
    'C3_Khac',
    'C4_GhiChuMo',
    ...(opts?.customQuestions || []).map((cq) => `${cq.key}_${cq.title.slice(0, 24).replace(/\s+/g, '_')}`),
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = Array.isArray(val) ? val.join(multiSep) : String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = responses.map((r) => {
    const isDomestic = r.S5 !== null && r.S5 >= 1 && r.S5 <= 4;
    const guestSource = r.S5 === null ? '' : isDomestic ? 'Nội địa' : 'Quốc tế';
    const locObj = locs.find((l) => l.id === r.locationId);
    const locDisplay =
      valueMode === 'code_only'
        ? r.locationId
        : valueMode === 'label_only'
        ? locObj?.name || r.locationId
        : `${r.locationId} - ${locObj?.name || ''}`;

    const customCols = (opts?.customQuestions || []).map((cq) => {
      if (cq.type === 'single') {
        const val = getSingleAnswer(r, cq.key);
        return formatSingle(cq.key, val, cq.options);
      }
      if (cq.type === 'multi') {
        const val = getMultiAnswer(r, cq.key);
        return formatMulti(cq.key, val, cq.options);
      }
      return getTextAnswer(r, cq.key);
    });

    return [
      r.id,
      r.surveyCode,
      r.surveyDate,
      r.startTime,
      r.endTime,
      r.durationSeconds,
      locDisplay,
      r.interviewerName,
      r.interviewerEmail,
      r.giftName,
      r.status,
      r.screenoutReason || '',
      formatSingle('S1', r.S1, S1_OPTIONS),
      formatSingle('S2', r.S2, S2_OPTIONS),
      formatSingle('S3', r.S3, S3_OPTIONS),
      formatSingle('S4', r.S4, S4_OPTIONS),
      formatSingle('S5', r.S5, S5_OPTIONS),
      r.S5_other,
      guestSource,
      formatSingle('S6', r.S6, S6_OPTIONS),
      formatSingle('S7', r.S7, S7_OPTIONS),
      formatSingle('S8', r.S8, S8_OPTIONS),
      formatSingle('S9', r.S9, S9_OPTIONS),
      formatSingle('A1', r.A1, A1_OPTIONS),
      formatMulti('A2', r.A2, A2_OPTIONS),
      formatMulti('A3', r.A3, A3_OPTIONS),
      r.A3_other,
      r.A3_1,
      r.A3_2,
      r.A3_3,
      formatSingle('A3_4', r.A3_4, A3_4_OPTIONS),
      formatSingle('A4', r.A4, A4_OPTIONS),
      formatSingle('A4_1', r.A4_1, A4_1_OPTIONS),
      r.A5?.buffet,
      r.A5?.alacarte,
      r.A5?.fastfood,
      r.A5?.pastry,
      r.A5?.beverage,
      r.A5?.souvenir,
      formatMulti('A6', r.A6, A6_OPTIONS),
      r.A6_other,
      formatSingle('A7', r.A7, A7_OPTIONS),
      formatSingle('A8', r.A8, A8_OPTIONS),
      formatMulti('B1', r.B1, B1_OPTIONS),
      r.B1_other,
      formatMulti('B2', r.B2, B2_OPTIONS),
      formatSingle('B3_1', r.B3_1, B3_1_OPTIONS),
      formatSingle('B3_2', r.B3_2, B3_2_OPTIONS),
      formatSingle('B3_3', r.B3_3, B3_3_OPTIONS),
      r.B4?.buffet,
      r.B4?.alacarte,
      r.B4?.fastfood,
      r.B4?.beverage,
      r.B4?.pastry,
      r.B5?.B5_1,
      r.B5?.B5_2,
      r.B5?.B5_3,
      r.B5?.B5_4,
      r.B5?.B5_5,
      r.B5?.B5_6,
      formatMulti('C1', r.C1, C1_OPTIONS),
      formatMulti('C2', r.C2, C2_OPTIONS),
      r.C2_other,
      formatMulti('C3', r.C3, C3_OPTIONS),
      r.C3_other,
      r.C4_note,
      ...customCols,
    ]
      .map(escapeCsv)
      .join(delimiter);
  });

  const csvContent = '\uFEFF' + [headers.join(delimiter), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BaNaHills_FnB_Survey_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
