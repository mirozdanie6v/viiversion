"""Website projection of six approved ENG-A..ENG-F directions.

Source: VIIVERSION Commercial Matrix / Entity_Registry / Product_Architecture_AF
and Website Channel Strategy & Projection (as checked 2026-10-13).
This is NOT a separate product registry. The ID anchors remain canonical in Drive.
Public subdivision headings and descriptions are presentation copy, not new entities.
"""

# Each item has (Russian name, English name, Russian buyer outcome, English buyer outcome).
ITEMS = {
    "P01": ("Лендинги и клиентские сайты", "Landing pages and customer websites", "Цифровая точка входа, где клиент может изучить предложение и оставить обращение.", "A digital entry point for exploring an offer and contacting the business."),
    "P02": ("Модернизация сайтов", "Website modernization", "Обновление существующего сайта с сохранением необходимых рабочих сценариев.", "Modernize an existing website while preserving essential workflows."),
    "P03": ("Технический аудит и исправление WordPress", "WordPress audit and repair", "Проверка проблем сайта и выполнение согласованных технических исправлений.", "Diagnose website issues and implement agreed technical repairs."),
    "P04": ("Telegram-боты", "Telegram bots", "Приём запросов, сообщения и запуск клиентских сценариев через Telegram.", "Customer requests, messaging and workflow entry through Telegram."),
    "P05": ("Telegram Mini Apps", "Telegram Mini Apps", "Клиентское приложение внутри Telegram с нужными функциями бизнеса.", "A customer application inside Telegram with relevant business functions."),
    "P06": ("Zalo Mini Apps", "Zalo Mini Apps", "Клиентские приложения для экосистемы Zalo.", "Customer applications within the Zalo ecosystem."),
    "P07": ("Онлайн-бронирование и запись", "Online booking and appointments", "Выбор услуги, параметров и времени с оформлением брони.", "Choose services, parameters and times to complete a booking."),
    "P08": ("Расписание и доступность", "Schedules and availability", "Управление слотами, местами и доступным временем.", "Manage slots, capacity and available times."),
    "P09": ("Каталог и конфигуратор цен", "Catalogue and pricing configurator", "Товары, услуги, варианты и расчёт стоимости.", "Products, services, options and calculated prices."),
    "P10": ("Настройка и интеграция CRM", "CRM setup and integration", "Настройка действующей CRM и связь с клиентскими операциями.", "Configure an existing CRM and connect it to customer workflows."),
    "P12": ("Личный кабинет клиента", "Customer account", "История обращений, заказов, документы и повторные действия.", "Request and order history, documents and repeat actions."),
    "P14": ("Уведомления и напоминания", "Notifications and reminders", "Сообщения отправляются по событиям и расписанию.", "Messages triggered by events or schedules."),
    "P15": ("Автоматизация клиентского цикла", "Customer lifecycle automation", "Автоматическое сопровождение клиентов после первого контакта.", "Automated follow-up across the customer lifecycle."),
    "P16": ("AI-консультант для клиентов", "AI customer consultant", "Консультация на данных компании и передача к нужному действию.", "Consultation using business data with handoff to a relevant action."),
    "P17": ("AI-поиск и подбор", "AI search and matching", "Подбор предложений по запросу на обычном языке.", "Find suitable offers using natural-language requests."),
    "P18": ("Бизнес-аналитика и KPI", "Business analytics and KPIs", "Показатели, отчёты и динамика на основе рабочих данных.", "KPIs, reporting and trends based on operational data."),
    "P19": ("Подключение оплаты", "Payment integration", "Платёжный статус связан с заказом или другой операцией.", "Link payment status to the relevant order or business operation."),
    "P20": ("Интеграция POS и кассовых систем", "POS and checkout middleware", "Связь кассы, платёжного провайдера и рабочих систем.", "Connect checkout systems, payment providers and business software."),
    "P21": ("Интеграционная разработка", "Integration engineering", "Обмен данными и действиями между существующими системами.", "Exchange data and actions across existing systems."),
    "P22": ("Потоки и синхронизация данных", "Data pipelines and synchronization", "Устойчивый сбор, преобразование и перенос данных между системами.", "Reliable collection, transformation and synchronization of data."),
    "P23": ("Миграция и очистка данных", "Data migration and cleanup", "Перенос и проверка данных при переходе на другую систему.", "Move, normalize and validate data during system changes."),
    "P24": ("Инженерия баз данных", "Database engineering", "Архитектура, оптимизация и поддержка баз данных.", "Database architecture, performance and reliability."),
    "P25": ("Сверка и контроль данных", "Data reconciliation and control", "Контроль потоков и выявление расхождений.", "Reconcile data flows and detect discrepancies."),
    "P26": ("Индивидуальная корпоративная система", "Custom internal system", "Закрытая система под роли, данные и нестандартный процесс компании.", "A private system for company-specific roles, data and workflows."),
    "P30": ("Модернизация приложений и инфраструктуры", "Application and infrastructure modernization", "Обновление систем, облачных сред и процессов выпуска.", "Modernize software, cloud environments and delivery processes."),
    "P31": ("UX/UI-аудит и прототип", "UX/UI audit and prototype", "Исследование пользовательских сценариев и интерактивная модель.", "Evaluate user journeys and prepare an interactive prototype."),
    "P33": ("Мультиязычность и локализация", "Localization and multilingual support", "Несколько языков в клиентском продукте и его контенте.", "Multiple languages across the customer experience."),
    "P34": ("Автоматизация рабочих процессов", "Workflow automation", "Назначение, статусы и следующие шаги выполняются по правилам.", "Automatically assign work, update statuses and trigger next steps."),
    "P35": ("Инженерное сопровождение", "Managed engineering and support", "Поддержка работающих систем, интеграций и инфраструктуры.", "Ongoing support for production systems and integrations."),
    "P37": ("Оформление заявки или заказа", "Customer request and order flow", "Клиент направляет структурированную заявку без обязательной брони.", "Submit a structured enquiry or order without mandatory booking."),
    "P38": ("Клиентская база", "Customer registry", "Карточки клиентов и связанные данные в рабочей системе.", "Customer profiles and related records in an operational system."),
    "P39": ("Управление заявками и заказами", "Requests and orders", "Обработка заказов с ответственными, статусами и историей.", "Process orders with ownership, status and history."),
    "P40": ("Переписка с клиентами", "Customer inbox", "История сообщений связана с клиентом и заказом.", "Messages linked to customers and orders."),
    "P41": ("Задачи и работа команды", "Work queue and tasks", "Очереди работ, сроки, приоритеты и исполнители.", "Task queues, deadlines, priorities and ownership."),
    "P42": ("Автоматизация документов", "Document automation", "Формирование документов из данных и шаблонов.", "Generate documents from business data and templates."),
    "P43": ("Автоматизация обработки данных", "Operational data automation", "Автоматическая проверка и преобразование рабочих записей.", "Automated checks and transformations of operational records."),
    "P44": ("AI-помощник сотрудника", "AI employee assistant", "Помощь с внутренними данными, сообщениями и задачами.", "Assistance with internal data, conversations and tasks."),
    "P45": ("AI-разбор входящей информации", "AI intake and understanding", "Извлечение структуры из сообщений, писем и документов.", "Extract structured information from messages and documents."),
    "P46": ("AI-помощь в принятии решений", "AI decision support", "Рекомендации на основе данных и правил компании.", "Recommendations based on business data and rules."),
}

# Market/readiness from Commercial Matrix / Products. These entries may be
# commissioned, but must not be marketed as ready-to-install software.
PACKAGE_FIRST = {"P06", "P37", "P40", "P41", "P42", "P43", "P44", "P45", "P46"}
SYSTEM_FIRST = {"P38", "P39"}

DIRECTIONS = [
    {
        "key": "a", "cluster": "ENG-A", "slug": "customer-systems",
        "ru": "Продажи и обслуживание клиентов",
        "en": "Sales & customer service",
        "lead_ru": "Разрабатываем клиентские системы от выбора предложения до заказа, бронирования и обслуживания; готовые модули дополняем индивидуальной логикой.",
        "lead_en": "We build customer systems for discovery, ordering, booking and service, combining reusable modules with custom logic.",
        "groups": [
            ("Выбор, заказ и бронирование", "Selection, orders and booking", ["P09", "P07", "P08", "P37"]),
            ("Личный кабинет и языки", "Customer accounts and languages", ["P12", "P33"]),
            ("Клиентские приложения и каналы", "Customer apps and channels", ["P01", "P04", "P05", "P06"]),
        ],
        "services": ["P02", "P03", "P31"],
        "works_ru": ["Разработка клиентской системы под нестандартный процесс", "Создание и внедрение клиентских приложений и модулей"],
        "works_en": ["Custom customer-system engineering", "Customer-app and module delivery"],
        "examples": ["max-tour", "uniq-smart-rent", "pet-nika"],
        "jobs_ru": ["Разработать клиентский сервис с собственной логикой заказа", "Расширить существующий сайт или приложение необходимыми действиями"],
        "jobs_en": ["Build a customer service with custom ordering logic", "Extend an existing website or app with new business actions"],
    },
    {
        "key": "b", "cluster": "ENG-B", "slug": "business-operations",
        "ru": "Управление заявками и работой команды",
        "en": "Requests & team operations",
        "lead_ru": "Разрабатываем рабочие инструменты для сотрудников: клиенты, обращения, заказы и исполнение внутри существующей или новой системы.",
        "lead_en": "We build operational tools for teams: customers, messages, orders and execution within new or existing systems.",
        "groups": [
            ("Клиенты и коммуникации", "Customers and communications", ["P38", "P40"]),
            ("Заказы и исполнение", "Orders and delivery", ["P39", "P41"]),
        ],
        "services": [],
        "works_ru": ["Разработка индивидуальной операционной системы", "Встраивание рабочих модулей в действующую систему", "Настройка ролей и подключение внешних источников"],
        "works_en": ["Custom operational-system engineering", "Embed operational modules in existing software", "Role configuration and external-source connections"],
        "examples": ["max-tour", "pet-nika"],
        "jobs_ru": ["Создать единое рабочее пространство команды", "Собрать заявки и ответственность в одном процессе"],
        "jobs_en": ["Create a shared team workspace", "Bring requests and ownership into one process"],
    },
    {
        "key": "c", "cluster": "ENG-C", "slug": "process-automation",
        "ru": "Автоматизация бизнес-процессов",
        "en": "Business process automation",
        "lead_ru": "Автоматизируем действия по событиям, правилам и времени — от маршрутов задач до документов и обработки данных.",
        "lead_en": "Automate event-, rule- and schedule-driven work, from task routing to documents and data operations.",
        "groups": [
            ("События и рабочие процессы", "Events and workflows", ["P14", "P34"]),
            ("Сопровождение клиентов", "Customer lifecycle", ["P15"]),
            ("Документы и операционные данные", "Documents and operational data", ["P42", "P43"]),
        ],
        "services": [],
        "works_ru": ["Проектирование индивидуальной автоматизации", "Внедрение правил в существующие процессы", "Настройка контроля ошибок и повторных действий"],
        "works_en": ["Custom automation design", "Implement rules in existing workflows", "Configure error handling and retries"],
        "examples": [],
        "jobs_ru": ["Автоматически назначать задачи и запускать следующий этап", "Создавать документы из данных рабочего процесса"],
        "jobs_en": ["Assign tasks and start next steps automatically", "Generate documents from operational data"],
    },
    {
        "key": "d", "cluster": "ENG-D", "slug": "ai-systems",
        "ru": "AI для клиентов и сотрудников",
        "en": "AI for customers & employees",
        "lead_ru": "Встраиваем AI в рабочие процессы, чтобы понимать запросы, искать информацию и помогать людям на разрешённых данных компании.",
        "lead_en": "Embed AI in actual workflows to interpret requests, find information and assist people using approved business data.",
        "groups": [
            ("AI для клиентов", "Customer AI", ["P16", "P17"]),
            ("AI для сотрудников", "Employee AI", ["P44"]),
            ("Анализ информации и рекомендации", "Understanding and recommendations", ["P45", "P46"]),
        ],
        "services": [],
        "works_ru": ["Разработка индивидуальных AI-систем и инструментов", "Подключение AI к утверждённым данным и сервисам", "Настройка ограничений, передачи человеку и проверки качества"],
        "works_en": ["Custom AI systems and tools", "Connect AI to approved data and services", "Guardrails, human handoff and quality testing"],
        "examples": ["max-tour"],
        "jobs_ru": ["Создать консультанта с доступом к реальному каталогу", "Разбирать документы и обращения с помощью AI"],
        "jobs_en": ["Build a consultant connected to a real catalogue", "Interpret documents and enquiries with AI"],
    },
    {
        "key": "e", "cluster": "ENG-E", "slug": "integrations-payments",
        "ru": "Интеграция систем и платежей",
        "en": "Systems & payment integration",
        "lead_ru": "Соединяем существующие облачные сервисы, приложения, CRM и платёжные системы; при необходимости разрабатываем новые адаптеры.",
        "lead_en": "Connect cloud services, business apps, CRM and payments, building custom adapters where necessary.",
        "groups": [
            ("Оплата и кассовые системы", "Payments and checkout", ["P19", "P20"]),
        ],
        "services": ["P21", "P10"],
        "works_ru": ["Разработка нестандартных API-адаптеров и интеграционных шлюзов", "Проектирование устойчивого обмена данными и обработка ошибок"],
        "works_en": ["Custom API adapters and integration gateways", "Reliable data-exchange and error-handling design"],
        "examples": [],
        "jobs_ru": ["Подключить внешний сервис к действующей системе заказов", "Связать статус оплаты с рабочим процессом компании"],
        "jobs_en": ["Connect an external service to order processing", "Link payment status to the operational workflow"],
    },
    {
        "key": "f", "cluster": "ENG-F", "slug": "data-enterprise",
        "ru": "Данные, аналитика и корпоративные системы",
        "en": "Data, analytics & enterprise systems",
        "lead_ru": "Разрабатываем корпоративные системы, инженерные решения для данных, аналитические механизмы и надёжную серверную инфраструктуру.",
        "lead_en": "Build internal platforms, data-engineering solutions, analytics and reliable software infrastructure.",
        "groups": [
            ("Аналитика и контроль", "Analytics and controls", ["P18", "P25"]),
            ("Потоки и синхронизация", "Data flows and synchronization", ["P22"]),
            ("Индивидуальные внутренние системы", "Custom internal systems", ["P26"]),
        ],
        "services": ["P23", "P24", "P30", "P35"],
        "works_ru": ["Проектирование сложной архитектуры данных", "Разработка и эксплуатация индивидуальных программных систем"],
        "works_en": ["Complex data architecture", "Custom system engineering and operations"],
        "examples": ["max-tour"],
        "jobs_ru": ["Разработать закрытую систему с собственными правилами и ролями", "Синхронизировать разрозненные базы и контролировать расхождения"],
        "jobs_en": ["Build a private system with custom rules and roles", "Synchronize data sources and detect discrepancies"],
    },
]

# Canonical cross-links: owned software is separate and never flattened into ENG.
OWNED_SOFTWARE_ROUTE = "/software/"
PRODUCT_DETAIL_ROUTES = {
    "P05": "/products/telegram-mini-app/",
    "P07": "/products/online-booking/",
    "P09": "/products/catalog/",
    "P16": "/products/ai-consultant/",
    "P19": "/products/payment-integration/",
    "P21": "/products/system-integration/",
}

def validate_direction_catalog():
    assert len(DIRECTIONS) == 6, "Exactly six approved website directions are required"
    assert len(set(d["slug"] for d in DIRECTIONS)) == 6
    seen = set()
    for d in DIRECTIONS:
        assert d["cluster"] in {"ENG-A", "ENG-B", "ENG-C", "ENG-D", "ENG-E", "ENG-F"}
        ids = [item for _, _, members in d["groups"] for item in members] + d["services"]
        assert len(ids) == len(set(ids)), f"Duplicate within {d['cluster']}"
        for item in ids:
            assert item in ITEMS, f"Unknown canonical ID {item}"
            assert item not in seen, f"Repeated canonical ID {item} across clusters"
            seen.add(item)
    assert len(seen) == 39, f"Expected 39 active Engineering records, got {len(seen)}"
    assert "P11" not in seen and "P13" not in seen, "Legacy shells must be excluded"
    assert not any(x in seen for x in ("P27", "P28", "P29", "P36", "P47", "P48")), "Owned software is separate"

validate_direction_catalog()
