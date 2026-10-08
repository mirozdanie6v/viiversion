# Cognitive Model v0.1

## Purpose
Capture how Olga and Dmitrii detect problems, generate options, choose, revise beliefs, and fail — without collapsing them into one founder profile.

Modes:
- Mirror: predict how a founder is likely to reason and decide.
- Augmented: use the founder model plus evidence, critique, memory, and specialist analysis to recommend the best action.

## Olga — initial observed model

### Observed strengths
- Problem-finding: questions whether the stated problem is the real problem.
- System-level reframing: tends to move from symptom to architecture/process.
- Divergent generation: produces multiple possible directions quickly.
- Cross-domain transfer across product, design, automation, sales, and communication.
- User-centered interpretation: notices where user/client experience breaks before technical completeness.
- Bias toward building and testing real artifacts rather than remaining in abstract planning.

### Candidate failure modes to test
Hypotheses only:
- opening new directions faster than older commercial loops are closed;
- preferring architecture-level redesign where a bounded local fix may sometimes be sufficient;
- idea generation outrunning stabilization, documentation, and consolidation.

### Evidence rule
Every new pattern must link to decision traces and outcomes. Counterexamples must be retained.

## Dmitrii — initial model
Insufficient evidence has been formally captured in the Brain repository yet.

Capture:
- problem detection;
- architecture preferences;
- risk tolerance;
- evidence threshold;
- execution style;
- trade-off preferences;
- recurring failure modes;
- belief revision triggers.

## Cognitive principle schema
- id
- founder
- statement
- type: observed / inferred / hypothesis
- supporting traces
- counter-evidence
- confidence
- first observed
- last revised
- status: active / disputed / retired

## Evaluation
The model improves only if it gets better at predicting founder decisions, identifying blind spots that later prove consequential, and helping Augmented mode outperform simple imitation.

## Memory architecture
The Brain maintains distinct memory classes:
- Semantic memory: durable facts about VIIVERSION, products, people, clients, systems, and constraints.
- Episodic memory: dated events, incidents, conversations, launches, failures, and milestones.
- Procedural memory: validated ways of working, playbooks, operating rules, and repeatable workflows.
- Decision memory: decisions, alternatives, predictions, outcomes, lessons, and reusable principles.

These memory classes must not be collapsed into one undifferentiated chat history.

## Founder-model learning protocol
Olga and Dmitrii models are learned progressively from real decision traces, not personality labels. For each trace capture:
problem as first perceived → what each founder noticed → reframing → options generated → rejected options → trade-off → decision → confidence → expected result → actual result → later revision.

The Brain must preserve the difference between:
- what the founder would probably decide;
- what the Brain recommends after critique and broader company evidence.

The purpose is cognitive fidelity plus augmentation, not stylistic imitation.