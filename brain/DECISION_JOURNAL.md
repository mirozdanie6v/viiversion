# Decision Journal

## Record schema
- Decision ID
- Date
- Context
- Trigger
- Options considered
- AI CEO recommendation
- Predicted Olga choice
- Predicted Dmitrii choice
- Final decision
- Rationale
- Owner
- Expected outcome
- Expected review date
- Actual outcome
- Evaluation
- Lesson
- Reusable principle
- Evidence / provenance
- Status

---

# DJ-001 — Establish VIIVERSION Brain before staffing departments

## Context
The company has two founders performing development and product work while company knowledge, products, infrastructure, marketing, sales, and documents are fragmented.

## Trigger
Need for a central management intelligence capable of discovering the real company state, directing strategy, challenging founders, and progressively building the organization.

## Options considered
1. Create many specialist AI departments immediately.
2. Keep working through existing chats and tools without a canonical management layer.
3. Create VIIVERSION Brain / AI CEO first, define governance and registries, then run a factual Day-0 audit before deciding which roles or departments to instantiate.

## AI CEO recommendation
Option 3.

## Final decision
Option 3 approved by founder.

## Rationale
Organization design should be derived from verified bottlenecks and company state rather than imagined from a conventional corporate org chart.

## Expected outcome
A canonical management layer, reliable Day-0 company map, and evidence-based first hiring/agent plan.

## Status
Active.

## DJ-002 — Adopt the crisis-manager / founder-management model

### Context
The intended Brain was previously summarized in the project's earlier Brain discussion more strongly than the initial bootstrap captured.

### Decision
VIIVERSION Brain is explicitly a strong AI CEO/turnaround manager hired to take a messy two-founder company and build it into a leading international product company over 24 months. It serves the company's long-term result and reports to Olga and Dmitrii as owners, while managing and challenging them in their operating roles.

### Consequences
- founder work is subject to assignment, prioritization, measurement, and correction;
- the Brain may recommend limiting new initiatives;
- memory is explicitly split into semantic, episodic, procedural, and decision memory;
- Olga/Dmitrii Cognitive Models learn from decision traces and outcomes;
- the Brain must preserve and learn from its own errors.

### Status
Active.

## DJ-003 — Establish the AI CEO's human working name

### Decision
The human working name of the VIIVERSION AI CEO is **Mark (Марк)**.

### Canonical identities
- Human working identity: Mark / Марк
- Project/system identity: VIIVERSION Brain
- Position: AI CEO / General Manager of VIIVERSION

### Rationale
The company is operated by people and will use a human name in daily planning, management, and communication, while preserving VIIVERSION Brain as the durable system/project identity.

### Status
Active.

## DJ-004 — Management error: architecture proposed before asset audit

### Date
2026-10-07 (Vietnam, UTC+7)

### Context
Immediately after Mark was appointed AI CEO, the founders asked how the persistent CEO should operate outside a single chat.

### Error
Mark proposed a new generic Brain Runtime architecture before auditing VIIVERSION's existing agent/runtime assets.

### Evidence discovered after correction
The company already has production-shaped Cloudflare agent infrastructure. In particular, `mini-app-factory` implements Durable Objects, Cloudflare Workflows, D1, R2, Workers AI, Browser, persistent audit/state, approvals, bounded retries/error routing, GitHub engineering integration and controlled Cloudflare release. `viiversion-ai-engineer` independently implements a Cloudflare control plane with Workflow + Durable Object + D1 + R2 + Browser, task state, approvals, idempotency, verification and rollback.

### Root cause
The CEO violated the canonical operating order: **Audit → Diagnose → Strategize**. A generic architecture pattern was substituted for company-specific due diligence.

### Consequence
Risk of duplicate infrastructure, unnecessary engineering work, extra complexity and failure to reuse company IP.

### Correction
No Brain Runtime architecture is accepted until the existing VIIVERSION stack has been audited and each candidate component receives a reuse / extend / replace decision.

### Learning rule
**Before proposing a new internal platform, runtime, service or major subsystem, Mark must first search the Company Registry and authoritative engineering sources for existing capabilities and document reuse evidence.**

### Evaluation
Management error confirmed by founder and accepted by AI CEO.

### Status
Corrective action in progress under VII-132.

---

## DJ-005 — Утвердить единую модульную архитектуру Марка

**Дата:** 2026-10-27. **Тип:** архитектурное решение. **Статус:** ACCEPTED (target architecture only). **Инициатор/основание:** прямое требование основателя в рабочем разговоре VIIVERSION Brain после обсуждения пяти функциональных частей единого Марка и поручения провести критический аудит, устранить противоречия и утвердить окончательный вариант.

### Проблема

Реализация Brain сосредоточилась на изолированных D1/Worker/Workflow, но ещё не выполняет главной цели: осмысленное поступление информации из явно подключённых чатов, текущий общий контекст, самостоятельно обновляемые знания и живой корпоративный реестр. Повторные инвентаризации и успешные технические тесты не решают эту проблему.

### Утверждённое направление

Одна логическая система Марк с пятью функциональными частями:
1. Постоянная память и Identity Core.
2. Оперативная память чатов, задач и дня.
3. Механизмы восприятия, мышления, проверки, обучения, принятия решений и разрешённых действий.
4. Внутренние источники и живой реестр VIIVERSION.
5. Внешние источники — явно подключённые чаты и интернет.

Использовать действующие Brain Worker/D1/Workflows и расширять только по доказанной необходимости. Постоянная память содержит саму сущность Марка: защищённый Identity Core отдельно от обучаемого Self-Model; изменения прав/Конституции сохраняют существующий founder-approval gate. Детальные сведения из GitHub/Linear/Drive получаются выборочно; автоматическая оперативная память формируется из смысловых событий, без оптового копирования всей информации.

### Достоверность и ограничения

- **Архитектура** утверждена в [ADR-0001](architecture/ADR-0001-unified-mark.md), [MARK_ARCHITECTURE](architecture/MARK_ARCHITECTURE.md) и [MARK_ROADMAP](architecture/MARK_ROADMAP.md). [Audit](architecture/ARCHITECTURE_RECONCILIATION_AUDIT.md) описывает устранённые противоречия.
- **Автоматическая передача контекста обычных выбранных чатов ChatGPT не доказана.** Документация MCP подтверждает вызов приложения на отдельном сообщении, а не пассивную подписку на весь чат. Этап M0B и интеграционная способность M3 — BLOCKED до отдельной живой проверки; их нельзя объявлять готовыми.
  **Историческое утверждение (SUPERSEDED by DJ-006):** пассивный мониторинг больше не является требованием; M0B/M3 остаются PENDING VERIFICATION исключительно для передачи доступного контекста по явному вызову.
- Проверенный production v0.1 остаётся узким техническим фундаментом. Полный CEO Loop, живой реестр, оперативная память и изолированные parallel checkpoints не реализованы.
- Это решение **не утверждает коммерческие изменения, новый объём доступа к личным чатам, фоновые перехваты сообщений, изменение действующей Конституции или полномочий Марка**.
- Ранее сформулированное в историческом Day-0 audit абсолютное требование полной инвентаризации *до* архитектуры больше не относится к этой целевой модели. Требование анализировать существующие компоненты прежде новых инфраструктурных узлов остаётся в силе.

### Ожидаемый результат

Разработка прекращает подменять главный механизм поступления информации повторной ручной инвентаризацией. Каждый новый этап закрывается доказательством поведения единого Марка, а не только инфраструктурными тестами. Система поэтапно получает устойчивую идентичность, контекст, живой реестр и когнитивный цикл с верифицируемыми полномочиями.

### Проверка решения

Документационный PR с архитектурой/ADR/roadmap/матрицей противоречий + отдельные acceptance gates M0B–M6. Реальное исполнение и полномочия требуют собственных проверок и разрешений.

---

## DJ-006 — Передача контекста выбранного чата по вызову Марка

**Дата:** 2026-10-27. **Статус:** ACCEPTED — целевой способ интеграции, техническая готовность PENDING VERIFICATION.

### Уточнение основателя

Марк существует и функционирует **вне чата**. Его вызывают в обычном ChatGPT; в этот момент доступный и фактически переданный ему контекст разговора должен стать **оперативной памятью Марка** после подтверждённого сохранения в Brain D1. Далее Марк в собственной системе самостоятельно думает, классифицирует информацию, сохраняет значимое в постоянную память, обновляет реестр при достаточных основаниях и возвращает контекст следующему разрешённому вызову.

### Как исправлена прежняя постановка

**Отменено как техническое требование:** Марк обязан пассивно следить за каждым сообщением подключённого чата и получать события без повторного вызова. Соответствующее утверждение о непреодолимом блокере M0B в DJ-005 было результатом неверного понимания требуемой схемы и superseded в этой части. Сохраняется управление областью видимости: неподключённые беседы не извлекаются самостоятельно.

**Обязательный технический контракт:** вызвать Марка в чате → передать фактически доступный контекст через разрешённый bridge/MCP → durable receipt и working context в Brain D1 → независимая обработка → восстановление при следующем вызове. GitHub может быть транзитным мостом, но не должен хранить тексты приватных бесед как коммиты.

### Границы и проверка

Наличие MCP-подключения **не гарантирует**, что ChatGPT предоставит весь transcript. Тест обязан установить фактически переданные элементы, coverage (`verified_complete_for_declared_scope` / `partial` / `unknown`), идемпотентность и восстановление. Если ChatGPT передал только часть разговора, Марк обязан честно указывать неполноту; «переданное сохранилось» не означает «весь чат доступен».

Обязательная приёмка M0B/M3: контрольные факты + решение в чате A → явный вызов → реальный payload и receipt → независимое чтение из D1 → явный вызов в чате B → точное восстановление, проверка прав, повторных вызовов и отказов. Оперативная память может обрабатываться внутри Brain после передачи без нового текста из ChatGPT.

Документы: [CHAT_CONTEXT_HANDOFF_CONTRACT.md](architecture/CHAT_CONTEXT_HANDOFF_CONTRACT.md), [MARK_ARCHITECTURE.md](architecture/MARK_ARCHITECTURE.md), [MARK_ROADMAP.md](architecture/MARK_ROADMAP.md), [ADR-0001](architecture/ADR-0001-unified-mark.md).

**Результат:** уточнена архитектура и тестовый контракт, но продуктовая интеграция пока **не реализована и не проверена**.

---

## DJ-007 — Запрет пользовательского ввода технических секретов для Марка

**Дата:** 2026-10-29. **Статус:** ACCEPTED — требование владельца к UX и безопасности.

Владелец VIIVERSION прямо запретил требовать при обычном использовании Марка вводить, сохранять, искать или передавать технические пароли, API-токены и другие внутренние ключи. Реализованный ранее ввод `BRAIN_API_TOKEN` в OAuth consent-форме признан **ошибкой проектирования**.

**Решение:** технические секреты принадлежат сервисам и закрытому хранилищу Cloudflare. Они **никогда не запрашиваются в пользовательских интерфейсах Марка**, в обычном ChatGPT, в параметрах вызова MCP, GitHub issues/PR или через переписку. Авторизация доступа к частной корпоративной памяти выполняется внутри защищённых интеграций с использованием уже разрешённого канала владельца, без ввода технического секрета пользователем. Отменять контроль доступа и публиковать корпоративную память ради упрощения UX запрещено.

Первый реализованный путь: на странице OAuth вместо поля `BRAIN_API_TOKEN` показывается одноразовое ожидание подтверждения; отдельный уже авторизованный Cloudflare администратор может одобрить **конкретную** короткоживущую привязку; пользователь возвращается в браузер и продолжает без ввода пароля. Это временная реализация без дополнительных инфраструктурных узлов, но **не означает автоматическую регистрацию плагина или пассивный доступ к чату**.

**Доказательство и статус:** [PR #41](https://github.com/mirozdanie6v/viiversion/pull/41) — замена формы, D1 migration 0005, проверки отсутствия пароля/самоодобрения/повторного использования. Исполнение в production и фактическая авторизация пользователя проверяются отдельно. Прежние решения DJ-005/DJ-006 по объёму доступного контекста остаются действующими.
