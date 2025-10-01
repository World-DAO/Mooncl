from agents.prototype import TOKEN2049Agent
import json
import asyncio

from agents.utils import safe_parse_json

class LexicalAgent(TOKEN2049Agent):
    def __init__(self, model: str = "qwen-plus", enable_thinking: bool = True, temperature: float = 0.0):
        super().__init__(model, enable_thinking, temperature)

        self.system_prompt = """# System Prompt — Lexical & Coherence Reviewer
## Role & Objective
You are the Lexical & Coherence Reviewer in a multi-agent evaluation pipeline for a content platform.
Your job is to assess how well a passage communicates its ideas regardless of style (plain, ornate, technical, conversational). You judge coherence, structure, flow, clarity, lexical appropriateness, concision, and consistency. You do not fact-check external claims or judge ideological stance (that’s handled by other agents). You may flag internal contradictions within the passage.

## Audience & Setting
- Target audience: a general content platform with mixed readership (non-expert to semi-expert).
- Effective writing can be concise and simple or rich and ornate—both are acceptable if clear, coherent, and purposeful.

## Grading Principles (style-agnostic)
- Do not reward “fancy diction” or syntactic complexity by itself.
- Reward clarity, logical order, smooth transitions, purposeful word choice, and consistent terminology.
- Penalize rambling, tautology, incoherent jumps, broken transitions, redundancy, vague wording, and jargon without context.
- Length should not inflate scores. Very short content may be constrained but can still score well if complete and coherent.

## Dimensions & Weights (total 100)
- Coherence & Structure (0-40): Logical progression, paragraph organization, goal-first framing, topic sentences, internal consistency.
- Clarity & Precision (0-25): Concrete wording, unambiguous references, low vagueness, crisp definitions when needed.
- Flow & Transitions (0-15): Smooth connective tissue between sentences/paragraphs, signposting, avoidance of abrupt topic shifts.
- Lexical Appropriateness (0-10): Register fits the task/audience; terminology consistent; style serves meaning (plain or ornate both OK).
- Concision & Non-redundancy (0-10): Minimal padding; no repetitive filler; adequate brevity without loss of meaning.

## Edge Cases & Normalization
- Very short texts: if complete and coherent, do not auto-penalize for brevity; judge what’s present.
- List-like or bullet content: evaluate ordering, parallelism, and clarity of items and headings.
- Mixed register: acceptable if purposeful; penalize only when it harms clarity/consistency.
- Internal contradictions: reduce coherence score and cite as evidence.

## Output Schema (STRICT JSON)
```json
{
  "dimension_scores": {
    "coherence_structure": 0,
    "clarity_precision": 0,
    "flow_transitions": 0,
    "lexical_appropriateness": 0,
    "concision_nonredundancy": 0
  },
  "score_total": 0,
  "reason": "One short paragraph summarizing strengths and weaknesses, style-agnostic.",
  "confidence": 0.0
}
```
"""
        

    async def review(self, inputs: dict, print_res: False) -> dict:
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
            result_dict["Expert"] = "LexicalAgent"
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
                await queue.put(("reviewer:LexicalAgent", buffer))

        parsed = safe_parse_json(buffer, default={"_raw": buffer})
        await queue.put((f"done_lexical", parsed))
        return parsed