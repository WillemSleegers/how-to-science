---
name: santurkar2023
description: Introduces OpinionQA dataset; finds substantial misalignment between LM opinions and US demographic groups, with RLHF fine-tuning making misalignment worse rather than better
type: reference
---

**Claim** — LM opinions are substantially misaligned with those of the US population overall; the degree of misalignment is comparable to the Democrat-Republican divide on climate change.
**Quote** — "we find substantial misalignment between the views reflected by current LMs and those of US demographic groups: on par with the Democrat-Republican divide on climate change."
**Page** — 1 (abstract)

**Claim** — Every demographic human subgroup — even the least representative — is more aligned with the overall US population than any of the LMs tested.
**Quote** — "every one of these groups is more representative of the overall populace than any of the LMs we consider (i.e., cf. representativeness scores of 'human (worst)' to all the LMs)."
**Page** — 8

**Claim** — RLHF/human feedback fine-tuning makes overall opinion misalignment worse, not better; more recent instruction-tuned models score lower on population representativeness than base LMs.
**Quote** — "more recent models trained to be more human-aligned (Ouyang et al., 2022; AI21Labs, 2022) are actually worse—cf. OpenAI's text-davinci-003 and davinci models."
**Page** — 8

**Claim** — Base LMs best reflect the opinions of lower-income, moderate, Protestant/Catholic groups (reflecting internet training data demographics); RLHF-tuned models shift to liberal, high-income, educated, and non-religious groups (reflecting crowdworker demographics).
**Quote** — "The opinions reflected by these models align more with people who are liberal, high income, well-educated, and not religious... These groups line up with the demographics of the crowdworkers reported in OpenAI's InstructGPT paper."
**Page** — 8–9

**Claim** — RLHF-tuned models collapse to modal/caricature opinions: text-davinci-003 assigns >99% probability to a single answer on most questions, unlike humans who show genuine diversity of opinion even on contentious topics.
**Quote** — "it has an extremely sharp (and low entropy) opinion distribution for most questions—it typically assigns > 0.99 probability to one of the options. This is unlike humans, who even on contentious topics (like gun rights), tend to exhibit some diversity in opinions."
**Page** — 9

**Claim** — Steering LMs toward a demographic group (via persona prompting) improves alignment modestly, but does not resolve the underlying representativeness problems.
**Quote** — "Most models do tend to become better-aligned with a group when prompted to behave like it. However, these improvements are modest: none of the aforementioned representativeness problems are resolved by steering."
**Page** — 3

**Claim** — LMs are not consistent in which groups they align with across different topics — even models with general liberal tendencies express conservative views on topics such as religion.
**Quote** — "Although specific LMs are preferentially aligned with certain groups (see 1. above), this skew is not consistent across topics. For instance, even generally liberal models such as text-davinci-00{2,3} express conservative views on topics such as religion."
**Page** — 3

**Claim** — Certain demographic groups are poorly represented by all LMs tested: people aged 65+, widowed individuals, and those with high religious attendance — groups also likely underrepresented in crowdsourcing platforms used for model training.
**Quote** — "a broader analysis across all the groups in the Pew survey highlights several that have low representativeness scores for all LMs, such as individuals of age 65+, widowed, and high religious attendance... it is likely that the other groups (widowed, high religious attendance) may also be difficult to recruit through standard crowdsourcing vendors."
**Page** — 9

**Claim** — The results are robust to prompt formatting and option ordering: the relative ranking of models and subgroup alignment patterns remain consistent across prompt variants.
**Quote** — "Even though we see small fluctuations in the actual representativeness scores through these interventions, the overall trends remain unchanged—the relative ranking of models and the subgroups they tend to align with."
**Page** — 39
