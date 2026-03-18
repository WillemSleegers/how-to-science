---
name: argyle2023
description: Introduces "silicon sampling" — conditioning LLMs on demographic backstories to simulate human survey subpopulations; demonstrates GPT-3's "algorithmic fidelity" in US politics domain
type: reference
---

**Claim** — The paper coins the term "silicon sampling" and defines it as a method for conditioning a language model on sociodemographic backstories drawn from a nationally representative sample, to correct for the skewed demographics of the LLM's training data.
**Quote** — "We propose a general methodology, which we term silicon sampling, that corrects skewed marginal statistics of a language model... we leverage the conditional nature of language models and sample backstories from a known, nationally representative sample (e.g., the ANES) and then estimate P(V) based on those ANES-sampled backstories."
**Page** — 4

**Claim** — GPT-3 passes a social science Turing Test: human evaluators could not reliably distinguish GPT-3-generated word lists from human-generated ones.
**Quote** — "participants guessed 61.7% of human-generated lists were human-generated, while guessing the same of 61.2% of GPT-3 lists (two-tailed difference p = 0.44)."
**Page** — 6–7

**Claim** — GPT-3 silicon samples closely replicate human vote-choice distributions, with tetrachoric correlations of 0.90–0.94 across three ANES election years (2012, 2016, 2020).
**Quote** — "The 2012 tetrachoric correlation across all respondents 0.90, the 2016 estimate was 0.92, and the 2020 value was 0.94. We find this consistently high correlation remarkable given the differences in context across years."
**Page** — 9

**Claim** — GPT-3 reproduces complex inter-correlations among survey variables with high fidelity; the mean difference in Cramer's V between human and GPT-3 data is only 0.026.
**Quote** — "We again find remarkably high correspondence between the patterns of associations in human survey data and these same patterns in GPT-3 produced survey data. The mean difference between the Cramer's V values is 0.026."
**Page** — 12

**Claim** — Silicon samples fail most notably for pure political independents, the only demographic group where GPT-3 substantially diverges from human data.
**Quote** — "there is only one exception to this overall pattern: the estimates of vote choice do not match well for pure independents, especially in 2020."
**Page** — 9

**Claim** — GPT-3 shows mild but consistent ideological biases: slightly predisposed against Romney (2012), against Trump (2016), and against Biden (2020), though these do not negate the strong correlational patterns.
**Quote** — "we see evidence of a mild amount of overall bias in GPT-3: GPT-3 was a little predisposed against Romney in 2012, against Trump in 2016, and against Biden in 2020."
**Page** — 9

**Claim** — Algorithmic fidelity is domain-specific and must be validated before using silicon samples — the authors caution against generalising beyond demonstrated domains.
**Quote** — "While the current study is restricted to a specific domain, the underlying methodology is general purpose and calls for additional work to quantify both the extent and limitations of GPT-3's algorithmic fidelity in a wide array of social science fields."
**Page** — 13

**Claim** — Silicon sampling can serve as a cheap pilot tool for hypothesis exploration before costly human data collection; Study 1 cost only $29 to run on GPT-3.
**Quote** — "Crucially, this can be done with substantially fewer resources than a parallel data collection with human respondents: Study 1 cost $29 on GPT-3."
**Page** — 12

**Claim** — The model does not simulate specific individuals reliably — only aggregate distributions correspond to human data; individual-level predictions should not be expected to match.
**Quote** — "we do not expect the values in the silicon sample to exactly match the human response on the individual level... with a large enough sample size, we expect the overall distribution of text responses in the silicon sample to match the overall distribution in the human data."
**Page** — 12
