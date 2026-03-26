---
title: Best practices in EFA
order: 1
toc: true
prefer-html: true
---


<link href="EFA-best-practices_files/libs/htmltools-fill-0.5.9/fill.css" rel="stylesheet" />
<script src="EFA-best-practices_files/libs/htmlwidgets-1.6.4/htmlwidgets.js"></script>
<script src="EFA-best-practices_files/libs/viz-1.8.2/viz.js"></script>
<link href="EFA-best-practices_files/libs/DiagrammeR-styles-0.2/styles.css" rel="stylesheet" />
<script src="EFA-best-practices_files/libs/grViz-binding-1.0.11/grViz.js"></script>

- [Preparation](#preparation)
  - [Sample](#sample)
  - [Sample size](#sample-size)
  - [Number of items](#number-of-items)
- [Data Analysis](#data-analysis)
  - [Relevant items](#relevant-items)
  - [Sampling Adequacy](#sampling-adequacy)
  - [Principal Components vs. Factor Analysis](#principal-components-vs-factor-analysis)
  - [Number of factors](#number-of-factors)
  - [Factor Extraction Method](#factor-extraction-method)
  - [Rotation methods](#rotation-methods)
- [Interpretation](#interpretation)
  - [Factor Loadings](#factor-loadings)
  - [Reliability](#reliability)
- [](#section)
- [](#section-1)
- [References](#references)

> [!WARNING]
>
> This chapter is still a work in progress.

The goal of an exploratory factor analysis (EFA) is to study latent factors that underlie responses to a larger number of items. In other words, the goal is to *explore* the data and *reduce* the number of variables. It is a popular technique in the development and validation of assessment instruments.

Unlike confirmatory factor analysis (CFA), EFA is used when there is little or no a priori justification for specifying a particular structural model. This means that there is reasonable uncertainty about the number of underlying factors and which items load on which factor. The hope is to resolve some of that uncertainty empirically.

## Preparation

Before you perform a factor analysis, make sure that the design of your study is suitable for this type of analysis. This means you should have an appropriate sample, sample size, and indicators (items).

### Sample

It may be obvious, but make sure to target participants that are likely to vary in the attitude that you’re interested in measuring and that the sample is representative of the population that you’re interested in.

### Sample size

Rules of thumb are one way to determine an appropriate sample size, but the general consensus is that rules of thumb are a bad idea Costello & Osborne (2005). The reason for that is that rules of thumb only involve one of two factors: a set number of participants or a particular participant-to-item ratio. The reality is that the appropriate sample size is dependent on many more factors, such as [communalities](EFA-glossary.qmd#communality), factor loadings, the number of indicators per factor, the number of factors, and more Velicer & Fava (1998).

Given the replication failures in the social sciences, it should be no surprise that also in the EFA literature there appears to be a sample size problem. This is perhaps best demonstrated by Costello & Osborne (2005). They reviewed two years’ worth of PsychINFO articles and found that the majority of the studies (62.9%) had participants to item ratios of 10:1 or less. Of course, the participant to item ratio is not a good benchmark for the appropriate sample size, so this is not enough to demonstrate that the sample size is insufficient. They did find support that this is not enough by sampling data of various sample sizes from a large data set of responses to the Marsh’s Self-Description Questionnaire. They found that only 70% of their large (20:1) samples produced correct solutions, leading them to conclude that a 20:1 participant to item ratio produces error rates well above the field standard alpha = .05 level.

So how many participants should you recruit? In my opinion, the most useful study is a simulation study by Mundfrom et al. (2005). They ran simulations to determine the minimum sample size for a study, taking into account the number of factors, the ratio of items to factors, and several different communalities. They generated a variety of population correlation matrices under different conditions, repeatedly sampled from these population structures, and determined coefficients of congruence between the sample solutions and population structures (similar to Velicer & Fava (1998)). This allowed them to produce a table with minimum recommend sample sizes for different situations.

| Criterion        | Communality     | Items per factor | Minimum sample size |
|------------------|-----------------|------------------|---------------------|
| Excellent (0.98) | High (.6 to .8) | 4                | 500                 |
|                  |                 | 6                | 250                 |
|                  |                 | 8                | 100                 |
|                  | Wide (.2 to .8) | 4                | 900                 |
|                  |                 | 6                | 200                 |
|                  |                 | 8                | 130                 |
|                  | Low (.2 to .4)  | 4                | 1400                |
|                  |                 | 6                | 260                 |
|                  |                 | 8                | 130                 |
| Good (0.92)      | High (.6 to .8) | 5                | 130                 |
|                  |                 | 7                | 55                  |
|                  | Wide (.2 to .8) | 5                | 140                 |
|                  |                 | 8                | 60                  |
|                  | Low (.2 to .4)  | 5                | 200                 |
|                  |                 | 8                | 80                  |

Recommended minimum sample sizes by Mundfrom et al. (2005)

As can be seen in the table, the appropriate sample size is dependent on several factors and is not simply a function of sample size alone or a particular participant to item ratio.

### Number of items

The previous section on sample size shows that a relevant factor in determining the minimum sample size is the number of items per factor, so how many items should you create and include in the factor analysis?

Since this is an exploratory factor analysis, it is not clear in advance how many items will actually survive the exploration. It could be that certain items will not be well understood by participants (although this should be caught in pilot testing prior to running an EFA) or that multiple items simple do not fit in the expected factor structure. Since not all items will likely behave well, you should always include more items than you intend to keep.

It’s also useful to keep in mind that for a single factor model to be identifiable, it must consist of at least three indicators and preferably four to also allow for the model to be statistically testable Russell (2002). This is useful for when you want to do a CFA later or if you want others to be able to perform CFAs on your factor analysis results.

The number of indicators also depends on the quality of indicators. Costello & Osborne (2005) notes that 5 or more strongly loading items (.50 or better) indicate a solid factor. MacCallum et al. (1999) writes that more indicators is generally better Hayduk & Littvay (2012). Within the range of indicators they studied (three to seven per factor), it is better to have more indicators than fewer. The critical point, however, is that these indicators must be reasonably valid and reliable.

Velicer & Fava (1998) suggest that 6-10 initial items per factor is recommended as 25% to 50% will not perform as expected and the end goal should be to have four- or five to-one as a minimum. The bare minimum of three variables was found to be insufficient (based on two simulation studies) and a more prudent target would be to have four- or five to-one as a minimum. A ratio of 20-30 initial items per factor is also possible as an appropriate target for extensive oversampling, which may be needed in cases where it is not possible to obtain a large sample size.

Finally, you should also take into account the desirable scale length. Shorter scales have the desirable property that they are quick to administer, meaning they can more easily be added to a study or included in short studies to obtain a larger sample size. The goal may therefore be to find only a handful of solid indicators for a factor.

## Data Analysis

### Relevant items

One design issue that is especially important is about which measured variables to include in the study. If measured variables irrelevant to the domain of interest are included, then spurious common factors might emerge or true common factors might be obscured (Fabrigar et al., 1999).

### Sampling Adequacy

The Kaiser–Meyer–Olkin (KMO) test is a statistical measure to determine how suitable the data is for factor analysis. The test measures sampling adequacy for the complete model and each variable in the model. The statistic indicates the degree to which each variable in a set is predicted without error by the other variables.

The KMO value ranges from 0 to 1, with 0.60 considered suitable for factor analysis (Tabachnick & Fidell, 2013). Kaiser (1974) himself suggested that KMO \> .9 were marvelous, in the .80s, meritorious, in the .70s, middling, in the .60s, mediocre, in the 50s, miserable, and less than .5, unacceptable.

Bartlett’s test of sphericity is a notoriously sensitive test of the hypothesis that the correlations in a correlation matrix are zero. Because of its sensitivity and its dependence on N, the test is likely to be significant with samples of substantial size even if correlations are very low. Therefore, use of the test is recommended only if there are fewer than around five participants per variable (Tabachnick & Fidell, 2013).

### Principal Components vs. Factor Analysis

An important consideration is whether to use a principal components analysis (PCA) or a factor analysis. PCA is a data reduction technique and while a factor analysis is also a type of data reduction technique, the focus with PCA is more on simply reducing the data, without regard for a theoretical interpretation. With PCA, the variables themselves are of interest, rather than a hypothetical latent construct. Constructs are conceptualized as being causally determined by the observations; that is, CFA reflects a formative model rather than a reflective one (Edwards & Bagozzi, 2000). If you are a psychologist trying to create a measure of a psychological construct, this is probably not what you want as principal component scores are “caused” by their indicators in much the same way that sum scores are “caused” by item scores.” (Borsboom, 2006, p. 426). Instead, you likely want the opposite causal relationship in which a latent factor causes the indicator scores.

``` r
DiagrammeR::grViz("
  digraph dot {
    graph [
      layout = dot, 
      rankdir = LR, 
      fontname = 'Source Sans Pro', 
      label = 'Illustration of a PCA model (left) and a factor analysis model (right).'
    ]
    
    node [fontname = 'Source Sans Pro']
    node [shape = square]
    var1 [label = 'item 1']
    var2 [label = 'item 2']
    var3 [label = 'item 3']
    var4 [label = 'item 4']
    var5 [label = 'item 1']
    var6 [label = 'item 2']  
    var7 [label = 'item 3']  
    var8 [label = 'item 4']
  
    node [shape = circle]
    construct_a [label = 'construct A']
    construct_b [label = 'construct B']
  
    edge [color = black, minlen = 3]
    {var1 var2 var3 var4} -> construct_a
    construct_b -> {var5 var6 var7 var8}
  
    edge[style = invis, minlen = 1];
    construct_a -> construct_b
  }"
)
```

<div class="grViz html-widget html-fill-item" id="htmlwidget-3741aa64007066f745bc" style="width:672px;height:480px;"></div>
<script type="application/json" data-for="htmlwidget-3741aa64007066f745bc">{"x":{"diagram":"\n  digraph dot {\n    graph [\n      layout = dot, \n      rankdir = LR, \n      fontname = \"Source Sans Pro\", \n      label = \"Illustration of a PCA model (left) and a factor analysis model (right).\"\n    ]\n    \n    node [fontname = \"Source Sans Pro\"]\n    node [shape = square]\n    var1 [label = \"item 1\"]\n    var2 [label = \"item 2\"]\n    var3 [label = \"item 3\"]\n    var4 [label = \"item 4\"]\n    var5 [label = \"item 1\"]\n    var6 [label = \"item 2\"]  \n    var7 [label = \"item 3\"]  \n    var8 [label = \"item 4\"]\n  \n    node [shape = circle]\n    construct_a [label = \"construct A\"]\n    construct_b [label = \"construct B\"]\n  \n    edge [color = black, minlen = 3]\n    {var1 var2 var3 var4} -> construct_a\n    construct_b -> {var5 var6 var7 var8}\n  \n    edge[style = invis, minlen = 1];\n    construct_a -> construct_b\n  }","config":{"engine":"dot","options":null}},"evals":[],"jsHooks":[]}</script>

A related issue is that factor analysis assumes that the total variance can be partitioned into common and unique variance and PCA assumes that the common variances takes up all of total variance. This means that PCA assumes that all variables are measured without error. It is usually more reasonable to assume that you have not measured your set of items perfectly.

Although some argue that the two methods have the same results (Velicer & Jackson, 1990), there is evidence that those similarities are mistaken and that factor analysis has better results than PCA (Widaman, 1993).

**Conclusion**: Do not use PCA.

### Number of factors

There are many different methods to determine how many factors to retain. Some popular methods are:

- Theory

- Kaiser criterion

- Scree test

- Parallel analysis

- Velicer’s multiple average partial (MAP) procedure

- Akaike information criterion

- Bayesian information criterion

- Comparison data

- Very Simple Structure (VSS)

- The root-mean-square error of approximation

- Likelihood ratio statistic

Determining the number of factors is probably the most difficult part of the exploratory factor analysis. As Henry Kaiser said:

> Solving the number of factors problem is easy, I do it everyday before breakfast. But knowing the right solution is harder.

The difficulty of this step means that a certain flexibility is warranted.

It makes sense to begin with the expectation that you will see the theorized factor structure. Instruments are rarely perfect (especially the first time it is examined), and theoretical expectations are not always supported, but unless one is on a totally blind fishing expedition, this is a good place to start.

The default in most statistical software packages is to use the Kaiser criterion. It makes some sense, as an eigenvalue represents the sum of the squared factor loadings in a column, and to get a sum of 1.0 or more, one must have rather large factor loadings to square and sum. However, this is easily achieved with more items and there are now alternative methods. Hence, there is broad consensus in the literature that this is among the least accurate methods for selecting the number of factors to retain (Velicer & Jackson, 1990).

The scree test involves examining the graph of the eigenvalues and looking for the natural bend or “elbow” in the data where the slope of the curve changes markedly. Although the scree plot itself is not considered sufficient to determine how many factors should be extracted (Velicer et al., 2000), it does appear to be a relatively reliable method. The main down side seems to be its ambiguity as the bend is not always clear and sometimes there are even multiple bends.

Parallel analysis involves generating random uncorrelated data, and comparing eigenvalues from the EFA to the eigenvalues from the random data. Using this process, only factors with eigenvalues that are above random eigenvalues should be retained, although it is not clear how much above the random eigenvalues they should be. Several authors have endorsed this as the most robust and accurate process for determining the number of factors to extract Velicer et al. (2000).

The Minimum Average Partial (MAP) criterion involves partialing out common variance as each successive component is created. As each successive component is partialed out, common variance will decrease to a minimum. Velicer argued that minimum point should be considered the criterion for the number of factors to extract.

VSS involves degrading the initial rotated factor solution by assuming that the nonsalient loadings are zero, even though in actuality they rarely are. What VSS does is test how well the factor matrix we think about and talk about actually fits the correlation matrix. It is not a confirmatory procedure for testing the significance of a particular loading, but rather it is an exploratory procedure for testing the relative utility of interpreting the correlation matrix in terms of a family of increasingly more complex factor models. The simplest model tested by VSS is that each item is of complexity one, and that all items are embedded in a more complex factor matrix of rank k. This is the model most appropriate for scale construction and is the one we use most frequently when we talk about factor solutions. More complicated models may also be evaluated by VSS.

Zwick & Velicer (1986) tested the scree test, Horn’s parallel test, and Velicer’s MAP test (among others) in simulation studies using a data set with a clear factor structure. Both the parallel test and MAP test seemed to work well. Ruscio & Brendan Roche (2012) notes that PA is considered to be the method of choice among methodologists and recommend that researchers take advantage of PA as a starting point, perhaps supplemented by CD. They note that researchers can also use more than one method. Osborne (2014) notes that MAP has been considered superior to the “classic” criteria, and probably is superior to parallel analysis, although neither is perfect, and all must be used in the context of a search for conceptually interpretable factors. He recommends to use parallel analysis or MAP criteria, along with theory (and any of the classic criteria that suits you and is defensible). Another simulation study, perhaps the most comprehensive one so far, also shows that the results of multiple methods should be taken into consideration (Auerswald & Moshagen, 2019). They recommend that investigators compare the results of sequential $\chi^2$ model tests and either PA<sub>PCA-95</sub>, Hull, or the Empirical Kaiser Criterion (EKC). If both methods suggest the same number of factors, this most often reflects the correct number of underlying factors. If the methods disagree, CD, the EKC, or one of the variants of traditional PA<sub>PCA</sub> are viable extraction criteria provided that the sample is large. They also note the importance of theoretical considerations and that the resulting factor loading patterns should be interpretable and that the scale reliabilities should also be taken into account.

Finally, empirical research suggests that overfactoring introduces much less error to factor loading estimates than under factoring Wood et al. (1996). Although you should be skeptical of solutions with too many factors because the factors may not be meaningful and parsimony should also be considered.

**Conclusion:** Use multiple criteria, including theory, to make a judgment call about how many factors to extract. When in doubt, favor more factors rather than fewer factors.

### Factor Extraction Method

Extraction is the general term for the process of reducing the number of dimensions being analyzed from the number of variables in the data set (and matrix of associations) into a smaller number of factors.

There are multiple factor extraction methods, such as:

- minres

- unweighted least squares (ULS)

- generalized least squares (GLS)

- maximum likelihood

- principal axis factor(ing)

- alpha factor(ing)

- image factor(ing)

It’s not entirely clear which factor extraction method is the best and some authors use different terms for some of the methods, making it more difficult to compare them.

Fabrigar et al. (1999) argued that if data are relatively normally distributed, maximum likelihood is the best choice because “it allows for the computation of a wide range of indexes of the goodness of fit of the model and permits statistical significance testing of factor loadings and correlations among factors and the computation of confidence intervals.” (p. 277). In case the data is not generally normally distributed, they recommend principal axis factoring. This is recommended in several sources (Costello & Osborne (2005); Osborne (2014)).

**Conclusion**: Use the maximum likelihood method if the data is generally normally distributed and to use principal axis factoring if the data is non-normal.

### Rotation methods

The goal of rotation is to clarify the factor structure and make the results of the EFA more interpretable.

Rotation methods can be categorized into one of two categories: orthogonal or oblique. Orthogonal rotations keep axes at a 90 degree angle, forcing the factors to be uncorrelated. Oblique rotations allow angles that are not 90 degrees , thus allowing factors to be correlated if that is optimal for the solution.

Orthogonal rotation methods include:

- varimax

- quartimax

- equamax

Oblique rotation methods include:

- direct oblimin

- quartimin

- promax

In the social sciences, we generally expect some correlation among factors, since behavior is rarely partitioned into neatly packaged units that function independently of one another. Therefore using orthogonal rotation results in a loss of valuable information if the factors are correlated, and oblique rotation should theoretically render a more accurate, and perhaps more reproducible, solution. If the factors are truly uncorrelated, orthogonal and oblique rotation produce nearly identical results. Since oblique rotation will reproduce an orthogonal solution but not vice versa, it makes sense to go for oblique rotation.

There is no widely preferred method of oblique rotation; all tend to produce similar results (Fabrigar et al., 1999).

**Conclusion**: Use any oblique rotation.

## Interpretation

Remember that the goal of exploratory factor analysis is to explore whether your data fits a model that makes sense. Ideally, you have a conceptual or theoretical framework for the analysis. Even if you do not, the results should be sensible in some way. You should be able to construct a simple narrative describing how each factor, and its items, makes sense and is easily labeled.

### Factor Loadings

After determining the number of factors and rotation, you will be able to produce a table of factor loadings. The question is now to see whether there are items that load sufficiently strongly on each factor. If the goal is to have unidimensional factors, then cross loadings should also be examined. Items that don’t perform well may be removed.

There are different recommendations about what kind of factor loading cutoff threshold to use. Comrey & Lee (1992) suggest that loadings in excess of .71 (50% overlapping variance) are considered excellent, .63 (40% overlapping variance) very good, .55 (30% overlapping variance) good, .45 (20% overlapping variance) fair, and .32 (10% overlapping variance) poor. Tabachnick & Fidell (2013) cite .32 as a good rule of thumb for the minimum loading of an item, assuming the sample size is larger than 300. Others say item loadings above .30 (Costello & Osborne, 2005). Clark & Watson (1995) say larger than .35.

In a review on the topic, Peterson (2000) found that the average factor loading cutoff threshold is .40.

Using a particular threshold is, however, insufficient if sample size is not taken into account. Factor loadings, like many other statistics, are estimated statistics and may be associated with large uncertainty intervals, depending on the sample size. It’s possible for a sample factor loading of .70 to be 0 in the population, if the sample size was low (Cudeck & O’Dell, 1994). A first benchmark, therefore, should be whether the factor loading is significantly different from 0. The standard errors of factor loadings can be calculated in different ways. If computational power is not an issue, non-parametric bootstrapping seems to be the preferred method (Zhang, 2014).

Note that a multiple comparisons correction (e.g., Bonferonni) must be used to control familywise Type 1 errors.

Finally, one must be careful not to prematurely drop poorly performing items, especially when such items were predicted a priori to be strong markers of a given factor.

**Conclusion:** Calculate standard errors for factor loadings and use significance tests as the first benchmark to retain an item.

### Reliability

There are different types of reliabilities that can be calculated to assess the reliability of the scale:

- Internal consistency

- Test-retest reliability

Cronbach’s alpha is the most popular measure of internal reliability, with recommended cutoffs of .80 in a basic science setting and .9 or .95 in an applied setting (Clark & Watson, 1995). Note that Cronbach’s alpha relies on the assumption of unidimensionality, which means it cannot be used as evidence for unidimensionality. In fact, Cronbach’s alpha’s assumes *equally* sized factor loadings. Given that this is an unlikely assumption, and that Cronbach’s alpha is also influenced by the number of items, alternative measures of reliability should be used Hayes & Coutts (2020).

McDonald’s omega does not assume equally sized factor loadings. Cronbach’s alpha is actually a special case of McDonald’s omega, assuming the untenable assumption of equally sized factor loadings.

**Conclusion**: Use McDonald’s omega.

## 

## 

## References

<div id="refs" class="references csl-bib-body hanging-indent" entry-spacing="0" line-spacing="2">

<div id="ref-auerswald2019" class="csl-entry">

Auerswald, M., & Moshagen, M. (2019). How to determine the number of factors to retain in exploratory factor analysis: A comparison of extraction methods under realistic conditions. *Psychological Methods*, *24*(4), 468–491. <https://doi.org/10.1037/met0000200>

</div>

<div id="ref-borsboom2006" class="csl-entry">

Borsboom, D. (2006). The attack of the psychometricians. *Psychometrika*, *71*(3), 425. <https://doi.org/10.1007/s11336-006-1447-6>

</div>

<div id="ref-clark1995" class="csl-entry">

Clark, L. A., & Watson, D. (1995). Constructing validity: Basic issues in objective scale development. *Psychological Assessment*, *7*(3), 309–319. <https://doi.org/10.1037/1040-3590.7.3.309>

</div>

<div id="ref-comrey1992" class="csl-entry">

Comrey, A. L., & Lee, H. B. (1992). *A first course in factor analysis* (2nd ed.). Lawrence Erlbaum Associates.

</div>

<div id="ref-costello2005" class="csl-entry">

Costello, A., & Osborne, J. (2005). Best practices in exploratory factor analysis: Four recommendations for getting the most from your analysis. *Practical Assessment, Research, and Evaluation*, *10*(1). <https://doi.org/10.7275/jyj1-4868>

</div>

<div id="ref-cudeck1994" class="csl-entry">

Cudeck, R., & O’Dell, L. L. (1994). Applications of standard error estimates in unrestricted factor analysis: Significance tests for factor loadings and correlations. *Psychological Bulletin*, *115*(3), 475–487. <https://doi.org/10.1037/0033-2909.115.3.475>

</div>

<div id="ref-edwards2000" class="csl-entry">

Edwards, J. R., & Bagozzi, R. P. (2000). On the nature and direction of relationships between constructs and measures. *Psychological Methods*, *5*(2), 155–174. <https://doi.org/10.1037/1082-989X.5.2.155>

</div>

<div id="ref-fabrigar1999" class="csl-entry">

Fabrigar, L. R., Wegener, D. T., MacCallum, R. C., & Strahan, E. J. (1999). Evaluating the use of exploratory factor analysis in psychological research. *Psychological Methods*, *4*(3), 272–299. <https://doi.org/10.1037/1082-989X.4.3.272>

</div>

<div id="ref-fava1996" class="csl-entry">

Fava, J. L., & Velicer, W. F. (1996). The effects of underextraction in factor and component analyses. *Educational and Psychological Measurement*, *56*(6), 907–929. <https://doi.org/10.1177/0013164496056006001>

</div>

<div id="ref-gagne2006" class="csl-entry">

Gagne, P., & Hancock, G. R. (2006). Measurement model quality, sample size, and solution propriety in confirmatory factor models. *Multivariate Behavioral Research*, *41*(1), 65–83. <https://doi.org/10.1207/s15327906mbr4101_5>

</div>

<div id="ref-gana2019" class="csl-entry">

Gana, K., & Broc, G. (2019). *Structural equation modeling with lavaan* (Vol. 1). Wiley & Sons.

</div>

<div id="ref-hayduk2012" class="csl-entry">

Hayduk, L. A., & Littvay, L. (2012). Should researchers use single indicators, best indicators, or multiple indicators in structural equation models? *BMC Medical Research Methodology*, *12*(1), 159. <https://doi.org/10.1186/1471-2288-12-159>

</div>

<div id="ref-hayes2020" class="csl-entry">

Hayes, A. F., & Coutts, J. J. (2020). Use omega rather than Cronbach’s alpha for estimating reliability. But…. *Communication Methods and Measures*, *14*(1), 1–24. <https://doi.org/10.1080/19312458.2020.1718629>

</div>

<div id="ref-kaiser1974" class="csl-entry">

Kaiser, H. F. (1974). An index of factorial simplicity. *Psychometrika*, *39*(1), 31–36. <https://doi.org/10.1007/BF02291575>

</div>

<div id="ref-ledesma2007" class="csl-entry">

Ledesma, R. D., & Valero-Mora, P. (2007). Determining the number of factors to retain in EFA: An easy-to-use computer program for carrying out parallel analysis. *Practical Assessment, Research, and Evaluation*, *12*(12), 1–11. <https://doi.org/10.7275/WJNC-NM63>

</div>

<div id="ref-maccallum2001" class="csl-entry">

MacCallum, R. C., Widaman, K. F., Preacher, K. J., & Hong, S. (2001). Sample size in factor analysis: The role of model error. *Multivariate Behavioral Research*, *36*(4), 611–637. <https://doi.org/10.1207/S15327906MBR3604_06>

</div>

<div id="ref-maccallum1999" class="csl-entry">

MacCallum, R. C., Widaman, K. F., Zhang, S., & Hong, S. (1999). Sample size in factor analysis. *Psychological Methods*, *4*(1), 84–99. <https://doi.org/10.1037/1082-989X.4.1.84>

</div>

<div id="ref-marsh1998" class="csl-entry">

Marsh, H. W., Hau, K.-T., Balla, J. R., & Grayson, D. (1998). Is more ever too much? The number of indicators per factor in confirmatory factor analysis. *Multivariate Behavioral Research*, *33*(2), 181–220. <https://doi.org/10.1207/s15327906mbr3302_1>

</div>

<div id="ref-mundfrom2005" class="csl-entry">

Mundfrom, D. J., Shaw, D. G., & Ke, T. L. (2005). Minimum sample size recommendations for conducting factor analyses. *International Journal of Testing*, *5*(2), 159–168. <https://doi.org/10.1207/s15327574ijt0502_4>

</div>

<div id="ref-osborne2014" class="csl-entry">

Osborne, J. W. (2014). *Best practices in exploratory factor analysis*. Createspace publishing.

</div>

<div id="ref-peters2014" class="csl-entry">

Peters, G.-. J. Y. (2014). The alpha and the omega of scale reliability and validity: why and how to abandon Cronbach’s alpha and the route towards more comprehensive assessment of scale quality. *European Health Psychologist*, *16*(2), 56–69. <https://doi.org/10.31234/osf.io/h47fv>

</div>

<div id="ref-peterson2000" class="csl-entry">

Peterson, R. A. (2000). A meta-analysis of variance accounted for and factor loadings in exploratory factor analysis. *Marketing Letters*, *11*(3), 261–275. <https://doi.org/10.1023/A:1008191211004>

</div>

<div id="ref-ruscio2012" class="csl-entry">

Ruscio, J., & Brendan Roche. (2012). Determining the number of factors to retain in an exploratory factor analysis using comparison data of known factorial structure. *Psychological Assessment*, *24*(2), 282–292. <https://doi.org/10.1037/a0025697>

</div>

<div id="ref-russell2002" class="csl-entry">

Russell, D. W. (2002). In search of underlying dimensions: The use (and abuse) of factor analysis in Personality and Social Psychology Bulletin. *Personality and Social Psychology Bulletin*, *28*(12), 1629–1646. <https://doi.org/10.1177/014616702237645>

</div>

<div id="ref-tabachnick2013" class="csl-entry">

Tabachnick, B. G., & Fidell, L. S. (2013). *Using multivariate statistics* (6th ed.). Pearson.

</div>

<div id="ref-velicer2000" class="csl-entry">

Velicer, W. F., Eaton, C. A., & Fava, J. L. (2000). *Construct explication through factor or component analysis: A review and evaluation of alternative procedures for determining the number of factors or components* (R. D. Goffin & E. Helmes, Eds.; p. 4171). Springer US. <https://doi.org/10.1007/978-1-4615-4397-8_3>

</div>

<div id="ref-velicer1998" class="csl-entry">

Velicer, W. F., & Fava, J. L. (1998). Effects of variable and subject sampling on factor pattern recovery. *Psychological Methods*, *3*(2), 231–251. <https://doi.org/10.1037/1082-989X.3.2.231>

</div>

<div id="ref-velicer1990" class="csl-entry">

Velicer, W. F., & Jackson, D. N. (1990). Component analysis versus common factor analysis: Some issues in selecting an appropriate procedure. *Multivariate Behavioral Research*, *25*(1), 1–28. <https://doi.org/10.1207/s15327906mbr2501_1>

</div>

<div id="ref-widaman1993" class="csl-entry">

Widaman, K. F. (1993). Common factor analysis versus principal component analysis: Differential bias in representing model parameters? *Multivariate Behavioral Research*, *28*(3), 263–311. <https://doi.org/10.1207/s15327906mbr2803_1>

</div>

<div id="ref-wood1996" class="csl-entry">

Wood, J. M., Tataryn, D. J., & Gorsuch, R. L. (1996). Effects of under- and overextraction on principal axis factor analysis with varimax rotation. *Psychological Methods*, *1*(4), 354–365. <https://doi.org/10.1037/1082-989X.1.4.354>

</div>

<div id="ref-zhang2014" class="csl-entry">

Zhang, G. (2014). Estimating standard errors in exploratory factor analysis. *Multivariate Behavioral Research*, *49*(4), 339–353. <https://doi.org/10.1080/00273171.2014.908271>

</div>

<div id="ref-zwick1986" class="csl-entry">

Zwick, W. R., & Velicer, W. F. (1986). Comparison of five rules for determining the number of components to retain. *Psychological Bulletin*, *99*(3), 432–442. <https://doi.org/10.1037/0033-2909.99.3.432>

</div>

</div>
