---
title: Text Categorization with LLMs
description: >-
  Classifying open-ended text into categories with LLMs, and validating the
  output
toc: true
---


- [mall](#mall)
  - [Setup](#setup)
  - [Data](#data)
  - [Classification](#classification)
- [Evaluating LLM performance](#evaluating-llm-performance)
  - [Against ground truth](#against-ground-truth)
  - [Interactive human evaluation](#interactive-human-evaluation)
  - [Sample size planning](#sample-size-planning)

<details class="code-fold">
<summary>Code</summary>

``` r
library(tidyverse)
library(mall)
library(cli)

theme_set(theme_minimal())

color_primary <- "#2171b5"
color_secondary <- "#888888"
color_reference <- "gray50"
```

</details>

LLMs can assign text to predefined categories reliably and at scale, without manually labelling every item. This is useful for open-ended survey responses, product reviews, social media posts, or any text where you want to sort items into groups. However, despite their abilities, it remains necessary to validate their output and see whether they correctly categorized the responses, or at least match the performance of human raters.

This page uses the `mall` package to classify movie reviews and then shows two ways to evaluate how well the LLM performs.

## mall

The `mall` package provides a tidy interface for common LLM tasks, including classification. It works by sending each row of a dataframe column to an LLM and returning the result in a new column. The LLM can be a local model or a commercial model available via APIs. In the example below we use a local Gemma 4 model.

### Setup

Specify the backend once with `llm_use()`:

``` r
llm_use("ollama", "gemma4:e4b")
```

### Data

The `movie_review` dataset from the `text2vec` package contains 5,000 IMDB movie reviews with known sentiment labels (positive or negative). We work with a random sample of 50 reviews with fewer than 250 characters, to keep this simple.

``` r
set.seed(44)
data(movie_review, package = "text2vec")

reviews <- movie_review |>
  as_tibble() |>
  mutate(
    sentiment = if_else(sentiment == 1, "positive", "negative"),
    review = str_remove_all(review, "<[^>]+>") |> str_squish()
  ) |>
  filter(nchar(review) < 250) |>
  slice_sample(n = 50)

reviews
```

| id | sentiment | review |
|:---|:---|:---|
| 1433_10 | positive | Brilliant execution in displaying once and for all, this time in the venue of politics, of how "good intentions do actually pave the road to hell". Excellent! |
| 10403_2 | negative | Just a few words…. This movie really sucks. It’s like those TV Movies with bad cast and plot. It’s amazing how they could make this sequel worse than the III. Don’t waste your time watching this crap, even if you like the tremors movies. |
| 8716_10 | positive | I thought this was a quiet good movie. It was fun to watch it. What I liked best where the ‘Outtakes’ at the end of the movie. They were GREAT. |
| 12193_10 | positive | What can I say, it’s a damn good movie. See it if you still haven’t. Great camera works and lighting techniques. Awesome, just awesome. Orson Welles is incredible ‘The Lady From Shanghai’ can certainly take the place of ‘Citizen Kane’. |
| 259_3 | negative | photography was too jumpy to follow. dark scenes hard to see.Had good story line too bad it got lost somewhere. Too noisy for what was really happening Bottom line is it’s a baddddd movie |
| 1550_1 | negative | I honestly don’t understand how tripe like this gets made. The worst junior-high talent show skit you’ve ever seen is more entertaining than this film. Will Ferrell’s wrestling fetish provides the only (briefly) humorous moments. Utterly horrible. |
| 11950_2 | negative | This is without a doubt the worst movie I have ever seen. It is not funny. It is not interesting and should not have been made. |
| 8713_10 | positive | This movie is full of references. Like "Mad Max II", "The wild one" and many others. The ladybugs face its a clear reference (or tribute) to Peter Lorre. This movie is a masterpiece. Well talk much more about in the future. |
| 12058_4 | negative | Repugnant Bronson thriller. Unfortunately, it’s technically good and I gave it 4/10, but it’s so utterly vile that it would be inconceivable to call it "entertainment". Far more disturbing than a typical slasher film. |
| 5060_8 | positive | The movie is wonderful. It shows the man’s work for the wilderness and a natural understanding of the harmony of nature, without being an "extreme" naturalist. I definitely plan to look for the book. This is a rare treasure! |
| 10018_3 | negative | The characters are unlikeable and the script is awful. It’s a waste of the talents of Deneuve and Auteuil. |
| 10477_1 | negative | I would highly recommend seeing this movie. After viewing it, you will be able to walk out of every other bad movie EVER saying "at least it wasn’t The Omega Code."Forget my money, I want my TIME back! |
| 7881_9 | positive | What fun! Bucketfuls of good humor, terrific cast chemistry (Skelton/Powell/Lahr/O’Brien), dynamite Dorsey-driven soundtrack! Miss Powell’s dance numbers have exceptional individual character and pizzazz. Her most winning film appearance. |
| 10387_1 | negative | Giant crabs cursing in Japanese? What was in that drink? A terrible movie, but laughable. I love the invisible Samurai ghosties running around. Drink much beer before you see this movie. |
| 11924_10 | positive | GREAT movie and the family will love it!! If kids are bored one day just pop the tape in and you’ll be so glad you did!!!~Rubei luv raven-s! |
| 9599_1 | negative | Boring, badly written Italian exploitation flick.Lots of nudity, gore and awful acting.The werewolf makeup was the only thing that would raise a laugh.Complete rubbish-even for fans of cheesy Italian horror.Please avoid. |
| 825_1 | negative | I can’t believe they got the actors and actresses of that caliber to do this movie. That’s all I’ve got to say - the movie speaks for itself!! |
| 7479_3 | negative | It’s terrific when a funny movie doesn’t make smile you. What a pity!! This film is very boring and so long. It’s simply painfull. The story is staggering without goal and no fun.You feel better when it’s finished. |
| 4466_2 | negative | Spanish horrors are not bad at all, some are smart with interesting stories, but is not the case of "Second Name". It is badly directed, badly acted and boring…boring…boring, a missed chance for an interesting story. |
| 6016_10 | positive | This movie is one of the masterpieces from Mr. Antonioni. It is about youth, distraction, happiness, alienation, materialism, honor, corruption. And it is like everything else from great Italian director -true art. |
| 4255_9 | positive | I really enjoyed this movie. The script is fresh and unpredictable and the acting is outstanding.It is a down-to-earth movie with characters one cares about. It brought tears into my eyes a few times but left me with a great feeling afterwards. |
| 11785_1 | negative | Slim Slam Slum is a sad and disappointing picture. There is absolutely no reason to this sorry excuse for a picture. Don`t go there, what ever you do, don`t. Watch TV-Shop for 10 hours straight instead. That way you will be slightly amused. |
| 2263_10 | positive | I felt drawn into the world of the manipulation of mind and will at the heart of the story. The acting by Nolte, Lee, Arkin and the supporting cast was superb. The strange twists in the Vonnegut story are made stranger by odd details. |
| 10288_10 | positive | I absolutely loved this movie. It met all expectations and went beyond that. I loved the humor and the way the movie wasn’t just randomly silly. It also had a message. Jim Carrey makes me happy. :) |
| 11727_7 | positive | This film is fun, if your a person who likes a good campy feature film every now and then. By no means is this movie fine cinema, but if you dont take things too seriously, and can laugh at yourself once in a while, Elvira is a good frownbuster. |
| 8714_10 | positive | To quote Flik, that was my reaction exactly: Wow…you’re perfect! This is the best movie! I think I can even say it’s become my favorite movie ever, even. Wow. I tell you what, wow. |
| 987_8 | positive | The movie is great and I like the story. I prefer this movie than other movie such The cell ( sick movie ) and Highlander ( silly movie ). I just tell the truth, I like a reality hehe and also a true story :) |
| 9552_8 | positive | A real classic. A shipload of sailors trying to get to the towns daughters while their fathers go to extremes to deter the sailors attempts. A maidens cry for aid results in the dispatch of the "Rape Squad". A cult film waiting to happen! |
| 1252_4 | negative | After looking at monkeys (oops apes) for more than one hour, I was feeling like one too. I was an ape, spending money on this movie. Please people, hold you money in your pocket and go see some funny movie like Bridget Jones’s Diary.. |
| 2933_10 | positive | If you ever see a stand up comedy movie this is the one. You will laugh nonstop if you have any sense of humor at all. This is a once in a lifetime performance from a once in a lifetime performer. This is a stand up standard. |
| 10207_10 | positive | This film has renewed my interest in French cinema. The story is enchanting, the acting is flawless and Audrey Tautou is absolutely beautiful. I imagine that we will be seeing a lot more of her in the States after her upcoming role in Amelie. |
| 12124_1 | negative | Any movie that portrays the hard-working responsible husband as the person who has to change because of bored, cheating wife is an obvious result of 8 years of the Clinton era.It’s little wonder that this movie was written by a woman. |
| 1698_10 | positive | Laughs, adventure, a good time, a killer soundtrack, oscar-worthy acting, and special effects/ animitronics like none other, what else could you want in a movie? If you see this will be on the telly, WATCH IT, otherwise, run out now to RENT IT!!! |
| 4577_10 | positive | This movie is so good I could watch it all day long! Mary-Kate and Ashley were robbed at Oscar time!! If I got to be one of the actors I would be so excited!!! I can’t wait for the new Charlie’s Angels movie starring Mary-Kate and Ashley. |
| 9480_10 | positive | mature intelligent and highly charged melodrama unbelivebly filmed in China in 1948. wei wei’s stunning performance as the catylast in a love triangle is simply stunning if you have the oppurunity to see this magnificent film take it |
| 2698_8 | positive | I liked the movie a real lot. Wanted to see it just for Dara Tomanovich, but the plot and story were ok too. A very cool change in plot when you least expect it. |
| 4464_1 | negative | I have never seen such terrible performances in all my life.Everyone in the entire film was absolute rubbish.Not one decent actor/actress in the whole film, it was a joke.Reminded me of drama at school… |
| 1434_10 | positive | Kept my attention from start to finish. Great performances added to this tremendous film. Mr. Pacino once again gives us another brilliant character to enjoy. |
| 11824_1 | negative | This tear-teaser, written by Steve Martin himself, is so unbelievably bad, it makes you sick to your stomach!The plot is pathetic, the acting awful, and the dialogue is even more predictable than the ending.Avoid at all costs! |
| 728_3 | negative | i am very disappointed with this movie because i like these french actors and i liked "Buffet Froid" from this Director (bertrand blier) but the script of "Les Acteurs" is VERY POOR. why these actors they agreed to play this poor scenario. |
| 4518_9 | positive | Adrian Pasdar is excellent is this film. He makes a fascinating woman. |
| 5113_3 | negative | This movie was way too slow and predictable.I wish i could say more but i can’t.If you enjoy action/adventure films,this is not one to see.I’d suggest you go see movies like;Behind Enemy Lines with Owen Wilson and Iron Eagle with Louis Gossett Jr. |
| 10492_1 | negative | I would love to have that two hours of my life back. It seemed to be several clips from Steve’s Animal Planet series that was spliced into a loosely constructed script. Don’t Go, If you must see it, wait for the video … |
| 11578_1 | negative | Perhaps the biggest waste of production time, money and the space on the video store shelf. If someone suggests you see this movie, run screaming in the other direction. Unless, of course, you’re into self-abuse. |
| 1116_9 | positive | Did Sandra (yes, she must have) know we would still be here for her some nine years later?See it if you haven’t, again if you have; see her live while you can. |
| 9979_1 | negative | This is one of the worst movies I have ever seen! I saw it at the Toronto film festival and totally regret wasting my time. Completely unwatchable with no redeeming qualities whatsoever.Steer clear. |
| 12421_10 | positive | Very smart, sometimes shocking, I just love it. It shoved one more side of David’s brilliant talent. He impressed me greatly! David is the best. The movie captivates your attention for every second. |
| 1733_7 | positive | Much underrated camp movie on the level of Cobra Woman, etc. Photographic stills resemble Rembrandt prints. Sometimes subtle dialog and hidden literate touches found throughout. |
| 11873_1 | negative | "Ally McBeal" was a decent enough show, but it was very overrated. The characters become boring after a while and the jokes begin to fall short.I think it chose an appropriate point in time to leave - it was starting to outstay its welcome. |
| 12353_1 | negative | I think that movie can`t be a Scott`s film. That is impossible. Do you remember Blade Runner? And Alien? Two greats movies versus a one. I hope didnt see ever it. good bye!! |

### Classification

`llm_classify()` takes a dataframe, the column containing the text, and a character vector of valid categories. It sends each review to the LLM and appends the result in a new `.classify` column:

``` r
mall_results <- reviews |>
  llm_classify(review, c("positive", "negative"))
```

Since each review requires a separate LLM call, classification can take a while. To log progress during a longer run, process one row at a time inside `map()` with purrr’s built-in progress bar:

``` r
mall_results <- map(
  seq_len(nrow(reviews)),
  \(i) reviews[i, ] |> llm_classify(review, c("positive", "negative")),
  .progress = "Classifying reviews"
) |>
  bind_rows()
```

``` r
saveRDS(mall_results, "mall_results.rds")
```

| id | sentiment | review | .classify |
|:---|:---|:---|:---|
| 1433_10 | positive | Brilliant execution in displaying once and for all, this time in the venue of politics, of how "good intentions do actually pave the road to hell". Excellent! | negative |
| 9599_1 | negative | Boring, badly written Italian exploitation flick.Lots of nudity, gore and awful acting.The werewolf makeup was the only thing that would raise a laugh.Complete rubbish-even for fans of cheesy Italian horror.Please avoid. | negative |
| 825_1 | negative | I can’t believe they got the actors and actresses of that caliber to do this movie. That’s all I’ve got to say - the movie speaks for itself!! | positive |
| 5060_8 | positive | The movie is wonderful. It shows the man’s work for the wilderness and a natural understanding of the harmony of nature, without being an "extreme" naturalist. I definitely plan to look for the book. This is a rare treasure!<br /><br /> | positive |
| 1550_1 | negative | I honestly don’t understand how tripe like this gets made. The worst junior-high talent show skit you’ve ever seen is more entertaining than this film. Will Ferrell’s wrestling fetish provides the only (briefly) humorous moments. Utterly horrible. | negative |
| 11950_2 | negative | This is without a doubt the worst movie I have ever seen. It is not funny. It is not interesting and should not have been made. | negative |
| 8713_10 | positive | <br /><br />This movie is full of references. Like "Mad Max II", "The wild one" and many others. The ladybugs face its a clear reference (or tribute) to Peter Lorre. This movie is a masterpiece. Well talk much more about in the future. | positive |
| 12058_4 | negative | Repugnant Bronson thriller. Unfortunately, it’s technically good and I gave it 4/10, but it’s so utterly vile that it would be inconceivable to call it "entertainment". Far more disturbing than a typical slasher film. | negative |
| 235_10 | positive | A wonderful movie! Anyone growing up in an Italian family will definitely see themselves in these characters. A good family movie with sadness, humor, and very good acting from all. You will enjoy this movie!! We need more like it. | positive |
| 4518_9 | positive | Adrian Pasdar is excellent is this film. He makes a fascinating woman. | positive |
| 10695_8 | positive | Nicole Kidman is a wonderful actress and here she’s great. I really liked Ben Chaplin in The Thin Red Line and he is very good here too. This is not Great Cinema but I was most entertained. Given most films these days this is High Praise indeed. | positive |
| 7881_9 | positive | What fun! Bucketfuls of good humor, terrific cast chemistry (Skelton/Powell/Lahr/O’Brien), dynamite Dorsey-driven soundtrack! Miss Powell’s dance numbers have exceptional individual character and pizzazz. Her most winning film appearance. | positive |
| 7479_3 | negative | It’s terrific when a funny movie doesn’t make smile you. What a pity!! This film is very boring and so long. It’s simply painfull. The story is staggering without goal and no fun.<br /><br />You feel better when it’s finished. | negative |
| 11924_10 | positive | GREAT movie and the family will love it!! If kids are bored one day just pop the tape in and you’ll be so glad you did!!!<br /><br />~Rube<br /><br />i luv raven-s! | positive |
| 1252_4 | negative | After looking at monkeys (oops apes) for more than one hour, I was feeling like one too. I was an ape, spending money on this movie. Please people, hold you money in your pocket and go see some funny movie like Bridget Jones’s Diary.. | negative |
| 1698_10 | positive | Laughs, adventure, a good time, a killer soundtrack, oscar-worthy acting, and special effects/ animitronics like none other, what else could you want in a movie? If you see this will be on the telly, WATCH IT, otherwise, run out now to RENT IT!!! | positive |
| 8714_10 | positive | To quote Flik, that was my reaction exactly: Wow…you’re perfect! This is the best movie! I think I can even say it’s become my favorite movie ever, even. Wow. I tell you what, wow. | positive |
| 8716_10 | positive | I thought this was a quiet good movie. It was fun to watch it. What I liked best where the ‘Outtakes’ at the end of the movie. They were GREAT. | positive |
| 4466_2 | negative | Spanish horrors are not bad at all, some are smart with interesting stories, but is not the case of "Second Name". It is badly directed, badly acted and boring…boring…boring, a missed chance for an interesting story. | negative |
| 9480_10 | positive | mature intelligent and highly charged melodrama unbelivebly filmed in China in 1948. wei wei’s stunning performance as the catylast in a love triangle is simply stunning if you have the oppurunity to see this magnificent film take it | positive |
| 2263_10 | positive | I felt drawn into the world of the manipulation of mind and will at the heart of the story. The acting by Nolte, Lee, Arkin and the supporting cast was superb. The strange twists in the Vonnegut story are made stranger by odd details. | positive |
| 11785_1 | negative | Slim Slam Slum is a sad and disappointing picture. There is absolutely no reason to this sorry excuse for a picture. Don`t go there, what ever you do, don`t. Watch TV-Shop for 10 hours straight instead. That way you will be slightly amused. | negative |
| 6016_10 | positive | This movie is one of the masterpieces from Mr. Antonioni. It is about youth, distraction, happiness, alienation, materialism, honor, corruption. And it is like everything else from great Italian director -true art.<br /><br /> | positive |
| 12124_1 | negative | Any movie that portrays the hard-working responsible husband as the person who has to change because of bored, cheating wife is an obvious result of 8 years of the Clinton era.<br /><br />It’s little wonder that this movie was written by a woman. | negative |
| 728_3 | negative | i am very disappointed with this movie because i like these french actors and i liked "Buffet Froid" from this Director (bertrand blier) but the script of "Les Acteurs" is VERY POOR. why these actors they agreed to play this poor scenario. | negative |
| 9552_8 | positive | A real classic. A shipload of sailors trying to get to the towns daughters while their fathers go to extremes to deter the sailors attempts. A maidens cry for aid results in the dispatch of the "Rape Squad". A cult film waiting to happen! | negative |
| 4464_1 | negative | I have never seen such terrible performances in all my life.<br /><br />Everyone in the entire film was absolute rubbish.<br /><br />Not one decent actor/actress in the whole film, it was a joke.<br /><br />Reminded me of drama at school… | negative |
| 2933_10 | positive | If you ever see a stand up comedy movie this is the one. You will laugh nonstop if you have any sense of humor at all. This is a once in a lifetime performance from a once in a lifetime performer. This is a stand up standard. | positive |
| 12193_10 | positive | What can I say, it’s a damn good movie. See it if you still haven’t. Great camera works and lighting techniques. Awesome, just awesome. Orson Welles is incredible ‘The Lady From Shanghai’ can certainly take the place of ‘Citizen Kane’. | positive |
| 2920_8 | positive | Well I guess it supposedly not a classic because there are only a few easily recognizable faces, but I personally think it is… It’s a very beautiful sweet movie, Henry Winkler did a GREAT job with his character and it really impressed me. | positive |
| 10018_3 | negative | The characters are unlikeable and the script is awful. It’s a waste of the talents of Deneuve and Auteuil. | negative |
| 4577_10 | positive | This movie is so good I could watch it all day long! Mary-Kate and Ashley were robbed at Oscar time!! If I got to be one of the actors I would be so excited!!! I can’t wait for the new Charlie’s Angels movie starring Mary-Kate and Ashley. | positive |
| 10403_2 | negative | Just a few words…. This movie really sucks. It’s like those TV Movies with bad cast and plot. It’s amazing how they could make this sequel worse than the III. Don’t waste your time watching this crap, even if you like the tremors movies. | negative |
| 10670_10 | positive | This is a great film!! The first time I saw it I thought it was absorbing from start to finish and I still do now. I may not have seen the play, but even if I had it wouldn’t stop me thinking that the film is just as good. | positive |
| 259_3 | negative | photography was too jumpy to follow. dark scenes hard to see.<br /><br />Had good story line too bad it got lost somewhere. Too noisy for what was really happening Bottom line is it’s a baddddd movie | negative |
| 1434_10 | positive | Kept my attention from start to finish. Great performances added to this tremendous film. Mr. Pacino once again gives us another brilliant character to enjoy. | positive |
| 4255_9 | positive | I really enjoyed this movie. The script is fresh and unpredictable and the acting is outstanding.It is a down-to-earth movie with characters one cares about. It brought tears into my eyes a few times but left me with a great feeling afterwards. | positive |
| 987_8 | positive | The movie is great and I like the story. I prefer this movie than other movie such The cell ( sick movie ) and Highlander ( silly movie ). I just tell the truth, I like a reality hehe and also a true story :)<br /><br /> | positive |
| 11727_7 | positive | This film is fun, if your a person who likes a good campy feature film every now and then. By no means is this movie fine cinema, but if you dont take things too seriously, and can laugh at yourself once in a while, Elvira is a good frownbuster. | positive |
| 5113_3 | negative | This movie was way too slow and predictable.I wish i could say more but i can’t.If you enjoy action/adventure films,this is not one to see.I’d suggest you go see movies like;Behind Enemy Lines with Owen Wilson and Iron Eagle with Louis Gossett Jr. | negative |
| 10492_1 | negative | I would love to have that two hours of my life back. It seemed to be several clips from Steve’s Animal Planet series that was spliced into a loosely constructed script. Don’t Go, If you must see it, wait for the video … | negative |
| 10477_1 | negative | <br /><br />I would highly recommend seeing this movie. After viewing it, you will be able to walk out of every other bad movie EVER saying "at least it wasn’t The Omega Code."<br /><br />Forget my money, I want my TIME back! | negative |
| 1116_9 | positive | Did Sandra (yes, she must have) know we would still be here for her some nine years later?<br /><br />See it if you haven’t, again if you have; see her live while you can. | positive |
| 9979_1 | negative | This is one of the worst movies I have ever seen! I saw it at the Toronto film festival and totally regret wasting my time. Completely unwatchable with no redeeming qualities whatsoever.<br /><br />Steer clear. | negative |
| 10288_10 | positive | I absolutely loved this movie. It met all expectations and went beyond that. I loved the humor and the way the movie wasn’t just randomly silly. It also had a message. Jim Carrey makes me happy. :) | positive |
| 11578_1 | negative | Perhaps the biggest waste of production time, money and the space on the video store shelf. If someone suggests you see this movie, run screaming in the other direction. Unless, of course, you’re into self-abuse. | negative |
| 10387_1 | negative | Giant crabs cursing in Japanese? What was in that drink? A terrible movie, but laughable. I love the invisible Samurai ghosties running around. Drink much beer before you see this movie. | positive |
| 12353_1 | negative | I think that movie can`t be a Scott`s film. That is impossible. Do you remember Blade Runner? And Alien? Two greats movies versus a one. I hope didnt see ever it. good bye!! | negative |
| 2698_8 | positive | I liked the movie a real lot. Wanted to see it just for Dara Tomanovich, but the plot and story were ok too. A very cool change in plot when you least expect it. | positive |
| 10207_10 | positive | This film has renewed my interest in French cinema. The story is enchanting, the acting is flawless and Audrey Tautou is absolutely beautiful. I imagine that we will be seeing a lot more of her in the States after her upcoming role in Amelie. | positive |

## Evaluating LLM performance

### Against ground truth

Because `movie_review` includes known sentiment labels, we can measure LLM performance directly rather than relying on human spot-checks. We compute accuracy and Cohen’s kappa against the true labels:

``` r
library(psych)
```


    Attaching package: 'psych'

    The following objects are masked from 'package:ggplot2':

        %+%, alpha

``` r
results <- mall_results |>
  mutate(correct = sentiment == .classify)

n <- nrow(results)
agree <- sum(results$correct)

wilson <- prop.test(agree, n, correct = FALSE)

cat(sprintf(
  "Accuracy: %d/%d (%.0f%%) [95%% CI: %.0f%%–%.0f%%]\n",
  agree,
  n,
  wilson$estimate * 100,
  wilson$conf.int[1] * 100,
  wilson$conf.int[2] * 100
))
```

    Accuracy: 46/50 (92%) [95% CI: 81%–97%]

``` r
kappa_result <- cohen.kappa(data.frame(
  true = results$sentiment,
  llm = results$.classify
))

cat(sprintf(
  "Kappa:    %.2f [95%% CI: %.2f–%.2f]\n",
  kappa_result$kappa,
  kappa_result$confid["unweighted kappa", "lower"],
  kappa_result$confid["unweighted kappa", "upper"]
))
```

    Kappa:    0.84 [95% CI: 0.69–0.99]

**Accuracy** is the proportion of items the LLM labelled correctly. The Wilson 95% CI tells you the plausible range of true accuracy given the sample size — with 50 reviews the CI will be wide (roughly ±14 percentage points), so a larger sample gives a more precise estimate. **Cohen’s kappa** adjusts for the chance that the LLM would pick the right label at random; for a balanced binary task like this, chance agreement is 50%, so kappa and accuracy will be closely related. Both metrics come with confidence intervals so you can judge whether you have enough data to determine agreement.

### Interactive human evaluation

When ground truth labels are not available, the alternative is to label a random sample yourself and measure agreement between your labels and the LLM’s. The chunk below runs an interactive session in your R console: each iteration shows a random review, asks for your label, then reveals the LLM’s label and updates the running agreement statistics.

``` r
llm_labels_all <- mall_results$.classify
reviews_text <- mall_results$review
categories <- c("positive", "negative")

human_labels <- character(0)
llm_labels <- character(0)
seen <- integer(0)

repeat {
  remaining <- setdiff(seq_along(reviews_text), seen)
  if (length(remaining) == 0) {
    cli_alert_success("All reviews labelled.")
    break
  }

  i <- sample(remaining, 1)
  seen <- c(seen, i)

  cli_rule(left = paste("Review", length(seen), "of", length(reviews_text)))
  cat("\n", reviews_text[i], "\n\n")
  input <- tolower(trimws(readline(
    prompt = paste0("Label (", paste(categories, collapse = "/"), "/q): ")
  )))

  if (input == "q") {
    break
  }
  if (!input %in% categories) {
    cli_alert_warning("Unrecognised label — skipping.")
    seen <- seen[-length(seen)]
    next
  }

  human_labels <- c(human_labels, input)
  llm_labels <- c(llm_labels, llm_labels_all[i])

  n <- length(human_labels)
  agree <- sum(human_labels == llm_labels)

  wilson <- prop.test(agree, n, correct = FALSE)
  pct <- wilson$estimate
  ci <- wilson$conf.int

  cli_rule(left = "Results")
  cli_text("You: {.strong {input}}  |  LLM: {.strong {llm_labels_all[i]}}")
  cat("\n")
  cli_text(
    "Agreement: {agree}/{n} ({round(pct * 100)}%)",
    " [95% CI: {round(ci[1] * 100)}%–{round(ci[2] * 100)}%]"
  )

  if (n >= 2) {
    ratings <- data.frame(human = human_labels, llm = llm_labels)
    kappa_result <- tryCatch(cohen.kappa(ratings), error = function(e) NULL)
    if (!is.null(kappa_result)) {
      k <- kappa_result$kappa
      k_ci <- kappa_result$confid["unweighted kappa", c("lower", "upper")]
      cli_text(
        "Kappa:     {round(k, 2)}",
        " [95% CI: {round(k_ci['lower'], 2)}–{round(k_ci['upper'], 2)}]"
      )
    }
  }
  cat("\n")
}
```

The CI on percent agreement narrows as you label more items. Once the lower bound exceeds whatever threshold you find acceptable — say, 80% — you have statistical evidence the LLM is performing well enough.

### Sample size planning

Before you start labelling, it helps to know how many items you need to reach a CI narrow enough to be informative. The answer depends on two things: the CI width you can tolerate and the true agreement you expect. Both metrics have closed-form approximations.

For **percent agreement**, the 95% CI width is:

$$w \approx 2 \times 1.96 \times \sqrt{\frac{p(1-p)}{n}}$$

Solving for $n$:

$$n \approx \frac{4 \times 1.96^2 \times p(1-p)}{w^2}$$

For **kappa**, the Cicchetti approximation gives a similar expression. It assumes balanced categories (equal base rates for each class), under which chance agreement is $p_e = 0.5$ and observed agreement maps to kappa as $p_0 = (\kappa + 1)/2$:

$$n \approx \frac{16 \times 1.96^2 \times p_0(1-p_0)}{w^2}$$

The factor of 16 rather than 4 reflects that kappa compresses the scale by $(1 - p_e) = 0.5$, requiring roughly four times as many observations for the same CI width.

``` r
required_n <- function(
  width,
  agreement,
  conf = 0.95,
  metric = c("percent", "kappa")
) {
  metric <- match.arg(metric)
  z <- qnorm(1 - (1 - conf) / 2)
  if (metric == "percent") {
    ceiling(4 * z^2 * agreement * (1 - agreement) / width^2)
  } else {
    p0 <- (agreement + 1) / 2
    ceiling(16 * z^2 * p0 * (1 - p0) / width^2)
  }
}
```

For example, to achieve a CI no wider than ±10 percentage points (total width 0.20), assuming 80% true agreement:

``` r
required_n(width = 0.20, agreement = 0.80, metric = "percent")
```

    [1] 62

``` r
required_n(width = 0.20, agreement = 0.80, metric = "kappa")
```

    [1] 139

The plot below shows how CI width shrinks with sample size for a range of assumed agreement levels. Kappa consistently requires more items than percent agreement to achieve the same precision.

![Expected 95% CI width as a function of the number of rated items, for four levels of assumed true agreement. Kappa requires roughly four times as many items as percent agreement for equivalent precision (note the different x-axis scales).](index_files/figure-commonmark/sample-size-plot-1.svg)
