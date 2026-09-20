# 📊 CausalLens

**An Experimentation & Causal Impact Analysis Platform**

CausalLens is a full-stack statistical decision platform that automatically routes any "did this change actually work?" question to the correct method — proper A/B testing when randomization was possible, causal inference when it wasn't — instead of leaving that judgment call to the user.

🔗 **Live Demo:** [causal-lens-pearl.vercel.app](https://causal-lens-pearl.vercel.app/)
🔗 **Backend API Docs:** [causallens-backend.onrender.com/docs](https://causallens-backend.onrender.com/docs)

> ⚠️ The backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. The **first** request after idle time can take 30–60 seconds while it wakes up — this is expected, not a bug.

---

## Why this exists

Most "A/B testing" portfolio projects stop at a single t-test on a toy dataset. In practice, teams constantly face a harder question: **"Did this change actually cause the result we're seeing?"** — and the right method to answer that depends entirely on *how* the change was rolled out:

- Could you randomize who got it? → Run a proper experiment.
- Rolled out to everyone at once? → You need causal inference, not a t-test.
- Have a comparable group that didn't get it? → Different method again.

CausalLens doesn't just implement the formulas for these methods — it **reasons about which one applies**, using a guided Decision Router, and backs every result with ground-truth validation, assumption checks, and a plain-English AI explanation layer.

---

## 🧭 Core Feature: The Decision Router

Rather than asking the user to already know whether they need Difference-in-Differences or Propensity Score Matching, CausalLens asks a short sequence of plain-language questions:

```
Was treatment randomized?
        │
   ┌────┴────┐
  Yes         No
   │           │
Early stop?   Comparable control group over time?
   │           │
Sequential    ┌──┴──┐
or Bayesian  Yes    No
              │      │
             DiD   Known confounders?
                     │
                 ┌───┴───┐
                Yes      No
                 │        │
                PSM   CausalImpact
```

It then explains **why** that method fits the situation, and takes you directly to the matching tool — turning the project from "7 implemented formulas" into a statistical reasoning engine.

---

## 🧪 Experimentation Engine (randomization possible)

| Method | What it solves |
|---|---|
| **Power Analysis** | Required sample size before running a test, given a baseline rate and minimum detectable effect |
| **Bayesian A/B Testing** | Posterior probability that B beats A, with credible intervals — an intuitive alternative to p-values (built with PyMC) |
| **Sequential Testing (SPRT)** | Lets you check results *while a test is running* without inflating the false-positive rate — solves the "peeking problem" |
| **Multiple-Testing Correction** | Benjamini-Hochberg correction for when 5+ metrics are checked at once — prevents false "wins" from multiple comparisons |

## 📈 Causal Impact Engine (randomization not possible)

| Method | What it solves |
|---|---|
| **Difference-in-Differences** | Isolates a treatment effect using a comparable control group observed over the same before/after period. Includes an automatic **parallel-trends warning** if pre-period trends diverge too much. |
| **Propensity Score Matching** | Matches treated and untreated units on observable confounders when no clean control group exists. Includes a **covariate balance table** showing before/after matching diagnostics. |
| **CausalImpact** | For a single time series with no control group at all — builds a Bayesian structural time-series counterfactual (implemented from scratch on `statsmodels`, since the standard `pycausalimpact` library is unmaintained and incompatible with modern pandas). |

---

## ✨ Beyond the core methods

- **Bring your own data** — every causal module accepts a CSV upload with dynamic column mapping and plain-language hints (e.g., *"The column that shows who got the change vs. who didn't"*), so a non-technical user isn't blocked by not knowing statistical terminology.
- **AI Insights (Gemini-powered)** — every result card has a "Get AI Insights" button that explains the output in plain business language, flags caveats (e.g. a parallel-trends warning), and supports follow-up questions as a threaded conversation.
- **Ground-truth validation** — DiD, PSM, and CausalImpact are all covered by `pytest` tests that check the methods recover a *known, simulated* treatment effect, not just that they run without crashing.
- **Real-data validation** — the platform was validated against the real, 64K-row [Hillstrom Customer Retention dataset](https://www.kaggle.com/datasets/davinwijaya/customer-retention) (Kaggle), including a **deliberately confounded** version of it (only keeping high-spend treated customers) to prove PSM still recovers the true effect within ~1 percentage point even when randomization is broken.

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌──────────────────────────┐
│   React Frontend     │  REST   │   FastAPI Backend         │
│   (Vercel)           │ ──────> │   (Render)                │
│                       │  JSON   │                           │
│  - Decision Router    │ <────── │  - Power Analysis         │
│  - 7 tool tabs        │         │  - Bayesian A/B (PyMC)    │
│  - CSV upload         │         │  - Sequential Test        │
│  - AI chat threads    │         │  - Multiple Testing       │
└─────────────────────┘         │  - Diff-in-Differences    │
                                  │  - Propensity Matching    │
                                  │  - CausalImpact           │
                                  │  - Gemini AI Interpreter  │
                                  └──────────────────────────┘
```

**Backend:** Python, FastAPI, `scipy.stats` / `statsmodels` (hypothesis testing, power analysis, DiD, structural time series), PyMC (Bayesian inference), scikit-learn (propensity score matching), Google Gemini API (plain-language result interpretation), pytest (ground-truth validation)

**Frontend:** React (Vite), Tailwind CSS, Recharts (CausalImpact visualization), PapaParse (CSV parsing), Axios

**Deployment:** Backend on Render (free tier), Frontend on Vercel (free tier), connected via environment-variable configuration — no secrets committed to the repo

---

## 📸 Screenshots

<img width="1915" height="815" alt="image" src="https://github.com/user-attachments/assets/7afb8d40-820c-43f9-b7bf-6df8b9b478ca" />
<img width="1916" height="836" alt="image" src="https://github.com/user-attachments/assets/761330bb-b87a-4a05-8f6c-5eaf4e5d5686" />
<img width="1437" height="828" alt="image" src="https://github.com/user-attachments/assets/aaca3243-aac0-49ab-a41a-a2ca98d85b6c" />
<img width="1438" height="817" alt="image" src="https://github.com/user-attachments/assets/d054bbb2-6d28-42b0-8a85-685f62770731" />
<img width="1342" height="816" alt="image" src="https://github.com/user-attachments/assets/13f56ce5-8c96-49da-96d0-fc0438f134fe" />





---

## 🚀 Running locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
# Create a .env file with: GEMINI_API_KEY=your_key_here
uvicorn app.main:app --reload --port 8000
```
API docs available at `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
# Create a .env file with: VITE_API_URL=http://localhost:8000/api
npm run dev
```
App available at `http://localhost:5173`

### Running the validation suite
```bash
cd backend
pytest tests/ -v
```

---

## ✅ Validation Results

**Simulated data (known ground truth):**

| Method | True Effect | Recovered Estimate |
|---|---|---|
| Difference-in-Differences | 25.0 | 25.00 |
| Propensity Score Matching | 20.0 | 20.00 |
| CausalImpact | ~30.0 | 29.55 |

**Real data — Hillstrom dataset (64K rows), clean randomized experiment:**
- Bayesian A/B test: P(discount beats no-offer) = **100%**, expected lift = **72.2%** (10.6% → 18.3% conversion)

**Real data — deliberately confounded (treatment restricted to high-spend customers only):**
- Propensity Score Matching recovered an ATT of **0.068** vs. the true experimental effect of **~0.076** — within ~1 percentage point, despite broken randomization.

---

## 🔍 Known Limitations

- The backend's free hosting tier spins down after inactivity, causing a cold-start delay on the first request.
- The AI Insights feature uses Google Gemini's free tier, which has rate limits (a burst of rapid requests may occasionally return a temporary error).
- CSV uploads are capped at 1,000 randomly-sampled rows for performance in the browser; the underlying methods are validated on much larger datasets via the backend scripts.

---

## 🛠️ Tech Stack Summary

`Python` `FastAPI` `PyMC` `statsmodels` `scikit-learn` `pytest` · `React` `Vite` `Tailwind CSS` `Recharts` · `Google Gemini API` · `Render` `Vercel`

---

Built by **Mahak Paliwal** — [GitHub](https://github.com/MahakPaliwal)
