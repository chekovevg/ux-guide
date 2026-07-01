# Pathway / Wynde UX Research Guide — контекст для Codex

Дата сборки: 2026-05-31
Язык брифа: русский, но сам продукт/кейс предполагается для англоязычного рынка.

## 0. Важное уточнение

В доступном контексте есть несколько разных веток с названием Pathway. Для этой задачи использовать только ветку **Pathway / Wynde UX Research Guide** — концепт/гайд по UX-исследованиям и немодерируемому тестированию. Не смешивать с отдельным Pathway-проектом про underbanked / first-time cardholders / banking / Taglish microcopy.

Отдельного финального файла со спеками, точным оглавлением и копирайтом в File Library не найдено. Ниже — консолидированный бриф из доступной памяти проекта + актуализированные технические ссылки.

## 1. Суть проекта

**Pathway / Wynde** — продуктовая концепция / платформа для удалённых, немодерируемых UX-исследований и опросов.

Ключевая идея продукта: сделать UX-исследования проще, доступнее и практичнее для дизайнеров, продактов и исследователей. В старом контексте Wynde описывался как платформа с:

- немодерируемыми UX-тестами;
- опросами;
- модульным конструктором исследований «как из кубиков»;
- интеграцией с Figma;
- AI-дорасспросами / AI follow-ups;
- мультиязычностью;
- дружелюбным, живым тоном команды.

Текущая задача — сверстать **UX Research Guide** / docs-like guide / long-form content system по дизайну в Figma. Figma будет подключена отдельно.

## 2. Цель гайда

Гайд должен быть не просто статьёй, а практичной системой обучения и справочником по UX-исследованиям, особенно по немодерируемым исследованиям.

Цели:

1. Помочь новичку пройти путь 0→1: понять метод, подготовить исследование, запустить его и интерпретировать результаты.
2. Дать опытным пользователям быстрый справочник: чек-листы, шаблоны, типовые ошибки, примеры.
3. Связать обучение с продуктом Pathway/Wynde: в каждом релевантном месте показывать, как сделать это внутри продукта.
4. Сохранить основной контент и структуру, но улучшить восприятие через навигацию, компоненты, callouts, шаблоны, sticky ToC и визуальную систему.
5. Сделать визуально сильный, читабельный, эстетичный кейс, понятный дизайнерам и продуктовым командам.

## 3. Аудитория

Основная аудитория:

- UX/UI и Product Designers;
- UX Researchers;
- Product Managers;
- небольшие продуктовые команды и стартапы;
- люди, которым нужно быстро запустить исследование без тяжелого research-процесса.

Важно: большинство аудитории — дизайнеры, поэтому визуальное качество, аккуратная типографика, rhythm, spacing, эстетика и сканируемость очень важны.

## 4. Позиционирование и тон

Тон:

- дружелюбный;
- экспертный, но не академичный;
- простой и понятный;
- практичный;
- живой, не «корпоративно-безликий»;
- уверенный, но допускающий неопределённость.

Брендовые принципы:

- **Playful** — легкость, человеческий тон, без сухого enterprise-языка.
- **Modular** — система собирается из блоков: chapters, cards, callouts, checklists, templates.
- **Simple with progressive disclosure** — сначала коротко и понятно, затем подробности / advanced.
- **Embraces uncertainty and human side** — исследования не всегда дают идеальные ответы; важно работать с неопределённостью.

## 5. Продуктовая логика гайда

Гайд должен иметь структуру:

**TL;DR → теория → как применить → как сделать в Pathway/Wynde → чек-лист / шаблон → связанные главы**

Для каждого метода желательно использовать паттерн:

**Method → When to use → How to run → Template → Common mistakes → How to run in Pathway/Wynde**

Примеры блоков:

- TL;DR summary;
- Step-by-step guide;
- Tip / Note / Warning callouts;
- Checklist;
- Template block;
- Quote / insight;
- “How to do this in Pathway”;
- “Next / related chapters”;
- “Common pitfalls”;
- CTA к продукту;
- links/resources.

## 6. Информационная архитектура

Точного финального оглавления в памяти не найдено, поэтому Codex не должен выдумывать окончательные названия глав, если они есть в репозитории или будут в Figma/контенте. Если точного оглавления нет, использовать нижнюю структуру как рабочую.

Рекомендуемый верхнеуровневый скелет:

1. Introduction / What is UX Research
2. Planning Research
3. Choosing a Method
4. Unmoderated Usability Testing
5. Writing Tasks & Questions
6. Recruiting Participants
7. Running the Study
8. Analyzing Results
9. Sharing Insights
10. Templates & Checklists
11. How to run this in Pathway/Wynde

Для портфолио-кейса ранее обсуждалась структура:

1. Hero: роль + артефакты desktop/mobile
2. Constraints + principles
3. Navigation + IA
4. Content components showcase
5. Illustration direction
6. Outcome + lessons learned

Но для текущей задачи, судя по запросу, важнее не кейс-страница, а верстка самого гайда/проекта по макетам.

## 7. UX/UI требования

### Навигация

Нужна docs-like навигация:

- desktop sidebar;
- sticky Table of Contents;
- active section state;
- indication “where I am now”;
- mobile TOC drawer / modal menu;
- keyboard accessibility;
- search flow handling, если в дизайне или репозитории есть поиск;
- next/previous chapter navigation;
- related chapters.

### Контентные компоненты

Нужна масштабируемая библиотека блоков:

- Article layout;
- Chapter header;
- Section heading;
- TL;DR card;
- Stepper / step-by-step block;
- Callout: Note / Tip / Warning / Advanced;
- Checklist;
- Template block;
- Example block;
- Quote block;
- Method card;
- Tag / badge;
- Related links;
- Next chapter;
- CTA block;
- “How to run in Pathway/Wynde”.

### Фильтры и теги

Ранее обсуждались теги/фильтры по:

- role;
- stage;
- format;
- level;
- material type.

Не внедрять фильтрацию, если её нет в Figma/репозитории, но заложить компонентно так, чтобы её можно было добавить.

### Типографика и ритм чтения

Требования:

- сильная, но спокойная иерархия;
- хорошая читабельность long-form текста;
- ограничение длины строки;
- много whitespace;
- ясные отступы между секциями;
- поддержка deep reading и scanning;
- аккуратные списки, цитаты, код/шаблоны;
- responsive поведение.

### Иллюстрации

Ранее был описан модульный illustration system:

- reusable shapes;
- единые stroke/grid rules;
- консистентная palette;
- иллюстрации должны снижать когнитивную нагрузку, а не быть декором;
- cover + inline visuals;
- схемы / фрагменты интерфейса / концептуальные диаграммы.

Если assets есть в Figma — использовать их. Если нет — оставить слоты/компоненты, не генерировать случайные иллюстрации без запроса.

## 8. Visual direction

Общее направление:

- clean docs-like system;
- карточки, бейджи, callouts, чек-листы;
- много воздуха;
- мягкие пастельные акценты;
- модульная сетка;
- визуальный язык «кубиков» / сборки;
- аккуратные состояния hover/focus/active;
- не перегружать UI.

Figma после подключения — source of truth для:

- spacing;
- colors;
- typography;
- components;
- breakpoints;
- assets;
- states.

## 9. Responsive requirements

Desktop:

- sidebar слева;
- content column по центру;
- sticky in-page ToC справа или согласно Figma;
- активная секция подсвечивается.

Tablet:

- sidebar может сворачиваться;
- content остается читабельным;
- ToC может уходить в collapsible block.

Mobile:

- no desktop sidebar;
- TOC через drawer/modal;
- sticky chapter nav допустим, если есть в дизайне;
- крупные tap targets;
- callouts/checklists не ломают ширину;
- таблицы/шаблоны должны скроллиться или адаптироваться.

## 10. Accessibility

Минимальные требования:

- semantic HTML: article, nav, aside, header, main;
- правильная структура heading h1–h3;
- aria-label для навигаций;
- visible focus;
- keyboard navigation;
- контраст текста и интерактивных элементов;
- не полагаться только на цвет;
- reduced-motion для анимаций;
- корректные alt для смысловых изображений;
- responsive без горизонтального скролла у всей страницы.

## 11. Контентные правила

Не переписывать основной текст без отдельной задачи. Сначала перенести/структурировать существующий контент. Можно дробить на блоки для читабельности, если это не меняет смысл.

Структура статьи:

- H1 + short intro;
- TL;DR;
- main sections;
- practical examples;
- callouts;
- checklist/template;
- Pathway/Wynde CTA;
- related/next.

## 12. Связь с продуктом Pathway/Wynde

В каждом релевантном разделе предусмотреть блок:

**How to do this in Pathway/Wynde**

Внутри:

- краткое объяснение сценария;
- 2–4 шага;
- ссылка/CTA на продукт или mock route;
- возможно мини-скрин/иллюстрация из Figma;
- если продукта/роутов ещё нет — сделать компонент с placeholder data, не хардкодить финальные ссылки.

## 13. Статус проекта и ограничения

По памяти проекта есть конфликт:

- с одной стороны, обсуждалась полноценная верстка гайда и объём около 90–100 часов, включая ~25 иллюстраций и вставку ~150k+ знаков;
- с другой стороны, проект отмечался как тестовый концепт, остановленный после тестовой части.

Для Codex трактовать текущую задачу как **реализацию текущего макета/концепта**, а не как обязательство финального релиза всего продукта.

## 14. Что НЕ включать

Не использовать контекст другого Pathway-проекта:

- underbanked users;
- first-time cardholders;
- freelancers/micro-entrepreneurs;
- Maya/Tonik/PlataCard/Vivid/Stripe/Finom/Monzo/Salmon/Klarna/Anna Money/N26 как банковский benchmarking;
- Taglish microcopy;
- security/regulatory compliance для финтех-карты.

Это другая ветка и не относится к Wynde UX Research Guide.

## 15. Технический workflow для Codex + Figma

### Figma MCP

Официально Figma поддерживает MCP server для передачи дизайн-контекста агентам. Для Codex можно подключить Figma Desktop MCP как Streamable HTTP server:

- Name: `figma-desktop`
- URL: `http://127.0.0.1:3845/mcp`
- Type: Streamable HTTP

Figma Desktop MCP включается в Figma Desktop через Dev Mode / `Shift + D` и Enable desktop MCP server. В актуальных доках Figma также говорит, что remote Figma MCP обычно предпочтительнее, а desktop server — для специфических org/enterprise use cases.

### Code Connect

Code Connect не обязателен для простой верстки по макету. Он полезен, если в проекте уже есть дизайн-система и нужно связать Figma-компоненты с реальными React/React Native/HTML/Web Components/SwiftUI/Compose-компонентами.

Если Code Connect не настроен:

- Codex всё равно может читать дизайн через MCP;
- нужно просить Codex сначала найти существующие компоненты в репозитории и переиспользовать их;
- не генерировать абстрактные компоненты поверх уже существующих.

### Codex config

Codex использует `~/.codex/config.toml` для пользовательской конфигурации и `.codex/config.toml` для project-scoped настроек в trusted project. MCP-сервера можно добавлять через UI/CLI или config.

## 16. Официальные ссылки для сетапа

- OpenAI Codex MCP: https://developers.openai.com/codex/mcp
- OpenAI Codex config reference: https://developers.openai.com/codex/config-reference
- OpenAI Codex config basics: https://developers.openai.com/codex/config-basic
- Figma MCP server guide: https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
- Figma desktop MCP local setup: https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- Codex and Figma MCP setup: https://help.figma.com/hc/en-us/articles/39888629089175-Codex-and-Figma-Set-up-the-MCP-server
- Figma Code Connect: https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect

## 17. Benchmark / reference links

Use as inspiration, not as copy source:

- Maze usability testing / moderated vs unmoderated: https://maze.co/guides/usability-testing/moderated-vs-unmoderated/
- Maze help: when to use unmoderated vs moderated testing: https://help.maze.co/articles/3959886432-when-should-i-use-unmoderated-vs-moderated-testing
- Lyssna UX research guide: https://www.lyssna.com/guides/ux-research/
- Lyssna unmoderated usability testing: https://www.lyssna.com/blog/unmoderated-usability-testing/
- Lyssna usability testing methods: https://www.lyssna.com/guides/usability-testing-guide/usability-testing-methods/
- Dovetail guides: https://dovetail.com/guides/
- Dovetail research repository: https://dovetail.com/research/what-is-a-research-repository/
- Optimal Workshop unmoderated usability testing checklist: https://www.optimalworkshop.com/blog/unmoderated-usability-testing-a-checklist

## 18. Prompt 1 — стартовый prompt для Codex

```text
Ты работаешь над проектом Pathway / Wynde UX Research Guide.

Контекст продукта:
Pathway/Wynde — концепция платформы для удалённых немодерируемых UX-исследований и опросов. Гайд должен быть docs-like системой обучения и справочником по UX-исследованиям для дизайнеров, UX researchers и product managers.

Цель задачи:
Сверстать UX Research Guide по дизайну из Figma. Figma — source of truth для визуала, spacing, typography, colors, components, states и responsive behavior. Репозиторий — source of truth для стека, роутинга, существующих компонентов, code style и data/content conventions.

Важное:
- Не смешивай с другим Pathway-проектом про banking/underbanked/cardholders. Это не он.
- Не переписывай основной контент без необходимости.
- Не выдумывай финальное оглавление, если оно уже есть в repo/Figma/content.
- Сначала изучи репозиторий и Figma selection через MCP, затем предложи план.
- Используй существующие компоненты и токены, если они есть.
- Если Code Connect настроен — используй mapped components. Если нет — найди аналоги в коде сам.
- Не генерируй случайные иллюстрации; используй assets из Figma или оставь корректные placeholders.

Нужный результат:
Responsive, accessible, pixel-close implementation of the guide with:
- desktop sidebar / docs navigation;
- sticky in-page ToC with active section state;
- mobile TOC drawer/menu;
- article/chapter layout;
- reusable content blocks: TL;DR, callouts, stepper, checklist, templates, quotes, related/next, CTA, “How to do this in Pathway/Wynde”;
- semantic HTML and keyboard/focus accessibility;
- clean component structure and maintainable content/data model.

Workflow:
1. Repo scan: determine stack, routes, package manager, style system, existing components, content format.
2. Figma scan: inspect selected frames/components via MCP; extract layout, tokens, states, breakpoints, assets.
3. Implementation plan: list files to create/change, components, risks, assumptions.
4. Implement in small cohesive patches.
5. Run lint/typecheck/tests/build if available.
6. Final report: what changed, commands run, remaining assumptions.

Do not start coding before repo/Figma scan and plan.
```

## 19. Prompt 2 — Figma-specific prompt

```text
Use the connected Figma MCP server to inspect the currently selected frame(s) for Pathway/Wynde UX Research Guide.

Extract:
- page/frame names;
- desktop/tablet/mobile layouts;
- typography scale;
- color tokens;
- spacing/grid rules;
- reusable components;
- variants/states;
- icons/illustrations/assets;
- exact dimensions that matter;
- responsive behavior implied by the frames.

Then map the design to the existing codebase:
- existing layout components;
- existing typography/tokens;
- existing card/callout/button/nav components;
- missing components to create.

Return a concise implementation plan before making code changes.
```

## 20. Prompt 3 — implementation prompt after plan approval

```text
Proceed with implementation of the approved plan.

Rules:
- Keep changes minimal and idiomatic for this repo.
- Prefer existing components/tokens over new abstractions.
- Create reusable content components only where repeated patterns exist.
- Keep content separate from layout where possible.
- Preserve accessibility: semantic HTML, aria labels for nav/drawer, visible focus, keyboard navigation, reduced motion.
- Match Figma visually as closely as possible without hardcoding brittle magic numbers everywhere.
- Ensure responsive behavior for desktop, tablet, mobile.

After implementation run available checks:
- install/build command only if dependencies are already present or repo docs say so;
- lint;
- typecheck;
- tests;
- build.

Report:
- files changed;
- components added;
- checks run and results;
- any assumptions or missing Figma/content data.
```

## 21. Prompt 4 — QA/review prompt

```text
Review the implementation critically against the Figma design and product context.

Check:
- visual fidelity: spacing, type, hierarchy, colors, layout;
- responsive behavior: desktop/tablet/mobile;
- navigation: sidebar, ToC, active states, mobile drawer;
- content components: TL;DR, callouts, steps, checklists, templates, related/next, CTA;
- accessibility: semantic structure, keyboard, focus, aria, contrast, reduced motion;
- code quality: reuse, component boundaries, duplication, brittle hardcoding;
- performance: unnecessary client JS, heavy assets, layout shift;
- product correctness: this is Pathway/Wynde UX Research Guide, not banking Pathway.

Return:
A) Issues by severity: blocker / major / minor
B) Suggested fixes
C) Files/locations
D) Whether implementation is ready to ship as a prototype
```

## 22. Prompt 5 — PRD-first / evidence workflow for Codex

```text
# PRD-FIRST WORKFLOW
Критически: Проверяемость > Скорость. Не выдумывай API/пакеты/методы.

## Общая дисциплина
- Сначала repo scan + Figma scan.
- Затем короткий PRD/implementation plan.
- Код только после плана.
- Любое важное утверждение о проекте подтверждай найденным файлом/кодом/Figma context или официальной документацией.
- Если данных недостаточно — явно напиши INSUFFICIENT DATA и сделай разумное предположение, если оно безопасно.

## PRD template
# Feature: Pathway/Wynde UX Research Guide implementation
## Problem
## Goals
## Non-Goals
## Target Users & Use-cases
## Scope In / Out of Scope
## UX Notes / Figma Frames
## Components / Data Model
## Accessibility Requirements
## Acceptance Criteria
## Risks & Assumptions
## Test Plan
## Change Log

## Output format
A) Analysis
B) Plan
C) Patch summary
D) Checks
E) Remaining uncertainties
```

## 23. Acceptance criteria

Implementation is acceptable when:

- layout matches Figma on desktop/tablet/mobile;
- docs navigation works;
- in-page ToC highlights current section or at least provides correct anchors;
- mobile navigation is usable;
- article content is readable and semantically structured;
- content blocks are reusable and data-driven enough for more chapters;
- no banking Pathway content leaked in;
- lint/typecheck/build pass or failures are documented with reasons;
- accessibility basics are covered.

## 24. Unknowns to fill before/while coding

Need from user / Figma / repo:

- Figma file/frame link or active selection through MCP;
- repository path/URL;
- target stack (unless repo makes it clear);
- exact content source: markdown, CMS, static data, existing copy;
- exact chapter list / route list;
- whether project is web code, Framer export, or another target;
- final assets/illustrations/icons;
- desired deployment target.

If these are missing, Codex should inspect what exists and proceed with safe placeholders only where necessary.
