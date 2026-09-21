# Client-facing content for the VIIVERSION product site.
# Keep marketing copy here; templates and rendering belong in build-product-site.py.

LANGS = ("ru", "en")

BRAND = {
    "ru": {
        "tagline": "Цифровые бизнес-системы: от клиентского интерфейса до данных и интеграций",
        "hero_title": "Проектируем и собираем цифровые системы вокруг реального процесса бизнеса.",
        "hero_lead": "Соединяем клиентские приложения, продажи и бронирование с рабочими панелями, AI-автоматизацией, оплатой, CRM и внешними системами. Внедрять можно поэтапно — архитектура остаётся единой.",
        "hero_primary": "Посмотреть, как устроены системы",
        "hero_secondary": "Посмотреть кейсы",
        "problem_title": "Что сейчас тормозит процесс?",
        "problem_lead": "Начинаем с процесса бизнеса, а технологии и интерфейсы подбираем под него.",
        "products_title": "Компоненты цифровой системы",
        "products_lead": "Booking, Mini App, AI, рабочие панели, оплата и интеграции — строительные блоки, которые соединяются в единый контур.",
        "proof_title": "Системы, которые можно открыть и проверить",
        "proof_lead": "Показываем клиентский путь, работу команды и уже реализованные части системы — не только отдельные экраны.",
        "start_title": "Система может расти поэтапно",
        "start_lead": "Можно начать с одного проверяемого контура, сохранив архитектуру для дальнейшего расширения.",
        "matrix_title": "Одна архитектура — разные отраслевые процессы",
        "matrix_lead": "В каждой отрасли меняется процесс и набор компонентов, но система остаётся связанной.",
        "special_title": "Собственные продукты и партнёрские форматы",
        "team_title": "Продуктовая и инженерная архитектура в одной команде",
        "final_title": "Покажите процесс, который хотите перестроить.",
        "final_lead": "Разберём клиентский путь, работу команды, данные и интеграции. Предложим архитектуру системы и первый проверяемый этап.",
    },
    "en": {
        "tagline": "Digital business systems — from customer interface to data and integrations",
        "hero_title": "We design and build digital systems around the real business process.",
        "hero_lead": "We connect customer apps, sales and booking with operational workspaces, AI automation, payments, CRM and external systems. Delivery can be phased while the architecture stays coherent.",
        "hero_primary": "See how the systems work",
        "hero_secondary": "See cases",
        "problem_title": "Where is the process breaking today?",
        "problem_lead": "We start with the business process, then choose the technology and interfaces around it.",
        "products_title": "Digital system building blocks",
        "products_lead": "Booking, Mini Apps, AI, operational workspaces, payments and integrations are building blocks of one connected system.",
        "proof_title": "Systems you can open and inspect",
        "proof_lead": "We show the customer journey, team workflow and implemented system layers — not just isolated screens.",
        "start_title": "The system can grow in stages",
        "start_lead": "Start with one verifiable flow while keeping an architecture that can expand later.",
        "matrix_title": "One architecture, different industry workflows",
        "matrix_lead": "The business flow and components change by industry, while the system remains connected.",
        "special_title": "Software products and partner delivery",
        "team_title": "Product and engineering architecture in one team",
        "final_title": "Show us the process you want to rebuild.",
        "final_lead": "We map the customer journey, team workflow, data and integrations, then propose the system architecture and a first verifiable phase.",
    },
}


# Commercial product data lives only in product_catalog.py.
# This file keeps brand, proof, team and navigation content.

CASES = {
    "max-tour": {
        "ru": {"name": "MAX TOUR", "industry": "Туризм", "status": "working-demo", "status_label": "ИНТЕРАКТИВНОЕ ДЕМО", "summary": "Клиентский путь, бронирование, роли, рабочая панель и аналитика для экскурсионного бизнеса.", "shows": ["Бронирование", "Операционный контур", "AI"], "demo": "https://max-tour.viiversion.com/"},
        "en": {"name": "MAX TOUR", "industry": "Tourism", "status": "working-demo", "status_label": "WORKING DEMO", "summary": "Customer flow, booking, roles, admin and owner analytics for a tour business.", "shows": ["Booking", "Operations", "AI"], "demo": "https://max-tour.viiversion.com/"},
    },
    "uniq-smart-rent": {
        "ru": {"name": "UNIQ SMART RENT", "industry": "Аренда", "status": "working-demo", "status_label": "ИНТЕРАКТИВНОЕ ДЕМО", "summary": "Каталог, цены и путь заявки для аренды транспорта.", "shows": ["Клиентский слой", "Бронирование", "Операционный контур"], "demo": "https://uniq-smart-rent.mirozdanie6v.workers.dev/"},
        "en": {"name": "UNIQ SMART RENT", "industry": "Rental", "status": "working-demo", "status_label": "WORKING DEMO", "summary": "Catalogue, pricing and request lifecycle for vehicle rental.", "shows": ["Customer layer", "Booking", "Operations"], "demo": "https://uniq-smart-rent.mirozdanie6v.workers.dev/"},
    },
    "pet-nika": {
        "ru": {"name": "PET NIKA", "industry": "Ветеринария", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Клиентский кабинет, питомцы, обращения, запись и рабочая панель.", "shows": ["Клиентский слой", "Бронирование", "Операционный контур"], "demo": "https://pet-nika.viiversion.com/"},
        "en": {"name": "PET NIKA", "industry": "Veterinary", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Customer account, pets, requests, booking and admin layer.", "shows": ["Customer layer", "Booking", "Operations"], "demo": "https://pet-nika.viiversion.com/"},
    },
    "ave-dental": {
        "ru": {"name": "AVE Dental", "industry": "Стоматология", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Мультиязычный Mini App и сценарий онлайн-записи для клиники.", "shows": ["Клиентский слой", "Бронирование"], "demo": "https://ave-dental-miniapp.vercel.app/"},
        "en": {"name": "AVE Dental", "industry": "Dental", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Multilingual Mini App and booking flow for a clinic.", "shows": ["Customer layer", "Booking"], "demo": "https://ave-dental-miniapp.vercel.app/"},
    },
    "rusinfocenter": {
        "ru": {"name": "Русский Информационный Центр", "industry": "Туризм", "status": "concept", "status_label": "КЛИЕНТСКАЯ КОНЦЕПЦИЯ", "summary": "Цифровой клиентский путь и архитектура будущей системы продаж.", "shows": ["Клиентский слой", "Бронирование", "Интеграции"], "demo": "https://rusinfocenter.viiversion.com/"},
        "en": {"name": "Russian Information Center", "industry": "Tourism", "status": "concept", "status_label": "CLIENT CONCEPT", "summary": "Customer journey and architecture for a future sales system.", "shows": ["Customer layer", "Booking", "Integrations"], "demo": "https://rusinfocenter.viiversion.com/"},
    },
    "g-beauty": {
        "ru": {"name": "G-Beauty", "industry": "Бьюти / SPA", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Лендинг, Mini App, онлайн-запись и демонстрационная рабочая панель для beauty-бизнеса.", "shows": ["Клиентский слой", "Бронирование", "Операционный контур"], "demo": "https://gbeauty-vien-trieu-prototype.mirozdanie6v.workers.dev/"},
        "en": {"name": "G-Beauty", "industry": "Beauty", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Landing, Mini App, booking and demo admin for a local beauty business.", "shows": ["Customer layer", "Booking", "Operations"], "demo": "https://gbeauty-vien-trieu-prototype.mirozdanie6v.workers.dev/"},
    },
    "true-surf": {
        "ru": {"name": "TRUE SURF", "industry": "Активности и спорт", "status": "prototype", "status_label": "ПУБЛИЧНЫЙ ПРОТОТИП", "summary": "Онлайн-запись, профиль клиента и повторные действия в формате Mini App.", "shows": ["Клиентский слой", "Бронирование"], "demo": "https://truesurf-app.viiversion.com/"},
        "en": {"name": "TRUE SURF", "industry": "Activities", "status": "prototype", "status_label": "PUBLIC PROTOTYPE", "summary": "Booking, client passport and repeat flow in a Mini App.", "shows": ["Customer layer", "Booking"], "demo": "https://truesurf-app.viiversion.com/"},
    },
}


TEAM = {
    "ru": [
        ("Дмитрий Владимиров", "Серверная архитектура и данные · базы данных · интеграции", "20+ лет в IT и телеком. Отвечает за серверную логику, данные, интеграции, надёжность и техническую архитектуру."),
        ("Ольга Ногтич", "Продуктовая и системная архитектура · AI-автоматизация · интерфейсы", "Проектирует логику продукта и системы, AI-автоматизацию, клиентские и операционные сценарии, интерфейсы и техническую реализацию продуктовых прототипов."),
    ],
    "en": [
        ("Dmitrii Vladimirov", "Systems architecture · databases · integrations · development", "Oracle, PL/SQL, ETL, Linux, API, telecom BSS / Revenue Assurance. Experience with complex telecom and international systems."),
        ("Olga Nogtich", "Product & AI systems engineering · system architecture · interfaces", "Designs product and system logic, AI automation, customer and operational flows, interfaces and technical implementation of product prototypes."),
    ],
}

NAV = {
    "ru": [
        ("Системы", "/#systems"),
        ("Кейсы", "/cases/"),
        ("Отрасли", "/#industries"),
        ("Компоненты", "/products/"),
        ("Инженерия", "/enterprise/"),
        ("О нас", "/about/"),
    ],
    "en": [
        ("Systems", "/#systems"),
        ("Cases", "/cases/"),
        ("Industries", "/#industries"),
        ("Building blocks", "/products/"),
        ("Engineering", "/enterprise/"),
        ("About", "/about/"),
    ],
}
