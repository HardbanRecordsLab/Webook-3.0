"""
Audio Generator (TTS) for Webbooks
Supports:
1. Piper TTS (Local, Free, High Quality)
2. ElevenLabs (Cloud, Paid, Ultra Realistic)
"""

import os
import subprocess
import uuid
from pathlib import Path
from dotenv import load_dotenv
import httpx

load_dotenv()

class AudioGenerator:
    def __init__(self):
        self.elevenlabs_key = os.getenv('ELEVENLABS_API_KEY')
        self.output_dir = Path("uploads/audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Check for Piper
        self.piper_available = self._check_piper()
        
    def _check_piper(self) -> bool:
        """Check if piper binary is available"""
        try:
            # In production, we assume piper is installed
            # For this mock, we'll return False unless specifically configured
            return os.path.exists("./piper/piper") or os.path.exists("/usr/local/bin/piper")
        except:
            return False

    async def generate_from_text(self, 
                                text: str, 
                                voice: str = "pl_PL-ewa-medium", 
                                lesson_id: str = None,
                                language: str = "pl") -> dict:
        """
        Generate audio from text
        
        Priority:
        1. Piper (if available & voice is local) - FREE
        2. ElevenLabs (if key available) - PAID
        3. Fallback (Google Translate TTS or Mock)
        """
        
        file_id = lesson_id or str(uuid.uuid4())
        output_file = self.output_dir / f"lesson_{file_id}.wav"
        
        # 1. Try Piper (Best Free Option)
        if self.piper_available and "pl_PL" in voice:
            try:
                self._generate_piper(text, output_file, voice)
                return {
                    "status": "success",
                    "file": f"/api/audio/{file_id}",
                    "provider": "piper",
                    "duration": 0 # TODO: Calculate duration
                }
            except Exception as e:
                print(f"Piper failed: {e}")
        
        # 2. Try ElevenLabs (Best Quality)
        if self.elevenlabs_key:
            try:
                await self._generate_elevenlabs(text, output_file)
                return {
                    "status": "success",
                    "file": f"/api/audio/{file_id}",
                    "provider": "elevenlabs",
                    "duration": 0
                }
            except Exception as e:
                print(f"ElevenLabs failed: {e}")
                
        # 3. Fallback / Mock
        # In a real app, we might use gTTS (Google Translate TTS) here
        return {
            "status": "error",
            "message": "No TTS provider available (Piper not found, ElevenLabs key missing)"
        }

    def _generate_piper(self, text: str, output_path: Path, voice: str):
        """Run local Piper TTS process"""
        cmd = f"echo '{text}' | piper --model {voice} --output_file {output_path}"
        subprocess.run(cmd, shell=True, check=True)
        
    async def _generate_elevenlabs(self, text: str, output_path: Path):
        """Call ElevenLabs API"""
        # Default voice ID (Adam)
        voice_id = "pNInz6obpgDQGcFmaJgB" 
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.elevenlabs_key
        }
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            
            if response.status_code != 200:
                raise Exception(f"ElevenLabs error: {response.text}")
                
            with open(output_path, "wb") as f:
                f.write(response.content)

# Singleton
_audio_instance = None

def get_audio_generator() -> AudioGenerator:
    global _audio_instance
    if _audio_instance is None:
        _audio_instance = AudioGenerator()
    return _audio_instance
