export type SurveyLanguage = 'en' | 'hi' | 'ko' | 'zh' | 'ru' | 'vi';

export interface LanguageOption {
  code: SurveyLanguage;
  shortLabel: string;
  nameVi: string;
  nativeName: string;
  flag: string;
}

export const SURVEY_LANGUAGES: LanguageOption[] = [
  { code: 'en', shortLabel: 'EN', nameVi: 'Tiếng Anh', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', shortLabel: 'HI', nameVi: 'Tiếng Ấn', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', shortLabel: 'KO', nameVi: 'Tiếng Hàn', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', shortLabel: 'ZH', nameVi: 'Tiếng Trung', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ru', shortLabel: 'RU', nameVi: 'Tiếng Nga', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'vi', shortLabel: 'VI', nameVi: 'Chỉ Tiếng Việt', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
];

type TranslationTuple = {
  en: string;
  hi: string;
  ko: string;
  zh: string;
  ru: string;
};

const t = (en: string, hi: string, ko: string, zh: string, ru: string): TranslationTuple => ({
  en,
  hi,
  ko,
  zh,
  ru,
});

/**
 * Từ điển dịch chuẩn xác 100% chuyên ngành Khảo sát F&B Sun World Ba Na Hills
 * cho 5 ngôn ngữ chính: Anh (en), Ấn (hi), Hàn (ko), Trung (zh), Nga (ru).
 * Khóa tra cứu là văn bản Tiếng Việt đã chuẩn hóa (bỏ mã câu ở đầu nếu có).
 */
const CURATED_DICTIONARY: Record<string, TranslationTuple> = {
  // ==================== TIÊU ĐỀ CÂU HỎI CHÍNH & CÂU HỎI CON ====================
  'Thời gian tham quan tại Bà Nà hôm nay?': t(
    'How long have you visited Ba Na Hills today?',
    'आज आपने बा ना हिल्स में कितना समय बिताया है?',
    '오늘 바나힐을 방문하신 시간은 얼마나 되셨나요?',
    '今天您在巴拿山游览了多长时间？',
    'Сколько времени вы провели на Ба На Хиллс сегодня?'
  ),
  'Anh/Chị có trực tiếp chi trả chi phí ăn uống hôm nay?': t(
    'Are you directly paying for dining & beverage expenses today?',
    'क्या आज खाने-पीने के खर्चों का भुगतान आप स्वयं कर रहे हैं?',
    '오늘 식음료 비용을 직접 지불하시나요?',
    '今天您的餐饮费用是由您本人直接支付吗？',
    'Оплачиваете ли вы сегодня расходы на питание и напитки лично?'
  ),
  'Giới tính': t('Gender', 'लिंग', '성별', '性别', 'Пол'),
  'Độ tuổi': t('Age group', 'आयु वर्ग', '연령대', '年龄段', 'Возрастная группа'),
  'Nơi sinh sống / Quốc tịch': t(
    'Place of Residence / Nationality',
    'निवास स्थान / राष्ट्रीयता',
    '거주지 / 국적',
    '居住地 / 国籍',
    'Место проживания / Гражданство'
  ),
  'Đi cùng ai trong chuyến đi hôm nay?': t(
    'Who are you traveling with today?',
    'आज की यात्रा में आप किसके साथ हैं?',
    '오늘 누구와 함께 여행 중이신가요?',
    '今天您是和谁一起出游的？',
    'С кем вы путешествуете сегодня?'
  ),
  'Hình thức chuyến đi': t(
    'Travel arrangement / Trip type',
    'यात्रा का प्रकार',
    '여행 형태',
    '出行方式',
    'Формат поездки'
  ),
  'Số lần đến Sun World Ba Na Hills': t(
    'Number of visits to Sun World Ba Na Hills',
    'सन वर्ल्ड बा ना हिल्स में आने की संख्या',
    '썬월드 바나힐 방문 횟수',
    '到访太阳世界巴拿山的次数',
    'Количество посещений Sun World Ba Na Hills'
  ),
  'Loại vé / Gói sản phẩm sử dụng hôm nay': t(
    'Ticket / Package type used today',
    'आज उपयोग किया गया टिकट / पैकेज प्रकार',
    '오늘 이용하신 티켓 / 패키지 종류',
    '今天使用的门票 / 套餐类型',
    'Тип билета / пакета, используемый сегодня'
  ),
  'Ngân sách dự kiến chi cho ăn uống & đồ uống (1 người)?': t(
    'Planned budget for food & beverages today (per person)?',
    'आज खाने-पीने के लिए प्रति व्यक्ति अनुमानित बजट क्या है?',
    '오늘 1인당 예상 식음료 지출 예산은 얼마인가요?',
    '今天每人预计的餐饮消费预算是多少？',
    'Планируемый бюджет на еду и напитки сегодня (на 1 человека)?'
  ),
  'Dịch vụ ăn uống đã sử dụng tại Bà Nà hôm nay?': t(
    'Which F&B services have you used at Ba Na Hills today?',
    'आज आपने बा ना हिल्स में किन खाद्य और पेय सेवाओं का उपयोग किया है?',
    '오늘 바나힐에서 이용하신 식음료 서비스는 무엇인가요?',
    '今天您在巴拿山使用了哪些餐饮服务？',
    'Какими услугами питания и напитков вы воспользовались сегодня на Ба На Хиллс?'
  ),
  'Lý do chưa sử dụng dịch vụ ẩm thực tại Bà Nà?': t(
    'Main reasons for not using F&B services at Ba Na Hills today?',
    'आज बा ना हिल्स में खान-पान सेवाओं का उपयोग न करने के मुख्य कारण क्या हैं?',
    '오늘 바나힐에서 식음료 서비스를 이용하지 않으신 주된 이유는 무엇인가요?',
    '今天尚未在巴拿山使用餐饮服务的主要原因是什么？',
    'Основные причины, по которым вы не пользовались услугами питания сегодня?'
  ),
  'Anh/Chị đã ăn ở đâu trước khi lên Bà Nà?': t(
    'Where did you eat before coming to Ba Na Hills?',
    'बा ना हिल्स आने से पहले आपने कहाँ खाना खाया था?',
    '바나힐에 오시기 전에 어디에서 식사하셨나요?',
    '来巴拿山之前您在哪里用过餐？',
    'Где вы поели перед приездом на Ба На Хиллс?'
  ),
  'Mức giá hợp lý Anh/Chị sẵn sàng chi (VNĐ/người)?': t(
    'What reasonable price are you willing to pay (VND/person)?',
    'प्रति व्यक्ति आप कौन सी उचित कीमत चुकाने को तैयार हैं (VND/व्यक्ति)?',
    '1인당 지불할 의향이 있는 적정 가격대는 얼마인가요 (VND/인)?',
    '您认为合理且愿意支付的人均价格是多少（越南盾/人）？',
    'Какую разумную цену вы готовы заплатить (VND на человека)?'
  ),
  'Món ăn hoặc dịch vụ ẩm thực mong muốn có thêm?': t(
    'What dishes or F&B services would you like to see added?',
    'आप कौन से व्यंजन या खाद्य सेवाएं और जुड़वाना चाहेंगे?',
    '추가되었으면 하는 메뉴나 식음료 서비스는 무엇인가요?',
    '您希望增加哪些菜品或餐饮服务？',
    'Какие блюда или услуги питания вы хотели бы добавить?'
  ),
  'Nếu khắc phục các điểm trên, Anh/Chị có sẵn sàng chi tiêu?': t(
    'If these points were improved, would you be willing to use our F&B services?',
    'यदि इन बिंदुओं में सुधार किया जाए, तो क्या आप हमारी खाद्य सेवाओं का उपयोग करेंगे?',
    '위 사항들이 개선된다면 식음료 서비스를 이용하실 의향이 있으신가요?',
    '如果改善以上方面，您是否愿意消费餐饮服务？',
    'Если эти моменты будут улучшены, будете ли вы готовы воспользоваться услугами питания?'
  ),
  'Thực tế đã chi bao nhiêu cho ăn uống hôm nay (1 người)?': t(
    'How much have you actually spent on food & drinks today (per person)?',
    'आज आपने खाने-पीने पर वास्तव में कितना खर्च किया है (प्रति व्यक्ति)?',
    '오늘 식음료에 실제로 지출하신 금액은 얼마인가요 (1인 기준)?',
    '今天您在餐饮上实际消费了多少（每人）？',
    'Сколько вы фактически потратили на еду и напитки сегодня (на 1 человека)?'
  ),
  'Chi thêm ngoài phần đã bao gồm trong vé/tour (1 người)?': t(
    'Extra F&B spending beyond what was included in your ticket/tour (per person)?',
    'टिकट/टूर में शामिल भोजन के अलावा प्रति व्यक्ति अतिरिक्त खर्च कितना रहा?',
    '티켓/투어에 포함된 식사 외에 추가로 지출한 식음료 금액은 얼마인가요 (1인 기준)?',
    '除门票/团费已含餐食外，您每人额外消费了多少？',
    'Дополнительные расходы на еду и напитки сверх включенных в билет/тур (на 1 человека)?'
  ),
  'Mức chi theo từng loại hình đã dùng (1 người)': t(
    'Spending breakdown by F&B category used (per person)',
    'उपयोग की गई प्रत्येक श्रेणी के अनुसार खर्च (प्रति व्यक्ति)',
    '이용하신 식음료 유형별 지출 금액 (1인 기준)',
    '按已使用的餐饮类型划分的人均消费金额',
    'Расходы по каждой использованной категории питания (на 1 человека)'
  ),
  'Yếu tố ảnh hưởng nhất khi chọn nơi ăn uống hôm nay?': t(
    'Most important factors when choosing where to eat/drink today?',
    'आज खाने-पीने की जगह चुनते समय सबसे महत्वपूर्ण कारक क्या थे?',
    '오늘 식음료 매장을 선택할 때 가장 큰 영향을 미친 요인은 무엇인가요?',
    '今天选择就餐地点时最重要的影响因素是什么？',
    'Какие факторы больше всего повлияли на выбор места питания сегодня?'
  ),
  'Từ giờ đến khi rời Bà Nà, có dự định chi thêm cho F&B?': t(
    'Do you plan to spend more on food & drinks before leaving Ba Na Hills?',
    'बा ना हिल्स छोड़ने से पहले क्या आप खाने-पीने पर और खर्च करने की योजना बना रहे हैं?',
    '바나힐을 떠나기 전까지 식음료를 추가로 구매할 계획이 있으신가요?',
    '在离开巴拿山之前，您还打算继续消费餐饮吗？',
    'Планируете ли вы еще потратить деньги на еду и напитки перед отъездом с Ба На Хиллс?'
  ),
  'Dự kiến chi thêm khoảng bao nhiêu (1 người)?': t(
    'Approximately how much more do you plan to spend (per person)?',
    'आप प्रति व्यक्ति लगभग कितना अतिरिक्त खर्च करने की योजना बना रहे हैं?',
    '1인당 약 얼마를 추가로 지출할 예정이신가요?',
    '预计每人还会额外消费多少？',
    'Примерно сколько еще вы планируете потратить (на 1 человека)?'
  ),
  'Phong cách ẩm thực mong muốn có tại Bà Nà?': t(
    'Which cuisine styles would you like to have at Ba Na Hills?',
    'आप बा ना हिल्स में किस प्रकार के व्यंजन चाहते हैं?',
    '바나힐에서 선호하시는 음식 스타일은 무엇인가요?',
    '您希望巴拿山提供哪些风味的美食？',
    'Какие кулинарные направления вы хотели бы видеть на Ба На Хиллс?'
  ),
  'Yêu cầu đặc biệt về chế độ ăn uống?': t(
    'Preferred F&B service style?',
    'पसंदीदा खाद्य सेवा शैली?',
    '선호하는 식음료 서비스 이용 형태는 무엇인가요?',
    '您偏好的餐饮服务形式是什么？',
    'Предпочтительный формат обслуживания?'
  ),
  'Hình thức phục vụ ưu tiên cho bữa chính?': t(
    'Preferred spice level for your food?',
    'भोजन में मसाले/तीखेपन का पसंदीदा स्तर?',
    '선호하는 음식의 매운맛 정도는 어떠신가요?',
    '您偏好的食物辣度是？',
    'Предпочтительный уровень остроты блюд?'
  ),
  'Mức độ sẵn sàng thử ẩm thực mới lạ / đặc trưng?': t(
    'Preferred flavor intensity?',
    'पसंदीदा स्वाद की तीव्रता?',
    '선호하는 음식의 간(맛의 진하기) 정도는 어떠신가요?',
    '您偏好的口味浓淡程度是？',
    'Предпочтительная насыщенность вкуса?'
  ),
  'Thời gian tối đa chấp nhận chờ món?': t(
    'Preferred food temperature?',
    'भोजन का पसंदीदा तापमान?',
    '선호하는 음식 온도 형태는 무엇인가요?',
    '您偏好的食物温度是？',
    'Предпочтительная температура блюд?'
  ),
  'Cảm nhận mức giá hiện tại (1: Đắt • 2: Hợp lý • 3: Rẻ)': t(
    'Perception of current price levels (1: Expensive • 2: Reasonable • 3: Cheap)',
    'वर्तमान कीमतों के बारे में आपकी राय (1: महंगा • 2: उचित • 3: सस्ता)',
    '현재 가격대에 대한 체감 수준 (1: 비쌈 • 2: 적당함 • 3: 저렴함)',
    '对当前价格水平的感受（1：贵 • 2：合理 • 3：便宜）',
    'Восприятие текущего уровня цен (1: Дорого • 2: Разумно • 3: Дешево)'
  ),
  'Mức độ hài lòng (1: Rất tệ → 5: Rất hài lòng)': t(
    'Satisfaction level (1: Very Dissatisfied → 5: Very Satisfied)',
    'संतुष्टि का स्तर (1: बहुत असंतुष्ट → 5: बहुत संतुष्ट)',
    '만족도 평가 (1: 매우 불만족 → 5: 매우 만족)',
    '满意度评价（1：非常不满意 → 5：非常满意）',
    'Уровень удовлетворенности (1: Очень плохо → 5: Очень доволен)'
  ),
  'Yếu tố nào ảnh hưởng nhiều nhất đến quyết định mua F&B của Quý khách?': t(
    'Which factors most influence your F&B purchase decision?',
    'आपके खान-पान (F&B) खरीदने के निर्णय को कौन से कारक सबसे अधिक प्रभावित करते हैं?',
    '식음료(F&B) 구매 결정에 가장 큰 영향을 미치는 요소는 무엇인가요?',
    '哪些因素最影响您的餐饮（F&B）购买决定？',
    'Какие факторы больше всего влияют на ваше решение о покупке еды и напитков?'
  ),
  'Xin Quý khách đánh giá mức độ quan trọng của các yếu tố sau khi quyết định sử dụng F&B tại Bà Nà Hills theo thang điểm từ 1 (Rất không quan trọng) đến 5 (Cực kỳ quan trọng):': t(
    'Please rate the importance of the following factors when deciding to use F&B services at Ba Na Hills on a scale from 1 (Not important at all) to 5 (Extremely important):',
    'कृपया बा ना हिल्स में F&B सेवाओं का उपयोग करने का निर्णय लेते समय निम्नलिखित कारकों के महत्व को 1 (बिल्कुल महत्वपूर्ण नहीं) से 5 (अत्यंत महत्वपूर्ण) के पैमाने पर आँकें:',
    '바나힐에서 식음료(F&B) 이용을 결정하실 때 다음 요소들의 중요도를 1점(전혀 중요하지 않음)부터 5점(매우 중요함)까지 평가해 주십시오:',
    '请按 1（非常不重要）至 5（极其重要）的等级，评估在巴拿山使用餐饮服务时以下因素的重要程度：',
    'Пожалуйста, оцените важность следующих факторов при выборе услуг питания на Ба На Хиллс по шкале от 1 (Совсем не важно) до 5 (Чрезвычайно важно):'
  ),
  'Rất không quan trọng': t(
    'Not important at all',
    'बिल्कुल महत्वपूर्ण नहीं',
    '전혀 중요하지 않음',
    '非常不重要',
    'Совсем не важно'
  ),
  'Không quan trọng': t(
    'Not important',
    'महत्वपूर्ण नहीं',
    '중요하지 않음',
    '不重要',
    'Не важно'
  ),
  'Cực kỳ quan trọng': t(
    'Extremely important',
    'अत्यंत महत्वपूर्ण',
    '매우 중요함',
    '极其重要',
    'Чрезвычайно важно'
  ),
  'Mong muốn cải thiện nhất về dịch vụ F&B tại Bà Nà?': t(
    'Which time slots do you usually need F&B services at Ba Na Hills?',
    'बा ना हिल्स में आपको आमतौर पर किस समय खाने-पीने की सेवाओं की आवश्यकता होती है?',
    '바나힐 방문 중 주로 식음료가 필요한 시간대는 언제인가요?',
    '在巴拿山游览期间，您通常在哪些时段有餐饮需求？',
    'В какое время вам обычно требуются услуги питания на Ба На Хиллс?'
  ),
  'Trải nghiệm ăn uống kết hợp giải trí sẵn sàng chi thêm?': t(
    'Special dietary requirements for you or your group?',
    'आपके या आपके समूह के लिए विशेष आहार आवश्यकताएँ?',
    '본인 또는 동행인의 특별한 식단 요구사항이 있으신가요?',
    '您或同行人员是否有特殊饮食需求？',
    'Особые диетические требования для вас или вашей группы?'
  ),
  'Sản phẩm F&B đóng gói sẵn muốn mua làm quà mang về?': t(
    'Top suggestions to improve F&B services at Ba Na Hills?',
    'बा ना हिल्स में खाद्य और पेय सेवाओं को बेहतर बनाने के लिए प्रमुख सुझाव?',
    '바나힐 식음료 서비스 개선을 위해 가장 필요한 사항은 무엇인가요?',
    '您对改善巴拿山餐饮服务最主要的建议是什么？',
    'Главные предложения по улучшению услуг питания и напитков на Ба На Хиллс?'
  ),

  // ==================== THANG ĐO LIKERT 5 MỨC CHUẨN ====================
  'Rất không hài lòng': t(
    'Very dissatisfied',
    'बहुत असंतुष्ट',
    '매우 불만족',
    '非常不满意',
    'Совершенно не удовлетворен'
  ),
  'Không hài lòng': t(
    'Dissatisfied',
    'असंतुष्ट',
    '불만족',
    '不满意',
    'Не удовлетворен'
  ),
  'Bình thường': t(
    'Neutral / Average',
    'सामान्य / तटस्थ',
    '보통',
    '一般 / 中立',
    'Нейтрально / Нормально'
  ),
  'Hài lòng': t(
    'Satisfied',
    'संतुष्ट',
    '만족',
    '满意',
    'Удовлетворен'
  ),
  'Rất hài lòng': t(
    'Very satisfied',
    'बहुत संतुष्ट',
    '매우 만족',
    '非常满意',
    'Очень удовлетворен'
  ),
  'Hoàn toàn không đồng ý': t(
    'Strongly disagree',
    'पूरी तरह असहमत',
    '전혀 동의하지 않음',
    '完全不同意',
    'Совершенно не согласен'
  ),
  'Không đồng ý': t(
    'Disagree',
    'असहमत',
    '동의하지 않음',
    '不同意',
    'Не согласен'
  ),
  'Trung lập / Phân vân': t(
    'Neutral / Undecided',
    'तटस्थ',
    '중립 / 보통',
    '中立 / 不确定',
    'Нейтрально'
  ),
  'Đồng ý': t(
    'Agree',
    'सहमत',
    '동의함',
    '同意',
    'Согласен'
  ),
  'Hoàn toàn đồng ý': t(
    'Strongly agree',
    'पूरी तरह सहमत',
    '매우 동의함',
    '完全同意',
    'Полностью согласен'
  ),
  'Hoàn toàn không quan trọng': t(
    'Not important at all',
    'बिल्कुल महत्वपूर्ण नहीं',
    '전혀 중요하지 않음',
    '完全不重要',
    'Совсем не важно'
  ),
  'Ít quan trọng': t(
    'Slightly important',
    'कम महत्वपूर्ण',
    '별로 중요하지 않음',
    '不太重要',
    'Маловажно'
  ),
  'Quan trọng': t(
    'Important',
    'महत्वपूर्ण',
    '중요함',
    '重要',
    'Важно'
  ),
  'Rất quan trọng': t(
    'Very important',
    'बहुत महत्वपूर्ण',
    '매우 중요함',
    '非常重要',
    'Очень важно'
  ),
  'Rất kém': t('Very poor', 'बहुत खराब', '매우 나쁨', '非常差', 'Очень плохо'),
  'Kém': t('Poor', 'खराब', '나쁨', '较差', 'Плохо'),
  'Trung bình': t('Fair / Average', 'औसत', '보통', '中等', 'Средне'),
  'Tốt': t('Good', 'अच्छा', '좋음', '好', 'Хорошо'),
  'Rất tốt': t('Very good / Excellent', 'बहुत अच्छा', '매우 좋음', '非常好', 'Отлично'),

  // ==================== ĐÁP ÁN PHẦN S ====================
  'Rồi (Từ 4 tiếng trở lên)': t(
    'Yes (4 hours or more)',
    'हाँ (4 घंटे या उससे अधिक)',
    '예 (4시간 이상)',
    '是（4小时及以上）',
    'Да (4 часа и более)'
  ),
  'Chưa (Dưới 4 tiếng)': t(
    'No (Less than 4 hours)',
    'नहीं (4 घंटे से कम)',
    '아니오 (4시간 미만)',
    '否（不足4小时）',
    'Нет (менее 4 часов)'
  ),
  'Có, cho cả nhóm': t(
    'Yes, paying for the whole group',
    'हाँ, पूरे समूह के लिए',
    '예, 일행 전체 비용 지불',
    '是的，为整个同行团队支付',
    'Да, за всю группу'
  ),
  'Có, nhưng chỉ cho bản thân': t(
    'Yes, paying for myself only',
    'हाँ, लेकिन केवल अपने लिए',
    '예, 본인 비용만 지불',
    '是的，仅支付我自己的费用',
    'Да, но только за себя'
  ),
  'Không, người khác chi trả hoàn toàn': t(
    'No, someone else pays completely',
    'नहीं, कोई और पूरी तरह से भुगतान करता है',
    '아니오, 다른 사람이 전액 지불',
    '不，完全由他人支付',
    'Нет, полностью оплачивает другой человек'
  ),
  'Nam': t('Male', 'पुरुष', '남성', '男', 'Мужской'),
  'Nữ': t('Female', 'महिला', '여성', '女', 'Женский'),
  'Dưới 18 tuổi': t('Under 18 years old', '18 वर्ष से कम', '18세 미만', '18岁以下', 'До 18 лет'),
  '18 – 25 tuổi': t('18 – 25 years old', '18 – 25 वर्ष', '18 – 25세', '18 – 25岁', '18 – 25 лет'),
  '26 – 35 tuổi': t('26 – 35 years old', '26 – 35 वर्ष', '26 – 35세', '26 – 35岁', '26 – 35 лет'),
  '36 – 45 tuổi': t('36 – 45 years old', '36 – 45 वर्ष', '36 – 45세', '36 – 45岁', '36 – 45 лет'),
  '46 – 55 tuổi': t('46 – 55 years old', '46 – 55 वर्ष', '46 – 55세', '46 – 55岁', '46 – 55 лет'),
  'Trên 55 tuổi': t('Over 55 years old', '55 वर्ष से अधिक', '55세 이상', '55岁以上', 'Старше 55 лет'),
  'Việt Nam: TP. Đà Nẵng': t(
    'Vietnam: Da Nang City',
    'वियतनाम: दा नांग शहर',
    '베트남: 다낭시',
    '越南：岘港市',
    'Вьетнам: г. Дананг'
  ),
  'Việt Nam: Miền Bắc': t(
    'Vietnam: Northern Region',
    'वियतनाम: उत्तरी क्षेत्र',
    '베트남: 북부 지역',
    '越南：北部地区',
    'Вьетнам: Северный регион'
  ),
  'Việt Nam: Miền Trung (trừ TP. Đà Nẵng)': t(
    'Vietnam: Central Region (excl. Da Nang)',
    'वियतनाम: मध्य क्षेत्र (दा नांग को छोड़कर)',
    '베트남: 중부 지역 (다낭 제외)',
    '越南：中部地区（不含岘港）',
    'Вьетнам: Центральный регион (кроме Дананга)'
  ),
  'Việt Nam: Miền Nam': t(
    'Vietnam: Southern Region',
    'वियतनाम: दक्षिणी क्षेत्र',
    '베트남: 남부 지역',
    '越南：南部地区',
    'Вьетнам: Южный регион'
  ),
  'Hàn Quốc / South Korea': t('South Korea', 'दक्षिण कोरिया', '대한민국 (한국)', '韩国', 'Южная Корея'),
  'Ấn Độ / India': t('India', 'भारत (India)', '인도', '印度', 'Индия'),
  'Đông Nam Á (Thái Lan, Malaysia, Philippines,...)': t(
    'Southeast Asia (Thailand, Malaysia, Philippines,...)',
    'दक्षिण पूर्व एशिया (थाईलैंड, मलेशिया, फिलीपींस,...)',
    '동남아시아 (태국, 말레이시아, 필리핀 등)',
    '东南亚（泰国、马来西亚、菲律宾等）',
    'Юго-Восточная Азия (Таиланд, Малайзия, Филиппины и др.)'
  ),
  'Đông Bắc Á khác (Nhật Bản, Trung Quốc, Đài Loan,...)': t(
    'Other Northeast Asia (Japan, China, Taiwan,...)',
    'अन्य पूर्वोत्तर एशिया (जापान, चीन, ताइवान,...)',
    '기타 동북아시아 (일본, 중국, 대만 등)',
    '其他东北亚地区（中国、日本、台湾等）',
    'Другие страны Северо-Восточной Азии (Китай, Япония, Тайвань и др.)'
  ),
  'Western countries – Europe/Americas/Australia': t(
    'Western countries – Europe / Americas / Australia',
    'पश्चिमी देश – यूरोप / अमेरिका / ऑस्ट्रेलिया',
    '서구권 – 유럽 / 미주 / 호주',
    '欧美及大洋洲国家（欧洲/美洲/澳大利亚）',
    'Западные страны – Европа / Америка / Австралия'
  ),
  'Nga / Russia (Nhóm ưu tiên Quota)': t(
    'Russia / CIS',
    'रूस (Russia)',
    '러시아 / CIS',
    '俄罗斯 / 独联体',
    'Россия / СНГ'
  ),
  'Khác (ghi rõ)': t(
    'Other (please specify)',
    'अन्य (कृपया स्पष्ट करें)',
    '기타 (구체적으로 기재)',
    '其他（请注明）',
    'Другое (уточните)'
  ),
  'Đi một mình / Solo traveler': t(
    'Solo traveler',
    'अकेले यात्री (Solo traveler)',
    '혼자 여행 (1인 여행객)',
    '独自旅行（个人游）',
    'Путешествую один / одна'
  ),
  'Gia đình có trẻ em (dưới 12 tuổi)': t(
    'Family with children (under 12 years old)',
    'बच्चों के साथ परिवार (12 वर्ष से कम)',
    '어린이 동반 가족 (12세 미만 포함)',
    '带儿童的家庭（12岁以下）',
    'Семья с детьми (до 12 лет)'
  ),
  'Gia đình người lớn / đa thế hệ (không có trẻ em <12 tuổi)': t(
    'Adult / Multi-generational family (no children under 12)',
    'वयस्क / बहु-पीढ़ी परिवार (12 वर्ष से कम के बच्चे नहीं)',
    '성인 가족 / 다세대 가족 (12세 미만 어린이 없음)',
    '成人/多代家庭（无12岁以下儿童）',
    'Семья взрослых / несколько поколений (без детей до 12 лет)'
  ),
  'Nhóm bạn / cặp đôi': t(
    'Friends / Couple',
    'दोस्तों का समूह / युगल (Couple)',
    '친구 모임 / 커플',
    '朋友结伴 / 情侣',
    'Компания друзей / Пара'
  ),
  'Đoàn khách / công ty': t(
    'Tour group / Corporate group (MICE)',
    'टूर ग्रुप / कंपनी समूह',
    '단체 관광객 / 회사 단체',
    '旅行团 / 公司团队',
    'Туристическая группа / Корпоративная группа'
  ),
  'Đi tự do / Tự túc': t(
    'Independent / Self-guided traveler (FIT)',
    'स्वतंत्र / स्वयं की यात्रा (FIT)',
    '자유여행 / 개별여행 (FIT)',
    '自由行 / 自助游',
    'Самостоятельное путешествие (FIT)'
  ),
  'Đi theo tour trọn gói của công ty lữ hành (đã gồm suất ăn trưa)': t(
    'Package tour via travel agency (lunch included)',
    'ट्रैवल एजेंसी का पैकेज टूर (दोपहर का भोजन शामिल)',
    '여행사 패키지 투어 (중식 포함)',
    '旅行社全包跟团游（已含午餐）',
    'Пакетный тур от турагентства (обед включен)'
  ),
  'Lần đầu': t('First time', 'पहली बार', '첫 방문', '第一次', 'В первый раз'),
  'Lần thứ 2': t('Second time', 'दूसरी बार', '두 번째 방문', '第二次', 'Во второй раз'),
  'Từ lần thứ 3 trở lên': t(
    '3rd time or more',
    'तीसरी बार या उससे अधिक',
    '3회 이상 방문',
    '三次及以上',
    'В третий раз и более'
  ),
  'Chỉ vé cáp treo': t(
    'Cable car ticket only',
    'केवल केबल कार टिकट',
    '케이블카 단일 티켓',
    '仅缆车门票',
    'Только билет на канатную дорогу'
  ),
  'Combo cáp treo + buffet': t(
    'Cable car + Buffet combo',
    'केबल कार + बुफे कॉम्बो',
    '케이블카 + 뷔페 콤보',
    '缆车 + 自助餐套票',
    'Комбо: канатная дорога + шведский стол (буфет)'
  ),
  'Combo cáp treo + voucher ẩm thực (mệnh giá 300.000đ)': t(
    'Cable car + F&B Voucher combo (300,000 VND)',
    'केबल कार + फूड वाउचर कॉम्बो (300,000 VND)',
    '케이블카 + 식음료 바우처 콤보 (300,000 VND)',
    '缆车 + 餐饮代金券套票（300,000越南盾）',
    'Комбо: канатная дорога + ваучер на питание (300 000 VND)'
  ),
  'Vé trong tour trọn gói': t(
    'Included in package tour',
    'पैकेज टूर में शामिल टिकट',
    '패키지 투어 포함 티켓',
    '跟团游包含的门票',
    'Билет включен в пакетный тур'
  ),
  'Gói/vé ưu đãi khác (First 18–25, giá địa phương,...)': t(
    'Other promotional ticket (First 18–25, local resident,...)',
    'अन्य प्रचार टिकट (First 18–25, स्थानीय निवासी,...)',
    '기타 프로모션/할인 티켓 (First 18–25, 지역주민 할인 등)',
    '其他优惠套票（18–25岁优惠、本地居民票等）',
    'Другой льготный билет / акция (First 18–25, местный тариф и т.д.)'
  ),
  'Không rõ': t('Not sure', 'पता नहीं / अनिश्चित', '잘 모르겠음', '不清楚', 'Не уверен(а)'),

  // ==================== ĐÁP ÁN PHẦN A ====================
  'Dưới 150.000đ': t(
    'Under 150,000 VND',
    '150,000 VND से कम',
    '150,000 VND 미만',
    '150,000 越南盾以下',
    'Менее 150 000 VND'
  ),
  'Từ 150.000 đến dưới 300.000đ': t(
    '150,000 – under 300,000 VND',
    '150,000 से 300,000 VND से कम',
    '150,000 ~ 300,000 VND 미만',
    '150,000 至 300,000 越南盾以下',
    'От 150 000 до 300 000 VND'
  ),
  'Từ 300.000 đến dưới 400.000đ': t(
    '300,000 – under 400,000 VND',
    '300,000 से 400,000 VND से कम',
    '300,000 ~ 400,000 VND 미만',
    '300,000 至 400,000 越南盾以下',
    'От 300 000 до 400 000 VND'
  ),
  'Từ 400.000 đến dưới 500.000đ': t(
    '400,000 – under 500,000 VND',
    '400,000 से 500,000 VND से कम',
    '400,000 ~ 500,000 VND 미만',
    '400,000 至 500,000 越南盾以下',
    'От 400 000 до 500 000 VND'
  ),
  'Từ 500.000 đến dưới 700.000đ': t(
    '500,000 – under 700,000 VND',
    '500,000 से 700,000 VND से कम',
    '500,000 ~ 700,000 VND 미만',
    '500,000 至 700,000 越南盾以下',
    'От 500 000 до 700 000 VND'
  ),
  'Từ 700.000 đến dưới 1.000.000đ': t(
    '700,000 – under 1,000,000 VND',
    '700,000 से 1,000,000 VND से कम',
    '700,000 ~ 1,000,000 VND 미만',
    '700,000 至 1,000,000 越南盾以下',
    'От 700 000 до 1 000 000 VND'
  ),
  'Từ 1.000.000đ trở lên': t(
    '1,000,000 VND or more',
    '1,000,000 VND या उससे अधिक',
    '1,000,000 VND 이상',
    '1,000,000 越南盾及以上',
    'От 1 000 000 VND и более'
  ),
  'Chưa dự trù / không nhớ': t(
    'Did not budget / Cannot recall',
    'बजट तय नहीं किया / याद नहीं है',
    '예산을 정하지 않음 / 기억나지 않음',
    '未做预算 / 不记得',
    'Не планировал(а) бюджет / Не помню'
  ),
  'Nhà hàng buffet (Bốn Mùa, Taiga, Bharata,...)': t(
    'Buffet restaurant (Four Seasons, Taiga, Bharata,...)',
    'बुफे रेस्तरां (Bốn Mùa, Taiga, Bharata,...)',
    '뷔페 레스토랑 (사계절, 타이거, 바라타 등)',
    '自助餐厅（四季、Taiga、Bharata印度餐厅等）',
    'Ресторан шведский стол / буфет (Four Seasons, Taiga, Bharata и др.)'
  ),
  'Nhà hàng gọi món (à la carte/set menu)': t(
    'À la carte / Set menu restaurant',
    'अ ला कार्टे (À la carte) / सेट मेनू रेस्तरां',
    '단품 메뉴 (À la carte) / 세트 메뉴 레스토랑',
    '点餐 / 套餐餐厅（À la carte / Set menu）',
    'Ресторан по меню (à la carte / сет-меню)'
  ),
  'Đồ ăn nhanh/món ăn nhẹ (xiên nướng, xúc xích,...)': t(
    'Fast food / Snacks (grilled skewers, sausages,...)',
    'फास्ट फूड / स्नैक्स (ग्रिल्ड स्क्यूवर्स, सॉसेज,...)',
    '패스트푸드 / 간식류 (꼬치구이, 소시지 등)',
    '快餐 / 小吃（烤串、香肠等）',
    'Фастфуд / Закуски (шашлычки, сосиски и т.д.)'
  ),
  'Bánh ngọt, kem, trái cây mang đi': t(
    'Pastries, ice cream, takeaway fruit',
    'पेस्ट्री, आइसक्रीम, टेकअवे फल',
    '베이커리, 아이스크림, 테이크아웃 과일',
    '甜点、冰淇淋、外带水果',
    'Выпечка, мороженое, фрукты навынос'
  ),
  'Cà phê, trà, nước giải khát, bia hoặc đồ uống pha chế': t(
    'Coffee, tea, soft drinks, beer, or crafted beverages',
    'कॉफी, चाय, शीतल पेय, बीयर या अन्य पेय पदार्थ',
    '커피, 차, 청량음료, 맥주 또는 제조 음료',
    '咖啡、茶、软饮、啤酒或特调饮品',
    'Кофе, чай, прохладительные напитки, пиво или коктейли'
  ),
  'Mua đồ ăn, thức uống mang về làm quà': t(
    'Packaged food & drinks bought as souvenirs / gifts',
    'उपहार के रूप में घर ले जाने के लिए पैक किए गए खाद्य और पेय',
    '선물용 포장 식음료 구매',
    '购买包装食品/饮品作为伴手礼',
    'Покупка еды и напитков в подарок / с собой'
  ),
  'Chưa sử dụng bất kỳ dịch vụ F&B nào (Mã loại trừ)': t(
    'Have not used any F&B services today (Exclusive)',
    'आज किसी भी खाद्य या पेय सेवा का उपयोग नहीं किया है',
    '오늘 어떠한 식음료 서비스도 이용하지 않음',
    '今天尚未在景区使用任何餐饮服务',
    'Сегодня не пользовался(-ась) никакими услугами питания и напитков'
  ),
  'Đã ăn uống trước khi đến hoặc không có nhu cầu ăn uống': t(
    'Ate before arriving or had no need to eat/drink',
    'आने से पहले खा लिया था या खाने-पीने की आवश्यकता नहीं थी',
    '방문 전에 이미 식사했거나 식음료 이용 필요가 없었음',
    '来之前已用过餐，或没有餐饮需求',
    'Поел(а) до приезда или не было необходимости в еде/напитках'
  ),
  'Đã mang theo đồ ăn, thức uống': t(
    'Brought own food and drinks',
    'अपना खाना और पेय साथ लाए थे',
    '음식과 음료를 직접 챙겨 옴',
    '自带了食物和饮品',
    'Принес(ла) свою еду и напитки'
  ),
  'Giá chưa phù hợp với ngân sách': t(
    'Prices do not fit my budget',
    'कीमतें मेरे बजट के अनुकूल नहीं हैं',
    '가격이 예산에 맞지 않음',
    '价格超出预算 / 不够实惠',
    'Цены не соответствуют моему бюджету'
  ),
  'Chưa tìm thấy món ăn/thức uống phù hợp sở thích/văn hóa': t(
    'Could not find food/drinks matching my taste or culture (e.g., Halal/Veg/Local)',
    'मेरी पसंद या संस्कृति (जैसे शाकाहारी/हलाल/भारतीय स्वाद) के अनुकूल भोजन नहीं मिला',
    '입맛이나 식문화에 맞는 음식/음료를 찾지 못함',
    '没有找到符合口味或饮食文化的食物/饮品',
    'Не нашел(-ла) блюд/напитков по своему вкусу или культуре питания'
  ),
  'Khó tìm điểm bán hoặc điểm bán không tiện trên hành trình': t(
    'Outlets are hard to find or inconvenient along the route',
    'दुकानें ढूँढना मुश्किल था या यात्रा मार्ग पर सुविधाजनक नहीं थीं',
    '매장을 찾기 어렵거나 이동 동선상 위치가 불편함',
    '餐厅/售卖点很难找，或不在顺路位置',
    'Точки питания трудно найти или они неудобно расположены по маршруту'
  ),
  'Thiếu thông tin/biển chỉ dẫn về các điểm bán F&B': t(
    'Lack of information or directional signage for F&B outlets',
    'खान-पान की दुकानों के बारे में जानकारी या दिशा-निर्देश बोर्ड की कमी',
    '식음료 매장에 대한 안내 정보나 표지판 부족',
    '缺少关于餐饮售卖点的信息或指示牌',
    'Недостаточно информации или указателей к точкам питания'
  ),
  'Lo ngại thời gian chờ đợi/xếp hàng lâu': t(
    'Worried about long waiting or queueing times',
    'लंबी कतार या प्रतीक्षा समय की चिंता',
    '대기 시간이나 줄이 길까 봐 우려됨',
    '担心排队或等餐时间太长',
    'Опасения по поводу долгого ожидания или очередей'
  ),
  'Đã có suất ăn trong vé/tour và không muốn chi thêm': t(
    'Meal already included in ticket/tour and did not want to spend extra',
    'टिकट/टूर में भोजन पहले से शामिल था और अतिरिक्त खर्च नहीं करना चाहते थे',
    '티켓/투어에 식사가 포함되어 있어 추가 지출을 원치 않음',
    '门票/团费中已包含餐食，不想再额外消费',
    'Питание уже включено в билет/тур, не хотелось тратить дополнительно'
  ),
  'Lý do khác (ghi rõ)': t(
    'Other reason (please specify)',
    'अन्य कारण (कृपया स्पष्ट करें)',
    '기타 이유 (구체적으로 기재)',
    '其他原因（请注明）',
    'Другая причина (уточните)'
  ),
  'Chắc chắn sẽ sử dụng': t(
    'Definitely will use',
    'निश्चित रूप से उपयोग करेंगे',
    '반드시 이용할 것임',
    '一定会使用',
    'Определенно воспользуюсь'
  ),
  'Có thể sẽ sử dụng': t(
    'Might use',
    'शायद उपयोग करेंगे',
    '이용할 수도 있음',
    '可能会使用',
    'Возможно воспользуюсь'
  ),
  'Vẫn không sử dụng': t(
    'Still will not use',
    'फिर भी उपयोग नहीं करेंगे',
    '그래도 이용하지 않을 것임',
    '仍然不会使用',
    'Все равно не воспользуюсь'
  ),
  'Không xác định được (không biết giá suất ăn đã bao gồm → hỏi A4.1)': t(
    'Cannot determine (meal included in package/tour → answer A4.1)',
    'निर्धारित नहीं कर सकते (पैकेज/टूर में भोजन शामिल है → A4.1 का उत्तर दें)',
    '확인 불가 (패키지/투어 포함 식사 가격 미상 → A4.1 응답)',
    '无法确定（不清楚套票/跟团已含餐食的价格 → 请答A4.1）',
    'Затрудняюсь определить (питание включено в тур/пакет → вопрос A4.1)'
  ),
  '0đ (Chưa chi thêm ngoài suất ăn trong vé/tour)': t(
    '0 VND (No extra spending beyond included ticket/tour meal)',
    '0 VND (टिकट/टूर के भोजन के अलावा कोई अतिरिक्त खर्च नहीं)',
    '0 VND (티켓/투어 포함 식사 외 추가 지출 없음)',
    '0 越南盾（除门票/团餐外无额外消费）',
    '0 VND (без доп. расходов сверх питания в билете/туре)'
  ),
  'Dưới 50.000đ': t('Under 50,000 VND', '50,000 VND से कम', '50,000 VND 미만', '50,000 越南盾以下', 'Менее 50 000 VND'),
  'Từ 50.000 đến dưới 100.000đ': t(
    '50,000 – under 100,000 VND',
    '50,000 से 100,000 VND से कम',
    '50,000 ~ 100,000 VND 미만',
    '50,000 至 100,000 越南盾以下',
    'От 50 000 до 100 000 VND'
  ),
  'Từ 100.000 đến dưới 200.000đ': t(
    '100,000 – under 200,000 VND',
    '100,000 से 200,000 VND से कम',
    '100,000 ~ 200,000 VND 미만',
    '100,000 至 200,000 越南盾以下',
    'От 100 000 до 200 000 VND'
  ),
  'Từ 200.000 đến dưới 300.000đ': t(
    '200,000 – under 300,000 VND',
    '200,000 से 300,000 VND से कम',
    '200,000 ~ 300,000 VND 미만',
    '200,000 至 300,000 越南盾以下',
    'От 200 000 до 300 000 VND'
  ),
  'Từ 300.000 đến dưới 500.000đ': t(
    '300,000 – under 500,000 VND',
    '300,000 से 500,000 VND से कम',
    '300,000 ~ 500,000 VND 미만',
    '300,000 至 500,000 越南盾以下',
    'От 300 000 до 500 000 VND'
  ),
  'Từ 500.000đ trở lên': t(
    '500,000 VND or more',
    '500,000 VND या उससे अधिक',
    '500,000 VND 이상',
    '500,000 越南盾及以上',
    'От 500 000 VND и более'
  ),
  'Đặt trước chuyến đi (khi mua vé/tour online hoặc qua đại lý)': t(
    'Booked before the trip (online or via travel agency)',
    'यात्रा से पहले बुक किया गया (ऑनलाइन या ट्रैवल एजेंसी के माध्यम से)',
    '여행 전 사전 예약 (온라인 또는 여행사를 통해 티켓/투어 구매 시)',
    '出行前已预订（在线或通过旅行社购票/报团时）',
    'Забронировано до поездки (онлайн или через турагентство)'
  ),
  'Ngay khi đến khu du lịch/lên trạm cáp treo': t(
    'Right upon arriving at the resort / cable car station',
    'रिसॉर्ट / केबल कार स्टेशन पर पहुँचते ही',
    '관광지 도착 직후 / 케이블카 탑승장에서',
    '刚到达景区 / 缆车站时',
    'Сразу по прибытии на курорт / на станцию канатной дороги'
  ),
  'Đến giờ ăn cố định (khoảng 11:30 – 13:30)': t(
    'At regular meal time (around 11:30 – 13:30)',
    'नियमित भोजन समय पर (लगभग 11:30 – 13:30)',
    '정해진 식사 시간이 되었을 때 (약 11:30 – 13:30)',
    '到了固定用餐时间（约 11:30 – 13:30）',
    'В обычное время обеда (около 11:30 – 13:30)'
  ),
  'Bắt đầu cảm thấy đói/khát hoặc mệt mỏi trên đường đi': t(
    'When feeling hungry, thirsty, or tired along the way',
    'रास्ते में भूख, प्यास या थकान महसूस होने पर',
    '이동 중 배고픔/갈증 또는 피로를 느끼기 시작할 때',
    '游览途中感到饥饿、口渴或疲惫时',
    'Когда почувствовал(а) голод, жажду или усталость во время прогулки'
  ),
  'Khi nhìn thấy hình ảnh món ăn/biển quảng cáo/khuyến mại bắt mắt': t(
    'When seeing attractive food displays, ads, or promotions',
    'आकर्षक भोजन के चित्र, विज्ञापन या प्रमोशन देखने पर',
    '눈길을 끄는 음식 사진/광고판/프로모션을 보았을 때',
    '看到吸引人的美食图片/广告牌/促销活动时',
    'Увидев аппетитные блюда, яркую рекламу или акции'
  ),
  'Khi được nhân viên giới thiệu': t(
    'When recommended by staff',
    'कर्मचारियों द्वारा सुझाव दिए जाने पर',
    '직원의 추천 및 안내를 받았을 때',
    '经景区工作人员介绍推荐时',
    'По рекомендации персонала'
  ),
  'Khi đi ngang qua điểm bán tiện lợi, không phải chờ đợi': t(
    'When passing by a convenient outlet with no waiting line',
    'बिना किसी कतार या प्रतीक्षा के सुविधाजनक दुकान के पास से गुजरते समय',
    '대기 줄 없이 편리하게 이용할 수 있는 매장을 지나갈 때',
    '路过方便且无需排队等待的售卖点时',
    'Проходя мимо удобной точки без очередей и ожидания'
  ),
  'Có': t('Yes', 'हाँ', '예 (있음)', '是（有）', 'Да'),
  'Có thể, tùy sản phẩm và mức giá': t(
    'Maybe, depending on the items and prices',
    'शायद, उत्पाद और कीमत के आधार पर',
    '아마도 (메뉴와 가격에 따라 결정)',
    '可能会，取决于产品和价格',
    'Возможно, в зависимости от ассортимента и цен'
  ),
  'Không (Chuyển thẳng sang Phần B)': t(
    'No (Proceed to Section B)',
    'नहीं (भाग B पर आगे बढ़ें)',
    '아니오 (B 파트로 이동)',
    '否（直接进入 B 部分）',
    'Нет (переход к Разделу B)'
  ),

  // ==================== ĐÁP ÁN PHẦN B ====================
  'Ẩm thực địa phương (món đặc trưng Đà Nẵng – Quảng Nam)': t(
    'Local Vietnamese cuisine (Da Nang – Quang Nam specialties)',
    'स्थानीय वियतनामी व्यंजन (दा नांग – क्वांग नाम विशेषता)',
    '베트남 현지 음식 (다낭·꽝남 특산 요리)',
    '当地特色美食（岘港 - 广南省风味）',
    'Местная вьетнамская кухня (блюда Дананга и Куангнама)'
  ),
  'Ẩm thực quê hương của Anh/Chị (món quen thuộc quốc gia/vùng miền)': t(
    'Authentic cuisine from your home country / region',
    'आपके अपने देश / क्षेत्र का परिचित भोजन (भारतीय व्यंजन आदि)',
    '본국 / 고향의 친숙한 한식 또는 자국 음식',
    '您家乡/本国的熟悉风味美食（如中餐）',
    'Кухня вашей родной страны / региона (привычные блюда)'
  ),
  'Ẩm thực quốc tế (Âu, Nhật, Hàn, Ấn,...)': t(
    'International cuisine (Western, Japanese, Korean, Indian,...)',
    'अंतर्राष्ट्रीय व्यंजन (यूरोपीय, जापानी, कोरियाई, भारतीय,...)',
    '세계 각국 요리 (양식, 일식, 한식, 인도식 등)',
    '国际美食（西餐、日料、韩餐、印度菜等）',
    'Международная кухня (европейская, японская, корейская, индийская и др.)'
  ),
  'Ẩm thực cao cấp (Fine dining)': t(
    'Premium / Fine dining cuisine',
    'प्रीमियम / फाइन डाइनिंग (Fine dining)',
    '고급 파인다이닝 (Fine dining)',
    '高端精致餐饮（Fine dining）',
    'Высокая кухня / Премиум-рестораны (Fine dining)'
  ),
  'Ẩm thực chay (Vegetarian)': t(
    'Vegetarian cuisine',
    'शाकाहारी भोजन (Pure Vegetarian / Jain)',
    '채식 메뉴 (Vegetarian)',
    '素食餐饮（Vegetarian）',
    'Вегетарианская кухня (Vegetarian)'
  ),
  'Ẩm thực healthy, tốt cho sức khỏe': t(
    'Healthy / Wellness food',
    'स्वस्थ और पौष्टिक आहार (Healthy food)',
    '건강식 / 웰빙 푸드 (Healthy food)',
    '健康轻食 / 养生餐饮',
    'Здоровое и диетическое питание (Healthy food)'
  ),
  'Đồ ăn nhanh (burger, gà rán, xiên que nướng,...)': t(
    'Fast food (burgers, fried chicken, grilled skewers,...)',
    'फास्ट फूड (बर्गर, फ्राइड चिकन, ग्रिल्ड स्क्यूवर्स,...)',
    '패스트푸드 (버거, 프라이드 치킨, 꼬치구이 등)',
    '快餐小食（汉堡、炸鸡、烤串等）',
    'Фастфуд (бургеры, жареная курица, шашлычки и т.д.)'
  ),
  'Bánh ngọt, bánh mì tươi, kem và món tráng miệng': t(
    'Pastries, fresh bakery, ice cream & desserts',
    'पेस्ट्री, ताज़ा बेकरी, आइसक्रीम और मिठाइयाँ',
    '베이커리, 신선한 빵, 아이스크림 및 디저트',
    '烘焙甜品、新鲜面包、冰淇淋及甜点',
    'Выпечка, свежий хлеб, мороженое и десерты'
  ),
  'Cà phê, trà, nước trái cây tươi và đồ uống pha chế': t(
    'Coffee, tea, fresh fruit juices & crafted drinks',
    'कॉफी, चाय, ताजे फलों का जूस और विशेष पेय',
    '커피, 차, 생과일주스 및 제조 음료',
    '咖啡、茶饮、鲜榨果汁及特调饮品',
    'Кофе, чай, свежевыжатые соки и авторские напитки'
  ),
  'Combo đồ ăn và thức uống': t(
    'Food & beverage value combos',
    'भोजन और पेय कॉम्बो (Value combos)',
    '음식 + 음료 세트 콤보 메뉴',
    '餐饮超值组合套餐（Combo）',
    'Выгодные комбо-наборы (еда + напиток)'
  ),
  'Quà tặng ẩm thực đóng gói đặc trưng Bà Nà': t(
    'Packaged Ba Na Hills specialty F&B gifts',
    'बा ना हिल्स के विशेष पैक किए गए खाद्य उपहार',
    '바나힐 특산 포장 식음료 기념품/선물',
    '巴拿山特色包装食品伴手礼',
    'Фирменные гастрономические сувениры Ба На Хиллс в упаковке'
  ),
  'Buffet đa dạng món ăn': t(
    'Buffet with a wide variety of dishes',
    'विविध व्यंजनों वाला बुफे (Buffet)',
    '다양한 메뉴를 제공하는 뷔페',
    '菜品丰富的自助餐（Buffet）',
    'Шведский стол (буфет) с большим выбором блюд'
  ),
  'Nhà hàng gọi món, phục vụ tại bàn': t(
    'À la carte restaurant with table service',
    'टेबल सर्विस वाला अ ला कार्टे रेस्तरां',
    '테이블 서비스가 제공되는 단품 주문 레스토랑',
    '提供桌边服务的点餐餐厅',
    'Ресторан с обслуживанием за столиками (à la carte)'
  ),
  'Quầy bán đồ ăn nhanh, nhận món nhanh': t(
    'Quick-service fast food counter',
    'त्वरित सेवा वाला फास्ट फूड काउंटर',
    '빠르게 수령할 수 있는 패스트푸드 카운터',
    '快速取餐的快餐柜台',
    'Стойка быстрого питания (быстрая выдача блюд)'
  ),
  'Kiosk/quầy mang đi trên hành trình tham quan': t(
    'Grab-and-go kiosk along the sightseeing route',
    'भ्रमण मार्ग पर टेक-अवे कियोस्क / स्टॉल',
    '관람 동선상의 테이크아웃 키오스크/매점',
    '游览路线沿途的外带亭 / 小食站',
    'Киоски «еда с собой» по маршруту прогулки'
  ),
  'Combo đồ ăn và thức uống giá trọn gói': t(
    'All-in-one food & drink combo at a fixed price',
    'निश्चित कीमत पर भोजन और पेय का कॉम्बो पैक',
    '합리적인 정찰가 음식+음료 콤보',
    '一口价餐饮组合套餐',
    'Комплексный набор (еда + напиток) по фиксированной цене'
  ),
  'Xe đẩy hoặc điểm bán lưu động tại khu vực đông khách': t(
    'Food carts or mobile stalls at busy areas',
    'भीड़-भाड़ वाले क्षेत्रों में फूड कार्ट या मोबाइल स्टॉल',
    '주요 밀집 구역의 푸드트럭/이동식 판매대',
    '在游客密集区设置的移动餐车/摊位',
    'Мобильные тележки с едой в оживленных зонах'
  ),
  'Không có ưu tiên cụ thể (Mã loại trừ)': t(
    'No specific preference (Exclusive)',
    'कोई विशेष प्राथमिकता नहीं',
    '특별히 선호하는 형태 없음',
    '没有特定偏好',
    'Нет особых предпочтений'
  ),
  'Không/ít cay': t(
    'Non-spicy / Mild',
    'बिना मसालेदार / कम तीखा',
    '안 매움 / 약간 매움',
    '不辣 / 微辣',
    'Неострое / Слабоострое'
  ),
  'Cay vừa': t('Medium spicy', 'मध्यम तीखा', '보통 매운맛', '中辣', 'Умеренно острое'),
  'Nhiều cay': t('Very spicy / Hot', 'अधिक तीखा / मसालेदार', '매운맛 선호', '重辣 / 特辣', 'Очень острое'),
  'Thanh nhẹ': t('Light / Mild flavor', 'हल्का स्वाद', '담백하고 순한 맛', '清淡爽口', 'Легкий / Нежный вкус'),
  'Yếu tố ảnh hưởng (Khung SERVQUAL)': t(
    'Influencing Factors (SERVQUAL Framework)',
    'प्रभावित करने वाले कारक (SERVQUAL)',
    '영향 요인 (SERVQUAL 프레임워크)',
    '影响因素（SERVQUAL 框架）',
    'Факторы влияния (модель SERVQUAL)'
  ),
  'Tiêu chí đánh giá': t(
    'Evaluation Criteria',
    'मूल्यांकन मानदंड',
    '평가 항목 / 기준',
    '评价指标 / 因素',
    'Критерии оценки'
  ),
  'Đậm vị': t('Rich / Bold flavor', 'गहरा / मसालेदार स्वाद', '진하고 풍부한 맛', '浓郁醇厚', 'Насыщенный / Яркий вкус'),
  'Món nóng': t('Hot dishes', 'गर्म भोजन', '따뜻한 음식', '热食 / 热饮', 'Горячие блюда'),
  'Món lạnh': t('Cold / Chilled items', 'ठंडा भोजन / पेय', '차가운 음식/음료', '冷食 / 冷饮', 'Холодные блюда / напитки'),
  'Cả hai / không quan trọng': t(
    'Both / Does not matter',
    'दोनों / कोई फर्क नहीं पड़ता',
    '둘 다 좋음 / 상관없음',
    '两者皆可 / 无所谓',
    'Оба варианта / Не имеет значения'
  ),

  // ==================== MA TRẬN A5, B4, B5 ====================
  'Gọi món (à la carte/set menu)': t(
    'À la carte / Set menu',
    'अ ला कार्टे / सेट मेनू',
    '단품 / 세트 메뉴',
    '点餐 / 套餐',
    'По меню (à la carte / сет)'
  ),
  'Đồ ăn nhanh/món ăn nhẹ': t('Fast food / Snacks', 'फास्ट फूड / स्नैक्स', '패스트푸드 / 간식', '快餐 / 小吃', 'Фастфуд / Закуски'),
  'Bánh ngọt/kem/trái cây': t(
    'Pastries / Ice cream / Fruit',
    'पेस्ट्री / आइसक्रीम / फल',
    '베이커리 / 아이스크림 / 과일',
    '甜点 / 冰淇淋 / 水果',
    'Выпечка / Мороженое / Фрукты'
  ),
  'Đồ uống (cà phê, trà, bia, nước giải khát)': t(
    'Beverages (coffee, tea, beer, soft drinks)',
    'पेय पदार्थ (कॉफी, चाय, बीयर, शीतल पेय)',
    '음료 (커피, 차, 맥주, 청량음료)',
    '饮品（咖啡、茶、啤酒、软饮）',
    'Напитки (кофе, чай, пиво, лимонады)'
  ),
  'Đồ ăn/thức uống mua về làm quà': t(
    'F&B souvenirs to take home',
    'उपहार के लिए खाद्य/पेय',
    '선물용 포장 식음료',
    '餐饮伴手礼',
    'Гастрономические сувениры с собой'
  ),
  'Buffet / người lớn': t('Buffet / adult', 'बुफे / प्रति वयस्क', '뷔페 / 성인 1인', '自助餐 / 成人', 'Шведский стол (буфет) / взр.'),
  'À la carte / người lớn': t(
    'À la carte / adult',
    'अ ला कार्टे / प्रति वयस्क',
    '단품 식사 / 성인 1인',
    '点餐 / 成人',
    'По меню (à la carte) / взр.'
  ),
  'Đồ ăn nhanh / một phần': t(
    'Fast food / portion',
    'फास्ट फूड / प्रति प्लेट',
    '패스트푸드 / 1인분',
    '快餐 / 每份',
    'Фастфуд / порция'
  ),
  'Đồ uống / một ly': t('Beverage / cup', 'पेय पदार्थ / प्रति गिलास', '음료 / 1잔', '饮品 / 每杯', 'Напиток / стакан'),
  'Bánh ngọt, kem / một phần': t(
    'Pastry or Ice cream / portion',
    'पेस्ट्री या आइसक्रीम / प्रति भाग',
    '베이커리·아이스크림 / 1개',
    '甜点、冰淇淋 / 每份',
    'Выпечка, мороженое / порция'
  ),
  '1. Đắt': t('1. Expensive', '1. महंगा', '1. 비쌈', '1. 贵', '1. Дорого'),
  '2. Hợp lý': t('2. Reasonable', '2. उचित', '2. 적당함', '2. 合理', '2. Разумно'),
  '3. Rẻ': t('3. Cheap', '3. सस्ता', '3. 저렴함', '3. 便宜', '3. Дешево'),
  'Vệ sinh quầy kệ, không gian chỗ ngồi thoáng mát, sạch sẽ': t(
    'Clean counters, airy and clean seating space',
    'साफ काउंटर, हवादार और स्वच्छ बैठने की जगह',
    '매대 위생 상태 및 쾌적하고 깨끗한 좌석 공간',
    '柜台卫生整洁，就餐座位宽敞干净',
    'Чистота прилавков, просторная и чистая посадочная зона'
  ),
  'Hương vị món ăn ngon, hợp khẩu vị, trình bày hấp dẫn': t(
    'Delicious taste, suits palate, appealing presentation',
    'स्वादिष्ट भोजन, पसंद के अनुकूल स्वाद और आकर्षक प्रस्तुति',
    '음식 맛이 좋고 입맛에 맞으며 보기 좋게 제공됨',
    '菜品美味合口味，摆盘精致诱人',
    'Вкусная еда, приятная подача блюд'
  ),
  'Niêm yết giá công khai, an toàn vệ sinh thực phẩm': t(
    'Clear price listing, food safety & hygiene',
    'स्पष्ट मूल्य सूची, खाद्य सुरक्षा और स्वच्छता',
    '명확한 가격 표시 및 식품 위생 안전성',
    '明码标价，食品安全卫生有保障',
    'Понятные ценники, безопасность и гигиена питания'
  ),
  'Nhân viên thân thiện, thời gian chờ lấy món nhanh': t(
    'Friendly staff, fast serving time',
    'मिलनसार कर्मचारी, भोजन मिलने में कम प्रतीक्षा समय',
    '친절한 직원 응대 및 빠른 음식 제공 속도',
    '员工服务热情友好，出餐等待时间短',
    'Дружелюбный персонал, быстрое обслуживание'
  ),
  'Có thực đơn riêng cho Trẻ em / Món chay / Khách quốc tế': t(
    'Dedicated menus for Kids / Vegetarian / International guests',
    'बच्चों / शाकाहारी / अंतर्राष्ट्रीय मेहमानों के लिए विशेष मेनू',
    '어린이 / 채식 / 외국인 관광객을 위한 맞춤 메뉴 구비',
    '提供儿童 / 素食 / 国际游客专属菜单',
    'Наличие детского, вегетарианского и международного меню'
  ),
  'Vị trí điểm bán dễ tìm dọc hành trình tham quan': t(
    'Easy-to-find outlets along the sightseeing route',
    'भ्रमण मार्ग के साथ आसानी से मिलने वाली दुकानें',
    '관람 동선을 따라 쉽게 찾을 수 있는 매장 위치',
    '游览路线沿途餐饮点位置显眼易找',
    'Удобное расположение точек питания по маршруту осмотра'
  ),
  'Tính hữu hình: Vệ sinh quầy kệ, không gian chỗ ngồi thoáng mát, sạch sẽ': t(
    'Tangibles: Clean counters, airy and clean seating space',
    'प्रत्यक्ष सुविधा (Tangibles): साफ काउंटर, हवादार और स्वच्छ बैठने की जगह',
    '유형성(Tangibles): 매대 위생 상태 및 쾌적하고 깨끗한 좌석 공간',
    '有形性：柜台卫生整洁，就餐座位宽敞干净',
    'Материальность: Чистота прилавков, просторная и чистая посадочная зона'
  ),
  'Chất lượng: Hương vị món ăn ngon, hợp khẩu vị, trình bày hấp dẫn': t(
    'Quality: Delicious taste, suits palate, appealing presentation',
    'गुणवत्ता (Quality): स्वादिष्ट भोजन, पसंद के अनुकूल स्वाद और आकर्षक प्रस्तुति',
    '품질(Quality): 음식 맛이 좋고 입맛에 맞으며 보기 좋게 제공됨',
    '品质：菜品美味合口味，摆盘精致诱人',
    'Качество: Вкусная еда, приятная подача блюд'
  ),
  'Sự tin cậy: Niêm yết giá công khai, an toàn vệ sinh thực phẩm': t(
    'Reliability: Clear price listing, food safety & hygiene',
    'विश्वसनीयता (Reliability): स्पष्ट मूल्य सूची, खाद्य सुरक्षा और स्वच्छता',
    '신뢰성(Reliability): 명확한 가격 표시 및 식품 위생 안전성',
    '可靠性：明码标价，食品安全卫生有保障',
    'Надежность: Понятные ценники, безопасность и гигиена питания'
  ),
  'Thái độ & Phản hồi: Nhân viên thân thiện, thời gian chờ lấy món nhanh': t(
    'Responsiveness: Friendly staff, fast serving time',
    'व्यवहार और प्रतिक्रिया (Responsiveness): मिलनसार कर्मचारी, कम प्रतीक्षा समय',
    '응대 및 반응성(Responsiveness): 친절한 직원 응대 및 빠른 음식 제공 속도',
    '态度与响应：员工服务热情友好，出餐等待时间短',
    'Отзывчивость: Дружелюбный персонал, быстрое обслуживание'
  ),
  'Sự thấu cảm: Có thực đơn riêng cho Trẻ em / Món chay / Khách quốc tế': t(
    'Empathy: Dedicated menus for Kids / Vegetarian / International guests',
    'सहानुभूति (Empathy): बच्चों / शाकाहारी / अंतर्राष्ट्रीय मेहमानों के लिए विशेष मेनू',
    '공감성(Empathy): 어린이 / 채식 / 외국인 관광객을 위한 맞춤 메뉴 구비',
    '同理心：提供儿童 / 素食 / 国际游客专属菜单',
    'Эмпатия: Наличие детского, вегетарианского и международного меню'
  ),
  'Tiện lợi: Vị trí điểm bán dễ tìm dọc hành trình tham quan': t(
    'Convenience: Easy-to-find outlets along the sightseeing route',
    'सुविधा (Convenience): भ्रमण मार्ग के साथ आसानी से मिलने वाली दुकानें',
    '편의성(Convenience): 관람 동선을 따라 쉽게 찾을 수 있는 매장 위치',
    '便利性：游览路线沿途餐饮点位置显眼易找',
    'Удобство: Удобное расположение точек питания по маршруту осмотра'
  ),

  // ==================== ĐÁP ÁN PHẦN C ====================
  'Buổi sáng trước 10:30 (cần điểm ăn sáng/cà phê)': t(
    'Morning before 10:30 (breakfast / morning coffee)',
    'सुबह 10:30 से पहले (नाश्ता / सुबह की कॉफी)',
    '오전 10:30 이전 (아침 식사 / 모닝커피)',
    '上午 10:30 之前（早餐 / 早间咖啡）',
    'Утром до 10:30 (завтрак / утренний кофе)'
  ),
  'Khoảng 10:30 – 14:00 (giờ ăn trưa chính)': t(
    'Around 10:30 – 14:00 (main lunch hours)',
    'लगभग 10:30 – 14:00 (मुख्य दोपहर के भोजन का समय)',
    '10:30 ~ 14:00경 (주요 점심 식사 시간)',
    '约 10:30 – 14:00（主要午餐时段）',
    'Около 10:30 – 14:00 (основное время обеда)'
  ),
  'Khoảng 14:00 – 16:00 (xế chiều: kem, bánh ngọt, trà/cà phê nghỉ chân)': t(
    'Around 14:00 – 16:00 (afternoon break: ice cream, pastry, tea/coffee)',
    'लगभग 14:00 – 16:00 (दोपहर का विश्राम: आइसक्रीम, पेस्ट्री, चाय/कॉफी)',
    '14:00 ~ 16:00경 (오후 휴식: 아이스크림, 베이커리, 차/커피)',
    '约 14:00 – 16:00（下午茶休息：冰淇淋、甜点、茶/咖啡）',
    'Около 14:00 – 16:00 (полдник: мороженое, выпечка, чай/кофе)'
  ),
  'Khoảng 16:00 – 17:30 (ăn nhẹ/mua nước trước khi xuống cáp treo)': t(
    'Around 16:00 – 17:30 (light snack / drink before taking cable car down)',
    'लगभग 16:00 – 17:30 (केबल कार से नीचे जाने से पहले हल्का नाश्ता/पेय)',
    '16:00 ~ 17:30경 (케이블카 하산 전 간단한 간식/음료)',
    '约 16:00 – 17:30（乘缆车下山前的简餐/饮品）',
    'Около 16:00 – 17:30 (легкий перекус / напиток перед спуском на канатной дороге)'
  ),
  'Sau 17:30 (tiệc tối/đồ ăn đêm)': t(
    'After 17:30 (dinner / night dining)',
    '17:30 के बाद (रात का खाना / नाइट डाइनिंग)',
    '17:30 이후 (저녁 식사 / 야간 식음료)',
    '17:30 之后（晚餐 / 夜间餐饮）',
    'После 17:30 (ужин / вечернее питание)'
  ),
  'Mua rải rác liên tục khi thấy điểm bán tiện đường': t(
    'Spontaneously throughout the trip when passing convenient outlets',
    'यात्रा के दौरान सुविधाजनक दुकानें दिखने पर कभी भी',
    '이동 중 편리한 매장이 보일 때마다 수시로 구매',
    '游览途中看到顺路方便的店铺随时购买',
    'Понемногу в течение всей прогулки в удобных точках по пути'
  ),
  'Món/khẩu phần cho trẻ em': t(
    'Kids menu / child-sized portions',
    'बच्चों के लिए विशेष भोजन / छोटा पोर्शन',
    '어린이용 메뉴 / 키즈 포션',
    '儿童专属餐食 / 儿童份量',
    'Детское меню / детские порции'
  ),
  'Món chay (Vegetarian)': t(
    'Vegetarian food',
    'शाकाहारी भोजन (Pure Vegetarian / Jain)',
    '채식 메뉴 (Vegetarian)',
    '素食菜品（Vegetarian）',
    'Вегетарианские блюда (Vegetarian)'
  ),
  'Món mềm, dễ ăn cho người lớn tuổi': t(
    'Soft, easy-to-digest food for seniors',
    'बुजुर्गों के लिए नरम और पचने में आसान भोजन',
    '어르신을 위한 부드럽고 소화가 잘되는 음식',
    '适合老年人的软烂易消化食物',
    'Мягкая, легкоусвояемая пища для пожилых людей'
  ),
  'Kiêng/dị ứng thực phẩm (hải sản, đậu phộng, gluten,...)': t(
    'Food allergies / dietary restrictions (seafood, peanuts, gluten,...)',
    'खाद्य एलर्जी / परहेज (सीफूड, मूंगफली, ग्लूटेन,...)',
    '식품 알레르기 / 제한 식단 (해산물, 땅콩, 글루텐 등)',
    '食物忌口 / 过敏注意（海鲜、花生、麸质等）',
    'Пищевая аллергия / ограничения (морепродукты, арахис, глютен и др.)'
  ),
  'Thực phẩm Halal (dành cho khách Hồi giáo)': t(
    'Halal-certified food (for Muslim guests)',
    'हलाल प्रमाणित भोजन (Halal food)',
    '할랄(Halal) 인증 식품',
    '清真认证食品（Halal）',
    'Халяльная еда (Halal)'
  ),
  'Không có nhu cầu đặc biệt (Mã loại trừ)': t(
    'No special dietary needs (Exclusive)',
    'कोई विशेष आहार आवश्यकता नहीं',
    '특별한 식단 요구사항 없음',
    '无特殊饮食需求',
    'Нет особых диетических требований'
  ),
  'Bổ sung biển chỉ dẫn điểm bán và thực đơn': t(
    'Add more directional signage and menu boards',
    'अधिक दिशा-निर्देश बोर्ड और मेनू बोर्ड जोड़ें',
    '매장 위치 안내판 및 메뉴 표지판 확충',
    '增加餐厅方向指示牌和菜单展示牌',
    'Добавить больше указателей к точкам питания и стендов с меню'
  ),
  'Công khai giá bán rõ ràng, dễ quan sát': t(
    'Display prices clearly and visibly',
    'कीमतों को स्पष्ट और आसानी से दिखने योग्य रूप में प्रदर्शित करें',
    '가격표를 명확하고 눈에 잘 띄게 표시',
    '价格标示清晰醒目、易于查看',
    'Четко и наглядно указывать цены'
  ),
  'Rút ngắn thời gian xếp hàng và nhận món': t(
    'Shorten queueing and food pickup waiting times',
    'कतार और भोजन प्राप्त करने के प्रतीक्षा समय को कम करें',
    '대기 줄 및 음식 수령 시간 단축',
    '缩短排队点餐和取餐等待时间',
    'Сократить время ожидания в очереди и выдачи блюд'
  ),
  'Bổ sung điểm bán nhanh trên hành trình': t(
    'Add more grab-and-go kiosks along the route',
    'यात्रा मार्ग पर अधिक त्वरित-सेवा स्टॉल जोड़ें',
    '관람 동선 내 간편 테이크아웃 매장 확충',
    '在游览路线沿途增加快捷售卖点',
    'Добавить больше точек быстрого питания по маршруту'
  ),
  'Tăng số lượng chỗ ngồi hoặc khu vực nghỉ chân': t(
    'Increase seating capacity and rest areas',
    'बैठने की क्षमता और विश्राम क्षेत्रों की संख्या बढ़ाएँ',
    '식사 좌석 및 휴식 공간 확충',
    '增加就餐座位或休息区数量',
    'Увеличить количество посадочных мест и зон отдыха'
  ),
  'Bổ sung combo tiết kiệm': t(
    'Offer more value meal combos',
    'अधिक किफायती मील कॉम्बो उपलब्ध कराएं',
    '가성비 좋은 세트/콤보 메뉴 확대',
    '增加实惠划算的套餐组合',
    'Предлагать больше выгодных комбо-наборов'
  ),
  'Có nhiều lựa chọn phù hợp cho trẻ em': t(
    'Provide more kid-friendly food choices',
    'बच्चों के अनुकूल अधिक खाद्य विकल्प उपलब्ध कराएं',
    '어린이를 위한 맞춤형 메뉴 선택지 확대',
    '提供更多适合儿童的餐食选择',
    'Больше выбора блюд, подходящих для детей'
  ),
  'Bổ sung món chay/lựa chọn cho nhu cầu ăn uống đặc biệt': t(
    'Add more vegetarian & special-diet options (Halal, allergy-free)',
    'अधिक शाकाहारी / विशेष आहार विकल्प (हलाल, जैन, एलर्जी-मुक्त) जोड़ें',
    '채식 및 특수 식단(할랄, 알레르기 케어 등) 메뉴 확충',
    '增加素食及特殊饮食（清真、防过敏等）选择',
    'Расширить выбор вегетарианских и специальных блюд (халяль, без аллергенов)'
  ),
  'Đa dạng hóa món ăn và đồ uống': t(
    'Diversify food and beverage variety',
    'भोजन और पेय पदार्थों की विविधता बढ़ाएँ',
    '음식 및 음료 메뉴의 다양성 확대',
    '丰富菜品与饮品的种类多样性',
    'Разнообразить ассортимент блюд и напитков'
  ),
  'Cải thiện chất lượng, hương vị và độ ổn định của món ăn': t(
    'Improve taste, quality, and consistency of dishes',
    'भोजन की गुणवत्ता, स्वाद और निरंतरता में सुधार करें',
    '음식의 품질, 맛 및 일관성 개선',
    '提升菜品品质、口味及出品稳定性',
    'Улучшить качество, вкус и стабильность приготовления блюд'
  ),
  'Tăng tiện ích thanh toán (QR, thẻ quốc tế, ví điện tử)': t(
    'Enhance payment convenience (QR, international cards, e-wallets)',
    'भुगतान सुविधा बढ़ाएँ (QR, अंतर्राष्ट्रीय कार्ड, ई-वॉलेट)',
    '결제 편의성 강화 (QR결제, 해외카드, 전자지갑 등)',
    '提升支付便利性（支持二维码、国际银行卡、电子钱包）',
    'Расширить способы оплаты (QR-коды, международные карты, электронные кошельки)'
  ),
  'Không có đề xuất (Mã loại trừ)': t(
    'No suggestions (Exclusive)',
    'कोई सुझाव नहीं',
    '특별한 제안 사항 없음',
    '无其他建议',
    'Нет предложений'
  ),

  // ==================== NHÃN GIAO DIỆN PHỎNG VẤN ====================
  'Sàng lọc': t('Screening', 'स्क्रीनिंग', '스크리닝', '受访筛选', 'Отбор'),
  'Dự kiến & Sử dụng': t('Budget & Usage', 'बजट और उपयोग', '예산 및 이용', '预算与使用', 'Бюджет и опыт'),
  'Thực tế / Lý do': t('Actual / Reasons', 'वास्तविक / कारण', '실제 지출 / 이유', '实际消费 / 原因', 'Расходы / Причины'),
  'Đánh giá & Giá': t('Preference & Rating', 'पसंद और मूल्यांकन', '선호도 및 평가', '偏好与评价', 'Оценка и цены'),
  'Nhu cầu mới': t('Expectations', 'सुझाव और अपेक्षाएँ', '추가 수요 및 제안', '需求与建议', 'Пожелания'),
  'Ghi chú ý kiến mở & Chọn quà tặng': t(
    'Open feedback & Select survey gift',
    'खुली प्रतिक्रिया और उपहार चुनें',
    '기타 의견 메모 및 답례품 선택',
    '开放式意见备注与选择礼品',
    'Дополнительные комментарии и выбор подарка'
  ),
  'Nhập câu trả lời của du khách...': t(
    'Enter guest response...',
    'अतिथि का उत्तर दर्ज करें...',
    '응답 내용을 입력하세요...',
    '请输入游客回答...',
    'Введите ответ гостя...'
  ),
};

const CACHE_STORAGE_KEY = 'banafi_fnb_auto_translations_v2';

// Bộ nhớ đệm bản dịch tự động cho các câu hỏi/đáp án mới do Admin thêm bằng Tiếng Việt
const runtimeCache: Record<string, Partial<Record<SurveyLanguage, string>>> = (() => {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Partial<Record<SurveyLanguage, string>>>) : {};
  } catch {
    return {};
  }
})();

const pendingRequests = new Set<string>();
const listeners = new Set<() => void>();

function saveRuntimeCache(): void {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(runtimeCache));
  } catch {
    // ignore
  }
}

export function subscribeToAutoTranslations(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

/**
 * Tách phần tiền tố mã câu hỏi (VD: "S1. ", "A3.1. ", "B3_1. ") ra khỏi phần thân Tiếng Việt
 * để tra từ điển chính xác kể cả khi Admin đổi mã câu hỏi.
 */
function splitQuestionPrefix(rawVi: string): { prefix: string; body: string } {
  const trimmed = (rawVi || '').trim();
  const match = trimmed.match(/^([A-Z]\d+(?:[._]\d+)*\.?\s+)(.+)$/i);
  if (match) {
    return { prefix: match[1], body: match[2].trim() };
  }
  return { prefix: '', body: trimmed };
}

/**
 * Dịch tự động chuỗi Tiếng Việt sang ngôn ngữ đích qua Google Neural Translate (client=gtx)
 * và lưu vào bộ nhớ đệm vĩnh viễn trên thiết bị.
 */
async function fetchLiveTranslation(viText: string, lang: SurveyLanguage): Promise<void> {
  if (lang === 'vi' || !viText.trim()) return;
  const reqKey = `${lang}:::${viText}`;
  if (pendingRequests.has(reqKey)) return;
  pendingRequests.add(reqKey);

  try {
    const tl = lang === 'zh' ? 'zh-CN' : lang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${encodeURIComponent(
      tl
    )}&dt=t&q=${encodeURIComponent(viText)}`;

    const res = await fetch(url);
    if (!res.ok) return;
    const data = (await res.json()) as unknown[];
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = (data[0] as unknown[])
        .map((segment) => (Array.isArray(segment) ? String(segment[0] || '') : ''))
        .join('')
        .trim();

      if (translated) {
        if (!runtimeCache[viText]) runtimeCache[viText] = {};
        runtimeCache[viText][lang] = translated;
        saveRuntimeCache();
        notifyListeners();
      }
    }
  } catch {
    // Offline fallback: giữ nguyên hoặc dùng bản dịch đã cache
  } finally {
    pendingRequests.delete(reqKey);
  }
}

/**
 * Trả về bản dịch chính xác nhất của văn bản Tiếng Việt `viText` sang ngôn ngữ `lang`.
 * - Ưu tiên 1: Từ điển chuẩn chuyên ngành F&B Sun World Ba Na Hills (`CURATED_DICTIONARY`).
 * - Ưu tiên 2: Bộ nhớ đệm dịch tự động (`runtimeCache`).
 * - Ưu tiên 3: Tự động kích hoạt dịch Neural thời gian thực (`fetchLiveTranslation`) và cập nhật tức thì.
 */
export function translateVi(
  viText: string,
  lang: SurveyLanguage,
  fallbackEn?: string
): string {
  if (!viText) return '';
  if (lang === 'vi') return viText;

  const trimmed = viText.trim();

  // 1. Kiểm tra trực tiếp trong từ điển chuẩn
  const directHit = CURATED_DICTIONARY[trimmed];
  if (directHit && directHit[lang]) {
    return directHit[lang];
  }

  // 2. Tách tiền tố mã câu hỏi (VD: "S1. ", "A3.1. ", "Q10. ") để tra phần thân câu hỏi
  const { prefix, body } = splitQuestionPrefix(trimmed);
  const bodyHit = CURATED_DICTIONARY[body];
  if (bodyHit && bodyHit[lang]) {
    return `${prefix}${bodyHit[lang]}`;
  }

  // 3. Kiểm tra trong bộ nhớ đệm dịch tự động
  const cachedFull = runtimeCache[trimmed]?.[lang];
  if (cachedFull) {
    return cachedFull;
  }
  const cachedBody = runtimeCache[body]?.[lang];
  if (cachedBody) {
    return `${prefix}${cachedBody}`;
  }

  // 4. Kích hoạt dịch tự động thời gian thực cho nội dung Tiếng Việt mới của Admin
  void fetchLiveTranslation(body || trimmed, lang);

  // Trong ~100ms đầu tiên khi đang tải bản dịch mới: nếu là tiếng Anh và có fallbackEn hợp lệ thì dùng tạm, ngược lại hiển thị chuỗi gốc
  if (lang === 'en' && fallbackEn && fallbackEn.trim() && fallbackEn !== trimmed) {
    return fallbackEn;
  }
  return trimmed;
}

/**
 * Dịch trước (Pre-warm) toàn bộ câu hỏi và đáp án trong cấu hình sang ngôn ngữ được chọn
 */
export function prewarmSurveyTranslations(
  texts: string[],
  lang: SurveyLanguage
): void {
  if (lang === 'vi') return;
  texts.forEach((txt) => {
    if (!txt || !txt.trim()) return;
    const { body } = splitQuestionPrefix(txt.trim());
    const target = body || txt.trim();
    if (!CURATED_DICTIONARY[target] && !runtimeCache[target]?.[lang]) {
      void fetchLiveTranslation(target, lang);
    }
  });
}
