---
title: Synthetic survey respondents
toc: true
---


- [Can LLMs simulate individual people?](#can-llms-simulate-individual-people)
- [Why individual simulation fails in principle](#why-individual-simulation-fails-in-principle)
- [What can work: aggregate distribution matching](#what-can-work-aggregate-distribution-matching)
- [Evidence and proposed use cases](#evidence-and-proposed-use-cases)
- [Limitations](#limitations)
- [Study overview](#study-overview)
- [Recommendations](#recommendations)

> [!WARNING]
>
> This page is still a work in progress.

Researchers have proposed using LLMs to replace or supplement human survey respondents, generating synthetic responses at a fraction of the cost of fielding a real survey (Buskirk et al., 2025). This page reviews when this can and cannot work, and what the evidence says about its validity.

## Can LLMs simulate individual people?

Several studies have attempted to build **digital twins**: LLM agents conditioned on rich individual-level data that predict how a specific person would respond. Results are poor. Across 19 pre-registered studies and 164 outcome measures, the average correlation between digital twin and human responses was 0.197 (Peng et al., 2025). Twin responses were significantly less variable than human responses in 94% of outcomes, and population mean estimates were significantly biased in 76% of cases. Adding richer individual-level data improved twins’ ability to rank-order people but did not improve individual-level accuracy or population mean estimation. The authors conclude that digital twins are not ready for deployment and should be understood as hyper-rational versions of humans rather than clones.

Fine-tuned models trained on longitudinal survey data perform better at the aggregate level but remain limited for individual prediction. A model fine-tuned on 50 years of the General Social Survey achieved individual AUC = 0.87 for questions already in the training data, falling to AUC = 0.73 for truly unasked questions, with aggregate accuracy dropping from ρ = 0.98 to ρ = 0.67 (Kim & Lee, 2024).

## Why individual simulation fails in principle

The failure of individual simulation is not a matter of insufficient data or model scale. It is structural.

**Training data is not representative.** LLMs are trained on internet text, which overrepresents certain demographics, languages, platforms, and time periods. The model’s implicit sense of how people think and what they believe is already skewed before any demographic conditioning is applied (Sarstedt et al., 2024).

**Models learn population-level patterns, not individuals.** Even within the training corpus, an LLM learns statistical regularities across many people, not representations of specific individuals. Conditioning on a demographic backstory shifts the output distribution but does not produce a simulated person.

**RLHF and system prompts collapse diversity.** Alignment training pushes models toward consensus, socially desirable responses regardless of demographic conditioning. This is the intended effect of safety tuning, but it means conditioned models systematically underrepresent minority opinions and within-group heterogeneity <span data-cite-id="santurkar2023" data-cite-quote="it has an extremely sharp (and low entropy) opinion distribution for most questions—it typically assigns > 0.99 probability to one of the options. This is unlike humans, who even on contentious topics (like gun rights), tend to exhibit some diversity in opinions." data-cite-page="9" class="cite-ref">(Santurkar et al., 2023)</span>. Fine-tuning for group-specific responses can backfire, pushing models to “embody caricatures of those groups” (Sarstedt et al., 2024).

**LLMs are probability distributions, not agents.** Each response is a sample from a distribution over tokens, and the same prompt produces different outputs across runs. There is no persistent person inside the model. When prompted with a demographic persona, an LLM constructs the stereotypical modal opinion of that group — what Li et al. (2025) term “Das Man” (Heidegger’s concept of the anonymous crowd) — rather than sampling from the group’s actual distribution. A direct consequence is **structural inconsistency**: the opinion distribution predicted for a demographic group changes depending on how finely the persona is specified (Li et al., 2025). Real survey data trivially satisfies this property; LLMs systematically violate it.

## What can work: aggregate distribution matching

If individual simulation is off the table, a narrower question is tractable: can LLMs reproduce the *distribution* of opinions within a subpopulation? This is what **silicon sampling** actually tests. Rather than asking whether any synthetic response matches a specific person, the question is whether the distribution of synthetic responses, conditioned on demographic backstories drawn from a nationally representative sample, matches the distribution of human responses for that subgroup <span data-cite-id="argyle2023" data-cite-quote="We propose a general methodology, which we term silicon sampling, that corrects skewed marginal statistics of a language model... we leverage the conditional nature of language models and sample backstories from a known, nationally representative sample (e.g., the ANES) and then estimate P(V) based on those ANES-sampled backstories." data-cite-page="4" class="cite-ref">(Argyle et al., 2023)</span>.

This is a much weaker claim, but it has practical value. If LLMs can reproduce aggregate distributions reliably in a given domain, they could serve as a cheap tool for hypothesis exploration, survey pretesting, or research where full fieldwork is infeasible.

## Evidence and proposed use cases

**US electoral politics** has the strongest evidence base. Conditioning GPT-3 on ANES backstories produced vote choice distributions with tetrachoric correlations of 0.90–0.94 across three election years (Argyle et al., 2023). **Random silicon sampling** draws demographics from a group’s distribution rather than individual records, removing the need for individual-level data. Applied to ANES 2020 vote choice, it produced similarly close results (KL-divergence = 0.0004) and was highly reproducible across repeated runs (SD = 0.46%) (Sun et al., 2024). A minimum of ~200 synthetic respondents was needed for stable estimates. These results should be treated as a best case, not as typical performance.

**Survey pretesting and pilot work** is the most widely endorsed use case in the methodological literature. Silicon samples can be used to evaluate item wording, identify double-barreled questions, flag vague language, and assess potential measurement invariance challenges before fielding, at very low cost (Sarstedt et al., 2024). The key constraint is that the LLM must have meaningful training data for the topic and population of interest.

**Cross-national research** where full fieldwork is infeasible is a proposed use case with growing empirical support. Fine-tuning LLMs on World Values Survey data substantially outperforms zero-shot prompting (a 34% 1-JSD improvement for Llama3-8B) and generalises to unseen countries and to an entirely different survey instrument (Cao et al., 2025). However, all LLMs tested, fine-tuned or not, produced less diverse predictions across countries than real human data, indicating that homogenisation is a structural problem rather than a prompting failure.

**Augmenting undersampled populations** is also proposed: using synthetic responses to fill gaps where real data is sparse, particularly for hard-to-reach groups. A related approach, Survey Transfer Learning, trains a neural network on existing real survey data rather than using LLMs and recycles it to generate responses for missing items, achieving 93% accuracy for US electoral outcomes and substantially outperforming LLM-based methods on the same outcomes (Amini, 2025). This is methodologically distinct from LLM silicon sampling but shares the augmentation framing.

## Limitations

**Aggregate similarity does not guarantee inferential validity.** ChatGPT aggregate feeling thermometer scores fall within one SD of ANES averages, but 48% of regression coefficients from synthetic data differ significantly from their ANES counterparts, and of those, 32% flip sign (Bisbee et al., 2024). Synthetic responses also have far less variance than human data, causing power analyses to underestimate required sample sizes by roughly an order of magnitude.

**Response homogenization.** LLMs severely underrepresent minority opinions within demographic subgroups. For abortion and immigration questions, LLMs assign extreme probability to the modal answer in 80–100% of subgroups, compared to 30–40% in real ANES data (Li et al., 2025). Within-group heterogeneity is systematically suppressed even when aggregate proportions look reasonable. Larger models do not mitigate this problem.

**Persona conditioning often doesn’t help.** Adding demographic persona prompts produces no consistent improvement over unconditioned models in aggregate alignment, and frequently worsens subgroup fidelity, especially for small, underrepresented strata (Morocho et al., 2026). Persona variables explain only a small share of variance in model outputs.

**Sensitive topics and sorted subgroups.** Random silicon sampling replicated only 1 of 10 questions beyond vote choice; on sensitive topics (race, gender, religion, sexuality) the model defaulted to socially harmless responses regardless of conditioning (Sun et al., 2024). Simulated Democrats and Republicans voted 99.96% and 99.22% for their party’s candidate, far more extreme than actual ANES distributions.

**Non-US and non-political domains.** Strong results are confined to US electoral politics. Performance in other domains, countries, or on non-political questions is substantially worse, and algorithmic fidelity must be validated domain by domain (Argyle et al., 2023; Bisbee et al., 2024). Performance is particularly poor for non-WEIRD populations (Cao et al., 2025; Sarstedt et al., 2024).

**Reproducibility.** The same prompt produced substantially different results between April and July 2023 due to undisclosed model updates (Bisbee et al., 2024). Closed-source models cannot be used for reproducible research.

## Study overview

| Study | Model | Task | Key finding |
|----|----|----|----|
| Argyle et al. (2023) | GPT-3 | ANES vote choice (2012–2020) | r = 0.90–0.94 at aggregate level; fails for independents |
| Sun et al. (2024) | GPT-3.5 | ANES 2020 vote choice | Group-level demographics sufficient; fails for sorted subgroups and sensitive topics |
| Peng et al. (2025) | GPT-4.1 | 19 studies, 164 outcomes | Mean r = 0.20; twins biased and under-dispersed; not ready for deployment |
| Bisbee et al. (2024) | ChatGPT 3.5 | ANES feeling thermometers | 48% of coefficients wrong; 32% flip sign; not reproducible |
| Santurkar et al. (2023) | GPT-3, InstructGPT | Pew surveys (60 demographic groups) | Every human subgroup more representative than any LM; RLHF worsens alignment |
| Li et al. (2025) | GPT-4, Llama 405B | ANES (abortion, immigration) | Severe response homogenization; structural inconsistency across aggregation levels |
| Cao et al. (2025) | Llama3, Qwen | World Values Survey (90+ countries) | Fine-tuning outperforms zero-shot; all models less diverse than real human data |
| Kim & Lee (2024) | Alpaca-7b | GSS (1972–2021) | Strong retrodiction (AUC = 0.87); modest unasked opinion prediction (AUC = 0.73) |

## Recommendations

- **Do not use LLM-generated responses as a substitute for human survey data.** Aggregate similarity does not guarantee valid inference: regression coefficients are frequently wrong in sign, and within-group heterogeneity is systematically suppressed.
- **Silicon sampling can be useful for cheap hypothesis exploration** before collecting human data, particularly for US political attitudes where the evidence is strongest. Treat it as preliminary and exploratory, not confirmatory.
- **Use silicon samples for pretesting and pilot work** (evaluating item wording, flagging double-barreled questions, assessing potential measurement non-invariance) rather than as main-study data.
- **Validate in your specific domain** before treating any LLM simulation as trustworthy. Strong results in US electoral politics do not generalise.
- **Always compare persona-conditioned results to an unconditioned baseline.** Conditioning often provides no benefit and can worsen subgroup fidelity.
- **Avoid RLHF-tuned models for opinion simulation.** Alignment training collapses opinion diversity and shifts outputs away from the general population.
- **Do not use closed-source models for reproducible research.** Undisclosed updates can change results substantially.

<div id="refs" class="references csl-bib-body hanging-indent" entry-spacing="0" line-spacing="2">

<div id="ref-amini2025" class="csl-entry">

Amini, A. (2025). *Survey transfer learning: Recycling data with silicon responses*. arXiv. <https://doi.org/10.48550/arXiv.2501.06577>

</div>

<div id="ref-argyle2023" class="csl-entry">

Argyle, L. P., Busby, E. C., Fulda, N., Gubler, J. R., Rytting, C., & Wingate, D. (2023). Out of one, many: Using language models to simulate human samples. *Political Analysis*, *31*(3), 337–355. <https://doi.org/10.1017/pan.2023.2>

</div>

<div id="ref-bisbee2024" class="csl-entry">

Bisbee, J., Clinton, J., Dorff, C., Kenkel, B., & Larson, J. (2024). Synthetic replacements for human survey data? The perils of large language models. *Political Analysis*, *32*(3), 401–416. <https://doi.org/10.1017/pan.2023.27>

</div>

<div id="ref-buskirk2025" class="csl-entry">

Buskirk, T. D., Keusch, F., Heyde, L. von der, & Eck, A. (2025). *More parameters than populations: A systematic literature review of large language models within survey research*. arXiv. <https://doi.org/10.48550/arXiv.2509.03391>

</div>

<div id="ref-cao2025" class="csl-entry">

Cao, Y., Liu, H., Arora, A., Augenstein, I., Röttger, P., & Hershcovich, D. (2025). Specializing large language models to simulate survey response distributions for global populations. *Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)*, 3141–3154. <https://doi.org/10.18653/v1/2025.naacl-long.162>

</div>

<div id="ref-kim2024" class="csl-entry">

Kim, J., & Lee, B. (2024). *AI-augmented surveys: Leveraging large language models and surveys for opinion prediction*. arXiv. <https://doi.org/10.48550/arXiv.2305.09620>

</div>

<div id="ref-li2025" class="csl-entry">

Li, D., Li, L., & Qiu, H. S. (2025). *ChatGPT is not a man but das man: Representativeness and structural consistency of silicon samples generated by large language models*. arXiv. <https://doi.org/10.48550/arXiv.2507.02919>

</div>

<div id="ref-morocho2026" class="csl-entry">

Morocho, E. E. T., Cima, L., Fagni, T., Avvenuti, M., & Cresci, S. (2026). *Assessing the reliability of persona-conditioned LLMs as synthetic survey respondents*. arXiv. <https://doi.org/10.48550/arXiv.2602.18462>

</div>

<div id="ref-peng2025" class="csl-entry">

Peng, T., Gui, G., Merlau, D. J., Fan, G. J., Sliman, M. B., Brucks, M., Johnson, E. J., Morwitz, V., Althenayyan, A., Bellezza, S., Donati, D., Fong, H., Friedman, E., Guevara, A., Hussein, M., Jerath, K., Kogut, B., Kumar, A., Lane, K., … Toubia, O. (2025). *A mega-study of digital twins reveals strengths, weaknesses and opportunities for further improvement*. arXiv. <https://doi.org/10.48550/arXiv.2509.19088>

</div>

<div id="ref-santurkar2023" class="csl-entry">

Santurkar, S., Durmus, E., Ladhak, F., Lee, C., Liang, P., & Hashimoto, T. (2023). Whose opinions do language models reflect? *Proceedings of the 40th International Conference on Machine Learning*.

</div>

<div id="ref-sarstedt2024" class="csl-entry">

Sarstedt, M., Adler, S. J., Rau, L., & Schmitt, B. (2024). Using large language models to generate silicon samples in consumer and marketing research: Challenges, opportunities, and guidelines. *Psychology & Marketing*, *41*(6), 1254–1270. <https://doi.org/10.1002/mar.21982>

</div>

<div id="ref-sun2024" class="csl-entry">

Sun, S., Lee, E., Nan, D., Zhao, X., Lee, W., Jansen, B. J., & Kim, J. H. (2024). Random silicon sampling: Simulating human sub-population opinion using a large language model based on group-level demographic information. *Findings of the Association for Computational Linguistics: ACL 2024*.

</div>

</div>
