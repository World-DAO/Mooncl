from agents.prototype import TOKEN2049Agent

import re
from typing import List
import asyncio
import json

from agents.utils import safe_parse_json

# 匹配“可拆分的点”：不是省略号的一部分，且不在数字之间
_DOT_SPLIT_RE = re.compile(r'(?<!\.)(?<!\d)\.(?!\d)(?!\.)')

def split_sentences_by_dot(text: str) -> List[str]:
    """
    Split text into sentences by '.' using regex.
    Protections:
      - Do not split inside ellipses '...'
      - Do not split when dot is between digits (e.g., 3.14)
    Returns trimmed sentences without the trailing '.'
    """
    if not text:
        return []
    parts = _DOT_SPLIT_RE.split(text)
    # 去掉空白与空片段
    sentences = [p.strip() for p in parts if p and p.strip()]
    return sentences

class SplitterAgent(TOKEN2049Agent):
    def __init__(self, model: str = "qwen-plus", enable_thinking: bool = True, temperature: float = 0.0):
        super().__init__(model, enable_thinking, temperature)

        self.system_prompt = """# System Prompt — Splitter Agent (Initial Screening)
## Role
You are the Splitter Agent. Your job is to perform a very light, deterministic pre-screen on an input passage.

## What to do
1. Split the input text into sentences by the `.` character only.
    - After splitting, trim whitespace around each sentence.
    - Drop empty results (e.g., if a split yields an empty string).
    - Do not do any fancy NLP; keep it literal.
2. Topic
    - Write a short topic line (5-12 words) that best summarizes the main subject of the passage.
    - Stay neutral and descriptive (no judgment).
3. Keywords
    - Extract 5-10 salient keywords or key phrases from the passage.
    - Lowercase; deduplicate; keep domain terms intact (multiword terms allowed, e.g., “transfer learning”).
4. Good sentences
    - Select 1-5 sentences from the split list that are particularly informative or central to the passage.
    - Criteria: states a claim, supports a claim (evidence/example), or gives a concrete instruction/definition.
    - Copy the sentence verbatim (before trimming you already trimmed; use the trimmed version).
    - Exclude filler or purely rhetorical lines.
## Output Schema (STRICT JSON)

```json
{
  "topic": "string (5-12 words)",
  "keywords": ["string", "string", "..."],
  "good_sentences": ["sentence 1", "sentence 2", "..."]
}
```

## Examples
"We propose a simple daily habit loop. First, track one measurable action. Then review weekly."

Output:
```json
{
  "topic": "simple daily habit tracking and review",
  "keywords": ["habit loop", "measurable action", "weekly review"],
  "good_sentences": [
    "We propose a simple daily habit loop",
    "First, track one measurable action"
  ]
}
```
"""
        

    async def review(self, contents: str, print_res: bool=False) -> dict:
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "split_by_dot",
                    "description": "Split text into sentences by '.' (with simple protections for '...' and digits). Return trimmed sentences.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "text": {"type": "string", "description": "The full input text to split."}
                        },
                        "required": ["text"]
                    }
                }
            }
        ]
        first = await self.aclient.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": contents}
            ],
            tools=tools,
            tool_choice="auto",
            temperature=self.temperature,
            max_tokens=1024,
        )

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": contents},
        ]

        msg = first.choices[0].message

        messages.append({"role": "assistant", "content": msg.content or "", "tool_calls": getattr(msg, "tool_calls", None)})

        tool_calls = getattr(msg, "tool_calls", None)
        if tool_calls:
            for call in tool_calls:
                if call.type == "function" and call.function.name == "split_by_dot":
                    # 解析参数
                    args = call.function.arguments
                    if isinstance(args, str):
                        args = json.loads(args)
                    text_arg = args.get("text", contents)
                    # 本地执行工具
                    sentences = split_sentences_by_dot(text_arg)
                    tool_result = json.dumps({"sentences": sentences}, ensure_ascii=False)

                    # 把工具结果作为 role="tool" 回灌（必须带 tool_call_id 关联）
                    messages.append({
                        "role": "tool",
                        "tool_call_id": call.id,
                        "name": "split_by_dot",
                        "content": tool_result
                    })

        second = await self.aclient.chat.completions.create(
            model=self.model,
            messages=messages,
            # json object
            response_format={"type": "json_object"},
            temperature=self.temperature,
            max_tokens=512,
        )
        out_text = second.choices[0].message.content or "{}"
        try:
            result_dict = json.loads(out_text)
            result_dict["original_content"] = contents
            if print_res:
                print(result_dict)
            return result_dict
        except Exception:
            # 兜底：返回一个空结构，避免上层炸
            return {"topic": "", "keywords": [], "good_sentences": []}
        
    async def review_stream(self, contents: str, queue: asyncio.Queue, print_res: bool=False):
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "split_by_dot",
                    "description": "Split text into sentences by '.' (with simple protections for '...' and digits). Return trimmed sentences.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "text": {"type": "string", "description": "The full input text to split."}
                        },
                        "required": ["text"]
                    }
                }
            }
        ]
        first = await self.aclient.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": contents}
            ],
            tools=tools,
            tool_choice="auto",
            temperature=self.temperature,
            max_tokens=1024,
        )

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": contents},
        ]

        msg = first.choices[0].message

        messages.append({"role": "assistant", "content": msg.content or "", "tool_calls": getattr(msg, "tool_calls", None)})

        tool_calls = getattr(msg, "tool_calls", None)
        if tool_calls:
            for call in tool_calls:
                if call.type == "function" and call.function.name == "split_by_dot":
                    # 解析参数
                    args = call.function.arguments
                    if isinstance(args, str):
                        args = json.loads(args)
                    text_arg = args.get("text", contents)
                    # 本地执行工具
                    sentences = split_sentences_by_dot(text_arg)
                    tool_result = json.dumps({"sentences": sentences}, ensure_ascii=False)

                    # 把工具结果作为 role="tool" 回灌（必须带 tool_call_id 关联）
                    messages.append({
                        "role": "tool",
                        "tool_call_id": call.id,
                        "name": "split_by_dot",
                        "content": tool_result
                    })

        second_stream = await self.aclient.chat.completions.create(
            model=self.model,
            messages=messages,
            # json object
            response_format={"type": "json_object"},
            stream=True,
            temperature=self.temperature,
            max_tokens=512,
        )
        buf = ""
        async for event in second_stream:
            delta = event.choices[0].delta
            if delta and delta.content:
                buf += delta.content
                await queue.put((f"splitter", buf))

        parsed = safe_parse_json(buf, default={"_raw": buf})
        await queue.put((f"done_splitter", parsed))
        return parsed
        # # 结束后可尝试 json.loads(buf) 校验；失败则做 fallback
        # try:
        #     j = json.loads(buf)
        # except Exception:
        #     j = {"Expert": splitter, "raw": buf}
        # await queue.put((f"done_splitter", j))