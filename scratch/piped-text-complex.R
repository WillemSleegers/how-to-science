# Real questionnaire source mixes prose with markup tags, field-reference fills,
# conditional-text markers, and literal contact data. Can the model translate the
# prose while leaving every non-prose token untouched? Test on a real intro page
# (Statistics Netherlands / CBS), translated Dutch -> English, bare and instructed.
#
# Scratch file. Run against LM Studio, inspect.

library(tidyverse)
library(ellmer)

model <- "google/gemma-4-26b-a4b-qat"

translate_nl_en <- function(text, system_prompt) {
  chat <- chat_lmstudio(
    model         = model,
    system_prompt = system_prompt,
    params        = params(temperature = 0)
  )
  chat$chat(text)
}

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

prompt_bare <- "Translate the following text from Dutch to English. Output only the translation."

prompt_keep <- paste0(
  "Translate the following text from Dutch to English. ",
  "It is survey source text. Leave every non-prose token exactly as it appears and ",
  "untranslated: markup tags like {Header} and {/Header}, field references in angle ",
  "brackets like <Main.NAW.Correspondentienummer>, conditional markers like $3:, and ",
  "literal data such as phone numbers, email addresses, and times. ",
  "Translate only the prose. Output only the translation."
)

bare       <- translate_nl_en(intro, prompt_bare)
instructed <- translate_nl_en(intro, prompt_keep)

# Tokens that must survive untouched.
tokens <- c(
  "{Header}", "{/Header}",
  "<Main.NAW.URL_specifiekesite>", "<Main.NAW.Correspondentienummer>",
  "$3:", "$4:", "$5:",
  "(045) 570 6400", "contactcenter@cbs.nl"
)

survival <- tibble(
  token         = tokens,
  in_bare       = map_lgl(tokens, \(t) str_detect(bare, fixed(t))),
  in_instructed = map_lgl(tokens, \(t) str_detect(instructed, fixed(t)))
)

cat("\n--- BARE ---\n", bare, "\n", sep = "")
cat("\n--- INSTRUCTED ---\n", instructed, "\n", sep = "")
print(survival, n = Inf)

writeLines(bare,       "scratch/complex-bare.txt")
writeLines(instructed, "scratch/complex-instructed.txt")
write_csv(survival,    "scratch/complex-survival.csv")
