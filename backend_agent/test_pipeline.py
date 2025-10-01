from agents import *
import asyncio
import os

from dotenv import load_dotenv

load_dotenv()

async def start_pipe():
    splitter_agent = SplitterAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=False, temperature=0.1)

    thinker_agent = ThinkDepthAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
    safety_agent = SafetyAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
    public_agent = PublicInfAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
    lexical_agent = LexicalAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)

    chairman = ChairmanAgent(model=os.getenv("FAST_MODEL", "qwen-plus"), enable_thinking=True, temperature=0.0)
    

    context = """SageAttention rightly criticizes FlashAttention-3 for weak
cross-device portability, but it sidesteps a key question: how
does SageAttention perform on Hopper, where WGMMA
and TMA exist? In SageAttention paper, the team compared performance of both SageAttention and “FlashAttention” on sm_80, sm_89 devices such as RTX3090, RTX4090,
and showed great contrast against each other. However, as
FlashAttention-3 could not be conducted on devices under
sm_90, the SageAttention in paper was only compared to
FlashAttention-2, not FlashAttention-3. This unfair comparison attracted our attention, and we should find out the
performance comparison on Hopper GPU."""

    structural_output: dict = await splitter_agent.review(contents=context, print_res=True)

    tasks = [
        thinker_agent.review,
        safety_agent.review,
        public_agent.review,
        lexical_agent.review,
    ]

    results = await asyncio.gather(*[task(structural_output, print_res=True) for task in tasks])

    for r in results:
        print("----- Result -----")
        print(r)

    final = await chairman.review(results, print_res=True)
    print("----- Final Result -----")
    print(final)

async def start_prod_pipe(content: str) -> dict:
    print_res = False
    splitter_agent = SplitterAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=False, temperature=0.1)

    thinker_agent = ThinkDepthAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
    safety_agent = SafetyAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
    public_agent = PublicInfAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)
    lexical_agent = LexicalAgent(model=os.getenv("FAST_MODEL", "qwen-turbo"), enable_thinking=True, temperature=0.3)

    chairman = ChairmanAgent(model=os.getenv("FAST_MODEL", "qwen-plus"), enable_thinking=True, temperature=0.0)

    structural_output: dict = await splitter_agent.review(contents=content, print_res=print_res)

    tasks = [
        thinker_agent.review,
        safety_agent.review,
        public_agent.review,
        lexical_agent.review,
    ]

    results = await asyncio.gather(*[task(structural_output, print_res=print_res) for task in tasks])

    # for r in results:
    #     print("----- Result -----")
    #     print(r)

    final: dict = await chairman.review(results, print_res=print_res)
    # print("----- Final Result -----")
    # print(final)

    return final


if __name__ == "__main__":
    asyncio.run(start_pipe())