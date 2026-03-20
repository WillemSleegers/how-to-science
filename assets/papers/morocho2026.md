---
name: morocho2026
description: Evaluates whether persona/demographic conditioning of LLMs improves alignment with survey responses; finds no consistent aggregate improvement and frequent subgroup deterioration
type: reference
---

Morocho et al. (2026) test whether adding demographic persona prompts to LLMs improves their alignment with real survey responses from the World Values Survey. They find no consistent aggregate improvement over unconditioned (vanilla) models, and that conditioning frequently worsens subgroup fidelity — especially for small, underrepresented demographic strata. Persona variables explain only a small share of variance in model outputs, and the authors conclude that personas act more as stereotypes than as faithful individual-level conditioning.

**Claim** — Persona prompting does not produce a consistent aggregate improvement in survey alignment and in many cases degrades performance.
**Quote** — "We find that persona prompting does not yield a clear aggregate improvement in survey alignment and, in many cases, significantly degrades performance."
**Page** — 1

**Claim** — The difference in aggregate accuracy between persona-conditioned and vanilla (no-persona) models is not statistically significant.
**Quote** — "PB prompting does not yield a consistent aggregate improvement across models, as also reflected in the lack of statistically significant differences between PB and V."
**Page** — 5

**Claim** — Both models substantially outperform a random guesser, but the incremental benefit of persona conditioning over an unconditioned model is minimal or absent.
**Quote** — "Both V and PB variants substantially outperform R, with Qwen3-4B achieving higher overall scores than Llama-2-13B. However, PB prompting does not yield a consistent aggregate improvement across models."
**Page** — 5

**Claim** — Persona effects are highly concentrated: most survey items show minimal change from conditioning, while a small subset shows large swings — conditioning acts as a selective perturbation rather than a uniform improvement.
**Quote** — "Most points lie close to the diagonal in the HS and SS scatter plots, and most PB–V differences cluster near zero in the bar charts. However, a limited set of WVS-7 items accounts for the largest swings in both HS and SS, indicating that persona prompting mainly acts as a selective perturbation rather than a uniform improvement."
**Page** — 5

**Claim** — Subgroup fidelity does not consistently improve with persona conditioning; for some demographic strata it deteriorates, with the largest distortions in small, underrepresented subgroups.
**Quote** — "Subgroup scores under PB do not show a consistent improvement over V... the largest PB-induced shifts tend to occur in small-n strata (i.e., lower number of users). There, estimates are inherently higher-variance and persona prompting can introduce disproportionate shifts."
**Page** — 5

**Claim** — Demographic conditioning can redistribute errors across groups in ways that undermine subgroup fidelity even when aggregate agreement appears stable.
**Quote** — "Even when aggregate agreement appears stable, demographic conditioning can redistribute errors unevenly across groups, undermining subgroup fidelity and potentially distorting downstream analyses that rely on subgroup comparisons or simulated agent populations."
**Page** — 5

**Claim** — Persona variables explain only a small share of variance in LLM outputs, though shifts are statistically significant (citing Hu & Collier).
**Quote** — "Hu and Collier [19] explicitly quantify the 'persona effect' and find that persona variables explain only a small share of variance in subjective NLP annotations, although persona prompts induce modest but statistically significant shifts in model predictions."
**Page** — 3

**Claim** — Personas may act as stereotypes rather than faithful individual-level representations, because demographic attributes do not capture the full context behind a respondent's beliefs.
**Quote** — "Persona prompting is derived from a limited set of socio-demographic attributes and does not capture the full context behind a respondent's beliefs. As a result, personas may sometimes act as stereotypes or weak proxies rather than faithful individual-level conditioning."
**Page** — 6

**Claim** — The practical recommendation is to always report a matched vanilla baseline and audit item- and subgroup-level behaviour, not just aggregate scores.
**Quote** — "For practical deployments (e.g., synthetic polling, agent initialization, or subgroup analysis), we recommend reporting matched vanilla baselines and auditing item- and subgroup-level behavior, instead of only computing aggregate scores."
**Page** — 6
