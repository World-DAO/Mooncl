# app.py
import os, json, asyncio, time
import gradio as gr
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

from agents import *

# ------- 占位/示例：替换成你的真实 Agent 调用 --------
async def splitter_agent(content: str) -> dict:
    # TODO: 换成你前面“Splitter system prompt + tools”那套
    # 这里模拟耗时 + 结果
    splitter_agent = SplitterAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=False, temperature=0.1)

    res_dict = await splitter_agent.review(contents=content, print_res=False)

    return res_dict

    # await asyncio.sleep(0.8)
    # # 假装做了句子切分和关键词抽取
    # sentences = [s.strip() for s in content.split(".") if s.strip()]
    # out = {
    #     "topic": "auto-detected topic about the passage",
    #     "keywords": ["keyword1", "keyword2", "keyword3"],
    #     "good_sentences": sentences[: min(5, len(sentences))]
    # }
    # return out

async def reviewer_agent(name: str, outputs_from_splitter: dict) -> dict:
    # TODO: 替换为各自的 system prompt（Lexical/Depth/Opinion/Safety）
    # await asyncio.sleep(1.2 + 0.4*hash(name)%3)  # 模拟不同耗时
    match name:
        case "Lexical/Coherence":
            agent = LexicalAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
        case "Content-Depth":
            agent = ThinkDepthAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
        case "Public-Opinion":
            agent = PublicInfAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
        case "Safety":
            agent = SafetyAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
        case _:
            raise ValueError(f"Unknown reviewer name: {name}")
    res = await agent.review(outputs_from_splitter, print_res=False)
    # 模拟统一 JSON 输出（与你前面定义的 schema 接近即可）
    return res

async def chairman_agent(reviews: list, top10_context: dict | None = None) -> dict:
    # TODO: 使用你“Chairman system prompt”，按加权与校准规则合成
    # await asyncio.sleep(0.6)
    # base = sum(r["score_total"] for r in reviews) / max(1, len(reviews))
    chairman = ChairmanAgent(model=os.getenv("FAST_MODEL", "qwen-plus"), enable_thinking=False, temperature=0.0)
    # diversity_delta = 0  # 这里演示不做 top-10 校准
    # final = max(0, min(100, round(base + diversity_delta)))
    final = await chairman.review(reviews, print_res=False)
    return final


CHUNK_CHARS = 40      # 每次追加多少字符
UI_THROTTLE = 0.04    # 每次 yield 之间的最小间隔（秒）

async def stream_json_chunks(queue: asyncio.Queue, channel: str, payload: Dict[str, Any]):
    raw = json.dumps(payload, ensure_ascii=False, indent=2)
    acc = ""
    for i in range(0, len(raw), CHUNK_CHARS):
        acc = raw[:i+CHUNK_CHARS]
        await queue.put((channel, acc))
        await asyncio.sleep(UI_THROTTLE)


async def splitter_agent_stream(content: str, queue: asyncio.Queue):
    splitter_agent = SplitterAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=False, temperature=0.1)

    await splitter_agent.review_stream(content, queue)



# ========== 子任务：reviewer（流式） ==========
async def reviewer_agent_stream(name: str, content: str, queue: asyncio.Queue):
    # TODO: 真实实现时，用 OpenAI/EigenAI 真流式：
    # stream = await client.chat.completions.create(..., stream=True)
    # buffer = ""
    # async for event in stream:
    #     delta = event.choices[0].delta
    #     if delta and delta.content:
    #         buffer += delta.content
    #         await queue.put((f"reviewer:{name}", buffer))
    # 最后解析 buffer 得到 JSON；这里先做伪流展示：
    # fake = {
    #     "Expert": name,
    #     "score_total": 75,
    #     "reason": f"{name} preliminary assessment...",
    #     "confidence": 0.83
    # }



    await stream_json_chunks(queue, f"reviewer:{name}", fake)
    await queue.put((f"done_reviewer:{name}", fake))


async def chairman_agent_stream(queue: asyncio.Queue, results: Dict[str, Dict[str, Any]]):
    # 先流式显示“等待中”
    await queue.put(("chairman", "Waiting for all reviewers to finish..."))
    # 等四个 reviewer 都完成
    needed = {"LexicalAgent","ThinkDepthAgent","PublicInfluenceAgent","SafetyAgent"}
    while not needed.issubset(set(results.keys())):
        await asyncio.sleep(0.05)

    # 有了全部评审，开始“流式计算”最终分
    await queue.put(("chairman", "Aggregating with confidence-aware weights..."))
    await asyncio.sleep(UI_THROTTLE*5)

    # 简单合成（替换成你的正式聚合算法）
    base = sum(r["score_total"] for r in results.values()) / len(results)
    final = max(0, min(100, round(base)))
    out = {
        "score_total": final,
        "reason": "Merged four reviewers; no safety gate triggered in this demo.",
        "per_reviewer": {k: {"score": v["score_total"], "confidence": v["confidence"]} for k,v in results.items()},
        "adjustments": {"safety_gate":{"applied": False, "label":"S0"},
                        "safety_S1_global_deduction":0,"conflict_adjustment":0,"diversity_delta":0},
        "reason_conflicts": "",
        "calibration_notes": "No top-10 provided."
    }
    await stream_json_chunks(queue, "chairman", out)
    await queue.put(("done_chairman", None))


# ------- Gradio 事件处理：单个 handler 里流式更新四大区块 -------
async def run_pipeline(content: str):
    """
    4区块UI顺序：
    左上：输入框（你已经在UI里了）
    左下：splitter 框
    右上：四个 reviewer 框（r1, r2, r3, r4）
    右下：chairman 框
    """
    splitter_box = "Running splitter..."
    r1 = r2 = r3 = r4 = "Waiting..."
    chairman_box = "Pending..."
    last_yield = 0.0
    yield splitter_box, r1, r2, r3, r4, chairman_box

    queue: asyncio.Queue = asyncio.Queue()

    # -------- Phase 1: Splitter（先完成，再进入下一阶段）--------
    # 启动 splitter 的真流式；等待其返回最终 dict
    splitter_agent = SplitterAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=False, temperature=0.1)
    splitter_task = asyncio.create_task(
        splitter_agent.review_stream(content, queue)
    )

    # 消费队列直到 splitter_task 完成
    while not splitter_task.done():
        try:
            chan, payload = await asyncio.wait_for(queue.get(), timeout=0.05)
            if chan == "splitter":
                splitter_box = payload  # payload 是拼接中的 JSON 字符串
        except asyncio.TimeoutError:
            pass

        # 节流刷新
        now = time.time()
        if now - last_yield >= UI_THROTTLE:
            yield splitter_box, r1, r2, r3, r4, chairman_box
            last_yield = now

    # 拿到 splitter 的最终结构化输出（dict）
    try:
        split_result: Dict[str, Any] = splitter_task.result()
    except Exception as e:
        split_result = {"topic": "", "keywords": [], "good_sentences": [], "error": str(e)}
    # 最后一刷，确保左下框停在完整JSON
    yield splitter_box, r1, r2, r3, r4, chairman_box

    # -------- Phase 2: 四个 Reviewer 并行（拿到四个最终结果后再进下一阶段）--------
    # 你要把 splitter 的 dict 传给每个 reviewer
    reviewers_inputs = {"content": content, "split": split_result}

    lexical_agent   = LexicalAgent(model=os.getenv("MID_MODEL", "qwen-plus"), enable_thinking=False, temperature=0.0)
    depth_agent     = ThinkDepthAgent(model=os.getenv("MID_MODEL", "qwen-plus"), enable_thinking=False, temperature=0.0)
    opinion_agent   = PublicInfAgent(model=os.getenv("MID_MODEL", "qwen-plus"), enable_thinking=False, temperature=0.0)
    safety_agent    = SafetyAgent(model=os.getenv("MID_MODEL", "qwen-plus"), enable_thinking=False, temperature=0.0)

    tasks = {
        "LexicalAgent": asyncio.create_task(lexical_agent.review_stream(reviewers_inputs, queue)),
        "ThinkDepthAgent": asyncio.create_task(depth_agent.review_stream(reviewers_inputs, queue)),
        "PublicInfluenceAgent": asyncio.create_task(opinion_agent.review_stream(reviewers_inputs, queue)),
        "SafetyAgent": asyncio.create_task(safety_agent.review_stream(reviewers_inputs, queue)),
    }

    reviewer_results: Dict[str, Dict[str, Any]] = {}

    # 消费队列，直到四个 reviewer 都完成
    while len(reviewer_results) < 4:
        # 优先处理流式更新
        try:
            chan, payload = await asyncio.wait_for(queue.get(), timeout=0.05)
            if chan.startswith("reviewer:"):
                name = chan.split(":", 1)[1]
                # payload 是该 reviewer 当前累积的 JSON 字符串
                if name == "LexicalAgent":
                    r1 = payload
                elif name == "ThinkDepthAgent":
                    r2 = payload
                elif name == "PublicInfAgent":
                    r3 = payload
                elif name == "SafetyAgent":
                    r4 = payload
        except asyncio.TimeoutError:
            pass

        # 查看谁先完成，收集最终 JSON
        for name, t in list(tasks.items()):
            if t.done() and name not in reviewer_results:
                try:
                    reviewer_results[name] = t.result()
                except Exception as e:
                    reviewer_results[name] = {"Expert": name, "error": str(e)}
                del tasks[name]

        # 节流刷新
        now = time.time()
        if now - last_yield >= UI_THROTTLE:
            yield splitter_box, r1, r2, r3, r4, chairman_box
            last_yield = now

    # 最后一刷，确保右上四框停在完整JSON
    yield splitter_box, r1, r2, r3, r4, chairman_box

    # -------- Phase 3: Chairman（最后裁定；可选流式或一次性）--------
    chairman_agent = ChairmanAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=False, temperature=0.0)

    # 组装 chairman 输入（示例：包含原文、四评JSON、可选top10）
    chairman_inputs = {
        "source_text": content,
        "reviews": [
            reviewer_results.get("LexicalAgent", {}),
            reviewer_results.get("ThinkDepthAgent", {}),
            reviewer_results.get("PublicInfluenceAgent", {}),
            reviewer_results.get("SafetyAgent", {}),
        ],
        "top10_context": None  # 如果有，就塞 summaries/signals 进来
    }

    # 如果你给 chairman 也做了 review_stream（流式），就像下面这样：
    chairman_task = asyncio.create_task(chairman_agent.review_stream(chairman_inputs, queue))

    while not chairman_task.done():
        try:
            chan, payload = await asyncio.wait_for(queue.get(), timeout=0.05)
            if chan == "chairman":
                chairman_box = payload  # 流式累积的最终 JSON 字符串
        except asyncio.TimeoutError:
            pass

        now = time.time()
        if now - last_yield >= UI_THROTTLE:
            yield splitter_box, r1, r2, r3, r4, chairman_box
            last_yield = now

    # 拿到最终裁决 JSON
    try:
        chairman_result: Dict[str, Any] = chairman_task.result()
    except Exception as e:
        chairman_result = {"error": str(e)}

    chairman_box = json.dumps(chairman_result, ensure_ascii=False, indent=2)
    yield splitter_box, r1, r2, r3, r4, chairman_box


# ---------------- UI 布局 ----------------
with gr.Blocks(title="Multi-Agent Review (Splitter + 4 Reviewers + Chairman)") as demo:
    gr.Markdown("## Multi-Agent Review Playground")

    with gr.Row():
        with gr.Column(scale=1):
            content = gr.Textbox(label="Input Content", lines=12, placeholder="Paste your passage here...")
            run_btn = gr.Button("Run Pipeline", variant="primary")

        with gr.Column(scale=1):
            splitter_out = gr.Code(label="Splitter Agent (streaming)", language="json", lines=12)

    with gr.Row():
        with gr.Column(scale=1):
            r1_out = gr.Code(label="Reviewer: Lexical/Coherence", language="json", lines=12)
        with gr.Column(scale=1):
            r2_out = gr.Code(label="Reviewer: Content-Depth", language="json", lines=12)
        with gr.Column(scale=1):
            r3_out = gr.Code(label="Reviewer: Public-Opinion", language="json", lines=12)
        with gr.Column(scale=1):
            r4_out = gr.Code(label="Reviewer: Safety", language="json", lines=12)

    with gr.Row():
        with gr.Column():
            chairman_out = gr.Code(label="Chairman (Final Arbiter)", language="json", lines=12)

    # 点击后触发异步生成器，按顺序流式更新六个输出框
    run_btn.click(
        fn=run_pipeline,
        inputs=[content],
        outputs=[splitter_out, r1_out, r2_out, r3_out, r4_out, chairman_out]
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", "7860")))
