# PORTELYX

### A Financial Decision Twin that learns from the futures you choose.

PORTELYX helps people rehearse financial decisions before making them.

Instead of simply answering questions like:

> “Can I afford a R15,000 laptop?”

PORTELYX creates alternative financial futures, simulates what happens in each one, stress-tests them against unexpected events, identifies where each option breaks, and helps the user understand which decision is more resilient.

The goal is not just to predict money.

It is to let people **experience the financial consequences of a decision before living through them.**

---

## The Problem

Traditional budgeting and financial tools mainly tell users:

- what they spent
- how much money they have
- whether they are over budget
- what may happen based on a forecast

But real financial decisions are more complicated.

A purchase may look affordable today and still leave someone dangerously exposed to an emergency, income interruption, or unexpected expense next month.

PORTELYX asks a different question:

**What happens to my financial future if I make this decision?**

---

## The Financial Decision Twin

PORTELYX creates a working model of the user's financial situation and uses it to rehearse decisions.

Its core decision loop is:

**MODEL → ASK → FORK → SIMULATE → STRESS → COMPARE → SCORE → FIND BREAKPOINT → DECIDE → OBSERVE → REPLAY → LEARN → NEXT DECISION**

For a decision such as buying a laptop, PORTELYX can create futures such as:

- Buy now
- Wait
- Don't buy
- Finance the purchase

Each future is calculated separately and can then be stress-tested.

---

## Core Features

### Alternate Financial Futures

PORTELYX forks a decision into multiple possible timelines and compares their financial consequences.

### Financial Chaos Mode

Users can introduce real-world shocks such as:

- temporary income loss
- emergency expenses
- delayed income
- increased living costs

PORTELYX then recalculates the future under those conditions.

### Decision Resilience Score

Instead of judging a decision only by whether it is affordable today, PORTELYX measures how well that decision survives financial pressure.

### Breakpoint Search

PORTELYX identifies the point at which a decision stops being financially resilient.

This can answer questions such as:

- At what purchase price does this become unsafe?
- How long should I wait?
- How much should I save first?

### Path to Yes

PORTELYX does not only say “no.”

When a decision is currently too risky, it can determine what would need to change to make it safer.

### Regret Replay

Users can revisit past financial decisions and compare what actually happened with an alternative timeline.

For example:

**What would my cash position look like today if I had not made that purchase six months ago?**

The comparison remains transparent about what it can and cannot measure, such as the usefulness or personal value received from a purchase.

### Surplus Survival

PORTELYX can test whether spare money can safely be invested while still protecting the user's financial resilience.

### Adaptive Twin

The Financial Decision Twin can learn from decisions and outcomes over time, allowing future simulations to become more relevant to the user's evolving financial situation.

---

## AI + Deterministic Financial Simulation

PORTELYX deliberately separates language intelligence from financial calculation.

> **AI understands the decision. PORTELYX calculates the future.**

AI is used to:

- understand natural-language financial questions
- determine the user's intended scenario
- explain simulation results
- help users compare alternatives
- translate complex financial outcomes into understandable guidance

The deterministic financial engine performs the actual calculations.

This prevents the language model from inventing balances, projections, resilience scores, or financial outcomes.

PORTELYX currently supports an AI provider fallback chain:

**Groq → Gemini → OpenAI → graceful unavailable state**

---

## Example

A user asks:

> “Should I buy a car now or wait 12 months?”

PORTELYX can:

1. Model the user's current financial position.
2. Create a **Buy Now** future.
3. Create a **Wait 12 Months** future.
4. Simulate both.
5. Compare their cash positions.
6. Stress-test the preferred option.
7. Introduce a scenario such as a 30% income reduction for three months.
8. Calculate whether the decision survives.
9. Show the lowest cash balance and potential shortfall.
10. Explain which option is more resilient and why.

The user can therefore evaluate not only:

**“Can I afford it?”**

but:

**“What happens to me if life goes wrong after I buy it?”**

---

## Architecture

```text
User
  │
  ▼
PORTELYX Web Interface
  │
  ▼
PORTELYX API
  │
  ├── Decision Twin Engine
  ├── Scenario Engine
  ├── Resilience Analysis
  ├── Breakpoint Search
  ├── Regret Replay
  ├── Adaptive Memory
  │
  ├── AI Interpretation Layer
  │     ├── Groq
  │     ├── Gemini
  │     └── OpenAI
  │
  └── Financial Data / Account Layer
```

The frontend is built separately from the financial simulation and API layer so deterministic calculations remain controlled by PORTELYX rather than generated by an LLM.

---

## Technology

### Frontend

- React
- TypeScript
- Vite
- Responsive web interface

### Backend

- Python
- FastAPI
- Pydantic
- HTTPX
- PyJWT

### Cloud

PORTELYX uses AWS infrastructure for its production backend and cloud deployment.

The production API is deployed using **AWS Elastic Beanstalk** on Amazon Linux with Nginx and an ASGI application server configuration.

### Financial Data

PORTELYX includes financial account/data integration architecture and Yodlee provider support.

### AI

- Groq
- Google Gemini
- OpenAI

### Alexa+

PORTELYX includes architecture for Alexa+ integration through MCP and OAuth/PKCE flows, enabling the Financial Decision Twin to eventually become conversational across compatible Alexa experiences.

---

## Privacy and Safety

Financial decisions can be high-impact.

PORTELYX is designed as a **decision-support and simulation tool**, not a replacement for professional financial advice.

Key design principles include:

- deterministic calculations for financial projections
- clear separation between AI explanation and financial computation
- transparent assumptions
- user control over decisions
- no autonomous movement or investment of real money
- explicit acknowledgement of factors a simulation cannot quantify

---

## Current Status

PORTELYX currently includes:

- Financial Decision Twin
- scenario generation
- alternative financial timelines
- resilience analysis
- breakpoint discovery
- Path to Yes
- Financial Chaos Mode
- Regret Replay
- adaptive decision memory
- financial profile tools
- statement parsing
- account connection architecture
- PORTELYX AI
- MCP architecture
- OAuth/PKCE architecture
- responsive web interface
- production AWS backend

---

## Hackathon

Built for the **Amazon Build, Ship, Shape 2026** hackathon.

PORTELYX is being developed for the **Alexa+ track** and **AWS Builder Mini Challenge**.

---

## Vision

Most financial software records the past.

Some financial software predicts the future.

**PORTELYX lets you rehearse it.**

Before making a major financial decision, users should be able to explore:

**What if I do it?**

**What if I wait?**

**What if something goes wrong?**

**What would make this decision safe?**

And eventually:

**What did my past decisions teach my Financial Decision Twin about the next one?**

---

## Author

**Lerato Mokgatla**

PORTELYX © 2026
---

## Live Application

**Try PORTELYX:** https://portelyx.vercel.app

**Source code:** https://github.com/sharmainelerato-glitch/Portelyx

PORTELYX has a deployed React frontend and a production FastAPI backend hosted on AWS Elastic Beanstalk.

The backend is served through Amazon CloudFront:

https://d6zmnirfl058n.cloudfront.net

The application includes an interactive Financial Decision Twin, an AI-assisted financial workspace, and a live MCP Simulator.

---

## MCP Integration and Interactive Simulator

PORTELYX exposes its financial capabilities through a Model Context Protocol (MCP) server.

The backend includes:

- An authenticated MCP endpoint.
- OAuth-based access-token handling.
- 13 registered MCP tools.
- MCP initialization and tool discovery.
- Tool execution through MCP `tools/call`.
- An interactive web-based MCP Simulator.
- A synthetic financial profile for demonstration.
- Financial simulation results returned through the MCP workflow.

### How the MCP Simulator Works

1. Open PORTELYX.
2. Navigate to **MCP Simulator**.
3. Choose a financial scenario.
4. Run the simulation.
5. Review the resulting financial metrics.
6. Inspect the MCP tool activity and response.
7. Compare the simulated outcome without changing the original Financial Twin.

### Verified Demo Scenario

A simulated increase of R3,000 in monthly expenses produces:

| Metric | Result |
|---|---:|
| Monthly income | R32,000 |
| Monthly expenses | R24,500 |
| Monthly surplus | R7,500 |

This scenario was tested successfully against the deployed production backend.

### Alexa+ Track

PORTELYX is designed around an Alexa+-oriented conversational financial experience.

For the hackathon, the web-based MCP Simulator demonstrates real MCP protocol interaction without requiring an Alexa+ device or claiming a direct Alexa+ runtime connection.

---

## Multilingual Experience

PORTELYX includes a multilingual interface designed to make financial decision tools more accessible across different regions.

The application includes:

- A language-selection system.
- Regional translation dictionaries.
- Support for African and international language options.
- English fallback when a translation is unavailable.
- Multilingual AI conversation capabilities.

Translation coverage varies by language. Some interface strings continue to use English fallback while additional translations are developed and reviewed.

---

## Expanded Financial Workspace

PORTELYX includes the following workspace capabilities:

### Decision Twin

Compare buying now, waiting, and financing a purchase through deterministic financial simulations.

Review:

- Decision Resilience Scores.
- Financial stress-test survival.
- Ending and minimum cash balances.
- Financing costs.
- Breakpoints and Path to Yes.

### Goal Builder

Create and explore financial goals using the application's goal-planning capabilities.

### Financial Profile and Setup

PORTELYX provides financial-profile setup workflows, including manual entry and statement-based setup.

### Profile and Settings

The application includes dedicated Profile and Settings pages for managing the user experience.

### Legal and Information Pages

PORTELYX also provides:

- Privacy Policy.
- Terms and Conditions.
- Financial Disclaimer.
- Contact page.

---

## Production Deployment

### Frontend

- React, TypeScript and Vite.
- Hosted on Vercel.
- Connected to the PORTELYX GitHub repository.

### Backend

- Python and FastAPI.
- AWS Elastic Beanstalk.
- Python 3.14 on Amazon Linux 2023.
- Gunicorn with Uvicorn workers.
- Nginx.
- Amazon CloudFront.

The production backend deployment was updated to `portelyx-v3` on 9 October 2026.

### Verified Production Tests

The following checks were completed successfully:

- Frontend production build.
- GitHub deployment.
- MCP Simulator interface availability.
- Backend API availability.
- MCP Simulator endpoint discovery.
- Live MCP financial simulation.
- Decision Twin financial calculations.

These checks demonstrate the working deployed features; they do not constitute a complete security or production-readiness audit.

---

## Updated Architecture

```text
USER
  |
  v
PORTELYX WEB APPLICATION
React + TypeScript + Vite
Hosted on Vercel
  |
  +-- Financial Decision Twin
  +-- Goal Builder
  +-- Financial Profile
  +-- PORTELYX AI
  +-- Multilingual Interface
  +-- MCP Simulator
  |
  v
AMAZON CLOUDFRONT
  |
  v
AWS ELASTIC BEANSTALK
FastAPI + Gunicorn + Uvicorn
  |
  +-- Deterministic Financial Engines
  |     +-- Decision Simulation
  |     +-- Financial Stress Testing
  |     +-- Resilience Scoring
  |     +-- Breakpoint Analysis
  |     +-- Goal Intelligence
  |     +-- Decision Memory
  |
  +-- AI Interpretation Layer
  |
  +-- Authenticated MCP Server
        +-- MCP Tool Discovery
        +-- MCP Tool Execution
        +-- Financial Scenario Simulation
        +-- Synthetic Demo Profile

```

The AI interpretation layer and deterministic financial engines remain separate. Financial decisions remain under human control.

---

## Demo Guide for Hackathon Judges

1. Visit https://portelyx.vercel.app.
2. Explore the Financial Decision Twin.
3. Compare buying now, waiting and financing.
4. Review resilience scores and stress-test results.
5. Open the MCP Simulator.
6. Run a financial scenario using the synthetic demo profile.
7. Inspect the returned financial metrics and MCP tool activity.
8. Explore the multilingual interface and additional workspace features.

PORTELYX is a financial decision-support prototype. Simulated outcomes are not guarantees or personalized professional financial advice.
