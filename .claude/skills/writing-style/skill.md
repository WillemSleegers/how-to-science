---
name: writing-style
description: Writing-style rules for prose on this site. Use whenever writing a new page or section, editing existing prose, or checking/improving writing style.
---

These are the writing-style rules for prose on this site. Apply them both when writing new prose and when reviewing an existing file. When asked to review or improve a file, check it against every rule below and fix any violations.

## Process

**Outline before writing.** Before writing any prose for a page or section, outline the logical flow to the user first. Do not write until the outline is approved.

## Tone

**Conversational but precise.** Write in the first person and state opinions directly. Use "we" to include the reader as a collaborator ("Now that we know...").

## Subject and voice

**No commands to the reader.** Every sentence must have the content as its subject, not the reader. Wrong: "Start with 30 studies", "Note that the SE is wrong", "Consider the following". Right: "The simulation uses 30 studies", "The SE is wrong", "The following example shows".

**Write claims directly.** Do not make authors or studies the grammatical subject. Wrong: "Smith et al. found that X is true." Right: "X is true."

**Don't ascribe agency to non-entities.** A study, experiment, paper, or package can't use, show, argue, report, or know anything; only people do. Write "we used an experimental design", not "this study used an experimental design". Describe what a tool is used to do, not what it "does" as an actor.

## Claims and precision

**Don't overclaim.** Make no stronger a claim than necessary. No superlatives or strong framing without justification.

**No "true effect" or "the truth".** Refer to simulation and model parameters directly: `mu`, the population effect, the value we set.

**Acknowledge limitations inline.** State simplifications and limitations where they arise rather than hiding them or quietly skipping past them.

## Structure and flow

**Setup before detail.** Never introduce a concept, code block, or result without first telling the reader what it is and why it matters. A reader encountering a code chunk should already know what it does and why.

**No throat-clearing or forward references.** Don't warm up, and don't narrate the document ("In this section we will...", "Next, we turn to..."). This is distinct from setup: explaining what a code chunk computes is substantive context, while announcing what a later section will cover is filler. Just say the thing.

**Introduce before using.** Don't reference a function, package, concept, or model before it has been introduced in the prose.

**Describe before labeling.** Introduce what something is before giving it its name. The reader should understand the concept before seeing the term.

**No circular definitions.** Don't define something in terms of itself.

## Paragraphs

**One topic per paragraph.** Each paragraph develops a single idea. Don't split one topic across separate paragraphs, and don't combine two distinct topics in one. A sentence that opens a new topic begins a new paragraph.

**Vary sentence length deliberately.** Short sentences for emphasis, longer ones for explanation. A short sentence can stand alone as its own paragraph.

**Make each point once.** If two sentences say the same thing in different words, keep the stronger one and cut the other. Restating an idea you already made does not reinforce it.

**Every sentence connects.** Each sentence pulls from what came before or sets up what comes next, with explicit, natural transitions where they help ("Now that we know...", "In other words..."). A sentence that introduces an idea unconnected to its neighbours is tacked on: cut it, or move it to the paragraph where it belongs.

**No mini-restatements.** Don't end a section with a sentence that restates what was just shown ("As we can see above...", "This demonstrates that..."). A deliberate summary or conclusion is fine when it earns its place: restate the argument tightly and completely, with no padding and no new information.

## Sentence-level style

**No em dashes as a default connector.** Use em dashes only when a pause or aside genuinely cannot be expressed as cleanly with a comma, period, or parenthesis. Default to plain sentence structure.

**Plain English by default.** Prefer plain words. Introduce technical terms only when necessary, and never as a substitute for explanation.

**No figurative or symbolic language.** Avoid phrases like "sharper than any study", "to watch the machinery work", "honesty in models", "data can agree or disagree". Describe what is literally happening.

**Concrete over abstract.** Prefer concrete simulated examples to abstract description. Pages here are practical and code-forward; show working R code with explanations.
