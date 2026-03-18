---
name: bisbee2024
description: Critical evaluation of ChatGPT as synthetic survey data; finds aggregate means close to ANES but regression coefficients frequently wrong, variance too low, and results non-reproducible across time and prompt variations
type: reference
---

**Claim** — Average synthetic responses from ChatGPT 3.5 fall within one standard deviation of ANES feeling thermometer averages, and rank ordering of group thermometers is largely preserved. However, this surface-level agreement masks serious inferential problems.
**Quote** — "While the average of ChatGPT responses does not exactly match the average survey response in the ANES, every synthetic mean falls within one standard deviation of the ANES average. In addition, the rank ordering of feeling thermometers is largely intact across both samples."
**Page** — 6

**Claim** — 48% of regression coefficients estimated from ChatGPT responses are statistically significantly different from ANES-derived counterparts, and among those cases the sign flips 32% of the time — meaning synthetic data can lead to opposite substantive conclusions.
**Quote** — "48% of coefficients estimated from the ChatGPT responses are statistically significantly different from their ANES-derived counterpart; among these cases, the sign of the effect flips 32% of the time. Simply put, researchers cannot take for granted that responses from a pretrained LLM will match traditional survey data."
**Page** — 2–3

**Claim** — Synthetic responses have substantially less variance than human survey responses, making them unreliable for power analyses and study design — they would wildly underestimate required sample sizes.
**Quote** — "the distribution of synthetic responses for some questions exhibits far less variation than human responses... Using the estimates of the magnitude and variation in the ChatGPT-generated measures of affective polarization, we calculate the sample size required to detect a difference... Even for 99% power, the ChatGPT estimates imply that just 33 partisan respondents would be necessary... almost an order of magnitude less than what we calculate from the ANES benchmark."
**Page** — 6–7 (Table 1, p. 8)

**Claim** — ChatGPT exaggerates political polarization at the subgroup level: Democrats in the synthetic data like liberals more and dislike conservatives more than their human counterparts, with differences of 10–20 points on the 100-point scale.
**Quote** — "these results suggest that Democrats like liberals more, and conservatives less, than their human counterparts, exaggerating the out-group antipathy along ideological lines... the patterns reported in Figure 2 highlight that synthetic responses would suggest that society is more politically hostile than it actually is."
**Page** — 6

**Claim** — LLM performance is primarily driven by political covariates (ideology, party ID); including only demographic information (age, race, gender, income) dramatically increases error for politically salient groups.
**Quote** — "failing to include information on the respondent's politics dramatically inflates the error for certain groups, notably those groups which are more politically salient (the parties, ideological groups, gays and lesbians, and Muslims)."
**Page** — 10

**Claim** — Synthetic responses are highly sensitive to minor changes in prompt wording, raising concerns about researcher degrees of freedom.
**Quote** — "the distribution of responses is highly sensitive to differences in the prompt used to generate data, which version of ChatGPT is used, and even changes over time in the 'same' model. Similar to the concerns about the effects of a 'garden of forking paths'... the differences we find highlight the fact that extracting responses from an LLM inevitably requires making data-dependent analytical decisions."
**Page** — 10

**Claim** — The same prompt produced substantially different results between April 2023 and July 2023 due to undisclosed changes to the underlying model, making reproducibility impossible for closed-source LLMs.
**Quote** — "The most concerning of these is that the distribution of responses to the same prompt changed between our initial run in April 2023 and a rerun in July 2023 due to changes in the underlying algorithm. This is a key illustration of how closed-source generative models pose a threat to the reproducibility norms of contemporary social science."
**Page** — 3

**Claim** — Performance in non-US contexts and on non-political questions is substantially worse than the already-problematic US results, suggesting the US political domain represents a best-case scenario.
**Quote** — "The variation in accuracy we find when applying similar prompts to different questions and non-U.S. contexts in SI Section 13 reveals how the same prompt can yield different levels of accuracy in ways that raise questions about the ability to develop generalizable prompting practices."
**Page** — 11

**Claim** — The authors argue there are fundamental ethical concerns with using LLM-generated synthetic opinion as a substitute for actual human survey responses, as it risks encoding the past into characterizations of current public opinion.
**Quote** — "relying on available preexisting content to generate/extrapolate synthetic opinions risks hard-wiring the past into the present... we should be cognizant of the difference between characterizing the opinions and behavior of actual human beings—however imperfect and complicated those efforts may be—and studying outputs from an algorithm with unknown properties."
**Page** — 14
