# Open-Source E-Commerce Automation Boilerplate

This repository showcases a production-ready, highly resilient automated test suite and architecture framework designed for e-commerce and scheduling applications. 

The core target architecture mimics a modern corporate WordPress and WooCommerce ecosystem, utilizing **Playwright + TypeScript** to evaluate critical user journeys, dynamic content generation, and multi-lingual shopping mechanics.

## 📁 Repository Architecture & Coverage Specs

The documentation files in `specs/` map out comprehensive QA coverage matrices across high-value business flows:

- **[Public Website Test Plan](./shop-smoke-test-plan.md):** Outlines non-destructive, read-only checks across the primary landing layout, contextual informational paths, cart summaries, and regulatory compliance blocks.
- **[Shop & Catalog Test Plan](./shop-smoke-test-plan.md):** Governs state-driven assertions on dynamic inventory catalog states, variant selection grids, and end-to-end shopping cart payload verification.

*Note: These specifications represent an enterprise QA roadmap; live execution coverage focuses on high-impact smoke and regression endpoints.*

## ⚙️ Automated Test Suite Manifest

The execution scripts in `tests/` demonstrate modular, highly adaptive programmatic browser automation:

- **`shop.spec.ts`:** Implements an algorithmic web crawler that parses category routes, verifies layout boundaries, and validates deterministic inventory logic (e.g., validating that out-of-stock items naturally mask cart triggers and display context-appropriate fallback links). It randomly selects available items to execute clean addition, verification, and automated cart-teardown flows.
- **`booking.spec.ts`:** Executes dynamic content detection rules against inline booking widgets, iframes, and fallback accessibility strings to verify scheduling availability.
- **`frontend.spec.ts`:** Validates authenticated interface layers, ensuring secure dashboard components and administrative session visibility render as intended.
- **`auth.setup.ts`:** Manages secure global session state token storage via isolated browser context structures, pulling local environment keys from encrypted environments or `.env` files.
- **`seed.spec.ts`:** Provides a structural interface hook intended for upstream database hydration, enabling future backend API state injections.

## 🛠️ Infrastructure & Execution Topology

The framework is configured via `playwright.config.ts`, which sets target routing properties, sandboxes parallel test workers, and orchestrates localized project dependencies. 

The core test suites depend heavily on `auth.setup.ts`, allowing individual test specs to execute across authenticated sessions instantly without incurring redundant login time overhead. The project structure is optimized to run locally or integrate seamlessly into remote remote environments.
