// Single source of truth for the generated CV (PL + EN).
// Rendered to clean, selectable PDF via Chromium (see build.mjs) — NOT @react-pdf/renderer.
//
// PLACEHOLDERS still to fill:
//   [SYSTEM_11_SUBAGENTOW] — production multi-agent system (11 subagents): stack + description + impact.

const links = {
  email: 'markowski.mateusz.praca@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/mateusz-markowski-2b576114b',
  linkedinText: 'linkedin.com/in/mateusz-markowski',
  githubUrl: 'https://github.com/gronkil',
  githubText: 'github.com/gronkil',
}

export const pl = {
  lang: 'pl',
  name: 'Mateusz Markowski',
  title: 'Inżynier AI · systemy agentowe, MCP i orkiestracja LLM · Fullstack (Kotlin / React)',
  contact: { ...links, location: 'Warszawa' },
  labels: {
    profile: 'Profil',
    skills: 'Umiejętności',
    aiProjects: 'AI / systemy agentowe',
    experience: 'Doświadczenie zawodowe',
    languages: 'Języki',
    education: 'Wykształcenie',
    tech: 'Stack',
  },
  profile:
    'Inżynier AI z produkcyjnymi wdrożeniami GenAI w środowisku enterprise (firma z sektora ubezpieczeń): ' +
    'dostarczyłem Assistance AI — platformę GenAI dla ponad 1 000 użytkowników — w 11 dni, aplikację wyróżnioną ' +
    'w konkursie Rzeczpospolita Cyfrowa 2024; współtworzę serwer MCP (Model Context Protocol) zgodny z polityką ' +
    'bezpieczeństwa firmy oraz procesy ewaluacji i weryfikacji agentów. Fullstack (Kotlin/Spring, React/TypeScript) ' +
    'traktuję jako narzędzia — od architektur multi-agent systems i agentic workflows, przez LLM orchestration, ' +
    'po RAG, embeddingi i bazy wektorowe.',
  skills: [
    {
      group: 'Systemy agentowe i MCP',
      items: [
        'Multi-agent systems — orkiestrator, wyspecjalizowani subagenci, wzorzec ReAct',
        'MCP (Model Context Protocol) — projektowanie serwerów zgodnych z politykami bezpieczeństwa',
        'Agentic workflows — dekompozycja zadań, routing, agregacja wyników',
      ],
    },
    {
      group: 'Integracje LLM w produkcji',
      items: [
        'Claude (Claude Code), GPT / OpenAI API — integracje LLM w aplikacjach enterprise',
        'LLM orchestration — łączenie modeli, narzędzi i danych w spójne przepływy',
        'AI-SDLC: GitHub Copilot, Copilot Extensions — wdrożenia i warsztaty',
      ],
    },
    {
      group: 'Ewaluacja i testowanie agentów',
      items: [
        'Ewaluacja agentów (agent evaluation), automatyczne code review PR, ocena jakości odpowiedzi',
      ],
    },
    {
      group: 'RAG i dane',
      items: ['RAG, embeddingi, bazy wektorowe'],
    },
    {
      group: 'Backend',
      items: ['Kotlin, Spring Boot / WebFlux, REST API, SQL, RabbitMQ, architektura mikroserwisowa'],
    },
    {
      group: 'Frontend',
      items: ['React.js, TypeScript, JavaScript'],
    },
    {
      group: 'DevOps & QA',
      items: ['GitHub / Bitbucket, CI/CD, Selenium, Cucumber / BDD, JIRA, ISTQB'],
    },
    {
      group: 'Prompt engineering',
      items: ['Techniki promptowania dla agentów i RAG'],
    },
  ],
  aiProjects: [
    {
      name: 'Produkcyjny system wieloagentowy — 11 subagentów',
      tech: '[SYSTEM_11_SUBAGENTOW — uzupełnić stack]',
      bullets: [
        '[SYSTEM_11_SUBAGENTOW — UZUPEŁNIĆ: produkcyjny multi-agent system z 11 wyspecjalizowanymi subagentami; orkiestrator koordynujący subagentów i dzielący odpowiedzialności]',
        '[SYSTEM_11_SUBAGENTOW — UZUPEŁNIĆ: zastosowanie i efekt biznesowy, skala, stack (np. Kotlin/Spring, MCP, LLM)]',
      ],
    },
    {
      name: 'Echo-word — architektura multi-agent',
      tech: 'Kotlin',
      bullets: [
        'Własny orkiestrator (multi-agent system) delegujący zadania do wyspecjalizowanych subagentów',
        'Koordynacja agentów i dekompozycja odpowiedzialności — routing zadań i agregacja wyników (wzorzec zbliżony do ReAct)',
        'Dowód praktycznego projektowania agentic workflows i LLM orchestration',
      ],
    },
    {
      name: 'AI Agent — GitHub + JIRA + LLM',
      tech: 'Kotlin · Spring WebFlux · Llama 3 (Ollama) · GitHub API · JIRA API',
      bullets: [
        'Agent integrujący GitHub i JIRA z lokalnym modelem LLM (Llama 3 via Ollama)',
        'Automatyczne pobieranie PR-ów i tasków, budowa promptu i generowanie raportu ryzyka',
        'Architektura reactive (application / domain / infrastructure)',
      ],
    },
  ],
  experience: [
    {
      company: 'PZU',
      role: 'Specjalista – Projektant Programista',
      period: '09.2023 – obecnie',
      bullets: [
        'Assistance AI — bezpieczna platforma webowa integrująca API GenAI (LLM) dla pracowników PZU; dostarczona w 11 dni, ~1 000 użytkowników; aplikacja wyróżniona w konkursie Rzeczpospolita Cyfrowa 2024',
        'AI Ambassador (od 05.2025) — kształtuję strategię AI-SDLC w IT PZU; współtworzę serwer MCP (Model Context Protocol) zgodny z polityką bezpieczeństwa; prowadzę warsztaty z GitHub Copilot i asystentów AI',
        'Ewaluacja i weryfikacja agentów AI — skille do automatycznego code review (PR) oraz oceny jakości odpowiedzi agentów; program transferu wiedzy o AI',
        'Zbudowałem platformę Developer Experience mierzącą efektywność narzędzi deweloperskich w organizacji',
        'Dług technologiczny (Dept) — system analizujący zależności wszystkich modułów z integracją repozytoriów; scoring ryzyka i wskaźniki DORA per repozytorium',
        'CRA (Centralna Rejestracja Aplikacji) — centralny rejestr systemów IT zbudowany od zera (React.js + Kotlin); automatyzacja onboardingu serwisów i powiązań',
        'Utrzymanie i rozwój architektury mikroserwisowej (Kotlin), pipeline’ów CI/CD i integracji w środowisku enterprise',
      ],
    },
    {
      company: 'PZU',
      role: 'Młodszy Programista',
      period: '03.2021 – 09.2023',
      bullets: [
        'Rozbudowałem framework testów automatycznych (Cucumber + Java) używany przez kilkanaście zespołów — skróciłem czas, jaki zajmuje konfiguracja nowego scenariusza, o ~60%',
        'Zaprojektowałem mikroserwis do generowania danych testowych (Kotlin) — czas przygotowania środowisk z godzin do minut',
        'Utrzymywałem panel webowy (React.js) do monitorowania i mutacji danych testowych — używany codziennie przez QA i deweloperów',
        'Integracje przez REST API, SQL i RabbitMQ; procesy CI/CD w Bamboo',
      ],
    },
    {
      company: 'PZU Życie SA',
      role: 'Specjalista Testów Automatycznych',
      period: '08.2017 – 02.2021',
      bullets: [
        'Testy E2E (Selenium + Java) pokrywające krytyczne ścieżki biznesowe systemów ubezpieczeniowych',
        'Onboarding i szkolenie nowych inżynierów QA (4 osoby)',
        'Zarządzanie backlogiem defektów w JIRA; analiza scenariuszy testowych z biznesem',
      ],
    },
  ],
  languages: [
    { language: 'Polski', level: 'ojczysty' },
    { language: 'Angielski', level: 'techniczny' },
  ],
  interestsLine: 'Zainteresowania: generatywna AI, systemy multi-agent, gry planszowe.',
  education: [
    { degree: 'Technik Informatyk', school: 'Zespół Szkół Elektronicznych i Licealnych', location: 'Warszawa' },
  ],
}

export const en = {
  lang: 'en',
  name: 'Mateusz Markowski',
  title: 'AI Engineer · agentic systems, MCP & LLM orchestration · Fullstack (Kotlin / React)',
  contact: { ...links, location: 'Warsaw, Poland' },
  labels: {
    profile: 'Profile',
    skills: 'Skills',
    aiProjects: 'AI / Agentic Systems',
    experience: 'Experience',
    languages: 'Languages',
    education: 'Education',
    tech: 'Stack',
  },
  profile:
    'AI Engineer with production GenAI deployments in enterprise (insurance sector): ' +
    'delivered Assistance AI — a GenAI platform for 1,000+ users — in 11 days, an application recognized ' +
    'in the Rzeczpospolita Cyfrowa 2024 awards; co-building an MCP (Model Context Protocol) server compliant ' +
    'with the company security policy, plus agent evaluation and verification processes. Fullstack ' +
    '(Kotlin/Spring, React/TypeScript) is my toolset — from multi-agent systems and agentic workflows, ' +
    'through LLM orchestration, to RAG, embeddings and vector databases.',
  skills: [
    {
      group: 'Agentic systems & MCP',
      items: [
        'Multi-agent systems — orchestrator, specialized subagents, ReAct pattern',
        'MCP (Model Context Protocol) — designing servers compliant with security policies',
        'Agentic workflows — task decomposition, routing, result aggregation',
      ],
    },
    {
      group: 'Production LLM integration',
      items: [
        'Claude (Claude Code), GPT / OpenAI API — LLM integrations in enterprise apps',
        'LLM orchestration — combining models, tools and data into coherent flows',
        'AI-SDLC: GitHub Copilot, Copilot Extensions — rollouts and workshops',
      ],
    },
    {
      group: 'Agent evaluation & testing',
      items: ['Agent evaluation, automated PR code review, response-quality assessment'],
    },
    {
      group: 'RAG & data',
      items: ['RAG, embeddings, vector databases'],
    },
    {
      group: 'Backend',
      items: ['Kotlin, Spring Boot / WebFlux, REST API, SQL, RabbitMQ, microservice architecture'],
    },
    {
      group: 'Frontend',
      items: ['React.js, TypeScript, JavaScript'],
    },
    {
      group: 'DevOps & QA',
      items: ['GitHub / Bitbucket, CI/CD, Selenium, Cucumber / BDD, JIRA, ISTQB'],
    },
    {
      group: 'Prompt engineering',
      items: ['Prompting techniques for agents and RAG'],
    },
  ],
  aiProjects: [
    {
      name: 'Production multi-agent system — 11 subagents',
      tech: '[SYSTEM_11_SUBAGENTOW — fill in stack]',
      bullets: [
        '[SYSTEM_11_SUBAGENTOW — FILL IN: production multi-agent system with 11 specialized subagents; orchestrator coordinating subagents and splitting responsibilities]',
        '[SYSTEM_11_SUBAGENTOW — FILL IN: use case and business impact, scale, stack (e.g. Kotlin/Spring, MCP, LLM)]',
      ],
    },
    {
      name: 'Echo-word — multi-agent architecture',
      tech: 'Kotlin',
      bullets: [
        'Custom orchestrator (multi-agent system) delegating tasks to specialized subagents',
        'Agent coordination and responsibility decomposition — task routing and result aggregation (ReAct-like pattern)',
        'Evidence of hands-on agentic workflows and LLM orchestration design',
      ],
    },
    {
      name: 'AI Agent — GitHub + JIRA + LLM',
      tech: 'Kotlin · Spring WebFlux · Llama 3 (Ollama) · GitHub API · JIRA API',
      bullets: [
        'Agent integrating GitHub and JIRA with a local LLM (Llama 3 via Ollama)',
        'Automatically fetches PRs and tasks, builds a prompt and generates a risk report',
        'Reactive architecture (application / domain / infrastructure)',
      ],
    },
  ],
  experience: [
    {
      company: 'PZU',
      role: 'Specialist – Software Designer / Developer',
      period: '09.2023 – present',
      bullets: [
        'Assistance AI — secure web platform integrating external GenAI (LLM) APIs for PZU employees; delivered in 11 days, ~1,000 users; application recognized in the Rzeczpospolita Cyfrowa 2024 awards',
        'AI Ambassador (since 05.2025) — shaping the AI-SDLC strategy across PZU IT; co-building an MCP (Model Context Protocol) server compliant with security policy; running GitHub Copilot and AI-assistant workshops',
        'Agent evaluation and verification — skills for automated PR code review and agent response-quality assessment; AI knowledge-transfer program',
        'Built a Developer Experience platform measuring the effectiveness of developer tooling across the organization',
        'Technical Debt (Dept) — system analyzing dependencies across all modules with repository integration; risk scoring and DORA metrics per repository',
        'CRA (Central Application Registry) — built from scratch a central IT system registry (React.js + Kotlin); automated service onboarding and relationships',
        'Maintained and evolved microservice architecture (Kotlin), CI/CD pipelines and integrations in an enterprise environment',
      ],
    },
    {
      company: 'PZU',
      role: 'Junior Developer',
      period: '03.2021 – 09.2023',
      bullets: [
        'Extended an automated testing framework (Cucumber + Java) used by a dozen+ teams — cut new-scenario setup time by ~60%',
        'Designed a test-data generation microservice (Kotlin) — reduced environment prep from hours to minutes',
        'Maintained a React.js web dashboard for monitoring and mutating test data, used daily by QA and developers',
        'Integrations via REST API, SQL and RabbitMQ; CI/CD processes in Bamboo',
      ],
    },
    {
      company: 'PZU Życie SA',
      role: 'Automated Testing Specialist',
      period: '08.2017 – 02.2021',
      bullets: [
        'E2E tests (Selenium + Java) covering critical business paths of insurance systems',
        'Onboarded and trained new QA engineers (4 people)',
        'Managed the defect backlog in JIRA; analyzed test scenarios with business stakeholders',
      ],
    },
  ],
  languages: [
    { language: 'Polish', level: 'native' },
    { language: 'English', level: 'technical / working' },
  ],
  interestsLine: 'Interests: generative AI, multi-agent systems, board games.',
  education: [
    { degree: 'IT Technician', school: 'Zespół Szkół Elektronicznych i Licealnych', location: 'Warsaw' },
  ],
}

export const documents = { pl, en }
