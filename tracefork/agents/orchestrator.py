"""TraceFork multi-agent orchestrator using Gemini with tool calling."""

from __future__ import annotations

import os
from typing import Any

from google import genai
from google.genai import types

from tracefork.agents.tools import TOOL_DECLARATIONS, execute_tool

SYSTEM_PROMPT = """You are TraceFork Orchestrator — an AI agent for food supply chain traceability.

You coordinate specialized capabilities:
- Intake: parse lot numbers
- Trace Builder: full batch trace
- Cold Chain: temperature violations
- Recall Simulator: impact analysis (requires human approval for CRITICAL)
- Integrity: hash chain verification

Rules:
- Only use data from tools — never invent batch data.
- If trace is incomplete, refuse recall simulation and explain why.
- For CRITICAL recalls, mention human approval is required.
- Be concise and professional. Food safety context.

Demo lots: LOT-2026-0421 (happy), LOT-2026-0315 (cold chain), LOT-2026-0199 (incomplete).
"""


def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in .env")
    return genai.Client(api_key=api_key)


def _to_gemini_tools() -> list[types.Tool]:
    declarations = []
    for tool in TOOL_DECLARATIONS:
        declarations.append(
            types.FunctionDeclaration(
                name=tool["name"],
                description=tool["description"],
                parameters=tool["parameters"],
            )
        )
    return [types.Tool(function_declarations=declarations)]


def run_agent(message: str, lot_number: str | None = None) -> str:
    client = _get_client()
    user_msg = message
    if lot_number:
        user_msg = f"[Context lot: {lot_number}] {message}"

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=_to_gemini_tools(),
        temperature=0.2,
    )

    contents: list[Any] = [user_msg]
    max_rounds = 5

    for _ in range(max_rounds):
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=config,
        )

        if not response.candidates:
            return "No response from agent."

        candidate = response.candidates[0]
        parts = candidate.content.parts if candidate.content else []

        tool_calls = [p for p in parts if p.function_call]
        if not tool_calls:
            return response.text or "Done."

        contents.append(candidate.content)
        tool_response_parts = []
        for part in tool_calls:
            fc = part.function_call
            name = fc.name
            args = dict(fc.args) if fc.args else {}
            result = execute_tool(name, args)
            tool_response_parts.append(
                types.Part.from_function_response(name=name, response={"result": result})
            )
        contents.append(types.Content(role="user", parts=tool_response_parts))

    return "Agent reached max tool rounds."
