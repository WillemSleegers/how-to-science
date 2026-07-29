---
title: Comparing String Similarity
description: >-
  Comparing strings with edit-distance, n-gram, and embedding-based similarity
  metrics
toc: true
toc-depth: 3
---


- [Edit distance](#edit-distance)
  - [Levenshtein similarity](#levenshtein-similarity)
  - [TER](#ter)
  - [Other edit-distance metrics](#other-edit-distance-metrics)
- [n-gram](#n-gram)
  - [Jaccard similarity](#jaccard-similarity)
  - [Cosine similarity](#cosine-similarity)
  - [BLEU score](#bleu-score)
  - [METEOR](#meteor)
  - [CHRF](#chrf)
  - [ROUGE](#rouge)
  - [Other n-gram metrics](#other-n-gram-metrics)
- [Embedding](#embedding)
  - [Whole-string cosine](#whole-string-cosine)
  - [BERTScore](#bertscore)
  - [Calibrating BERTScore](#calibrating-bertscore)
  - [Matching across languages](#matching-across-languages)
  - [Other embedding metrics](#other-embedding-metrics)
- [Learned metrics](#learned-metrics)
- [Case study: survey question](#case-study-survey-question)
  - [Choosing a metric](#choosing-a-metric)
- [Language considerations](#language-considerations)
  - [Morphological richness](#morphological-richness)
  - [Diacritics](#diacritics)
- [Item-level vs. document-level](#item-level-vs-document-level)

<details class="code-fold">
<summary>Code</summary>

``` r
library(tidyverse)
library(stringdist)
library(ditto)

options(digits = 2)
```

</details>

String similarity metrics reduce the comparison between two pieces of text to a single number, making it possible to rank, filter, or aggregate comparisons at scale. Common use cases include comparing survey responses across time points, detecting duplicate records, and evaluating translations.

These metrics fall into three categories, distinguished by what counts as similar. Edit distance metrics count the insertions, deletions, and substitutions needed to turn one string into the other, whether applied character by character or word by word. n-gram metrics don’t count edits at all: they ignore order and position entirely and instead compare which character or word sequences the two strings have in common. Embedding-based metrics set aside the surface text and compare the meaning a language model assigns to each string.

The `stringdist` package implements the edit-distance and n-gram metrics; the `ditto` package implements BLEU, CHRF, ROUGE, TER, METEOR, and the embedding-based metrics. A few more peripheral metrics have no R implementation and are described without code.

## Edit distance

### Levenshtein similarity

The Levenshtein distance counts the smallest number of single-character edits (insertions, deletions, or substitutions) needed to turn one string into the other. Turning `"next"` into `"text"` requires one substitution, replacing `'n'` with `'t'`, so the distance is 1.

Raw counts are hard to compare across strings of different lengths. One edit in a 4-character string is a larger change than one edit in a 40-character string. `stringsim()` normalizes the distance by dividing by the length of the longer string, producing a 0–1 score where 1 means identical and 0 means completely different.

Both `"next"` and `"text"` have 4 characters, so the normalized similarity is 1 − 1/4 = **0.75**. The table below shows more examples.

<details class="code-fold">
<summary>Code</summary>

``` r
tribble(
  ~a                 , ~b                 , ~note                      ,
  "agree"            , "agree"            , "identical"                ,
  "next"             , "text"             , "one substitution (n → t)" ,
  "agree"            , "agreed"           , "one insertion (add d)"    ,
  "agree"            , "disagree"         , "prefix insertion (dis–)"  ,
  "completely agree" , "completely agrre" , "typo (missing e)"         ,
  "agree"            , "skip"             , "no characters in common"
) |>
  mutate(similarity = stringsim(a, b, method = "lv"))
```

</details>

| a                | b                | note                     | similarity |
|:-----------------|:-----------------|:-------------------------|-----------:|
| agree            | agree            | identical                |       1.00 |
| next             | text             | one substitution (n → t) |       0.75 |
| agree            | agreed           | one insertion (add d)    |       0.83 |
| agree            | disagree         | prefix insertion (dis–)  |       0.62 |
| completely agree | completely agrre | typo (missing e)         |       0.94 |
| agree            | skip             | no characters in common  |       0.00 |

### TER

TER (Translation Edit Rate) applies edit distance at the word level rather than the character level. The count of word-level edits needed to turn the candidate into the reference is divided by the number of reference words. Unlike Levenshtein similarity, TER is not bounded between 0 and 1: a score above 1 is possible when the candidate requires more edits than the reference has words. TER is common in machine translation evaluation.

Take the reference “to what extent do you agree with the statement,” nine words long, against the candidate “to what extent do you agree with this statement.” The two differ in exactly one position: “this” where the reference has “the.” That single substitution is the only edit needed, so TER = 1/9 ≈ **0.11**.

The full metric also treats moving a block of words to a different position as a single edit (a “shift”), found by a heuristic search, since finding the optimal set of shifts exactly is computationally intractable. `ditto`’s `ter()` skips that search and counts only insertions, deletions, and substitutions, which makes it equivalent to word error rate rather than true TER.

Swapping two adjacent words in the same reference shows the cost of that omission concretely. The candidate “what to extent do you agree with the statement” swaps the reference’s first two words. A shift would move “what” one position to the left, past “to,” at a cost of one edit, so true TER would score this the same as the single substitution above: 1/9 ≈ 0.11. Without a shift operation, each position has to be corrected on its own instead: “what” becomes “to” and “to” becomes “what,” two substitutions, so `ter()` scores it 2/9 ≈ **0.22**, twice as high.

The table below applies TER to the same four candidates used throughout this page, from identical to entirely unrelated:

``` r
ref_ter <- "to what extent do you agree with the statement"

tribble(
  ~candidate                                        , ~note              ,
  "to what extent do you agree with the statement"  , "identical"        ,
  "to what extent do you agree with this statement" , "one word differs" ,
  "how much do you agree with the statement"        , "paraphrase"       ,
  "what is your date of birth"                      , "unrelated"
) |>
  mutate(ter = map_dbl(candidate, ter, reference = ref_ter)) |>
  select(candidate, note, ter)
```

| candidate                                       | note             |  ter |
|:------------------------------------------------|:-----------------|-----:|
| to what extent do you agree with the statement  | identical        | 0.00 |
| to what extent do you agree with this statement | one word differs | 0.11 |
| how much do you agree with the statement        | paraphrase       | 0.33 |
| what is your date of birth                      | unrelated        | 0.89 |

Unlike the 0–1 surface metrics, TER only reaches 0 for an identical match and grows without bound as edits pile up: the unrelated candidate needs almost one edit per reference word.

### Other edit-distance metrics

`stringdist` implements several other edit-distance metrics. Each solves a narrower problem well, but none adds much for comparing open-ended text.

Optimal string alignment (OSA) extends Levenshtein by treating a transposition (swapping two adjacent characters) as a single edit rather than two substitutions: `"teh"` is one transposition from `"the"`, so OSA assigns it a distance of 1 where Levenshtein assigns 2. Each character position can only be involved in one edit, so cascading transpositions still require multiple steps. Damerau-Levenshtein lifts that restriction and allows cascading transpositions; the two metrics agree on most inputs and only diverge on strings where the same character would need to be involved in multiple edits. Available as `method = "osa"` and `method = "dl"`.

Hamming distance counts positions where two same-length strings differ, character by character. It only applies to strings of equal length, which rules out most open-ended text but fits fixed-format strings such as coded response options. Available as `method = "hamming"`.

LCS distance allows only insertions and deletions, not substitutions, so a single substitution costs two operations instead of one. LCS distances are always at least as large as Levenshtein distances on the same pair. Available as `method = "lcs"`.

Jaro-Winkler counts how many characters in one string appear within a matching window of the other, then adds a bonus when the two strings share an identical prefix. That prefix weighting makes it a common choice for matching personal names, where a shared start (“Jon”, “Jonathan”) is a stronger signal than a shared ending, but it adds little when comparing full sentences or paragraphs, where prefix position carries no special meaning. Available as `method = "jw"`.

## n-gram

### Jaccard similarity

Levenshtein is sensitive to the exact sequence of characters. Jaccard takes a different approach: it ignores order and frequency entirely and compares only which characters the two strings have in common.

Each string is reduced to a set of unique characters. Jaccard similarity is the size of the intersection divided by the size of the union (the characters present in both strings divided by all distinct characters across both strings). If two strings have the same character set, the score is 1. If they share no characters, it is 0.

Take `"yes"` and `"yet"`, for example. Their character sets are {y, e, s} and {y, e, t} (3 distinct characters each). The intersection is {y, e} (2 characters). The union is all 4 distinct characters across both: {y, e, s, t}. The similarity score 2/4 = **0.5**.

<details class="code-fold">
<summary>Code</summary>

``` r
tribble(
  ~a                           , ~b                           , ~note                              ,
  "completely agree"           , "completely agree"           , "identical"                        ,
  "completely agree"           , "strongly agree"             , "one word differs"                 ,
  "completely agree"           , "not applicable"             , "no words shared"                  ,
  "neither agree nor disagree" , "disagree nor agree neither" , "same characters, different order" ,
  "strongly strongly agree"    , "strongly agree"             , "repetition ignored"
) |>
  mutate(similarity = stringsim(a, b, method = "jaccard"))
```

</details>

| a | b | note | similarity |
|:---|:---|:---|---:|
| completely agree | completely agree | identical | 1.00 |
| completely agree | strongly agree | one word differs | 0.64 |
| completely agree | not applicable | no words shared | 0.53 |
| neither agree nor disagree | disagree nor agree neither | same characters, different order | 1.00 |
| strongly strongly agree | strongly agree | repetition ignored | 1.00 |

Because only the character set matters, `"neither agree nor disagree"` and `"disagree nor agree neither"` are treated as identical, since they contain exactly the same characters. Jaccard also ignores repetition: “strongly” appearing twice contributes the same as once.

### Cosine similarity

Cosine similarity counts how often each character appears in each string, then asks whether the two strings have similar distributions. If the same characters show up with similar frequency in both strings, the score is high. If the distributions are very different, the score is low.

For `"agree"` and `"disagree"`, the character frequencies are {a:1, e:2, g:1, r:1} and {a:1, d:1, e:2, g:1, i:1, r:1, s:1}. The dot product is (1×1) + (2×2) + (1×1) + (1×1) = 7. The magnitude of each frequency vector is √(1²+2²+1²+1²) = √7 ≈ 2.65 and √(1²+2²+1²+1²+1²+1²+1²) = 3. The similarity score is 7 / (2.65 × 3) ≈ **0.88**. The score is high because all of `"agree"`’s characters appear in `"disagree"` with the same frequency.

<details class="code-fold">
<summary>Code</summary>

``` r
tribble(
  ~a                 , ~b                    , ~note                                               ,
  "completely agree" , "completely agree"    , "identical"                                         ,
  "completely agree" , "completely disagree" , "share almost all characters; 'd', 'i', 's' differ" ,
  "agree"            , "disagree"            , "'agree' characters are a subset of 'disagree'"     ,
  "agree"            , "next"                , "share only the letter 'e'"                         ,
  "yes"              , "yesterday"           , "all characters of 'yes' appear in 'yesterday'"
) |>
  mutate(similarity = stringsim(a, b, method = "cosine"))
```

</details>

| a | b | note | similarity |
|:---|:---|:---|---:|
| completely agree | completely agree | identical | 1.00 |
| completely agree | completely disagree | share almost all characters; ‘d’, ‘i’, ‘s’ differ | 0.95 |
| agree | disagree | ‘agree’ characters are a subset of ‘disagree’ | 0.84 |
| agree | next | share only the letter ‘e’ | 0.38 |
| yes | yesterday | all characters of ‘yes’ appear in ‘yesterday’ | 0.80 |

### BLEU score

Levenshtein, Jaccard, and cosine are general-purpose string comparison tools. BLEU (Bilingual Evaluation Understudy) was designed specifically for evaluating translations. Rather than comparing strings character-by-character, BLEU measures how much of the candidate’s word sequences appear in the reference.

BLEU combines three ideas. First, *n-gram precision*: it checks not just whether individual words match, but whether consecutive word sequences match, including pairs (bigrams), triples (trigrams), and longer sequences. Matching longer sequences is a stronger signal than matching single words, because the candidate would have to produce multiple words in exactly the right order. The standard implementation uses up to 4-grams. Second, *clipping*: each reference word can only be credited once, preventing a candidate that repeats a single word from scoring artificially high. Third, a *brevity penalty*: candidates shorter than the reference are penalized, since short strings have fewer n-grams to get wrong. For short strings, `max_n` is capped at the length of the shorter string, so a two-word label like “completely agree” is scored on unigrams and bigrams, not penalized for lacking 4-grams.

The `bleu()` function from `ditto` takes a candidate string and a reference and returns a score between 0 and 1. Four candidates, ranging from near-identical to unrelated, scored against the same reference:

``` r
ref_bleu <- "to what extent do you agree with the statement"

tribble(
  ~candidate                                        , ~note              ,
  "to what extent do you agree with the statement"  , "identical"        ,
  "to what extent do you agree with this statement" , "one word differs" ,
  "how much do you agree with the statement"        , "paraphrase"       ,
  "what is your date of birth"                      , "unrelated"
) |>
  mutate(bleu = map_dbl(candidate, bleu, reference = ref_bleu)) |>
  select(candidate, note, bleu)
```

| candidate                                       | note             | bleu |
|:------------------------------------------------|:-----------------|-----:|
| to what extent do you agree with the statement  | identical        | 1.00 |
| to what extent do you agree with this statement | one word differs | 0.75 |
| how much do you agree with the statement        | paraphrase       | 0.60 |
| what is your date of birth                      | unrelated        | 0.00 |

On sentence-level comparisons, scores are noisier and harder to interpret than on full documents because there are fewer n-grams to aggregate over.

### METEOR

METEOR addresses two limitations of BLEU. First, BLEU measures only n-gram precision: what fraction of the candidate’s words appear in the reference, without considering recall. A candidate that covers only part of the reference content can score well on BLEU as long as what it does say is accurate. METEOR computes an F-score over unigrams, combining precision and recall, then applies a fragmentation penalty when the matching words are scattered rather than contiguous.

Second, BLEU requires exact word matches. METEOR extends matching to word stems and synonyms: “walking” matches “walk”, and a synonym from an external lexicon counts as a match. This generally produces better correlation with human judgments than BLEU, but it requires external resources, a stemmer and a synonym lexicon, which limits full support to five languages.

`ditto`’s `meteor()` covers the exact-match and stem-matching stages only; it omits synonym matching, since that needs a WordNet installation available for only a handful of languages. The table below scores it against the same four candidates used throughout this page:

``` r
ref_meteor <- "to what extent do you agree with the statement"

tribble(
  ~candidate                                        , ~note              ,
  "to what extent do you agree with the statement"  , "identical"        ,
  "to what extent do you agree with this statement" , "one word differs" ,
  "how much do you agree with the statement"        , "paraphrase"       ,
  "what is your date of birth"                      , "unrelated"
) |>
  mutate(meteor = map_dbl(candidate, meteor, reference = ref_meteor)) |>
  select(candidate, note, meteor)
```

| candidate                                       | note             | meteor |
|:------------------------------------------------|:-----------------|-------:|
| to what extent do you agree with the statement  | identical        |   1.00 |
| to what extent do you agree with this statement | one word differs |   0.88 |
| how much do you agree with the statement        | paraphrase       |   0.67 |
| what is your date of birth                      | unrelated        |   0.06 |

The fragmentation penalty keeps even the identical candidate just under 1: matching every word in one contiguous run still costs a small penalty that only vanishes as the sentence gets longer.

### CHRF

CHRF (character n-gram F-score) computes precision and recall over character n-grams rather than word n-grams, averaged over every order from 1 up to 6 characters, the standard CHRF setting. Because character sequences are shared across inflected forms of a word, CHRF handles morphological variation better than BLEU: a candidate that says “walking” where the reference says “walked” shares the character sequence “walk” and scores higher on CHRF than on BLEU. CHRF++ extends the metric by also counting word bigrams.

`ditto`’s `chrf()` computes this, scored against the same four candidates used throughout this page:

``` r
ref_chrf <- "to what extent do you agree with the statement"

tribble(
  ~candidate                                        , ~note              ,
  "to what extent do you agree with the statement"  , "identical"        ,
  "to what extent do you agree with this statement" , "one word differs" ,
  "how much do you agree with the statement"        , "paraphrase"       ,
  "what is your date of birth"                      , "unrelated"
) |>
  mutate(chrf = map_dbl(candidate, chrf, reference = ref_chrf)) |>
  select(candidate, note, chrf)
```

| candidate                                       | note             | chrf |
|:------------------------------------------------|:-----------------|-----:|
| to what extent do you agree with the statement  | identical        | 1.00 |
| to what extent do you agree with this statement | one word differs | 0.91 |
| how much do you agree with the statement        | paraphrase       | 0.71 |
| what is your date of birth                      | unrelated        | 0.18 |

CHRF scores every non-identical candidate here higher than BLEU does on the same pair, because character overlap survives in places where whole words differ. Even the unrelated candidate shares occasional letters with the reference, so its score does not reach 0.

### ROUGE

ROUGE-n is the recall-oriented counterpart to BLEU, computed at a chosen n-gram order: ROUGE-1 counts single words (unigrams), ROUGE-2 counts word pairs (bigrams), and so on. Where BLEU asks what fraction of the candidate’s n-grams appear in the reference, ROUGE-n asks what fraction of the reference’s n-grams appear in the candidate. A short candidate can score well on BLEU by being precise while missing most of the reference content; ROUGE-n penalizes that.

ROUGE-L replaces n-gram counts with the longest common subsequence, the same alignment idea behind LCS distance above, but applied to whole words instead of characters and used as a match count rather than an edit count. Two strings that share a long common subsequence score high even when the matching tokens are not contiguous, making ROUGE-L less sensitive to exact phrasing than ROUGE-n.

ROUGE is the standard evaluation metric for summarization, where coverage of the reference matters more than precision. `ditto`’s `rouge()` computes ROUGE-1, ROUGE-2, and ROUGE-L, selected with the `variant` argument:

``` r
ref_rouge <- "to what extent do you agree with the statement"

tribble(
  ~candidate                                        , ~note              ,
  "to what extent do you agree with the statement"  , "identical"        ,
  "to what extent do you agree with this statement" , "one word differs" ,
  "how much do you agree with the statement"        , "paraphrase"       ,
  "the statement to what extent do you agree with"  , "reordered"        ,
  "what is your date of birth"                      , "unrelated"
) |>
  mutate(
    rouge_1 = map_dbl(candidate, rouge, reference = ref_rouge, variant = "1"),
    rouge_l = map_dbl(candidate, rouge, reference = ref_rouge, variant = "l")
  ) |>
  select(candidate, note, rouge_1, rouge_l)
```

| candidate | note | rouge_1 | rouge_l |
|:---|:---|---:|---:|
| to what extent do you agree with the statement | identical | 1.00 | 1.00 |
| to what extent do you agree with this statement | one word differs | 0.89 | 0.89 |
| how much do you agree with the statement | paraphrase | 0.71 | 0.71 |
| the statement to what extent do you agree with | reordered | 1.00 | 0.78 |
| what is your date of birth | unrelated | 0.13 | 0.13 |

ROUGE-1 and ROUGE-L agree everywhere in this table except on the reordered candidate. It contains every reference word, so ROUGE-1, which ignores order, scores it as a perfect match; ROUGE-L’s longest common subsequence is broken up by the reordering and scores it lower.

### Other n-gram metrics

A few n-gram metrics round out the family without adding much beyond what Jaccard, cosine, BLEU, and ROUGE already cover.

q-gram counts shared character n-grams directly, rather than reducing each string to a set (Jaccard) or a frequency vector compared by angle (cosine). It sits between the two and rarely changes the ranking either would produce. Available in `stringdist` as `method = "qgram"`.

NIST reweights BLEU’s n-gram precision so that rare, more informative n-grams count for more than common ones. It was designed as an improvement over BLEU for machine translation evaluation but has been largely superseded by METEOR and CHRF, which correlate better with human judgment.

ABLEU extends BLEU with negative reference sentences, penalizing a candidate for resembling a bad translation as well as rewarding it for resembling a good one. It needs those negative references curated ahead of time, which most projects do not have on hand.

CIDEr is a TF-IDF-weighted n-gram metric built for scoring image captions against a set of reference captions. It is not designed for comparing two arbitrary pieces of text; it is mentioned here only because it commonly appears alongside BLEU and ROUGE in NLP evaluation literature.

## Embedding

All the metrics above measure surface overlap: they compare the actual characters or words present in two strings. A paraphrase that conveys the same meaning in entirely different words scores poorly on every one of them. Embedding-based metrics compare meaning instead. A language model reads each string and produces a list of numbers that encode what it means; strings that mean similar things end up with similar numbers. Two metrics build on this in different ways. A whole-string cosine similarity pools each string into a single vector and measures how close the two vectors are. BERTScore keeps one vector per token and matches the tokens of one string against the other.

Both metrics need a model that produces these embeddings. In `ditto`, the embeddings come from a local `llama.cpp` server run with `--pooling none`, which returns one vector per token. The examples below use `bge-m3`, a multilingual embedding model.

### Whole-string cosine

`cosine_similarity()` collapses each string into a single vector and returns the cosine between the two. The server returns per-token vectors, so the pooling into one vector happens in R, set by the `pooling` argument. The setting must match how the model was trained: `bge-m3` uses the leading token’s vector, selected with `pooling = "cls"`.

``` r
cosine_similarity(
  "how much do you agree",
  "to what extent do you agree",
  pooling = "cls"
)
#> [1] 0.87
cosine_similarity(
  "what is your date of birth",
  "to what extent do you agree",
  pooling = "cls"
)
#> [1] 0.53
```

The paraphrase scores 0.87 and the unrelated question 0.53. The surface metrics earlier on this page give the paraphrase a low score, because it shares few words with the reference; the embedding score reflects their shared meaning.

### BERTScore

BERTScore keeps the per-token vectors rather than pooling them. It embeds each token in the context of its sentence, matches every candidate token to its most similar reference token, and reports precision, recall, and their harmonic mean. Precision measures match quality from the candidate’s side, recall from the reference’s side.

``` r
bertscore("how much do you agree", "to what extent do you agree")
#>  precision     recall         f1
#>      0.934      0.927      0.930
bertscore("what is your date of birth", "to what extent do you agree")
#>  precision     recall         f1
#>      0.746      0.755      0.751
```

The paraphrase scores 0.93 and the unrelated question 0.75. Both are high: even unrelated text scores above 0.7, so the raw separation is narrow. The ordering is correct, but the scores need calibrating before they work as thresholds.

### Calibrating BERTScore

`bertscore_baseline()` estimates the score the model assigns to unrelated text by averaging over many random pairs of distinct sentences. Passing that baseline to `bertscore()` rescales each score as (x − baseline) / (1 − baseline), mapping the unrelated floor to 0 while leaving a perfect match at 1.

``` r
baseline <- bertscore_baseline(seed = 1)

bertscore(
  "how much do you agree",
  "to what extent do you agree",
  baseline = baseline
)[["f1"]]
#> [1] 0.80
bertscore(
  "what is your date of birth",
  "to what extent do you agree",
  baseline = baseline
)[["f1"]]
#> [1] 0.29
```

After rescaling, the paraphrase stays at 0.80 while the unrelated question drops to 0.29, a separation the raw scores hid. The baseline is specific to the model and the language and should be estimated from text representative of the comparison.

### Matching across languages

Because `bge-m3` is multilingual, with support for over 100 languages, the embedding metrics recognise a paraphrase across languages where surface metrics find no word overlap, as in this comparison of an English question with its Dutch equivalent:

``` r
bertscore("to what extent do you agree", "in hoeverre bent u het eens")[["f1"]]
#> [1] 0.91
cosine_similarity(
  "to what extent do you agree",
  "in hoeverre bent u het eens",
  pooling = "cls"
)
#> [1] 0.887
```

Both score the cross-lingual pair almost as high as an English paraphrase.

### Other embedding metrics

A few other embedding-based approaches solve the same problem as whole-string cosine and BERTScore. Their tradeoffs mostly explain why they see less use today.

Word Mover’s Distance (WMD) frames similarity as a transport problem: each word in a string is placed at its position in embedding space, and WMD finds the minimum total cost to move every word in the candidate to the nearest word in the reference. Because the cost depends on how close word embeddings are rather than whether words are identical, WMD handles paraphrases without requiring exact matches: “car” and “automobile” are close in embedding space, so using one where the reference uses the other incurs a low transport cost. WMD relies on static word embeddings such as GloVe or Word2Vec, where each word maps to a single fixed vector regardless of context, so “bank” gets the same vector in “river bank” and “bank account”. It is also expensive: finding the optimal transport plan scales poorly with string length compared to cosine similarity or greedy token matching.

MoverScore applies the same transport idea using contextual BERT embeddings instead of static word vectors, which removes the fixed-vector limitation. In practice, though, MoverScore and BERTScore perform similarly: matching each token to its single best counterpart, as BERTScore does, captures most of what the optimal transport plan adds, at a fraction of the computational cost. That is why BERTScore, not MoverScore, appears in the case study below.

MEANT 2.0 and YiSi-1 take a different approach, scoring similarity from shallow semantic parses (who did what to whom) built on top of word embeddings, rather than from token-level matching. They correlate well with human judgment in evaluation studies but need a semantic role labeler for each language, which most languages don’t have, so they see little practical use outside a few well-resourced ones.

## Learned metrics

Learned metrics fit a model on human similarity judgments and predict a score directly, rather than applying a fixed rule. BEER combines character n-grams and word bigrams in a regression; BLEND combines predictions from around thirty existing metrics; RUSE combines several pretrained sentence embedding models. All three need annotated training data for the domain they are applied to and generalize poorly outside it, which makes them a poor fit for a one-off comparison task. None has an R implementation.

## Case study: survey question

The reference is a survey question, and the four variants range from near-identical wording to entirely unrelated content. Before computing any metric, the strings are cleaned (lowercased, punctuation stripped) so that surface differences do not distort the scores.

``` r
reference <- clean("To what extent do you agree with the following statements?")

variants <- tribble(
  ~label           , ~text                                                       ,
  "Near-identical" , "To what extent do you agree with the following statement?" ,
  "Paraphrase"     , "How much do you agree with each of the statements below?"  ,
  "Different"      , "How satisfied are you with the service you received?"      ,
  "Unrelated"      , "What is your highest level of education completed?"
) |>
  mutate(text = clean(text))
```

The table below shows all six metrics applied to the four variants. `compare_strings()` computes the surface metrics and BLEU from the cleaned text directly, and adds the two embedding columns when `bert = TRUE`:

``` r
compare_strings(variants$text, reference, bert = TRUE, pooling = "cls") |>
  mutate(label = variants$label, .before = 1) |>
  select(label, levenshtein, jaccard, cosine, bleu, bertscore_f1, cosine_emb)
```

| label          | levenshtein | jaccard | cosine | bleu | bertscore_f1 | cosine_emb |
|:---------------|------------:|--------:|-------:|-----:|-------------:|-----------:|
| Near-identical |        0.98 |    1.00 |   1.00 | 0.88 |         0.98 |       0.96 |
| Paraphrase     |        0.49 |    0.86 |   0.94 | 0.26 |         0.95 |       0.91 |
| Different      |        0.35 |    0.67 |   0.84 | 0.00 |         0.77 |       0.62 |
| Unrelated      |        0.25 |    0.82 |   0.92 | 0.00 |         0.73 |       0.48 |

### Choosing a metric

Levenshtein, Jaccard, and cosine often agree, but they diverge in predictable ways that reflect what each one measures.

Levenshtein is position-sensitive: a character in the wrong place is penalised the same as a missing character. It responds to small, local changes such as a typo, a missing word ending, or a transposition.

Jaccard ignores order and frequency. Where Jaccard and Levenshtein disagree, either word order has shifted or a character appears a different number of times.

Cosine also ignores order but tracks character frequency. It distinguishes between a character appearing once and appearing many times, which Jaccard does not. Cosine and Jaccard agree when frequency makes no difference; they split when it does. For most purposes, cosine is more informative than Jaccard.

Levenshtein is the right choice when small character-level edits matter. Cosine is better suited when strings differ substantially in length but share the same character patterns, because it is not penalised by extra characters the way Levenshtein is. Jaccard adds little alongside cosine, since cosine captures everything Jaccard measures and more.

BLEU operates at a different level. Rather than characters, BLEU measures the overlap of word sequences between the candidate and the reference. This makes it sensitive to word order in a way the character metrics are not. Two strings with the same words in a different order score lower on BLEU but are indistinguishable on cosine or Jaccard. For evaluating translations, where word arrangement carries meaning, BLEU is more appropriate.

TER trades BLEU’s bounded 0–1 score for a literal word-level edit count. That is easier to read as “how many words would need to change,” but because it is unbounded, it is harder to compare across candidate-reference pairs of different lengths.

CHRF replaces BLEU’s word n-grams with character n-grams. Because it does not require whole words to match, an inflected or slightly misspelled candidate keeps scoring well where BLEU’s exact word matching drops sharply.

ROUGE adds the recall that BLEU’s brevity penalty only approximates, so a candidate that omits reference content is penalized directly rather than through a length proxy. That makes it the better choice when the candidate is expected to cover the reference’s content rather than reproduce its exact wording, as in summarization.

METEOR keeps BLEU’s word-level matching but adds stemming and a penalty for scattering the matched words instead of keeping them contiguous. It rewards an inflected paraphrase that BLEU would score as a total mismatch, while still preferring a candidate that matches the reference in one run over one that matches the same words out of order.

None of these surface metrics captures meaning. When paraphrasing is expected, surface overlap underestimates similarity, and semantic similarity from embeddings gives a more accurate picture.

Between the two embedding metrics, whole-string cosine is cheaper: it pools each string into a single vector and compares two numbers. BERTScore keeps one vector per token and matches them individually, which captures partial overlap that whole-string pooling can wash out, at the cost of comparing every token pair instead of two vectors. Unless the strings are long enough that partial matches matter, whole-string cosine is the more practical default.

## Language considerations

The metrics on this page were developed primarily with English in mind. BLEU needs word tokens, so it tokenizes correctly in languages where words are separated by spaces; languages without space-delimited words, such as Chinese or Japanese, require a dedicated tokenizer before it can be applied. Levenshtein, Jaccard, and cosine operate on individual characters instead, so word boundaries don’t affect them either way. Within space-delimited languages, two features reduce metric reliability: morphological richness and diacritics.

### Morphological richness

Morphology refers to how much a language varies the surface form of a word to express grammatical meaning. In English, a verb has a small number of forms: *walk*, *walks*, *walked*, *walking*. In Turkish, the same root can produce hundreds of forms through suffixation: *evlerinden* (“from their houses”) is a single token built from *ev* (“house”) plus suffixes for plurality, possession, and case. Arabic works similarly, combining a consonantal root with different vowel patterns to produce words with related but distinct meanings.

BLEU is most affected by morphological richness, because it matches exact word tokens. When two questions express the same idea with different inflected forms, the word tokens may share nothing even though the meaning is the same, so BLEU’s n-gram precision drops: bigrams and trigrams in the candidate do not appear verbatim in the reference.

Levenshtein, Jaccard, and cosine are less affected, because as used on this page all three operate on individual characters rather than words. Shared character sequences still contribute to the score even when inflectional suffixes differ. The scores will underestimate similarity, but less so than a word-level metric like BLEU.

Semantic similarity is the most robust to morphological variation. Different surface forms of the same concept are mapped to nearby vectors, so a morphologically varied paraphrase scores similarly to one with identical word forms.

### Diacritics

Diacritics are marks attached to base letters to indicate pronunciation. When they are inconsistently present across texts, surface metrics treat the same word as two different strings. Polish diacritics appear consistently in standard written text, so the issue mainly arises when comparing across sources with inconsistent encoding. Arabic vowel markers are optional and frequently omitted, meaning the same word can appear with or without them across different sources.

Levenshtein counts each diacritic as a character, so a word written with and without diacritics has a non-zero distance. Jaccard and cosine are similarly affected: the character set or frequency vector shifts when diacritical characters appear or disappear. BLEU is affected at the token level: a diacritised and an undiacritised form of the same word will not match.

When texts are inconsistently diacritised, stripping diacritics before any comparison avoids this. For Arabic:

``` r
strip_arabic_diacritics <- function(x) {
  str_remove_all(x, "[ً-ٰٟ]")
}
```

Semantic similarity is largely robust to diacritics. Embedding models are trained on text with both diacritised and undiacritised forms and typically map both variants to nearby vectors.

## Item-level vs. document-level

The examples above compare single strings. For full questionnaires or multi-item instruments, there are two approaches:

**Document-level:** All items are concatenated into one long string and similarity is computed once. This is fast but hides variation within the instrument: a questionnaire that is nearly identical on most items but differs on one key question looks the same as one that is slightly different throughout.

**Item-level:** Source and variant items are aligned one-to-one, similarity is computed for each pair, and the results are summarized across items. This requires aligned data but reveals where the variants diverge.

``` r
items <- tribble(
  ~item , ~source                                                     , ~version_a                                                  , ~version_b                                        ,
      1 , "To what extent do you agree with this statement?"          , "To what extent do you agree with this statement?"          , "How much do you agree with the statement below?" ,
      2 , "How satisfied are you with the service?"                   , "How satisfied are you with the service?"                   , "How happy were you with the service provided?"   ,
      3 , "How likely are you to recommend us to a friend or family?" , "How likely are you to recommend us to a friend or family?" , "Would you recommend us to people you know?"
) |>
  mutate(across(source:version_b, clean))

items |>
  mutate(
    sim_a = stringsim(version_a, source, method = "lv"),
    sim_b = stringsim(version_b, source, method = "lv")
  ) |>
  summarise(
    mean_a = mean(sim_a),
    mean_b = mean(sim_b),
    min_a = min(sim_a),
    min_b = min(sim_b)
  )
```

| mean_a | mean_b | min_a | min_b |
|-------:|-------:|------:|------:|
|      1 |   0.55 |     1 |  0.46 |

The item-level summary shows not just the average similarity but also where a version diverges most from the original.
