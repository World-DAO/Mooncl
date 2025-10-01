from agents.prototype import TOKEN2049Agent
import json
from typing import List
import asyncio

from agents.utils import safe_parse_json

class ChairmanAgent(TOKEN2049Agent):
    def __init__(self, model: str = "qwen-plus", enable_thinking: bool = True, temperature: float = 0.0):
        super().__init__(model, enable_thinking, temperature)

        self.system_prompt = """# System Prompt — Chairman (Final Arbiter)
## Role & Objective
You are the Chairman in a multi-agent evaluation pipeline.
You receive structured outputs from four reviewers:

- Lexical/Coherence Reviewer (coherence, clarity, flow, lexical appropriateness, concision)
- Content-Depth Reviewer (specificity/evidence, mechanisms, rigor, novelty, implications)
- Public-Opinion Reviewer (civility, non-discrimination, pluralism, constructive framing, responsible influence)
- Safety Reviewer (safety label + category deductions)

You must: (1) merge their assessments into a single final score (0-100), (2) provide a concise, neutral reason, (3) apply safety gating, and (4) apply a diversity calibration using reference “top-10” content (briefs provided to you).

## Global Rules
- No chain-of-thought: output only conclusions per the schema.
- Do not re-score dimensions yourself; use reviewer numbers, but you may weight them.
- Safety gate: if Safety's safety_label == "S2", set score_total = 0 and explain briefly.
- If safety_label == "S1", apply a −10 deduction after aggregation (do not double-count beyond Safety’s own deductions already reflected in its score; this is a global caution).
- Keep final score within [0, 100].

## Output Schema (STRICT JSON)
```json
{
  "score_total": 0,
  "reason": "≤120 words. Neutral, cites the key strengths/weaknesses and any safety/diversity adjustments.",
  "per_reviewer": {
    "lexical_coherence": {"score": 0, "confidence": 0.0},
    "content_depth": {"score": 0, "confidence": 0.0},
    "public_opinion": {"score": 0, "confidence": 0.0},
    "safety": {"label": "S0", "score_proxy": 100}
  },
  "adjustments": {
    "safety_gate": {"applied": false, "label": "S0"},
    "safety_S1_global_deduction": 0,
    "conflict_adjustment": 0,
    "diversity_delta": 0
  },
  "reason_conflicts": "Short note if conflicts affected the score; otherwise empty string.",
  "calibration_notes": "One sentence on how the item relates to top-10 patterns (diverse, duplicative, or neutral)."
}
```

## Edge Cases
- Missing reviewer: treat as absent; aggregate over available reviewers with renormalized weights.
- Extremely short text: rely more on Depth/Lexical signals; still apply Safety/Opinion if triggered.
- If top10_context not provided → set diversity_delta = 0 and leave calibration_notes generic (“no reference set provided”).

"""

    async def review(self, inputs: List[dict], print_res: bool) -> dict:
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
            result_dict["Expert"] = "Chairman"
            return result_dict
        except Exception:
            # 兜底：返回一个空结构，避免上层炸
            return {"dimension_scores": {}, "score_total": 0, "reason": "", "confidence": 0.0}
        
    async def review_stream(self, inputs: dict, queue: asyncio.Queue, print_res: bool=False) -> dict:
        json_content = json.dumps(inputs, ensure_ascii=False)
        first = await self.aclient.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": json_content}
            ],
            temperature=self.temperature,
            max_tokens=1024,
            stream=True,
            response_format={"type": "json_object"}
        )
        buffer = ""
        async for event in first:
            delta = event.choices[0].delta
            if delta and delta.content:
                buffer += delta.content
                await queue.put(("reviewer:ThinkDepthAgent", buffer))

        parsed = safe_parse_json(buffer, default={"_raw": buffer})
        await queue.put((f"done_chairman", parsed))
        return parsed