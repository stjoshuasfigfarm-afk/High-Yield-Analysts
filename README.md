Jerome Jackson
Email: jerome.jackson.solutions@gmail.com
Site: high-yield-analysts.vercel.app
YouTube: @HighYieldAnalysts

The HY Analysts Terminal
The Analysis Terminal is a high-performance financial analytics dashboard built on a quantitative stack designed for low-latency synthesis. It is currently deployed as a no-npm index.html file to optimize for limited local hardware space.

Core Architecture: The "High-Yield Silo" Pattern
The backend is structured into three distinct layers to ensure efficient data orchestration and 100% uptime:

The Harvester: A specialized service layer that interfaces with institutional APIs, managing rate-limiting, error fallbacks, and data normalization.

The Engine: Powered by Next.js Server Actions, this layer acts as the orchestrator; it checks the Firestore Silo first and rehydrates data only if it is stale or missing.

The Intelligence Layer: Driven by Genkit and Claude 3.5 Sonnet to perform recursive synthesis of market trends.

Key Features & Components
Recursive Financial Synthesis: Utilizes AI agents to synthesize global trade data, supply chain topology, and market trends across bonds and stocks.

Modular Chassis: The UI is composed of modular panels, including a Topology Map (mapping company headquarters and employment data), the Analyst Terminal, and the Macro Corridor.

Real-Time Data Hooks: Custom hooks (useSiloPrice and useCollection) provide real-time listeners, ensuring the UI updates instantly when the backend rehydrates data.

Cloud Integration: Designed for Gemini CLI control, the system utilizes Firebase for database connectivity and real-time listeners.

Project File Structure
src/ai/: Contains Genkit configurations and server-side AI "Flows".

src/app/: Core Next.js App Router containing the main UI and Server Actions.

src/components/yield-terminal/: The modular "Chassis" components.

src/firebase/: Database connectors and real-time listeners.

src/lib/: Data structure definitions and mock data for session boots.
