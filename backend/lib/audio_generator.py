"""
Audio/TTS Generation with Piper + ElevenLabs fallback
Supports: Polish, English, German, French
Free tier optimized
"""

import subprocess
import os
import httpx
from pathlib import Path
from typing import Dict, Optional
from dotenv import load_dotenv
import asyncio

load_dotenv()

class AudioGenerator:
    def __init__(self, output_dir: str = "uploads/audio"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Check if Piper is installed
        self.piper_available = self._check_piper_installed()
        self.elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
    
    def _check_piper_installed(self) -> bool:
        """Check if piper-tts is available"""
        try:
            result = subprocess.run(
                ["piper", "--version"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False
    
    async def generate_from_text(self,
                                 text: str,
                                 voice: str = "pl_PL-ewa-medium",
                                 lesson_id: str = None,
                                 language: str = "pl") -> Dict:
        """
        Generate audio from text
        
        Voices available (Polish):
        - pl_PL-ewa-medium (female, natural)
        - pl_PL-klejda-medium (female, alternative)
        
        Falls back to ElevenLabs if Piper fails
        
        Args:
            text: Text to convert to speech
            voice: Voice model ID
            lesson_id: Unique identifier for caching
            language: Language code (pl, en, de, fr)
        
        Returns:
            {
                "status": "success" | "error",
                "file": "/api/audio/lesson_xxx.wav",
                "duration_estimate": 42.5,
                "provider": "piper" | "elevenlabs",
                "file_size": 524288
            }
        """
        
        # Validate input
        if not text or len(text.strip()) == 0:
            return {"status": "error", "message": "Empty text"}
        
        if len(text) > 10000:
            # Split long texts
            return await self._generate_from_chunks(text, voice, lesson_id, language)
        
        lesson_id = lesson_id or f"audio_{hash(text)}"
        output_file = self.output_dir / f"lesson_{lesson_id}.wav"
        
        # Try Piper first (free, fast, offline)
        if self.piper_available:
            result = await self._piper_generate(text, voice, output_file)
            if result["status"] == "success":
                return result
        
        # Fallback to ElevenLabs
        print(f"⚠️  Piper failed, trying ElevenLabs...")
        return await self._elevenlabs_generate(text, lesson_id, language)
    
    async def _piper_generate(self, text: str, voice: str, output_file: Path) -> Dict:
        """
        Generate audio using Piper TTS (self-hosted, FREE)
        
        Installation on VPS:
        pip install piper-tts
        piper_download_model pl_PL-ewa-medium
        """
        
        try:
            # Piper requires input via stdin
            process = await asyncio.create_subprocess_exec(
                "piper",
                "--model", voice,
                "--output_file", str(output_file),
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(input=text.encode('utf-8')),
                timeout=30.0
            )
            
            if process.returncode != 0:
                error_msg = stderr.decode('utf-8', errors='ignore')
                raise Exception(f"Piper error: {error_msg}")
            
            # Get file info
            file_size = output_file.stat().st_size if output_file.exists() else 0
            duration_estimate = len(text.split()) / 150  # ~150 WPM average
            
            return {
                "status": "success",
                "file": f"/api/audio/lesson_{output_file.stem.split('_')[1]}.wav",
                "duration_estimate": round(duration_estimate, 1),
                "provider": "piper",
                "file_size": file_size
            }
        
        except Exception as e:
            print(f"❌ Piper generation failed: {str(e)[:100]}")
            return {"status": "error", "message": str(e)[:100]}
    
    async def _elevenlabs_generate(self, text: str, lesson_id: str, language: str) -> Dict:
        """
        ElevenLabs API - Fallback
        
        Free tier: 10,000 characters per month
        Cost after: $0.30 per 100,000 chars
        
        Voices: en_US (many), but limited Polish support
        """
        
        if not self.elevenlabs_key:
            return {
                "status": "error",
                "message": "No ElevenLabs API key. Install Piper or add ELEVENLABS_API_KEY"
            }
        
        try:
            # Limit text to 2000 chars (safe for free tier)
            text_chunk = text[:2000]
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
                    headers={"xi-api-key": self.elevenlabs_key},
                    json={
                        "text": text_chunk,
                        "model_id": "eleven_monolingual_v1",
                        "voice_settings": {
                            "stability": 0.5,
                            "similarity_boost": 0.75
                        }
                    }
                )
                
                if response.status_code != 200:
                    error = response.json() if response.headers.get('content-type') == 'application/json' else response.text
                    raise Exception(f"ElevenLabs error {response.status_code}: {error}")
                
                # Save audio
                output_file = self.output_dir / f"lesson_{lesson_id}_elevenlabs.mp3"
                output_file.write_bytes(response.content)
                
                return {
                    "status": "success",
                    "file": f"/api/audio/lesson_{lesson_id}_elevenlabs.mp3",
                    "duration_estimate": len(text_chunk.split()) / 150,
                    "provider": "elevenlabs",
                    "file_size": len(response.content),
                    "chars_used": len(text_chunk)  # For tracking free tier
                }
        
        except Exception as e:
            return {"status": "error", "message": str(e)[:100]}
    
    async def _generate_from_chunks(self, text: str, voice: str, lesson_id: str, language: str) -> Dict:
        """
        Handle long texts by splitting into chunks
        Useful for full course narration
        """
        
        # Split by sentences/paragraphs
        chunks = text.split('\n\n')
        if len(chunks) == 1:
            # Fallback to sentence splitting
            chunks = text.split('. ')
        
        results = []
        for i, chunk in enumerate(chunks):
            if not chunk.strip():
                continue
            
            result = await self.generate_from_text(
                chunk.strip(),
                voice=voice,
                lesson_id=f"{lesson_id}_part_{i}",
                language=language
            )
            results.append(result)
        
        # Return info about all chunks
        return {
            "status": "success",
            "total_chunks": len(results),
            "chunks": results,
            "message": f"Generated {len(results)} audio chunks"
        }
    
    async def batch_generate(self, texts: list[str], voice: str = "pl_PL-ewa-medium") -> list[Dict]:
        """
        Generate audio for multiple texts
        Optimizes batch processing
        """
        tasks = [
            self.generate_from_text(text, voice=voice)
            for text in texts
        ]
        return await asyncio.gather(*tasks)


# Singleton
_audio_gen = None

def get_audio_generator() -> AudioGenerator:
    global _audio_gen
    if _audio_gen is None:
        _audio_gen = AudioGenerator()
    return _audio_gen
