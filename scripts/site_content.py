# Client-facing content for the VIIVERSION product site.
# Keep marketing copy here; templates and rendering belong in build-product-site.py.

LANGS = ("ru", "en")

BRAND = {
    "ru": {
        "tagline": "Цифровые системы для продаж и операций",
        "hero_title": "Цифровые решения для конкретных задач бизнеса.",
        "hero_lead": "Разрабатываем онлайн-бронирование, клиентские приложения, CRM, AI-консультантов, оплату и интеграции. Можно начать с одной задачи и не менять то, что уже работает.",
        "hero_primary": "Выбрать свою отрасль",
        "hero_secondary": "Посмотреть рабочие демо",
        "problem_title": "Что сейчас тормозит процесс?",
        "problem_lead": "Начинаем не с набора технологий, а с одного участка, где теряется время, заявки или данные.",
        "products_title": "Основные продукты",
        "products_lead": "Каждый продукт решает самостоятельную задачу и при необходимости соединяется с другими.",
        "proof_title": "Посмотрите, что мы уже собрали",
        "proof_lead": "Показываем не только интерфейс, но и сценарий: что делает клиент, что получает команда и какие части уже реализованы.",
        "start_title": "Начните с одной небольшой задачи",
        "start_lead": "Фиксированный первый шаг проще согласовать и проверить. Если он даёт результат, расширяем систему дальше.",
        "matrix_title": "Один продукт — разные сценарии для разных отраслей",
        "matrix_lead": "Выберите продукт и посмотрите, где он применим. Сама технология остаётся знакомой, а сценарий меняется под процесс бизнеса.",
        "special_title": "Для партнёров и сложных внутренних систем",
        "team_title": "Вы общаетесь напрямую с теми, кто делает продукт",
        "final_title": "Покажите, как задача решается у вас сейчас.",
        "final_lead": "Предложим конкретный первый шаг, заранее зафиксируем что входит, срок и ориентир по стоимости. Рабочие системы не меняем без необходимости.",
    },
    "en": {
        "tagline": "Digital systems for sales and operations",
        "hero_title": "Digital solutions for specific business tasks.",
        "hero_lead": "Online booking, customer apps, CRM, AI assistants, payments and integrations. Start with one task and keep what already works.",
        "hero_primary": "Choose my industry",
        "hero_secondary": "See working demos",
        "problem_title": "Where is the process breaking today?",
        "problem_lead": "We start with one point where time, leads or data are being lost — not with a shopping list of technologies.",
        "products_title": "Core products",
        "products_lead": "Each product solves a useful problem on its own and can connect to the rest when needed.",
        "proof_title": "See what we have already built",
        "proof_lead": "We show the customer flow, team workflow and what is already implemented — not just interface screenshots.",
        "start_title": "Start with one small, testable task",
        "start_lead": "A fixed first step is easier to approve and verify. If it works, the system can grow from there.",
        "matrix_title": "One product, different industry scenarios",
        "matrix_lead": "Choose a product and see where it fits. The core technology stays familiar while the workflow changes around the business.",
        "special_title": "For partners and complex internal systems",
        "team_title": "Work directly with the people building the product",
        "final_title": "Show us how the task works today.",
        "final_lead": "We will propose a concrete first step and agree the scope, timeline and price guide before development. We keep working systems unless a change is actually required.",
    },
}


# Commercial product data lives only in product_catalog.py.
# This file keeps brand, proof, team and navigation content.

CASES = {
    "max-tour": {
        "ru": {"name": "MAX TOUR", "industry": "Туризм", "status": "working-demo", "status_label": "ИНТЕРАКТИВНОЕ ДЕМО", "summary": "Клиентский путь, бронирование, роли, рабочая панель и аналитика для экскурсионного бизнеса.", "shows": ["Онлайн-бронирование", "CRM и работа команды", "AI"], "demo": "https://max-tour.viiversion.com/"},
        "en": {"name": "MAX TOUR", "industry": "Tourism", "status": "working-demo", "status_label": "WORKING DEMO", "summary": "Customer flow, booking, roles, admin and owner analytics for a tour business.", "shows": ["Онлайн-бронирование", "CRM и работа команды", "AI"], "demo": "https://max-tour.viiversion.com/"},
    },
    "uniq-smart-rent": {
        "ru": {"name": "UNIQ SMART RENT", "industry": "Аренда", "status": "working-demo", "status_label": "ИНТЕРАКТИВНОЕ ДЕМО", "summary": "Каталог, цены и путь заявки для аренды транспорта.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "CRM и работа команды"], "demo": "https://uniq-smart-rent.mirozdanie6v.workers.dev/"},
        "en": {"name": "UNIQ SMART RENT", "industry": "Rental", "status": "working-demo", "status_label": "WORKING DEMO", "summary": "Catalogue, pricing and request lifecycle for vehicle rental.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "CRM и работа команды"], "demo": "https://uniq-smart-rent.mirozdanie6v.workers.dev/"},
    },
    "pet-nika": {
        "ru": {"name": "PET NIKA", "industry": "Ветеринария", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Клиентский кабинет, питомцы, обращения, запись и рабочая панель.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "CRM и работа команды"], "demo": "https://pet-nika.viiversion.com/"},
        "en": {"name": "PET NIKA", "industry": "Veterinary", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Customer account, pets, requests, booking and admin layer.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "CRM и работа команды"], "demo": "https://pet-nika.viiversion.com/"},
    },
    "ave-dental": {
        "ru": {"name": "AVE Dental", "industry": "Стоматология", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Мультиязычный Mini App и сценарий онлайн-записи для клиники.", "shows": ["Онлайн-продажи", "Онлайн-бронирование"], "demo": "https://ave-dental-miniapp.vercel.app/"},
        "en": {"name": "AVE Dental", "industry": "Dental", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Multilingual Mini App and booking flow for a clinic.", "shows": ["Онлайн-продажи", "Онлайн-бронирование"], "demo": "https://ave-dental-miniapp.vercel.app/"},
    },
    "rusinfocenter": {
        "ru": {"name": "Русский Информационный Центр", "industry": "Туризм", "status": "concept", "status_label": "КЛИЕНТСКАЯ КОНЦЕПЦИЯ", "summary": "Цифровой клиентский путь и архитектура будущей системы продаж.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "Интеграции"], "demo": "https://rusinfocenter.viiversion.com/"},
        "en": {"name": "Russian Information Center", "industry": "Tourism", "status": "concept", "status_label": "CLIENT CONCEPT", "summary": "Customer journey and architecture for a future sales system.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "Интеграции"], "demo": "https://rusinfocenter.viiversion.com/"},
    },
    "g-beauty": {
        "ru": {"name": "G-Beauty", "industry": "Бьюти / SPA", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Лендинг, Mini App, онлайн-запись и демонстрационная рабочая панель для beauty-бизнеса.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "CRM и работа команды"], "demo": "https://gbeauty-vien-trieu-prototype.mirozdanie6v.workers.dev/"},
        "en": {"name": "G-Beauty", "industry": "Beauty", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Landing, Mini App, booking and demo admin for a local beauty business.", "shows": ["Онлайн-продажи", "Онлайн-бронирование", "CRM и работа команды"], "demo": "https://gbeauty-vien-trieu-prototype.mirozdanie6v.workers.dev/"},
    },
    "true-surf": {
        "ru": {"name": "TRUE SURF", "industry": "Активности и спорт", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Онлайн-запись, профиль клиента и повторные действия в формате Mini App.", "shows": ["Онлайн-продажи", "Онлайн-бронирование"], "demo": "https://truesurf-app.viiversion.com/"},
        "en": {"name": "TRUE SURF", "industry": "Activities", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Booking, client passport and repeat flow in a Mini App.", "shows": ["Онлайн-продажи", "Онлайн-бронирование"], "demo": "https://truesurf-app.viiversion.com/"},
    },
}


TEAM = {
    "ru": [
        ("Дмитрий Владимиров", "Серверная архитектура и данные · базы данных · интеграции", "20+ лет в IT и телеком. Отвечает за серверную логику, данные, интеграции, надёжность и техническую архитектуру."),
        ("Ольга Ногтич", "Продуктовая архитектура · интерфейсы · AI-автоматизация", "16+ лет в цифровых и визуальных коммуникациях. Отвечает за логику продукта, пользовательские сценарии, интерфейсы, исследования и AI-автоматизацию."),
    ],
    "en": [
        ("Dmitrii Vladimirov", "Systems architecture · databases · integrations · development", "Oracle, PL/SQL, ETL, Linux, API, telecom BSS / Revenue Assurance. Experience with complex telecom and international systems."),
        ("Olga Nogtich", "Product · UX/UI · research · content", "Product logic, interfaces, customer journeys, research and visual communication."),
    ],
}

NAV = {
    "ru": [
        ("Отрасли", "/#industries"),
        ("Что можно купить", "/products/"),
        ("Готовые продукты", "/software/"),
        ("Партнёрам", "/partners/"),
        ("Для крупных систем", "/enterprise/"),
        ("О нас", "/about/"),
    ],
    "en": [
        ("Industries", "/#industries"),
        ("Products", "/products/"),
        ("Software", "/software/"),
        ("Partners", "/partners/"),
        ("Enterprise", "/enterprise/"),
        ("About", "/about/"),
    ],
}
