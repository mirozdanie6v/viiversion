# VIIVERSION website presentation catalogue / cache.
# NOT a corporate or commercial Source of Truth.
# Canonical identity/ontology: Corporate Strategy + Commercial Matrix/Entity_Registry.
# Commercial state/proof: Commercial Matrix.
# Global market/brand rules: Global Brand & Market Strategy.
# This file is an L5 website implementation adapter and must remain traceable upstream.
#
# FAMILIES map to canonical Engineering Solutions categories:
# online-sales -> ENG-A; booking -> ENG-B; operations -> ENG-C;
# ai -> ENG-D; payments -> ENG-E; integrations -> ENG-F.

FAMILIES = {
    "online-sales": {
        "ru": {"name": "Онлайн-продажи", "description": "Клиентские интерфейсы, каталог и действия до заявки или покупки."},
        "en": {"name": "Online Sales", "description": "Customer-facing interfaces, catalogues and actions before enquiry or purchase."},
    },
    "booking": {
        "ru": {"name": "Бронирование", "description": "Выбор услуги, даты, параметров и подтверждение брони."},
        "en": {"name": "Booking", "description": "Service, date, parameter selection and booking confirmation."},
    },
    "operations": {
        "ru": {"name": "Работа с заявками и заказами", "description": "CRM, статусы, очередь работы и контроль команды."},
        "en": {"name": "Operations", "description": "CRM, status, team queue and operational control."},
    },
    "ai": {
        "ru": {"name": "AI", "description": "Консультации и подбор по утверждённым данным бизнеса."},
        "en": {"name": "AI", "description": "Consultation and recommendation using approved business information."},
    },
    "payments": {
        "ru": {"name": "Оплата", "description": "Связь оплаты с заказом и подтверждённым статусом."},
        "en": {"name": "Payments", "description": "Connect payment to the order and verified payment status."},
    },
    "integrations": {
        "ru": {"name": "Интеграции", "description": "Обмен данными между существующими системами."},
        "en": {"name": "Integrations", "description": "Reliable data exchange between existing systems."},
    },
}

SELLABLE_PRODUCTS = {
    "online-booking": {
        "family": "booking",
        "ru": {
            "name": "Онлайн-бронирование",
            "short": "Клиент сам выбирает услугу, дату и параметры. Вы получаете готовую бронь.",
            "result": "Убирает ручное согласование дат и повторяющиеся вопросы в мессенджере.",
            "for": ["туризм", "отели", "аренда", "клиники", "услуги"],
            "steps": ["Клиент выбирает услугу", "видит доступную дату или слот", "указывает параметры", "получает подтверждение", "бронь приходит команде в понятном виде"],
            "includes": ["один законченный сценарий бронирования", "даты или слоты", "основные параметры", "подтверждение", "мобильная версия"],
            "excludes": ["полную замену вашей CRM", "сложные сторонние интеграции без отдельной оценки", "миграцию всей базы данных"],
            "proof": ["max-tour", "ave-dental", "pet-nika", "true-surf"],
            "cta": "Оценить онлайн-бронирование",
        },
        "en": {
            "name": "Online booking",
            "short": "Customers choose the service, date and parameters; your team receives a complete booking.",
            "result": "Removes manual date coordination and repetitive booking questions.",
            "for": ["tourism", "hotels", "rental", "clinics", "services"],
            "steps": ["Customer selects a service", "sees available dates or slots", "enters the required details", "receives confirmation", "the team receives a structured booking"],
            "includes": ["one complete booking flow", "dates or slots", "core parameters", "confirmation", "mobile version"],
            "excludes": ["full CRM replacement", "complex third-party integrations without separate scoping", "full database migration"],
            "proof": ["max-tour", "ave-dental", "pet-nika", "true-surf"],
            "cta": "Scope online booking",
        },
        "packages": {
            "start": {
                "ru": {"name": "Первый запуск", "price": "8–18M ₫", "timeline": "обычно 7–14 дней", "scope": ["одна услуга или тип бронирования", "дата / слот", "ключевые параметры", "создание брони", "подтверждение"]},
                "en": {"name": "Starter", "price": "US$330–740", "timeline": "typically 7–14 days", "scope": ["one service or booking type", "date / slot", "key parameters", "booking creation", "confirmation"]},
            }
        },
        "recommended_addons": ["schedule", "notifications", "payment", "crm-connection", "customer-account"],
    },
    "telegram-mini-app": {
        "family": "online-sales",
        "ru": {
            "name": "Telegram Mini App",
            "short": "Каталог, услуги, запись или заявка открываются прямо внутри Telegram.",
            "result": "Клиенту не нужно переходить по нескольким сайтам и собирать информацию в переписке.",
            "for": ["туризм", "аренда", "клиники", "магазины", "услуги"],
            "steps": ["Клиент открывает Mini App", "видит услуги или каталог", "выбирает нужное", "оставляет заявку или бронирует", "данные передаются вам"],
            "includes": ["главный экран", "каталог или услуги", "одно ключевое действие", "мобильный интерфейс", "публичная рабочая версия"],
            "excludes": ["большую CRM", "сложную ERP", "неограниченное число нестандартных интеграций"],
            "proof": ["uniq-smart-rent", "ave-dental", "pet-nika", "true-surf"],
            "cta": "Оценить Mini App",
        },
        "en": {
            "name": "Telegram Mini App",
            "short": "Catalogue, services, booking or enquiry directly inside Telegram.",
            "result": "Customers do not need to jump between websites and chats to complete one action.",
            "for": ["tourism", "rental", "clinics", "retail", "services"],
            "steps": ["Customer opens the Mini App", "sees services or catalogue", "chooses an option", "books or sends an enquiry", "the data reaches your team"],
            "includes": ["home screen", "catalogue or services", "one primary action", "mobile UI", "public working release"],
            "excludes": ["large CRM", "complex ERP", "unlimited custom integrations"],
            "proof": ["uniq-smart-rent", "ave-dental", "pet-nika", "true-surf"],
            "cta": "Scope a Mini App",
        },
        "packages": {
            "start": {
                "ru": {"name": "Первый запуск", "price": "10–12M ₫", "timeline": "обычно 7–10 дней", "scope": ["главный экран", "каталог или услуги", "одно ключевое действие", "мобильный интерфейс", "публичная версия"]},
                "en": {"name": "Starter", "price": "US$410–495", "timeline": "typically 7–10 days", "scope": ["home screen", "catalogue or services", "one primary action", "mobile UI", "public release"]},
            }
        },
        "recommended_addons": ["online-booking", "customer-account", "payment", "crm-connection"],
    },
    "catalog": {
        "family": "online-sales",
        "ru": {
            "name": "Каталог с ценами",
            "short": "Клиент видит товары или услуги, варианты и стоимость до разговора с менеджером.",
            "result": "Сокращает вопросы «что есть?» и «сколько стоит?» и приводит к более готовой заявке.",
            "for": ["туризм", "магазины", "аренда", "услуги"],
            "steps": ["Показываем категории", "карточки товара или услуги", "варианты и цену", "клиент выбирает", "переходит к заявке или бронированию"],
            "includes": ["структуру каталога", "карточки", "цены", "базовые фильтры", "одно целевое действие"],
            "excludes": ["полноценную ERP", "сложный складской учёт", "маркетплейс с множеством продавцов"],
            "proof": ["uniq-smart-rent", "max-tour"],
            "cta": "Оценить каталог",
        },
        "en": {
            "name": "Catalogue with pricing",
            "short": "Customers see products or services, options and price before speaking to staff.",
            "result": "Reduces repetitive availability and pricing questions and produces better-qualified enquiries.",
            "for": ["tourism", "retail", "rental", "services"],
            "steps": ["Show categories", "show product or service cards", "show options and price", "customer chooses", "moves to enquiry or booking"],
            "includes": ["catalogue structure", "cards", "pricing", "basic filters", "one primary action"],
            "excludes": ["full ERP", "complex inventory management", "multi-vendor marketplace"],
            "proof": ["uniq-smart-rent", "max-tour"],
            "cta": "Scope a catalogue",
        },
        "packages": {
            "start": {
                "ru": {"name": "Первый запуск", "price": "от 5M ₫", "timeline": "обычно 5–10 дней", "scope": ["структура", "карточки", "цены", "базовые фильтры", "одно действие"]},
                "en": {"name": "Starter", "price": "from US$205", "timeline": "typically 5–10 days", "scope": ["structure", "cards", "pricing", "basic filters", "one action"]},
            }
        },
        "recommended_addons": ["online-booking", "payment", "ai-consultant"],
    },
    "crm": {
        "family": "operations",
        "ru": {
            "name": "Операционная рабочая панель",
            "short": "Заказы, обращения, статусы, ответственные и рабочие действия команды — в одном интерфейсе, связанном с вашим процессом.",
            "result": "Команда работает с заказами и операциями в одном контуре, а CRM остаётся подключённой системой там, где она уже используется.",
            "for": ["туризм", "отели", "аренда", "клиники", "магазины", "услуги"],
            "steps": ["Заявка или заказ попадает в рабочий контур", "получает статус и ответственного", "сотрудник выполняет предметные действия", "история сохраняется", "руководитель видит очередь и показатели"],
            "includes": ["заказы и рабочие сущности", "статусы", "ответственных", "операционную панель", "базовую аналитику"],
            "excludes": ["обязательную замену существующей CRM", "миграцию сложной legacy-базы без отдельного этапа", "неограниченные отчёты"],
            "proof": ["max-tour", "pet-nika", "rusinfocenter"],
            "cta": "Разобрать рабочий контур",
        },
        "en": {
            "name": "Operational workspace",
            "short": "Orders, enquiries, status, ownership and team actions in one interface built around the actual workflow.",
            "result": "The team runs operational work in one connected layer while the existing CRM can remain the customer system of record.",
            "for": ["tourism", "hotels", "rental", "clinics", "retail", "services"],
            "steps": ["A request or order enters the operating flow", "gets a status and owner", "staff perform domain-specific actions", "history is preserved", "management sees the queue and key numbers"],
            "includes": ["orders and operational entities", "statuses", "ownership", "operational workspace", "basic analytics"],
            "excludes": ["mandatory replacement of the existing CRM", "complex legacy migration without a separate phase", "unlimited custom reporting"],
            "proof": ["max-tour", "pet-nika", "rusinfocenter"],
            "cta": "Map the operational workflow",
        },
        "packages": {
            "start": {
                "ru": {"name": "Первый рабочий раздел", "price": "15–35M ₫", "timeline": "обычно 2–4 недели", "scope": ["основные сущности", "статусы", "очередь", "ответственные", "базовая аналитика"]},
                "en": {"name": "First working area", "price": "US$620–1,450", "timeline": "typically 2–4 weeks", "scope": ["core entities", "statuses", "queue", "ownership", "basic analytics"]},
            }
        },
        "recommended_addons": ["staff-dashboard", "analytics", "owner-dashboard", "repeat-sales", "notifications"],
    },
    "ai-consultant": {
        "family": "ai",
        "ru": {
            "name": "AI-консультант",
            "short": "Отвечает по вашим услугам, уточняет запрос и передаёт менеджеру уже понятную заявку.",
            "result": "Снимает повторяющиеся вопросы и помогает клиенту выбрать без ожидания ответа сотрудника.",
            "for": ["туризм", "отели", "клиники", "магазины", "услуги"],
            "steps": ["Клиент задаёт вопрос", "AI отвечает только по утверждённой информации", "уточняет параметры", "предлагает подходящий вариант", "передаёт менеджеру контекст или ведёт к записи"],
            "includes": ["одну задачу", "один канал", "утверждённую базу знаний", "правила ответа", "передачу человеку"],
            "excludes": ["свободные ответы вне согласованной базы", "медицинские заключения", "неограниченные действия без подтверждения"],
            "proof": ["max-tour"],
            "cta": "Показать AI на моём сценарии",
        },
        "en": {
            "name": "AI assistant",
            "short": "Answers from your approved information, clarifies the request and passes a useful lead to staff.",
            "result": "Handles repetitive questions and helps customers choose without waiting for staff.",
            "for": ["tourism", "hotels", "clinics", "retail", "services"],
            "steps": ["Customer asks a question", "AI answers from approved information only", "clarifies the request", "suggests a relevant option", "passes context to staff or moves to booking"],
            "includes": ["one defined task", "one channel", "approved knowledge base", "response rules", "human handoff"],
            "excludes": ["free-form answers outside the approved base", "medical diagnosis", "unlimited actions without confirmation"],
            "proof": ["max-tour"],
            "cta": "See AI on my scenario",
        },
        "packages": {
            "start": {
                "ru": {"name": "Первый сценарий", "price": "8–25M ₫", "timeline": "обычно 7–14 дней", "scope": ["утверждённая база знаний", "одна задача", "правила ответа", "передача человеку", "тестовые диалоги"]},
                "en": {"name": "First scenario", "price": "US$330–1,030", "timeline": "typically 7–14 days", "scope": ["approved knowledge base", "one task", "response rules", "human handoff", "test conversations"]},
            }
        },
        "recommended_addons": ["catalog-connection", "online-booking", "crm-connection"],
    },
    "payment-integration": {
        "family": "payments",
        "ru": {
            "name": "Подключение оплаты",
            "short": "Оплата на сайте, в приложении или кассе связывается с заказом и возвращает подтверждённый статус.",
            "result": "Не нужно вручную проверять, оплатил ли клиент и к какому заказу относится платёж.",
            "for": ["туризм", "отели", "магазины", "рестораны", "аренда"],
            "steps": ["Клиент оплачивает", "провайдер подтверждает платёж", "система проверяет событие", "заказ получает статус", "статус передаётся в рабочую систему"],
            "includes": ["один платёжный сценарий", "обработку статуса", "ошибки и повторные события", "логи", "документацию"],
            "excludes": ["комиссии платёжного провайдера", "сертификацию чужого POS", "несколько провайдеров без отдельной оценки"],
            "proof": ["max-tour"],
            "cta": "Обсудить подключение оплаты",
        },
        "en": {
            "name": "Payment integration",
            "short": "Connect payment on website, app or POS to the order and return verified status.",
            "result": "Removes manual payment checking and connects the transaction to the right order.",
            "for": ["tourism", "hotels", "retail", "restaurants", "rental"],
            "steps": ["Customer pays", "provider confirms payment", "the event is validated", "the order status updates", "status reaches the working system"],
            "includes": ["one payment flow", "status handling", "errors and repeat events", "logging", "documentation"],
            "excludes": ["provider fees", "third-party POS certification", "multiple providers without separate scoping"],
            "proof": ["max-tour"],
            "cta": "Discuss payment integration",
        },
        "packages": {
            "start": {
                "ru": {"name": "Одна платёжная интеграция", "price": "10–30M ₫", "timeline": "после проверки API провайдера", "scope": ["один платёжный сценарий", "статусы", "ошибки", "логи", "документация"]},
                "en": {"name": "One payment integration", "price": "US$410–1,240", "timeline": "after provider API review", "scope": ["one payment flow", "status handling", "errors", "logging", "documentation"]},
            }
        },
        "recommended_addons": ["reconciliation", "crm-connection", "analytics"],
    },
    "system-integration": {
        "family": "integrations",
        "ru": {
            "name": "Интеграция двух систем",
            "short": "Передаём нужные данные между сайтом, CRM, кассой, оплатой или внутренней системой.",
            "result": "Сотрудникам не приходится вручную копировать данные из одной системы в другую.",
            "for": ["магазины", "отели", "рестораны", "корпоративные системы"],
            "steps": ["Проверяем API", "фиксируем какие данные передаются", "собираем интеграцию", "добавляем логи и обработку ошибок", "тестируем согласованный сценарий"],
            "includes": ["одну интеграцию", "карту данных", "логи", "обработку ошибок", "документацию"],
            "excludes": ["недокументированные системы без доступа", "массовую миграцию данных", "несколько независимых интеграций по цене одной"],
            "proof": ["max-tour", "uniq-smart-rent"],
            "cta": "Обсудить интеграцию",
        },
        "en": {
            "name": "System integration",
            "short": "Move the required data between website, CRM, POS, payments or internal systems.",
            "result": "Staff no longer need to copy data manually between systems.",
            "for": ["retail", "hotels", "restaurants", "enterprise systems"],
            "steps": ["Review the API", "define the data exchange", "build the integration", "add logging and error handling", "test the agreed scenario"],
            "includes": ["one integration", "data map", "logging", "error handling", "documentation"],
            "excludes": ["undocumented systems without access", "mass data migration", "multiple unrelated integrations for one fixed price"],
            "proof": ["max-tour", "uniq-smart-rent"],
            "cta": "Discuss an integration",
        },
        "packages": {
            "start": {
                "ru": {"name": "Одна интеграция", "price": "по технической оценке", "timeline": "обычно 5–10 рабочих дней после доступа к API", "scope": ["проверка API", "один обмен данными", "логи", "ошибки", "документация"]},
                "en": {"name": "One integration", "price": "after technical review", "timeline": "typically 5–10 working days after API access", "scope": ["API review", "one data exchange", "logging", "errors", "documentation"]},
            }
        },
        "recommended_addons": ["monitoring", "analytics", "managed-support"],
    },
}

ADDONS = {
    "schedule": {"ru": "Расписание и доступность", "en": "Schedule & availability"},
    "notifications": {"ru": "Подтверждения и напоминания", "en": "Confirmations & reminders"},
    "payment": {"ru": "Оплата", "en": "Payments"},
    "crm-connection": {"ru": "Связь с CRM", "en": "CRM connection"},
    "customer-account": {"ru": "Личный кабинет клиента", "en": "Customer account"},
    "staff-dashboard": {"ru": "Рабочая панель сотрудников", "en": "Staff dashboard"},
    "analytics": {"ru": "Аналитика", "en": "Analytics"},
    "owner-dashboard": {"ru": "Панель руководителя", "en": "Owner dashboard"},
    "repeat-sales": {"ru": "Повторные продажи", "en": "Repeat sales"},
    "catalog-connection": {"ru": "Связь с каталогом", "en": "Catalogue connection"},
    "reconciliation": {"ru": "Сверка платежей", "en": "Payment reconciliation"},
    "monitoring": {"ru": "Мониторинг интеграции", "en": "Integration monitoring"},
    "managed-support": {"ru": "Техническое сопровождение", "en": "Managed support"},
}

INDUSTRY_CONFIGS = {
    "tourism": {
        "ru": {"name": "Туры и экскурсии", "lead": "Продажа экскурсий, туров, трансферов и активностей."},
        "en": {"name": "Tours & activities", "lead": "Selling tours, transfers and activities."},
        "primary": ["online-booking", "catalog", "ai-consultant"],
        "later": ["crm", "payment-integration", "telegram-mini-app"],
    },
    "hotels": {
        "ru": {"name": "Отели", "lead": "Прямое бронирование, оплата и работа с гостем."},
        "en": {"name": "Hotels", "lead": "Direct booking, payments and guest service."},
        "primary": ["online-booking", "payment-integration", "crm"],
        "later": ["ai-consultant", "telegram-mini-app"],
        "addons": ["customer-account"],
    },
    "shops": {
        "ru": {"name": "Магазины", "lead": "Каталог, заявки, оплата и обмен данными между системами."},
        "en": {"name": "Retail", "lead": "Catalogue, enquiries, payments and system integration."},
        "primary": ["catalog", "payment-integration", "crm"],
        "later": ["ai-consultant", "system-integration"],
    },
    "rental": {
        "ru": {"name": "Аренда", "lead": "Транспорт, оборудование и другие объекты аренды."},
        "en": {"name": "Rental", "lead": "Vehicles, equipment and other rental assets."},
        "primary": ["catalog", "online-booking", "crm"],
        "later": ["payment-integration", "telegram-mini-app"],
        "addons": ["customer-account"],
    },
    "clinics": {
        "ru": {"name": "Клиники", "lead": "Запись, заявки, клиентский путь и повторные обращения."},
        "en": {"name": "Clinics", "lead": "Booking, enquiries, customer journey and repeat visits."},
        "primary": ["online-booking", "crm", "telegram-mini-app"],
        "later": ["ai-consultant"],
        "addons": ["customer-account", "notifications"],
    },
    "restaurants": {
        "ru": {"name": "Рестораны", "lead": "Бронь, оплата и связь кассы с рабочими системами."},
        "en": {"name": "Restaurants", "lead": "Reservations, payments and POS integration."},
        "primary": ["payment-integration", "online-booking", "system-integration"],
        "later": ["crm"],
        "addons": ["staff-dashboard"],
    },
    "services": {
        "ru": {"name": "Услуги", "lead": "Запись, заявки, консультации и повторные обращения."},
        "en": {"name": "Services", "lead": "Booking, enquiries, consultation and repeat business."},
        "primary": ["online-booking", "crm", "telegram-mini-app"],
        "later": ["ai-consultant", "payment-integration"],
    },
}

TARGET_LANDINGS = {
    "tourism/online-booking": {
        "industry": "tourism",
        "product": "online-booking",
        "ru": {
            "title": "Онлайн-бронирование экскурсий",
            "headline": "Турист бронирует экскурсию сам. Менеджер получает готовый заказ.",
            "lead": "Экскурсия, дата, количество людей и дополнительные параметры оформляются без длинной переписки.",
            "specific": ["ночные заявки не ждут открытия офиса", "менеджер меньше времени тратит на одинаковые уточнения", "структура заказа сразу готова для CRM или рабочей панели"],
        },
        "en": {
            "title": "Online booking for tours",
            "headline": "The traveller books the tour; the team receives a complete order.",
            "lead": "Tour, date, party size and options are captured without a long chat exchange.",
            "specific": ["after-hours enquiries do not wait for the office", "staff spend less time on repetitive clarification", "the order arrives ready for CRM or operations"],
        },
    },
    "tourism/ai-consultant": {
        "industry": "tourism",
        "product": "ai-consultant",
        "ru": {
            "title": "AI-консультант для туров и экскурсий",
            "headline": "AI помогает туристу выбрать и передаёт менеджеру уже понятный запрос.",
            "lead": "Консультант работает по вашему каталогу и правилам, задаёт уточняющие вопросы и ведёт к бронированию или человеку.",
            "specific": ["ответы по каталогу 24/7", "подбор по интересам, дате и составу группы", "передача контекста в бронирование или менеджеру"],
        },
        "en": {
            "title": "AI assistant for tour companies",
            "headline": "AI helps the traveller choose and hands a clear request to the team.",
            "lead": "The assistant works from your catalogue and rules, asks clarifying questions and moves the customer to booking or a human.",
            "specific": ["catalogue answers 24/7", "recommendations by interest, date and party", "context passed to booking or staff"],
        },
    },
    "rental/online-booking": {
        "industry": "rental",
        "product": "online-booking",
        "ru": {
            "title": "Онлайн-бронирование для проката",
            "headline": "Клиент выбирает транспорт и даты без ручного расчёта в мессенджере.",
            "lead": "Каталог, период аренды, тариф и заявка соединяются в один понятный сценарий.",
            "specific": ["меньше вопросов «сколько стоит на эти даты?»", "заявка сразу содержит модель и период", "дальше можно подключить доступность, оплату и CRM"],
        },
        "en": {
            "title": "Online booking for rental businesses",
            "headline": "Customers choose the vehicle and dates without manual quoting in chat.",
            "lead": "Catalogue, rental period, pricing and request work as one clear flow.",
            "specific": ["fewer repetitive price questions", "the request already contains model and dates", "availability, payments and CRM can connect later"],
        },
    },
    "clinics/online-booking": {
        "industry": "clinics",
        "product": "online-booking",
        "ru": {
            "title": "Онлайн-запись для клиники",
            "headline": "Пациент выбирает услугу и время, администратор получает структурированную запись.",
            "lead": "Запись можно связать с врачами, услугами, напоминаниями и CRM без полной замены текущей системы клиники.",
            "specific": ["меньше ручного согласования времени", "контекст пациента приходит вместе с записью", "напоминания можно подключить позже"],
        },
        "en": {
            "title": "Online booking for clinics",
            "headline": "Patients choose the service and time; the clinic receives a structured booking.",
            "lead": "Booking can connect to doctors, services, reminders and CRM without replacing the clinic's entire system.",
            "specific": ["less manual slot coordination", "patient context arrives with the booking", "reminders can be added later"],
        },
    },
    "clinics/ai-consultant": {
        "industry": "clinics",
        "product": "ai-consultant",
        "ru": {
            "title": "AI-консультант для клиники",
            "headline": "AI отвечает на типовые вопросы и помогает довести обращение до записи.",
            "lead": "Работает только по утверждённой информации о клинике и услугах, не заменяет врача и не выдаёт медицинских заключений.",
            "specific": ["режим работы, услуги, подготовка и общая информация", "уточнение нужной услуги", "передача администратору контекста обращения"],
        },
        "en": {
            "title": "AI assistant for clinics",
            "headline": "AI handles routine questions and helps move the enquiry toward booking.",
            "lead": "It uses approved clinic and service information only; it does not replace a clinician or provide medical diagnosis.",
            "specific": ["hours, services, preparation and general information", "clarifies which service the customer needs", "hands context to clinic staff"],
        },
    },
    "restaurants/payment-integration": {
        "industry": "restaurants",
        "product": "payment-integration",
        "ru": {
            "title": "Подключение оплаты для ресторанов и POS",
            "headline": "Свяжите оплату с заказом и подтверждённым статусом без ручной сверки.",
            "lead": "Подходит ресторанам, POS-вендорам, интеграторам и сетям, которым нужно надёжно связать кассу с платёжным провайдером.",
            "specific": ["статус оплаты возвращается в заказ", "повторные события и ошибки обрабатываются системно", "можно расширить до сверки и нескольких точек"],
        },
        "en": {
            "title": "Payment integration for restaurants and POS",
            "headline": "Connect payment to the order and verified status without manual reconciliation.",
            "lead": "For restaurants, POS vendors, integrators and chains that need reliable payment-provider integration.",
            "specific": ["payment status returns to the order", "repeat events and errors are handled systematically", "can expand to reconciliation and multi-location"],
        },
    },
}

COMPOSITE_SYSTEMS = {
    "tour-sales": {"family_products": ["catalog", "online-booking", "payment-integration", "crm"], "ru": "Онлайн-продажи экскурсий", "en": "Tour sales system"},
    "hotel-direct": {"family_products": ["online-booking", "payment-integration", "crm"], "ru": "Прямое бронирование отеля", "en": "Hotel direct booking"},
    "rental-operations": {"family_products": ["catalog", "online-booking", "crm", "payment-integration"], "ru": "Продажи и операции проката", "en": "Rental sales & operations"},
    "clinic-frontdesk": {"family_products": ["online-booking", "crm", "ai-consultant"], "ru": "Цифровая регистратура клиники", "en": "Clinic digital front desk"},
}

SOFTWARE_PRODUCTS = {
    "proposal-studio": {
        "ru": {"name": "Proposal Studio", "status": "ДОСТУПНО", "summary": "Исследование, диагностика и сборка коммерческого предложения в одном процессе.", "url": "/proposal-studio/"},
        "en": {"name": "Proposal Studio", "status": "AVAILABLE", "summary": "Research, diagnosis and commercial proposal generation in one workflow.", "url": "/proposal-studio/"},
    },
    "zl-web-agent": {
        "ru": {"name": "ZL Web Agent", "status": "ЗАКРЫТАЯ БЕТА", "summary": "Аудит WordPress на основе фактических данных и план безопасных изменений.", "url": None},
        "en": {"name": "ZL Web Agent", "status": "PRIVATE BETA", "summary": "Evidence-based WordPress audit and a safe change plan.", "url": None},
    },
    "video-human-editor": {
        "ru": {"name": "Event Video Human Editor", "status": "В РАЗРАБОТКЕ", "summary": "Семантический анализ больших массивов видео до ручного монтажа.", "url": None},
        "en": {"name": "Event Video Human Editor", "status": "IN DEVELOPMENT", "summary": "Semantic analysis of large event-video collections before human editing.", "url": None},
    },
}

PARTNER_PRODUCTS = {
    "mini-app-factory": {
        "ru": {"name": "Mini App Factory", "status": "ЗАКРЫТАЯ БЕТА", "summary": "Платформа для серийной сборки Mini Apps под брендом агентства или партнёра.", "cta": "Обсудить работу под брендом партнёра"},
        "en": {"name": "Mini App Factory", "status": "PRIVATE BETA", "summary": "A repeatable Mini App production platform for agency and white-label delivery.", "cta": "Discuss a white-label partnership"},
    },
    "payment-partnership": {
        "ru": {"name": "Платёжные интеграции для POS и платформ", "status": "ПАРТНЁРСКИЙ ФОРМАТ", "summary": "Интеграционный слой для POS-вендоров, сетей и программных платформ.", "cta": "Обсудить технический пилот"},
        "en": {"name": "Payment integration for POS & platforms", "status": "PARTNER DELIVERY", "summary": "Payment integration layer for POS vendors, chains and software platforms.", "cta": "Discuss a technical pilot"},
    },
}

LEGACY_REDIRECTS = {
    "/products/online-sales/": "/products/",
    "/products/booking/": "/products/online-booking/",
    "/products/operations/": "/products/crm/",
    "/products/ai-operator/": "/products/ai-consultant/",
    "/products/paybridge/": "/products/payment-integration/",
    "/modules/": "/products/",
    "/modules/online-booking/": "/products/online-booking/",
    "/modules/telegram-mini-app/": "/products/telegram-mini-app/",
    "/modules/crm/": "/products/crm/",
    "/modules/ai-consultant/": "/products/ai-consultant/",
    "/modules/payment-integration/": "/products/payment-integration/",
    "/modules/catalog/": "/products/catalog/",
    "/modules/api-integration/": "/products/system-integration/",
    "/offers/": "/products/",
    "/offers/booking-start/": "/products/online-booking/",
    "/offers/mini-app-pilot/": "/products/telegram-mini-app/",
    "/offers/ai-operator-pilot/": "/products/ai-consultant/",
    "/offers/operations-core/": "/products/crm/",
    "/offers/integration-sprint/": "/products/system-integration/",
    "/labs/": "/software/",
    "/solutions/tourism/booking/": "/solutions/tourism/online-booking/",
    "/solutions/tourism/ai-operator/": "/solutions/tourism/ai-consultant/",
    "/solutions/rental/booking/": "/solutions/rental/online-booking/",
    "/solutions/clinics/booking/": "/solutions/clinics/online-booking/",
    "/solutions/clinics/ai-operator/": "/solutions/clinics/ai-consultant/",
    "/solutions/restaurants/paybridge/": "/solutions/restaurants/payment-integration/",
}
