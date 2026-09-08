-- MAX TOUR verified baseline seed
-- Verified against https://maxtourvietnam.com/ and individual tour detail pages on 2026-09-09.
-- This file is idempotent and must never contain DEMO availability, orders, payments, promos or analytics.

INSERT INTO app_settings (`key`, `value_json`, `updated_at`, `updated_by`)
VALUES
  (
    'max_tour.business',
    '{"dataStatus":"verified_site","sourceUrl":"https://maxtourvietnam.com/","headline":"Более 150 экскурсий по всему Вьетнаму","channels":["WhatsApp","Telegram","MAX"]}',
    1788912000000,
    NULL
  ),
  (
    'max_tour.booking_policy',
    '{"dataStatus":"verified_site","sourceUrl":"https://maxtourvietnam.com/","depositPercentRange":{"min":30,"max":100},"reschedule":{"freeUntil":"17:00 day before tour","afterPenaltyPercent":30},"cancellation":{"freeMoreThanHoursBefore":48,"until17DayBeforePenaltyPercent":30,"departureDayOrNoShowPenaltyPercent":100},"refundBusinessDaysMax":7,"bankFeesMayApply":true}',
    1788912000000,
    NULL
  ),
  (
    'max_tour.payment_methods',
    '{"dataStatus":"verified_site","sourceUrl":"https://maxtourvietnam.com/","methods":["cash","bank_card","sbp","kaspi","bank_transfer_rub_kzt","international_transfer"],"automationStatus":"not_claimed"}',
    1788912000000,
    NULL
  ),
  (
    'max_tour.transfer_rules',
    '{"dataStatus":"verified_site","sourceUrl":"https://maxtourvietnam.com/","currency":"USD","zones":[{"key":"cam_ranh","labels":["Камрань"],"tiers":[{"minPeople":1,"maxPeople":6,"priceMinor":3000},{"minPeople":7,"maxPeople":14,"priceMinor":5000}]},{"key":"diamond_amiana_alibu_do","labels":["Diamond Bay","Amiana","Alibu","Театр DO"],"tiers":[{"minPeople":1,"maxPeople":6,"priceMinor":2000},{"minPeople":7,"maxPeople":14,"priceMinor":3000}]},{"key":"doc_let_gm_paradise","labels":["Зоклет","GM Resort","Paradise"],"tiers":[{"minPeople":1,"maxPeople":6,"priceMinor":6000},{"minPeople":7,"maxPeople":14,"priceMinor":9000}]}]}',
    1788912000000,
    NULL
  )
ON CONFLICT(`key`) DO UPDATE SET
  `value_json` = excluded.`value_json`,
  `updated_at` = excluded.`updated_at`,
  `updated_by` = NULL;

INSERT INTO destinations (`id`, `slug`, `name`, `source_url`, `data_status`, `is_published`, `sort_order`, `created_at`, `updated_at`)
VALUES
  ('dest-nha-trang', 'nha-trang', 'Нячанг', 'https://maxtourvietnam.com/', 'verified_site', 1, 10, 1788912000000, 1788912000000),
  ('dest-da-nang', 'da-nang', 'Дананг', 'https://maxtourvietnam.com/', 'verified_site', 1, 20, 1788912000000, 1788912000000),
  ('dest-phu-quoc', 'phu-quoc', 'Фукуок', 'https://maxtourvietnam.com/', 'verified_site', 1, 30, 1788912000000, 1788912000000),
  ('dest-mui-ne-phan-thiet', 'mui-ne-phan-thiet', 'Муйне/Фантьет', 'https://maxtourvietnam.com/', 'verified_site', 1, 40, 1788912000000, 1788912000000),
  ('dest-hanoi', 'hanoi', 'Ханой', 'https://maxtourvietnam.com/', 'verified_site', 1, 50, 1788912000000, 1788912000000)
ON CONFLICT(`id`) DO UPDATE SET
  `slug` = excluded.`slug`,
  `name` = excluded.`name`,
  `source_url` = excluded.`source_url`,
  `data_status` = 'verified_site',
  `is_published` = excluded.`is_published`,
  `sort_order` = excluded.`sort_order`,
  `updated_at` = excluded.`updated_at`;

INSERT INTO tours (
  `id`, `destination_id`, `slug`, `title`, `category`, `pricing_mode`, `currency`,
  `adult_price_minor`, `child_price_minor`, `pricing_rules_json`, `schedule_json`,
  `program_json`, `included_json`, `extra_costs_json`, `what_to_take_json`,
  `booking_rules_json`, `transfer_rules_json`, `source_url`, `data_status`,
  `is_published`, `sort_order`, `created_at`, `updated_at`
)
VALUES
  (
    'tour-fu-yen', 'dest-nha-trang', 'ekskursiya-v-provintsiyu-fuyen', 'Экскурсия в провинцию Фуйен',
    'day_trip', 'fixed', 'USD', 4000, 3000,
    '{"group":{"adultMinor":4000,"child":{"maxHeightCm":120,"priceMinor":3000,"freeUnderAgeYears":2}},"private":{"1-5":40000,"6":45000,"7":50000,"8":55000}}',
    '{"pickup":"5:00-5:30","return":"около 18:30"}',
    '["Купание на диком пляже","Город Туй Хоа и Чамская башня","Башни Нгинь Фонг","Маяк на мысе","Храм Трам","Обед в ресторане","Пагода Тхань Луонг","Базальтовый сад","Католический собор Манг Ланг"]',
    '["Обед","Все входные билеты","Профессиональные русскоязычные гиды","Трансфер на микроавтобусе","Комфортная группа 14–20 человек","Бутылка воды"]',
    '[]',
    '["Панама и солнцезащитное средство","Завтрак","Удобная обувь","Купальник и купальные принадлежности","Полотенце","Деньги на мелкие расходы и сувениры в донгах"]',
    '{"childRule":"height_to_120_plus_free_under_2"}',
    '{"settingsKey":"max_tour.transfer_rules"}',
    'https://maxtourvietnam.com/ekskursiya-v-fuyen-iz-nyachanga', 'verified_site', 1, 10, 1788912000000, 1788912000000
  ),
  (
    'tour-dalat-premium', 'dest-nha-trang', 'dalat-premium', 'Экскурсия в Далат "Премиум"',
    'dalat', 'fixed', 'USD', 5200, 3800,
    '{"group":{"adultMinor":5200,"child":{"freeMaxHeightCm":100,"paidMaxHeightCm":120,"paidMinor":3800}},"private":{"1-2":42000,"3":45000,"4":48000,"5":51000,"6":54000}}',
    '{"pickup":"5:00-5:30","return":"около 20:00"}',
    '["Кофейные плантации","Горный перевал","Глиняная деревня","Crazy House","Пагода Линь Фуок","Обед в ресторане","Водопад Датанла","Кофейная ферма и зоопарк","Канатная дорога"]',
    '["Обед","Все входные билеты и канатная дорога","Профессиональные русскоязычные гиды","Трансфер на микроавтобусе","Комфортная группа 14–20 человек","Бутылка воды"]',
    '[{"label":"Электросани у Датанла","priceMinor":500,"includedInBookingTotal":false},{"label":"Активности/катание на ферме","fromMinor":400,"toMinor":1600,"includedInBookingTotal":false}]',
    '["Одежда с закрытыми коленями и плечами","Завтрак","Кофта","Дождевик","Удобная обувь","Деньги на мелкие расходы и сувениры в донгах"]',
    '{"requiredParticipantFields":["fullName","birthDate"],"childRule":"height_100_free_120_paid"}',
    '{"settingsKey":"max_tour.transfer_rules"}',
    'https://maxtourvietnam.com/ekskursiya-v-dalat-iz-nyachanga-premium', 'verified_site', 1, 20, 1788912000000, 1788912000000
  ),
  (
    'tour-dalat-vip', 'dest-nha-trang', 'dalat-vip', 'Экскурсия в Далат "ВИП"',
    'dalat', 'fixed', 'USD', 4500, 3200,
    '{"group":{"adultMinor":4500,"child":{"maxHeightCm":120,"priceMinor":3200,"freeUnderAgeYears":2}},"private":{"1-2":35000,"3":40000,"4":45000,"5":48000,"6":51000}}',
    '{"pickup":"5:00-5:30","return":"около 20:00"}',
    '["Кофейные плантации","Деревня хоббитов","Горный перевал","Глиняная деревня","Crazy House","Пагода Линь Фуок","Статуя большого золотого Будды","Дегустация","Обед в ресторане","Водопад Датанла","Ферма животных"]',
    '["Обед","Все входные билеты","Профессиональные русскоязычные гиды","Трансфер на микроавтобусе","Комфортная группа 14–20 человек","Бутылка воды"]',
    '[{"label":"Электросани у Датанла","priceMinor":500,"includedInBookingTotal":false},{"label":"Активности/катание на ферме","fromMinor":400,"toMinor":1600,"includedInBookingTotal":false}]',
    '["Одежда с закрытыми коленями и плечами","Завтрак","Кофта","Дождевик","Удобная обувь","Деньги на мелкие расходы и сувениры в донгах"]',
    '{"requiredParticipantFields":["fullName","birthDate"],"childRule":"height_to_120_plus_free_under_2"}',
    '{"settingsKey":"max_tour.transfer_rules"}',
    'https://maxtourvietnam.com/vip-ekskursiya-v-dalat-iz-nyachanga', 'verified_site', 1, 30, 1788912000000, 1788912000000
  ),
  (
    'tour-dalat-glass-bridge', 'dest-nha-trang', 'dalat-steklyannyy-most', 'Экскурсия в Далат "Стеклянный мост"',
    'dalat', 'fixed', 'USD', 6000, 4200,
    '{"group":{"adultMinor":6000,"child":{"freeMaxHeightCm":100,"paidMaxHeightCm":120,"paidMinor":4200}},"private":{"1-2":45000,"3":49000,"4":53000,"5":57000,"6":61000}}',
    '{"pickup":"5:00-5:30","return":"около 20:00"}',
    '["Кофейные плантации","Горный перевал","Глиняная деревня","Crazy House","Пагода Линь Фуок","Обед в ресторане","Водопад Датанла","Кофейная ферма и зоопарк","Стеклянный мост"]',
    '["Обед","Все входные билеты","Профессиональные русскоязычные гиды","Трансфер на микроавтобусе","Комфортная группа 14–20 человек","Бутылка воды"]',
    '[{"label":"Электросани у Датанла","priceMinor":500,"includedInBookingTotal":false},{"label":"Активности/катание на ферме","fromMinor":400,"toMinor":1600,"includedInBookingTotal":false}]',
    '["Одежда с закрытыми коленями и плечами","Завтрак","Кофта","Дождевик","Удобная обувь","Деньги на мелкие расходы и сувениры в донгах"]',
    '{"requiredParticipantFields":["fullName","birthDate"],"childRule":"height_100_free_120_paid"}',
    '{"settingsKey":"max_tour.transfer_rules"}',
    'https://maxtourvietnam.com/ekskursiya-v-dalat-so-steklyannym-mostom-iz-nyachanga', 'verified_site', 1, 40, 1788912000000, 1788912000000
  ),
  (
    'tour-nha-trang-day-city', 'dest-nha-trang', 'dnevnaya-obzornaya-nyachang', 'Дневная обзорная экскурсия по Нячангу',
    'city_tour', 'fixed', 'USD', 3500, 2500,
    '{"group":{"adultMinor":3500,"child":{"maxHeightCm":120,"priceMinor":2500,"freeUnderAgeYears":2}},"private":{"1-2":18000,"3-4":{"perPersonMinor":6000},"5-7":{"perPersonMinor":5000},"7-13":{"perPersonMinor":4500}}}',
    '{"pickup":"9:00","return":"14:00"}',
    '["Пагода Лонг Шон и Белый Будда","Католический собор Нячанга","Сад камней Хон Чонг","Пагода Чук Лам Фунг","Чамские башни По Нагар","Северный пляж Нячанга","Обед в ресторане"]',
    '["Обед","Все входные билеты","Профессиональные русскоязычные гиды","Трансфер на микроавтобусе","Комфортная группа 14–20 человек","Бутылка воды"]',
    '[]',
    '["Одежда с закрытыми коленями и плечами","Панама и солнцезащитное средство","Деньги на мелкие расходы и сувениры в донгах"]',
    '{"childRule":"height_to_120_plus_free_under_2"}',
    '{"settingsKey":"max_tour.transfer_rules"}',
    'https://maxtourvietnam.com/dnevnaya-obzornaya-ekskursiya-po-nyachangu', 'verified_site', 1, 50, 1788912000000, 1788912000000
  ),
  (
    'tour-nha-trang-evening-city', 'dest-nha-trang', 'vechernyaya-obzornaya-nyachang', 'Вечерняя обзорная экскурсия по Нячангу',
    'city_tour', 'fixed', 'USD', 4800, 3500,
    '{"group":{"adultMinor":4800,"child":{"maxHeightCm":120,"priceMinor":3500,"freeUnderAgeYears":2}},"private":{"1-2":20000,"3":28000,"4":32000,"5":35000,"6":42000}}',
    '{"pickup":"14:00","return":"20:30"}',
    '["Пагода Да Бао","Сад камней Хон Чонг","Католический собор Нячанга","Театр DO","Чамские башни По Нагар","Пагода Лонг Шон и Белый Будда","Ресторан Старый Нячанг"]',
    '["Ужин-буфет с морепродуктами и национальным шоу","Все входные билеты","Профессиональные русскоязычные гиды","Трансфер на микроавтобусе","Комфортная группа 14–20 человек","Бутылка воды"]',
    '[]',
    '["Одежда с закрытыми коленями и плечами","Панама и солнцезащитное средство","Деньги на мелкие расходы и сувениры в донгах"]',
    '{"childRule":"height_to_120_plus_free_under_2"}',
    '{"settingsKey":"max_tour.transfer_rules"}',
    'https://maxtourvietnam.com/vechernyaya-obzornaya-ekskursiya-po-nyachangu', 'verified_site', 1, 60, 1788912000000, 1788912000000
  ),
  (
    'tour-dalat-two-days', 'dest-nha-trang', 'dalat-2-dnya', 'Экскурсия в Далат на 2 дня',
    'dalat', 'from_price', 'USD', 11000, 7900,
    '{"variants":{"standard":{"adultSingleMinor":12500,"adultDoubleMinor":11000,"childMaxHeightCm":120,"childMinor":7900,"freeMaxHeightCm":100},"glass_bridge":{"adultSingleMinor":14500,"adultDoubleMinor":13000,"childMaxHeightCm":120,"childMinor":10000,"freeMaxHeightCm":100}},"private":{"1-2":70000,"3":80000,"4":90000,"6":100000},"note":"No 5-person private price inferred because detail page does not publish it."}',
    '{"pickup":"5:00-5:30 day 1","return":"около 18:30 day 2"}',
    '["Кофейные плантации","Горный перевал","Глиняная деревня","Crazy House","Пагода Линь Фуок","Водопад Датанла","Кофейная ферма и зоопарк","Стеклянный мост","Пагода Линь Ань","Водопад Понгур","Старинный железнодорожный вокзал","Шелковая фабрика","Канатная дорога","Водопад Слон"]',
    '["Завтрак и два обеда","Все входные билеты","Профессиональные русскоязычные гиды"]',
    '[{"label":"Электросани у Датанла","priceMinor":500,"includedInBookingTotal":false},{"label":"Активности/катание на ферме","fromMinor":400,"toMinor":1600,"includedInBookingTotal":false}]',
    '[]',
    '{"requiredParticipantFields":["fullName","birthDate"],"pricingRequiresRoomVariant":true}',
    '{"settingsKey":"max_tour.transfer_rules"}',
    'https://maxtourvietnam.com/ekskursiya-v-dalat-na-2-dnya-iz-nyachanga', 'verified_site', 1, 70, 1788912000000, 1788912000000
  ),
  (
    'tour-hanoi-halong-two-days', 'dest-nha-trang', 'hanoi-halong-2-dnya', 'Ханой и бухта Халонг на самолёте (2 дня / 1 ночь)',
    'multi_day_flight', 'from_price', 'USD', NULL, NULL,
    '{"private":{"2PeopleFromMinor":100000},"child":{"freeUnderAgeYears":2},"dynamicNote":"Стоимость может меняться в зависимости от сезона и цен на авиабилеты."}',
    '{"duration":"2 дня / 1 ночь"}',
    '["Аэропорт Камрань","Ханой","Пагода Чан Куок","Обзорная экскурсия по Ханою","Пагода на одном столбе","Площадь Ба Динь и Мавзолей Хо Ши Мина","Храм Литературы","Старый квартал Ханоя","Кафедральный собор Святого Иосифа","Бухта Халонг","Diamond Era Cruise 5★","Sung Sot Cave","Luon Cave","остров Титов"]',
    '["Питание по программе","Авиабилеты","Все входные билеты","Русскоязычный гид в Ханое","Англоязычный гид во время круиза","Трансферы по программе","Отель 3★ в Ханое","Diamond Era Cruise 5★","Активности по программе"]',
    '[]',
    '["Паспорт","Деньги на мелкие расходы и сувениры в донгах"]',
    '{"pricingRequiresCurrentQuote":true}',
    '{}',
    'https://maxtourvietnam.com/hanoj-halong-iz-nyachanga-2-dnya', 'verified_site', 1, 80, 1788912000000, 1788912000000
  )
ON CONFLICT(`id`) DO UPDATE SET
  `destination_id` = excluded.`destination_id`,
  `slug` = excluded.`slug`,
  `title` = excluded.`title`,
  `category` = excluded.`category`,
  `pricing_mode` = excluded.`pricing_mode`,
  `currency` = excluded.`currency`,
  `adult_price_minor` = excluded.`adult_price_minor`,
  `child_price_minor` = excluded.`child_price_minor`,
  `pricing_rules_json` = excluded.`pricing_rules_json`,
  `schedule_json` = excluded.`schedule_json`,
  `program_json` = excluded.`program_json`,
  `included_json` = excluded.`included_json`,
  `extra_costs_json` = excluded.`extra_costs_json`,
  `what_to_take_json` = excluded.`what_to_take_json`,
  `booking_rules_json` = excluded.`booking_rules_json`,
  `transfer_rules_json` = excluded.`transfer_rules_json`,
  `source_url` = excluded.`source_url`,
  `data_status` = 'verified_site',
  `is_published` = excluded.`is_published`,
  `sort_order` = excluded.`sort_order`,
  `updated_at` = excluded.`updated_at`;
