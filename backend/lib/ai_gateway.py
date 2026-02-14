"""
Multi-Model AI Gateway with Fallback Chain
Supports: Groq, Gemini, Claude (with proper free tier optimization)
"""

import os
import json
import httpx
from typing import Optional, List
from dotenv import load_dotenv
import asyncio

load_dotenv()

class AIGateway:
    def __init__(self):
        self.groq_key = os.getenv('GROQ_API_KEY')
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        self.claude_key = os.getenv('ANTHROPIC_API_KEY', None)
        
        # Configuration
        self.groq_base_url = "https://api.groq.com/openai/v1"
        self.request_timeout = 60.0
        
    async def generate_text(self, 
                           prompt: str, 
                           max_tokens: int = 1000,
                           model: str = "auto",
                           temperature: float = 0.7) -> str:
        """
        Main entrypoint - uses fallback chain
        
        Chain order:
        1. Groq (fastest, 120 req/min free)
        2. Gemini (fallback, 1M tokens/min free)
        3. Error
        
        Args:
            prompt: Text to generate from
            max_tokens: Maximum output tokens (capped per model)
            model: "auto", "groq", "gemini", "claude"
            temperature: 0.0-1.0 (0=deterministic, 1=creative)
        """
        
        if model in ["auto", "groq"]:
            try:
                return await self._groq_generate(prompt, max_tokens, temperature)
            except Exception as e:
                print(f"⚠️  Groq failed: {str(e)[:100]}")
        
        if model in ["auto", "gemini"]:
            try:
                return await self._gemini_generate(prompt, max_tokens, temperature)
            except Exception as e:
                print(f"⚠️  Gemini failed: {str(e)[:100]}")
        
        if model in ["auto", "claude"] and self.claude_key:
            try:
                return await self._claude_generate(prompt, max_tokens, temperature)
            except Exception as e:
                print(f"⚠️  Claude failed: {str(e)[:100]}")
        
        raise Exception("❌ All AI models failed. Check API keys in .env")
    
    async def _groq_generate(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """
        Groq API - FASTEST & BEST FREE TIER
        
        Free tier: 120 requests/min, 30k tokens/min
        Models available:
        - mixtral-8x7b-32768 (best for Polish)
        - llama2-70b
        - llama3-70b (new, better)
        
        Cost: $0 (free tier)
        """
        
        if not self.groq_key:
            raise Exception("GROQ_API_KEY not set in .env")
        
        async with httpx.AsyncClient(timeout=self.request_timeout) as client:
            response = await client.post(
                f"{self.groq_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mixtral-8x7b-32768",  # 120 req/min, 30k tokens/min
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": min(max_tokens, 8192),  # Groq limit
                    "temperature": min(temperature, 2.0),
                    "top_p": 0.95,
                    "frequency_penalty": 0,
                    "presence_penalty": 0
                }
            )
            
            if response.status_code != 200:
                error_text = response.text[:200]
                raise Exception(f"Groq API error {response.status_code}: {error_text}")
            
            data = response.json()
            return data['choices'][0]['message']['content']
    
    async def _gemini_generate(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """
        Google Gemini - FALLBACK
        
        Free tier: 1M tokens/month, 60 req/min
        Models: gemini-1.5-flash (recommended for free tier)
        Cost: $0 (free tier)
        """
        
        if not self.gemini_key:
            raise Exception("GEMINI_API_KEY not set in .env")
        
        try:
            import google.generativeai as genai
        except ImportError:
            raise Exception("google-generativeai not installed. pip install google-generativeai")
        
        genai.configure(api_key=self.gemini_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content(
            prompt,
            generation_config={
                'max_output_tokens': min(max_tokens, 8000),
                'temperature': temperature
            }
        )
        
        return response.text
    
    async def _claude_generate(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """
        Claude API - PREMIUM (paid after free trial)
        
        Only use if ANTHROPIC_API_KEY is set
        Cost: $0.80/$2.40 per million tokens (expensive)
        """
        
        if not self.claude_key:
            raise Exception("ANTHROPIC_API_KEY not set")
        
        async with httpx.AsyncClient(timeout=self.request_timeout) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.claude_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-3-haiku-20240307",  # cheapest
                    "max_tokens": min(max_tokens, 4096),
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": temperature
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Claude API error {response.status_code}")
            
            data = response.json()
            return data['content'][0]['text']
    
    async def batch_generate(self, prompts: List[str], model: str = "auto") -> List[str]:
        """
        Generate multiple texts efficiently
        
        Uses batch mode when available
        Optimizes token usage
        """
        tasks = [
            self.generate_text(prompt, model=model)
            for prompt in prompts
        ]
        return await asyncio.gather(*tasks)
    
    async def generate_with_json_response(self,
                                         prompt: str,
                                         json_schema: dict = None) -> dict:
        """
        Generate JSON-structured response
        
        Useful for: quiz questions, structured data extraction
        """
        
        json_prompt = f"""{prompt}

IMPORTANT: Return ONLY valid JSON, no markdown, no extra text.
No JSON code blocks like ```json```, just raw JSON.

Example format:
{json.dumps(json_schema or {}, indent=2)}

Your response must be valid JSON that can be parsed by json.loads()"""
        
        response = await self.generate_text(json_prompt, max_tokens=2000)
        
        # Clean response
        response = response.strip()
        if response.startswith('```'):
            response = response.split('```')[1]
            if response.startswith('json'):
                response = response[4:]
        
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            # Fallback: return error structure
            return {
                "error": "Failed to parse JSON",
                "raw_response": response[:500]
            }


# Singleton pattern
_gateway_instance = None

def get_ai_gateway() -> AIGateway:
    """Get or create singleton instance"""
    global _gateway_instance
    if _gateway_instance is None:
        _gateway_instance = AIGateway()
    return _gateway_instance
