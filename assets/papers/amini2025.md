---
name: amini2025
description: Proposes Survey Transfer Learning (STL) — recycling existing survey data via neural network transfer to generate silicon responses for missing items, particularly for undersampled populations; outperforms LLMs and multiple imputation
type: reference
---

Amini (2025) proposes Survey Transfer Learning (STL), a neural network approach that recycles existing survey data to generate silicon responses for missing or unasked items — distinct from LLM-based silicon sampling in that it is trained on real human survey responses rather than on general text. STL uses shared demographic and partisan variables as a bridge between surveys, achieving 93% accuracy and near-perfect aggregate distribution replication for US electoral outcomes. The approach is positioned as augmenting surveys rather than replacing them, and shows particular promise for hard-to-reach populations where real data is sparse.

**Claim** — STL adapts transfer learning to survey research by using shared demographic and partisan variables (Anchor Transfer Variables: age, education, gender, income, race, region, party ID) to transfer knowledge across nationally representative datasets and generate silicon responses for missing or unasked items.
**Quote** — "STL applies this paradigm to survey research by leveraging Anchor Transfer Variables (ATVs)—shared demographic and partisan indicators such as age, education, gender, income, race, region, and party identification—to transfer knowledge across nationally representative datasets. In doing so, STL generates empirically grounded 'silicon responses' for missing or unasked items, offering a transparent and statistically valid alternative to both LLMs and repeated survey commissioning."
**Page** — 2

**Claim** — STL is not proposed as a replacement for surveys, but as a framework for reusing and extending existing data.
**Quote** — "STL is therefore offered not as a wholesale replacement for surveys, but as a practical framework for reusing and extending them in ways that are empirically grounded, interpretable, and more sustainable."
**Page** — 6

**Claim** — Researchers often do not need a full silicon sample — they already have ATV questions in their survey and need only silicon responses for specific missing items transferred from another survey.
**Quote** — "I argue that scholars often do not need a full 'silicon sample' since they already have ATV questions in their survey, but 'silicon response' which can be transfer from other survey."
**Page** — 17

**Claim** — The full STL cascade (CES 2020 → ANES 2020 → CES 2022) achieves 93% accuracy and AUC = 0.97 on vote choice, rivalling within-survey benchmarks.
**Quote** — "Using a neural network pre-trained on the Cooperative Election Study (CES) 2020, freezing early layers to preserve learned structure, and fine-tuning top layers on the American National Election Studies (ANES) 2020, STL generates 'silicon responses' CES 2022 and in held-out ANES 2020 data with accuracy rates of up to 93 percent."
**Page** — 1

**Claim** — STL reproduces aggregate distributions with high fidelity: KS statistics < 0.03, Wasserstein distances < 0.03, and absolute proportion errors < 1 percentage point for Trump vote, assault rifle bans, and racial resentment.
**Quote** — "In each case, predicted distributions closely match observed ones: KS statistics are < 0.03, Wasserstein distances < 0.03, and absolute proportion errors < 1 percentage points."
**Page** — 16

**Claim** — On racial resentment, STL achieves over 90% accuracy whereas LLMs achieve only about 60% on the same outcome.
**Quote** — "By contrast, STL achieves over 90% accuracy on the same outcomes and replicates distributions within one percentage point. STL also provides transparency (open data, reproducible models) and efficiency (trainable in commodity notebooks), avoiding the opacity, instability, and high computational cost of LLMs."
**Page** — 19

**Claim** — STL shows particular promise for surveys with limited observations of hard-to-reach groups, including Native American populations and immigrant communities, and can reduce costs of oversampling rare populations.
**Quote** — "STL shows particular promise for surveys with limited observations, such as studies of Native American populations, immigrant communities, or other hard-to-reach groups."
**Page** — 20

**Claim** — STL struggles with neutral/middle responses on Likert scales — "neither agree nor disagree" responses are less predictable from demographics, possibly reflecting social desirability bias, satisficing, or genuine ambivalence.
**Quote** — "The confusion matrix in Figure 5 reveals that the model achieves high accuracy for respondents with clear ideological positions about racial resentment questions but struggles significantly with neutral responses on attitude items. This pattern suggests that 'neither agree nor disagree' responses represent fundamentally different response processes, potentially due to social desirability bias, satisficing behavior, or genuine ambivalence, that are less predictable from standard demographic and political covariates."
**Page** — 15

**Claim** — STL's demonstrated validity is currently limited to binary outcomes; ordinal and continuous outcomes show lower accuracy.
**Quote** — "This motivates the binary recoding of attitude scales for STL at this stage. Future studies can extend this framework to work with ordinal and continuous outcomes as modeling techniques and sample sizes improve."
**Page** — 15–16

**Claim** — The approach requires nationally representative input data and the target year must align with the training context, as political attitudes evolve over time.
**Quote** — "There are two key assumptions for effective implementation in the context of American Politics: First, the input dataset should ideally be nationally representative, and second, the target year should align with the model's training context, as political attitudes in the U.S. evolve significantly over time."
**Page** — 9
