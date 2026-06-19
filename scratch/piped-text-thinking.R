# Does reasoning fix the dropped parenthesis in the CBS intro? Compare the same
# instructed prompt with reasoning off vs on, via params(reasoning_effort). Same
# token rules in both, so any difference is the reasoning, not a wordier prompt.
#
# Scratch file. Run against LM Studio (Gemma 4, thinking mode), inspect.

library(tidyverse)
library(ellmer)

model <- "google/gemma-4-26b-a4b-qat"

intro <- paste(
  c(
    "{Header}Welkom bij de vragenlijst{/Header}",
    "Bedankt dat u de tijd neemt om deze vragenlijst in te vullen.",
    "Het CBS is geïnteresseerd in uw mening en ervaringen. Er zijn geen goede of foute antwoorden.",
    "Twijfelt u over een antwoord? Kies dan het antwoord dat het beste bij u past.",
    "Opslaan en sluiten",
    "U kunt het invullen van de vragenlijst onderbreken met de knop 'Opslaan en sluiten'. Uw eerder ingevulde",
    "antwoorden blijven dan bewaard.",
    "Heeft u vragen?",
    "($3: Kijk op <Main.NAW.URL_specifiekesite> voor veelgestelde vragen over dit onderzoek.",
    "Staat het antwoord op uw vraag hier niet bij, bel $4: Bel) ons gerust op (045) 570 6400 of mail naar",
    "contactcenter@cbs.nl ($5: onder vermelding van het correspondentienummer:",
    "<Main.NAW.Correspondentienummer>).",
    "Wij zijn bereikbaar van maandag tot en met vrijdag tussen 9.00 en 17.00 uur.",
    "Druk op 'Volgende' om verder te gaan met de vragenlijst."
  ),
  collapse = "\n"
)

prompt <- paste0(
  "Translate the following text from Dutch to English. ",
  "It is survey source text. Leave every non-prose token exactly as it appears and ",
  "untranslated: markup tags like {Header} and {/Header}, field references in angle ",
  "brackets, conditional markers like $3:, the parentheses that group conditional ",
  "segments, and literal data such as phone numbers, email addresses, and times. ",
  "Translate only the prose. Output only the translation."
)

ask <- function(reasoning_effort = NULL) {
  p <- if (is.null(reasoning_effort)) {
    params(temperature = 0)
  } else {
    params(temperature = 0, reasoning_effort = reasoning_effort)
  }
  chat <- chat_lmstudio(model = model, system_prompt = prompt, params = p)
  chat$chat(intro)
}

no_reasoning   <- ask()
with_reasoning <- ask("high")

# Parentheses must stay balanced: the source has 3 "(" and 3 ")".
parens <- function(s) c(open = str_count(s, fixed("(")), close = str_count(s, fixed(")")))

cat("source         ", parens(intro), "\n")
cat("no_reasoning   ", parens(no_reasoning), "\n")
cat("with_reasoning ", parens(with_reasoning), "\n\n")

cat("--- NO REASONING ---\n", no_reasoning, "\n\n", sep = "")
cat("--- WITH REASONING ---\n", with_reasoning, "\n", sep = "")

writeLines(no_reasoning,   "scratch/thinking-off.txt")
writeLines(with_reasoning, "scratch/thinking-on.txt")
