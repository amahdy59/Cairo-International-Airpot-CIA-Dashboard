# Cairo International Airport (CIA) Command Hub

An enterprise-grade, highly scalable Operations & Safety Dashboard designed for airport managers. This project provides a real-time, bird's-eye view of passenger flow, flight movements, safety checks, and aircraft maintenance priorities.

## 📖 Table of Contents
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Tech Stack & Libraries](#tech-stack--libraries)
- [UX & UI Design Principles](#ux--ui-design-principles)
- [Developer Guidelines](#developer-guidelines)
- [Setup & Scripts](#setup--scripts)

---

## 🏗 Architecture & Folder Structure

The application is built using a **Feature-Sliced Design (FSD)** approach to ensure scalability and maintainability as the application grows. Rather than grouping files by type (e.g., all components together, all hooks together), files are grouped by their respective domain or feature.

```text
src/
├── components/          # Shared, global UI components
│   ├── command-center/  # Reusable widgets (MetricCards, SectionPanels)
│   └── layout/          # Global layout wrappers (Header, ErrorBoundary)
├── context/             # React Context providers (e.g., LocaleContext)
├── features/            # Feature-sliced domain modules
│   ├── digital-twin/    # Airport spatial mapping & live flights
│   ├── operations/      # Passenger influx and ground flow metrics
│   └── safety/          # Alert aging, maintenance, and risk tracking
├── hooks/               # Global custom React hooks (e.g., useAnimatedNumber)
├── utils/               # Helper functions (localization, tone mappers)
├── App.tsx              # Main orchestrator and layout router
├── data.ts              # Centralized mock data, schemas, and types
└── styles.css           # Tailwind configuration and custom CSS variables
```

---

## 🛠 Tech Stack & Libraries

- **Core:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS v4 (using the new inline `@theme` configuration)
- **Icons:** `lucide-react` (Lightweight, consistent SVG icons)
- **Data Integration:** 
  - `AviationStack API` for live flight tracking.
  - Built-in graceful degradation: Automatically falls back to high-fidelity mocked data if the API is unreachable or rate-limited.
- **Charts:** Custom-built React SVGs (e.g., `ForecastLineChart`, `Sparkline`) for maximum performance and highly specific styling without heavy charting library overhead.

---

## 🎨 UX & UI Design Principles

This dashboard was designed with a focus on **Cognitive Load Reduction**, **Accessibility**, and **Action-Oriented Workflows**.

### 1. Accessibility & Internationalization First
- **True RTL Support:** Full English (LTR) and Arabic (RTL) bidirectional support deeply integrated into the layout using logical CSS properties (e.g., `ml-`, `mr-` replaced with `start-`, `end-`).
- **High Contrast Mode:** A dedicated toggle that strips out low-contrast backgrounds and enforces WCAG AA compliant text colors for visually impaired users or brightly lit environments.
- **Dark/Light Themes:** Fully integrated semantic color tokens adapting to user system preferences.

### 2. Action-Oriented UX Writing
- We avoid passive, descriptive text (e.g., *"Security pressure building"*).
- We use prescriptive, command-driven alerts (e.g., *"Open 2 secondary lanes immediately"*) so managers can make decisions instantly without second-guessing the required action.
- All "Mock/Sample" developer tags are hidden in production, replaced with contextual states like "Offline Mode".

### 3. Visual Depth & Micro-Animations
- **Glassmorphism:** Strategic use of `backdrop-blur` and `oklch` color mixing for a premium, lightweight feel.
- **Depth (Dark Mode):** Instead of flat blacks, dark mode utilizes layered `box-shadows` and translucent inner borders (`rgba(255,255,255,0.05)`) to create a physical, tactile sense of elevation.
- **Dynamic Interactions:** Custom hooks like `useAnimatedNumber` provide a satisfying "count up" effect on mount, while subtle `group-hover` Tailwind classes scale up cards and bloom shadows dynamically.

---

## 🧑‍💻 Developer Guidelines

If you are contributing to this project, please adhere to the following best practices:

1. **Performance (React.memo):** 
   Complex SVGs (like `ForecastLineChart` and `Sparkline`) and expensive visual widgets must be wrapped in `React.memo()`. This prevents the entire dashboard from re-rendering when a parent component (like the clock) ticks every 30 seconds.
2. **Graceful Failures (Error Boundaries):**
   Every major feature module (`<DigitalTwinView />`, `<OperationsView />`, etc.) must be wrapped in `<ErrorBoundary>`. If an API payload malforms or a chart crashes, the rest of the dashboard must remain perfectly functional.
3. **Adding New Features:**
   Do not dump components into the global `/components` folder. Create a new directory inside `/features/` (e.g., `/features/baggage/`) and encapsulate the logic, sub-components, and specific hooks there.

---

## 🚀 Setup & Scripts

```bash
# Install dependencies
npm install

# Start the local development server (Vite)
npm run dev

# Build for production
npm run build
```
