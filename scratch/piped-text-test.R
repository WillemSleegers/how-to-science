# Exploratory: does the local model mishandle piped text when translating
# English survey items into Dutch? Two questions:
#   1. Does the placeholder token survive translation, across pipe syntaxes?
#   2. Does the text around a placeholder agree with the value that fills it?
#
# Scratch file. Run interactively against LM Studio, inspect, delete when done.

library(tidyverse)
library(ellmer)

model <- "google/gemma-4-26b-a4b-qat"

prompt_bare <- "Translate the following text from English to Dutch. Output only the translation."

prompt_keep <- paste0(
  "Translate the following text from English to Dutch. ",
  "Leave any placeholder in curly braces, square brackets, angle brackets, ",
  "or other delimiters exactly as it appears, untranslated. ",
  "Output only the translation."
)

translate_en_nl <- function(text, system_prompt) {
  chat <- chat_lmstudio(
    model         = model,
    system_prompt = system_prompt,
    params        = params(temperature = 0)
  )
  chat$chat(text)
}

# --- 1. Does the placeholder survive? Vary the pipe syntax -------------------
# Same sentence, different placeholder conventions used by real survey tools.

tokens <- c(
  curly        = "{provider}",
  double_curly = "{{provider}}",
  square       = "[provider]",
  angle        = "<provider>",
  percent      = "%provider%",
  dollar_curly = "${provider}",
  qualtrics    = "${e://Field/provider}",
  blaise       = "^provider",
  pipe         = "|provider|"
)

token_tests <- tibble(
  syntax = names(tokens),
  token  = unname(tokens),
  text   = str_glue("How satisfied are you with {token}?")
)

token_results <- token_tests |>
  mutate(
    bare                 = map_chr(text, translate_en_nl, system_prompt = prompt_bare),
    instructed           = map_chr(text, translate_en_nl, system_prompt = prompt_keep),
    bare_preserved       = str_detect(bare, fixed(token)),
    instructed_preserved = str_detect(instructed, fixed(token))
  )

print(token_results, width = Inf)

# --- 2. Does the token survive in harder positions? --------------------------
# Mid-sentence, repeated, multiple fills, fills next to punctuation.

position_tests <- tibble(
  case = c(
    "single",
    "repeated",
    "two_fills",
    "many_fills",
    "back_reference"
  ),
  text = c(
    "How satisfied are you with {provider}?",
    "You told us your provider is {provider}. Has {provider} contacted you this year?",
    "Compared with {provider_a}, how would you rate {provider_b}?",
    "On {date}, did you contact {provider} about your {product}?",
    "Earlier you said you live in {city}. Is {city} where you were born?"
  )
)

# Count curly placeholders going in and coming back out; they should match.
count_braces <- function(s) str_count(s, "\\{[^}]*\\}")

position_results <- position_tests |>
  mutate(
    bare        = map_chr(text, translate_en_nl, system_prompt = prompt_bare),
    instructed  = map_chr(text, translate_en_nl, system_prompt = prompt_keep),
    n_in        = count_braces(text),
    n_bare      = count_braces(bare),
    n_instructed = count_braces(instructed)
  )

print(position_results, width = Inf)

# --- 3. Does the Dutch agree with the value that fills the slot? -------------
# Translate each frame once (placeholder kept), then substitute Dutch nouns of
# both genders. de-words and het-words force different articles, demonstratives,
# and adjective endings; one translated frame cannot be correct for both.

agreement_frames <- tibble(
  frame = c(
    "How satisfied are you with this {x}?",
    "Was the {x} helpful?",
    "Please rate the {x} you used.",
    "Did you find the {x} clear?",
    "How would you describe the new {x}?"
  )
)

# Fills with known gender, so agreement is easy to judge by eye.
fills <- tribble(
  ~fill,             ~gender,
  "bank",            "de",
  "website",         "de",
  "gemeente",        "de",
  "energiebedrijf",  "het",
  "formulier",       "het",
  "loket",           "het"
)

agreement_results <- agreement_frames |>
  mutate(translated = map_chr(frame, translate_en_nl, system_prompt = prompt_keep)) |>
  crossing(fills) |>
  mutate(filled = str_replace(translated, "\\{x\\}", fill)) |>
  select(frame, translated, fill, gender, filled)

print(agreement_results, width = Inf, n = Inf)

# --- Save for inspection / possible reuse on the page ------------------------
write_csv(token_results,    "scratch/piped-text-tokens.csv")
write_csv(position_results, "scratch/piped-text-positions.csv")
write_csv(agreement_results, "scratch/piped-text-agreement.csv")
