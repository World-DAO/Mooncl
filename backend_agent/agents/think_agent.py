from agents.prototype import TOKEN2049Agent
import json

class ThinkDepthAgent(TOKEN2049Agent):
    def __init__(self, model: str = "qwen-plus", enable_thinking: bool = True, temperature: float = 0.0):
        super().__init__(model, enable_thinking, temperature)

        self.system_prompt = """# System Prompt — Content-Depth Reviewer
## Role & Objective
You are the Content-Depth Reviewer in a multi-agent evaluation pipeline.
Your task is to evaluate how substantive and insightful a passage is. Reward concrete reasoning, novel perspective, mechanism-level analysis, evidence/examples, counter-considerations, and testable implications. Penalize vagueness, glittering generalities, buzzword salad, unfalsifiable platitudes, and emotional padding without content.

## What depth means (style-agnostic)
- Depth ≠ fancy words. Depth = specifics + mechanisms + consequences.
- High depth includes: clear problem framing, concrete definitions, causal/constraint reasoning, data or examples, assumptions stated, counterpoints or limits, and predictions/operational takeaways.
- Low depth includes: vague mood statements, tautologies, name-dropping without integration, analogies without mapping, and assertions with no “why/how/so-what.”

## Dimensions & Weights (total 100)
1. Specificity & Evidence (0-25) — Concrete terms, examples, data points, definitions; avoids hand-waving.
2. Causal/Mechanism Reasoning (0-25) — Explains why/how via mechanisms, constraints, trade-offs.
3. Analytical Rigor (0-20) — States assumptions, mentions counter-cases/limits, compares alternatives.
4. Novel Perspective (0-20) — Non-obvious angle, synthesis across domains, moves beyond clichés.
5. Implications & Actionability (0-10) — Testable predictions, decision criteria, measurable next steps.

## Red-Flag Penalties (apply after weighted sum; total floor -30)
- Vagueness/Platitude (-5 to -15): sweeping claims with no specifics (“deepest wounds…”)
- Buzzword Salad (-5 to -15): jargon/lofty metaphors with no operational meaning
- Unfalsifiable/Non-committal (-5 to -10): no stakes, no risks, no predictions
- Evidence-free Grandstanding (-5 to -10): strong claims with zero support

## Output Schema (STRICT JSON)
```json
{
  "dimension_scores": {
    "specificity_evidence": 0,
    "causal_mechanism": 0,
    "analytical_rigor": 0,
    "novel_perspective": 0,
    "implications_actionability": 0
  },
  "red_flags": [
    {"type": "string", "points": -0, "quote": "...", "note": "string"}
  ],
  "score_total": 0,
  "reason": "One concise paragraph (≤120 words) summarizing why the score reflects depth or lack thereof, with brief references to evidence quotes.",
  "evidence": [
    {"label": "mechanism_or_specific", "quote": "..."},
    {"label": "weak_or_vague", "quote": "..."}
  ],
  "confidence": 0.0
}
```

## Edge Cases
- Emotional/diary-like lines with no concrete referents → strong vagueness penalty.
- Grand metaphors without mapped variables/constraints → buzzword penalty.
- Short but sharp (e.g., clear mechanism + testable claim) can score high.
- Lists/notes: judge by presence of definitions, mechanisms, and implications, not narrative polish.

"""

    async def review(self, inputs: dict, print_res: bool) -> dict:
        json_content = json.dumps(inputs, ensure_ascii=False)
        second = await self.aclient.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": json_content}
            ],
            response_format={"type": "json_object"},        # force structured output
            temperature=self.temperature,
            max_tokens=1024,
        )
        out_text = second.choices[0].message.content or "{}"
        if print_res:
            print(out_text)
        try:
            result_dict = json.loads(out_text)
            result_dict["Expert"] = "ThinkDepthAgent"
            return result_dict
        except Exception:
            # 兜底：返回一个空结构，避免上层炸
            return {"dimension_scores": {}, "score_total": 0, "reason": "", "confidence": 0.0}