---
title: Synthetic survey respondents
order: 2
toc: true
---


- [Study overview](#study-overview)
- [What the reviews say](#what-the-reviews-say)
- [When silicon sampling holds promise](#when-silicon-sampling-holds-promise)
- [What limits silicon sampling](#what-limits-silicon-sampling)
- [Recommendations](#recommendations)
- [References](#references)

**Silicon sampling** is the use of LLMs to generate synthetic responses that simulate how subpopulations would answer survey questions, a term coined by Argyle et al. (2023).

The technique is used in two distinct ways. The first is **group-level simulation**: conditioning an LLM on demographic profiles to reproduce the distribution of responses a given subpopulation would give — for example, how Republicans aged 30–45 would answer a question about immigration policy. The goal is not to simulate any individual but to approximate the aggregate opinion of a group. The second is **individual prediction** (sometimes called a “digital twin”): constructing a model of a specific person from their survey history or demographic attributes and predicting how they would answer new questions.

Proposed applications include replacing human survey respondents entirely, piloting survey instruments, pretesting question framings, stress-testing measurement instruments, and generating hypotheses about group differences before collecting primary data.

## Study overview

| Study | Goal | Key finding | Verdict |
|----|----|----|:--:|
| Argyle et al. (2023) | Replace human polling samples | Conditioning GPT-3 on ANES demographic profiles reproduced vote choice distributions with r = 0.90–0.94 across three election years; fails for independents | Mixed |
| Sun et al. (2024) | Replace human polling samples | Group-level demographic sampling reproduced ANES 2020 vote choice (KL-divergence = 0.0004); fails for sensitive topics and sorted partisan subgroups | Mixed |
| Lyman et al. (2025) | Assess effect of RLHF on fidelity | Follow-up to Argyle et al. (2023) examining the trade-off between RLHF alignment and algorithmic fidelity; alignment suppresses minority opinion expression | Negative |
| Bisbee et al. (2024) | Replace human survey respondents | Aggregate feeling thermometer scores fall within one SD of ANES, but 48% of regression coefficients differ significantly and 32% flip sign; results not reproducible across model versions | Negative |
| Cerina & Duch (2023) | Compare annotation vs simulation | LLMs better suited to annotating existing survey data than simulating responses; lack of explainability makes them unsuitable for silicon sampling | Negative |
| Neumann et al. (2025) | Establish reliability thresholds | No model tested passed all quality control checks for a minimum reliability threshold for silicon sampling | Negative |
| Karanjai et al. (2025) | Improve simulation accuracy with RAG | Prompting alone achieves reasonable adherence; RAG improves further, but results may reflect training data memorisation rather than generalisation | Mixed |
| K. Lee et al. (2025) | Generalise silicon sampling cross-culturally | LLMs can replicate key ideological and demographic patterns in Korean survey data but overemphasise ideological differences on contentious issues | Mixed |
| Xu et al. (2025) | Simulate opinion on legal questions | Models are better aligned with their training data than with actual survey respondents on US Supreme Court questions | Negative |
| S. Lee et al. (2024) | Simulate climate opinion by demographic group | Including demographic and issue-related covariates improves alignment; models perform poorly for non-Hispanic Black Americans | Mixed |
| Cao et al. (2025) | Cross-national opinion simulation via fine-tuning | Fine-tuning on World Values Survey data outperforms zero-shot by 34% (1-JSD); all models produce less diverse predictions than real human data | Mixed |
| Durmus et al. (2023) | Simulate global public opinion | Models default to US/European perspectives; responses shift when prompted with country information but often reflect cultural stereotypes | Negative |
| Boelaert et al. (2025) | Replace survey respondents for opinion research | Models cannot replace survey respondents for opinion research; response distributions show a systematic machine bias that varies randomly across topics | Negative |
| Maier et al. (2025) | Replace human panels for consumer testing | Synthetic consumers achieve 90% of human test-retest reliability for ranking personal care products; response distributions are too narrow for absolute measurement | Mixed |
| Kaiser et al. (2025) | Simulate consumer preference rankings | Models approximate aggregate rankings but produce overly positive results and reduced variance compared to real consumers | Mixed |
| Aher et al. (2022) | Replicate classic human subject experiments | LLMs successfully replicated findings from economic, psycholinguistic, and social psychology experiments but showed a hyper-accuracy distortion absent in real human data | Mixed |
| Peng et al. (2025) | Build individual digital twins | Across 19 pre-registered studies and 164 outcomes, mean r = 0.20 between digital twin and human responses; twins significantly under-dispersed in 94% of outcomes | Negative |
| Kim & Lee (2024) | Predict individual responses via fine-tuning | Fine-tuning on GSS data achieves AUC = 0.87 for questions in training data, falling to AUC = 0.73 for truly unasked questions | Mixed |
| Amini (2025) | Predict individual electoral choices | Survey Transfer Learning (non-LLM) achieves 93% accuracy for US electoral outcomes and substantially outperforms LLM-based methods on the same task | Negative |
| Dillion et al. (2023) | Assess when LLMs can substitute for humans | Reviews conditions under which LLMs can substitute for human participants; concludes substitution is appropriate only for tasks with objectively correct answers, not for subjective opinion measurement | Negative |
| Santurkar et al. (2023) | Assess whose opinions LLMs represent | Every human demographic subgroup is more representative of US public opinion than any LM tested; RLHF worsens group-level alignment | Negative |
| Li et al. (2025) | Assess opinion distribution accuracy | LLMs assign extreme probability to the modal answer in 80–100% of subgroups on abortion and immigration questions (vs. 30–40% in ANES); structural inconsistency across levels of aggregation | Negative |
| Park et al. (2024) | Measure opinion diversity in LLM outputs | LLMs express a single dominant opinion with very high probability on most questions, suppressing the diversity of thought present in human populations | Negative |
| Tjuatja et al. (2024) | Test whether LLMs replicate response biases | LLMs do not exhibit human-like response biases across a range of survey design effects; models give uniform answers where humans show high variation | Negative |
| Beck et al. (2024) | Assess robustness of sociodemographic prompting | Sociodemographic prompting is not robust; prompt formulation and model choice produce large variance in answers, with more than half of labels incorrectly classified | Negative |
| Cheng et al. (2023) | Assess quality of social group representations | Models fail to capture the multidimensionality of social groups and instead produce caricatures that perpetuate stereotypes | Negative |
| Morocho et al. (2026) | Test whether persona conditioning improves alignment | Persona conditioning produces no consistent improvement in aggregate alignment and frequently worsens subgroup fidelity for underrepresented strata | Negative |
| Gao et al. (2025) | Simulate game-theoretic behavior | Nearly all advanced approaches fail to replicate human behavior distributions in a game-theoretic task; failure causes are diverse and unpredictable across models and prompt variations | Negative |
| Suh et al. (2025) | Fine-tune for public opinion prediction | Fine-tuning on scaled public opinion survey data improves the ability to predict response distributions and generalises to unseen populations and question topics | Positive |
| Lu et al. (2025) | Simulate human online navigation behavior | LLM agents show similar outcomes to humans in website navigation tasks but use more goal-directed strategies; hyper-accuracy distortion observed in behavioral simulation | Mixed |

## What the reviews say

Three review papers have synthesised the empirical literature on silicon sampling. Their overall conclusions converge but differ in emphasis.

Silicon samples are not reliable substitutes for human respondents, especially in policy settings (Wihbey & D’Alonzo, 2025). LLMs are useful complements for early-stage tasks — refining survey questions, pretesting framings, and exploratory concept testing — but the most defensible approach is a hybrid pipeline that keeps human samples as the gold standard for final data collection (Wihbey & D’Alonzo, 2025).

Results vary considerably across domains, and silicon samples hold the most promise in upstream phases of the research process, such as qualitative pretesting and pilot studies, rather than in main studies (Sarstedt et al., 2024). Fine-tuning models on group-specific data can backfire, pushing them to produce caricatures rather than authentic group representations (Sarstedt et al., 2024).

LLMs may be appropriate participants in a narrow set of circumstances: topics where explicit situational features drive human judgment (such as moral scenarios with a clear intentional agent), tedious or high-volume tasks, early research stages such as hypothesis generation and item piloting, and Western English-speaking samples where training data coverage is strongest (Dillion et al., 2023). Even so, LLMs collapse diversity into a single modal opinion and are better at approximating group averages than capturing within-group variation (Dillion et al., 2023).

The point of agreement across all three reviews: silicon sampling is more defensible as a design tool than as a data collection method. The point of divergence is how much weight to give the positive cases — whether promising results in narrow domains (US electoral politics, moral judgment, consumer concept ranking) are evidence of a useful technique or anomalies that should not be generalised.

## When silicon sampling holds promise

The more consistent positive results cluster around a few conditions.

**Politically structured outcomes with large group margins.** When the question being simulated has a strong and stable relationship with demographic predictors — as US vote choice does — LLMs can reproduce aggregate distributions with high accuracy (Argyle et al., 2023; Sun et al., 2024). The model is effectively recovering well-documented group-level correlations that are heavily represented in its training data. Results degrade for groups with weaker predictable structure (independents, mixed partisans) and for sensitive topics where training data is sparse or suppressed (Sun et al., 2024).

**Tasks with structurally determined answers.** Moral scenarios, economic games, and psycholinguistic tasks — where human responses are driven by explicit situational features — are the conditions where LLM output correlates most strongly with human judgment (Aher et al., 2022; Dillion et al., 2023). The model is detecting the structural signal in the prompt. Divergence appears when competing intuitions are in play and the correct response is not deducible from surface features (Dillion et al., 2023).

**Ranking rather than absolute measurement.** Synthetic respondents produce rankings of consumer product concepts that correlate with human rankings, but absolute scores are systematically inflated and distributions are too narrow for measurement use (Kaiser et al., 2025; Maier et al., 2025). Comparisons within a set of stimuli are more reliable than any single rating.

**Fine-tuned models on domain-specific data.** Fine-tuning on survey data improves performance and generalises to unseen questions and populations (Suh et al., 2025). However, fine-tuning on group-specific profiles can backfire, pushing models to produce caricatures rather than authentic variation within groups (Sarstedt et al., 2024).

## What limits silicon sampling

The same studies that document positive results in narrow conditions also reveal a consistent set of failure modes that are structural, not fixable by scaling or prompting.

**Under-dispersion.** Every model tested produces less diverse predictions than real human data (Cao et al., 2025; Li et al., 2025; Park et al., 2024; Peng et al., 2025). LLMs assign extremely high probability to a single modal answer — often above 0.99 for a given option — whereas humans show genuine within-group variation even on contentious topics <span data-cite-id="santurkar2023" data-cite-quote="it has an extremely sharp (and low entropy) opinion distribution for most questions—it typically assigns > 0.99 probability to one of the options. This is unlike humans, who even on contentious topics (like gun rights), tend to exhibit some diversity in opinions." data-cite-page="9" class="cite-ref">(Santurkar et al., 2023)</span>. This is not incidental: alignment training pushes models toward consensus, socially desirable responses regardless of demographic conditioning (Lyman et al., 2025).

**Structural inconsistency.** The opinion distribution an LLM predicts for a demographic group changes depending on how finely the persona is specified (Li et al., 2025). Real survey data trivially satisfies the constraint that group estimates should be consistent across levels of aggregation; LLMs systematically violate it. This means silicon sampling can produce coherent-looking aggregate estimates that have no stable relationship to underlying subgroup opinion.

**Training data skew.** Models default to US and European perspectives on cross-national topics and perform poorly for groups underrepresented in training data — non-Hispanic Black Americans, older adults, non-Western populations (Durmus et al., 2023; S. Lee et al., 2024; Santurkar et al., 2023). Prompting with country or demographic information shifts responses but often toward stereotypes rather than genuine group distributions (Cheng et al., 2023; Durmus et al., 2023).

**Prompt sensitivity.** Results vary substantially with prompt formulation and model version, making findings difficult to replicate or reproduce (Beck et al., 2024; Bisbee et al., 2024). More than half of sociodemographic labels are incorrectly classified in some prompt configurations (Beck et al., 2024).

**Individual prediction fails.** Digital twins that simulate individual survey respondents achieve a mean correlation of r = 0.20 with actual human responses across a large pre-registered study set, and are significantly under-dispersed in 94% of outcomes (Peng et al., 2025). Non-LLM survey imputation methods substantially outperform LLMs on the same individual-prediction task (Amini, 2025).

## Recommendations

**Use silicon sampling for design, not data collection.** The clearest applications are upstream: generating survey items, pretesting question framing, exploring concept space before fielding human samples (Dillion et al., 2023; Sarstedt et al., 2024; Wihbey & D’Alonzo, 2025). Treat silicon samples as a way to stress-test a questionnaire, not as a substitute for it.

**Validate against human data before drawing conclusions.** Even in domains where group-level alignment looks acceptable, regression coefficients and subgroup estimates are unreliable (Bisbee et al., 2024). If silicon sampling is used in a study, at minimum report the model and version, the full prompting approach, and a sensitivity check across prompt variants.

**Do not use silicon sampling to measure minority opinion or within-group variation.** The systematic under-dispersion and training data skew make LLMs poorly suited for studying groups that are underrepresented in training corpora or whose opinions diverge from the modal position (S. Lee et al., 2024; Lyman et al., 2025; Santurkar et al., 2023). This is precisely the research context where human samples are most needed and hardest to replace.

## References

<div id="refs" class="references csl-bib-body hanging-indent" entry-spacing="0" line-spacing="2">

<div id="ref-aher2022" class="csl-entry">

Aher, G., Arriaga, R. I., & Kalai, A. T. (2022). *Using Large Language Models to Simulate Multiple Humans and Replicate Human Subject Studies*. arXiv. <https://doi.org/10.48550/arXiv.2208.10264>

</div>

<div id="ref-amini2025" class="csl-entry">

Amini, A. (2025). *Survey transfer learning: Recycling data with silicon responses*. arXiv. <https://doi.org/10.48550/arXiv.2501.06577>

</div>

<div id="ref-argyle2023" class="csl-entry">

Argyle, L. P., Busby, E. C., Fulda, N., Gubler, J. R., Rytting, C., & Wingate, D. (2023). Out of one, many: Using language models to simulate human samples. *Political Analysis*, *31*(3), 337–355. <https://doi.org/10.1017/pan.2023.2>

</div>

<div id="ref-beck2024" class="csl-entry">

Beck, T., Schuff, H., Lauscher, A., & Gurevych, I. (2024). Sensitivity, Performance, Robustness: Deconstructing the Effect of Sociodemographic Prompting. *Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics (Volume 1: Long Papers)*, 2589–2615. <https://doi.org/10.18653/v1/2024.eacl-long.159>

</div>

<div id="ref-bisbee2024" class="csl-entry">

Bisbee, J., Clinton, J., Dorff, C., Kenkel, B., & Larson, J. (2024). Synthetic replacements for human survey data? The perils of large language models. *Political Analysis*, *32*(3), 401–416. <https://doi.org/10.1017/pan.2023.27>

</div>

<div id="ref-boelaert2025" class="csl-entry">

Boelaert, J., Coavoux, S., Ollion, É., Petev, I., & Präg, P. (2025). Machine Bias. How Do Generative Language Models Answer Opinion Polls? *Sociological Methods & Research*, *54*(3), 1156–1196. <https://doi.org/10.1177/00491241251330582>

</div>

<div id="ref-cao2025" class="csl-entry">

Cao, Y., Liu, H., Arora, A., Augenstein, I., Röttger, P., & Hershcovich, D. (2025). Specializing large language models to simulate survey response distributions for global populations. *Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)*, 3141–3154. <https://doi.org/10.18653/v1/2025.naacl-long.162>

</div>

<div id="ref-cerina2023" class="csl-entry">

Cerina, R., & Duch, R. (2023). *Artificially Intelligent Opinion Polling*. arXiv. <https://doi.org/10.48550/arXiv.2309.06029>

</div>

<div id="ref-cheng2023" class="csl-entry">

Cheng, M., Piccardi, T., & Yang, D. (2023). *CoMPosT: Characterizing and Evaluating Caricature in LLM Simulations*. arXiv. <https://doi.org/10.48550/arXiv.2310.11501>

</div>

<div id="ref-dillion2023" class="csl-entry">

Dillion, D., Tandon, N., Gu, Y., & Gray, K. (2023). Can AI language models replace human participants? *Trends in Cognitive Sciences*, *27*(7), 597–600. <https://doi.org/10.1016/j.tics.2023.04.008>

</div>

<div id="ref-durmus2023" class="csl-entry">

Durmus, E., Nguyen, K., Liao, T. I., Schiefer, N., Askell, A., Bakhtin, A., Chen, C., Hatfield-Dodds, Z., Hernandez, D., Joseph, N., Lovitt, L., McCandlish, S., Sikder, O., Tamkin, A., Thamkul, J., Kaplan, J., Clark, J., & Ganguli, D. (2023). *Towards Measuring the Representation of Subjective Global Opinions in Language Models*. arXiv. <https://doi.org/10.48550/arXiv.2306.16388>

</div>

<div id="ref-gao2025" class="csl-entry">

Gao, Y., Lee, D., Burtch, G., & Fazelpour, S. (2025). Take caution in using LLMs as human surrogates. *Proceedings of the National Academy of Sciences*, *122*(24), e2501660122. <https://doi.org/10.1073/pnas.2501660122>

</div>

<div id="ref-kaiser2025" class="csl-entry">

Kaiser, C., Kaiser, J., Manewitsch, V., Rau, L., & Schallner, R. (2025). Simulating Human Opinions with Large Language Models: Opportunities and Challenges for Personalized Survey Data Modeling. *Adjunct Proceedings of the 33rd ACM Conference on User Modeling, Adaptation and Personalization*, 82–86. <https://doi.org/10.1145/3708319.3733685>

</div>

<div id="ref-karanjai2025" class="csl-entry">

Karanjai, R., Shor, B., Austin, A., Kennedy, R., Lu, Y., Xu, L., & Shi, W. (2025). *Synthesizing Public Opinions with LLMs: Role Creation, Impacts, and the Future to <span class="nocase">eDemocracy</span>*. arXiv. <https://doi.org/10.48550/arXiv.2504.00241>

</div>

<div id="ref-kim2024" class="csl-entry">

Kim, J., & Lee, B. (2024). *AI-augmented surveys: Leveraging large language models and surveys for opinion prediction*. arXiv. <https://doi.org/10.48550/arXiv.2305.09620>

</div>

<div id="ref-lee2025" class="csl-entry">

Lee, K., Park, J., Choi, S., & Lee, C. (2025). Ideology and Policy Preferences in Synthetic Data: The Potential of LLMs for Public Opinion Analysis. *Media and Communication*, *13*, 9677. <https://doi.org/10.17645/mac.9677>

</div>

<div id="ref-lee2024" class="csl-entry">

Lee, S., Peng, T.-Q., Goldberg, M. H., Rosenthal, S. A., Kotcher, J. E., Maibach, E. W., & Leiserowitz, A. (2024). Can large language models estimate public opinion about global warming? An empirical assessment of algorithmic fidelity and bias. *PLOS Climate*, *3*(8), e0000429. <https://doi.org/10.1371/journal.pclm.0000429>

</div>

<div id="ref-li2025a" class="csl-entry">

Li, D., Li, L., & Qiu, H. S. (2025). *ChatGPT is not A Man but Das Man: Representativeness and Structural Consistency of Silicon Samples Generated by Large Language Models*. arXiv. <https://doi.org/10.48550/arXiv.2507.02919>

</div>

<div id="ref-lu2025" class="csl-entry">

Lu, Y., Huang, J., Han, Y., Yao, B., Bei, S., Gesi, J., Xie, Y., Wang, Z., He, Q., & Wang, D. (2025). *Can LLM Agents Simulate Multi-Turn Human Behavior? Evidence from Real Online Customer Behavior Data*. arXiv. <https://doi.org/10.48550/arXiv.2503.20749>

</div>

<div id="ref-lyman2025" class="csl-entry">

Lyman, A., Hepner, B., Argyle, L. P., Busby, E. C., Gubler, J. R., & Wingate, D. (2025). Balancing Large Language Model Alignment and Algorithmic Fidelity in Social Science Research. *Sociological Methods & Research*, *54*(3), 1110–1155. <https://doi.org/10.1177/00491241251342008>

</div>

<div id="ref-maier2025" class="csl-entry">

Maier, B. F., Aslak, U., Fiaschi, L., Rismal, N., Fletcher, K., Luhmann, C. C., Dow, R., Pappas, K., & Wiecki, T. V. (2025). *LLMs reproduce human purchase intent via semantic similarity elicitation of likert ratings*. arXiv. <https://doi.org/10.48550/arXiv.2510.08338>

</div>

<div id="ref-morocho2026" class="csl-entry">

Morocho, E. E. T., Cima, L., Fagni, T., Avvenuti, M., & Cresci, S. (2026). *Assessing the reliability of persona-conditioned LLMs as synthetic survey respondents*. arXiv. <https://doi.org/10.48550/arXiv.2602.18462>

</div>

<div id="ref-neumann2025" class="csl-entry">

Neumann, T., De-Arteaga, M., & Fazelpour, S. (2025). *Should you use LLMs to simulate opinions? Quality checks for early-stage deliberation*. arXiv. <https://doi.org/10.48550/arXiv.2504.08954>

</div>

<div id="ref-park2024a" class="csl-entry">

Park, P. S., Schoenegger, P., & Zhu, C. (2024). Diminished diversity-of-thought in a standard large language model. *Behavior Research Methods*, *56*(6), 5754–5770. <https://doi.org/10.3758/s13428-023-02307-x>

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

<div id="ref-suh2025" class="csl-entry">

Suh, J., Jahanparast, E., Moon, S., Kang, M., & Chang, S. (2025). *Language Model Fine-Tuning on Scaled Survey Data for Predicting Distributions of Public Opinions*. arXiv. <https://doi.org/10.48550/arXiv.2502.16761>

</div>

<div id="ref-sun2024" class="csl-entry">

Sun, S., Lee, E., Nan, D., Zhao, X., Lee, W., Jansen, B. J., & Kim, J. H. (2024). Random silicon sampling: Simulating human sub-population opinion using a large language model based on group-level demographic information. *Findings of the Association for Computational Linguistics: ACL 2024*.

</div>

<div id="ref-tjuatja2024" class="csl-entry">

Tjuatja, L., Chen, V., Wu, T., Talwalkwar, A., & Neubig, G. (2024). Do LLMs Exhibit Human-like Response Biases? A Case Study in Survey Design. *Transactions of the Association for Computational Linguistics*, *12*, 1011–1026. <https://doi.org/10.1162/tacl_a_00685>

</div>

<div id="ref-wihbey2025" class="csl-entry">

Wihbey, J., & D’Alonzo, S. (2025). *AI simulations of audience attitudes and policy preferences: Silicon Sampling guidance for communications practitioners*. SSRN. <https://doi.org/10.2139/ssrn.5533958>

</div>

<div id="ref-xu2025" class="csl-entry">

Xu, S., Santosh, T. Y. S. S., Elazar, Y., Vogel, Q., Plank, B., & Grabmair, M. (2025). *Better Aligned with Survey Respondents or Training Data? Unveiling Political Leanings of LLMs on U.S. Supreme Court Cases*. arXiv. <https://doi.org/10.48550/arXiv.2502.18282>

</div>

</div>
