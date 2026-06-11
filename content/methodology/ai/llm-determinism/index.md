---
title: LLM Determinism
toc: true
---


- [Temperature](#temperature)
- [Reproducibility in practice](#reproducibility-in-practice)
- [Prompt design and consistency](#prompt-design-and-consistency)
- [Setting temperature in R](#setting-temperature-in-r)

``` r
library(tidyverse)
library(ellmer)
```

LLMs generate text by repeatedly sampling the next token from a probability distribution over the vocabulary. That distribution is computed from the input and the model’s weights, and sampling from it means the same input can produce different output on different calls.

To see this directly, the following code asks a model to generate a survey item measuring loneliness 25 times and counts how often each unique item appears.

``` r
results <- replicate(25, {
  chat <- chat_lmstudio(
    model         = "google/gemma-4-12b",
    system_prompt = "Write a survey item measuring the following construct. Output only the survey item text, nothing else.",
    params        = params(temperature = 1)
  )
  chat$chat("joy")
})

tibble(item = results) |>
  count(item, sort = TRUE)
```

With temperature at 1, the same prompt produces several different survey items across calls. The rest of this page explains why, and how to suppress the variation when consistent output is needed.

## Temperature

The shape of that distribution is controlled by a parameter called temperature. Before computing probabilities, the model divides its raw output scores (logits) by the temperature value. A lower temperature sharpens the distribution — the highest-scoring token receives most of the probability mass and is selected nearly every time. A higher temperature flattens it — lower-scoring tokens receive relatively more probability and are selected more often.

To make this concrete, suppose a model is translating “satisfied” into Dutch and has assigned raw scores to five candidate tokens. Applying softmax at different temperatures produces the following distributions.

![Candidate token probabilities under four temperature values. The raw logits are the same in each panel; only the temperature differs.](index_files/figure-commonmark/temperature-viz-1.svg)

At temperature 0.1, the distribution concentrates almost entirely on the top token — output is effectively deterministic. At temperature 2.0, probability is spread across all candidates and variation between calls is high. Temperature 1.0 leaves the distribution unchanged from what the model computes directly; most APIs default to values near 1.

## Reproducibility in practice

Setting temperature to 0 makes the model always select the highest-probability token, producing the same output on repeated calls for the same input. This is the right choice for any workflow where reproducibility matters — for example, translating a questionnaire that may need to be re-run, or auditing stored model output against a new run.

Even at temperature 0, exact reproducibility across different hardware, library versions, or batch sizes is not guaranteed. Floating-point operations on GPUs are not always deterministic, and the order of parallel computations can vary. In practice this rarely changes the output, but it can. Some APIs expose a `seed` parameter to further reduce this variability.

## Prompt design and consistency

Temperature is not the only factor that affects how much output varies across calls. The prompt itself also shapes consistency, independently of sampling.

Two mechanisms are at work. First, constraining the output format reduces the number of tokens where variation can accumulate. A prompt that asks for a single sentence produces fewer decisions than one that allows a full paragraph, and fewer decisions means less opportunity for different tokens to be sampled. Second, task framing affects how confident the model is at each step. Asking for “the survey item” signals that a correct canonical answer exists, which concentrates probability on familiar phrasings. Asking to “suggest a question” or “come up with a sentence” signals that many answers are acceptable, which spreads probability more evenly.

The practical consequence is that both levers matter for reproducible workflows. Temperature 0 eliminates sampling randomness, but a loosely specified prompt leaves the model with high uncertainty at many token positions, and greedy decoding across those positions can still produce different outputs when the model or infrastructure changes. A tightly specified prompt reduces that underlying uncertainty, making the output more stable regardless of temperature.

## Setting temperature in R

In `ellmer`, model parameters including temperature are passed via `params()`.

``` r
chat <- chat_lmstudio(
  model         = "google/gemma-4-12b",
  system_prompt = "Translate the following survey item to Dutch. Output only the translated text.",
  params        = params(temperature = 0)
)
```
