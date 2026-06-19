# Can the agreement problem be fixed? Three attempts, one run.
#   A. Baseline: bare prompt (reproduces the failure).
#   B. Prompt fix: warn the model the placeholder is a noun of unknown gender.
#   C. Article travels with the fill: keep the determiner out of the frame and
#      supply it inside the (Dutch) fill value instead.
#
# Scratch file. Run against LM Studio, save CSVs, inspect.

library(tidyverse)
library(ellmer)

model <- "google/gemma-4-26b-a4b-qat"

translate <- function(text, system_prompt) {
  chat <- chat_lmstudio(
    model         = model,
    system_prompt = system_prompt,
    params        = params(temperature = 0)
  )
  chat$chat(text)
}

# --- Shared frames and fills for A and B -------------------------------------
frames <- c(
  "How satisfied are you with this {x}?",
  "How would you describe the new {x}?",
  "Was the {x} helpful?"
)

fills <- tribble(
  ~fill,            ~gender,
  "bank",           "de",
  "energiebedrijf", "het"
)

run <- function(system_prompt) {
  tibble(english = frames) |>
    mutate(translated = map_chr(english, translate, system_prompt = system_prompt)) |>
    crossing(fills) |>
    mutate(filled = str_replace(translated, fixed("{x}"), fill))
}

# --- A. Baseline -------------------------------------------------------------
prompt_bare <- "Translate the following text from English to Dutch. Output only the translation."

baseline <- run(prompt_bare)

# --- B. Prompt fix: warn about the unknown-gender placeholder ----------------
prompt_robust <- paste0(
  "Translate the following English survey item to Dutch. ",
  "The text contains a placeholder in curly braces that will later be replaced ",
  "by a noun whose grammatical gender (de-word or het-word) is not known in advance. ",
  "Phrase the translation so that it stays grammatically correct whatever the gender ",
  "of the noun that fills the placeholder. Leave the placeholder unchanged. ",
  "Output only the translation."
)

robust <- run(prompt_robust)

# --- C. Article travels with the fill ---------------------------------------
# The source items leave the determiner out, so the frame has nothing to agree
# with. The Dutch fill value carries the correct article. This works for the
# definite article ("the"); a demonstrative ("this") is frame-specific and
# cannot live in a shared fill, so those items are left to be rephrased instead.
frames_c <- c(
  "Was {x} helpful?",
  "Did you find {x} clear?",
  "Please rate {x}."
)

fills_c <- tribble(
  ~fill,                ~gender,
  "de bank",            "de",
  "het energiebedrijf", "het"
)

article_in_fill <- tibble(english = frames_c) |>
  mutate(translated = map_chr(english, translate, system_prompt = prompt_bare)) |>
  crossing(fills_c) |>
  mutate(filled = str_replace(translated, fixed("{x}"), fill))

# --- Save --------------------------------------------------------------------
write_csv(baseline,        "scratch/agreement-baseline.csv")
write_csv(robust,          "scratch/agreement-robust-prompt.csv")
write_csv(article_in_fill, "scratch/agreement-article-in-fill.csv")

print(baseline,        width = Inf, n = Inf)
print(robust,          width = Inf, n = Inf)
print(article_in_fill, width = Inf, n = Inf)
