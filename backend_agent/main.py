from fastapi import FastAPI, HTTPException
from openai import AsyncOpenAI
import uvicorn
import os

from agent_utils import load_env_variables, create_async_client
from request_model import ChatRequest
from test_pipeline import start_pipe, start_prod_pipe

env_vars = load_env_variables()

app = FastAPI(title="Agent critical thinking Service")

@app.post("/chat")
async def chat(req: ChatRequest):
    # async_client = create_async_client()
    try:
        # resp = await async_client.chat.completions.create(
        #     model=env_vars['FAST_MODEL'],
        #     # extra_body={"enable_thinking": True},
        #     messages=[
        #         {'role': 'system', 'content': 'You are a philosopher.'},
        #         {"role": "user", "content": req.content}
        #     ],
        # )
        # msg = resp.choices[0].message

        res_dict = await start_prod_pipe(req.content)
        print(res_dict)
        return res_dict
    except Exception as e:
        return {"content": str(e)}


@app.get("/health")
async def health():
    return {"ok": True}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "23587")),
        log_level="info",
    )