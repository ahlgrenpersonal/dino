"""Generate generic demo words through LLMQ; LOW/test, one complete job per word.

Review ignored local-media/audio-trial outputs before copying WAVs to assets/audio.
Existing submission markers are never automatically replayed after uncertainty.
"""
import hashlib
import json
from pathlib import Path
import urllib.request

BASE = "http://127.0.0.1:8080"
ROOT = Path(__file__).resolve().parents[1] / "local-media" / "audio-trial"
WORDS = {
    "moo": "Moo.", "baa": "Baa.", "woof": "Woof.", "pop": "Pop.", "more": "More.",
    "ready-set": "Ready, set...", "go": "Go!", "beep": "Beep beep!", "boo": "Boo!", "hi": "Hi!",
    "ball": "Ball.", "up": "Up!", "mama": "Mama.", "dada": "Dada.", "ma": "Ma. Ma.", "ba": "Ba. Ba.", "oh": "Oh!"
}


def save(target, value):
    target.write_text(json.dumps(value, indent=2), encoding="utf-8")


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    for slug, text in WORDS.items():
        receipt = ROOT / (slug + ".json")
        if receipt.exists():
            prior = json.loads(receipt.read_text())
            if prior.get("completed") and (ROOT / (slug + ".wav")).exists():
                continue
            raise RuntimeError("Existing submission marker: recover its accepted result; do not resubmit.")
        payload = {"model": "qwen3-tts-1.7b-voicedesign", "input": text,
                   "instructions": "A warm, clear adult female voice speaking standard American English. Gentle and playful but calm. Say the supplied word or syllables clearly, with natural pronunciation and a small pause between repeated syllables. No whispering, singing or additional words.",
                   "language": "English", "seed": 42, "response_format": "wav",
                   "queue": {"priority": "low", "gpu_policy": "gpu_only", "client": "speech_play_audio_trial", "workload": "test"}}
        record = {"request": payload, "completed": False}
        save(receipt, record)
        print("Submitting " + slug + " at LOW priority", flush=True)
        req = urllib.request.Request(BASE + "/v1/audio/speech", data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10800) as response:
                result = json.load(response)
            record["response"] = result
            save(receipt, record)
            if result.get("model") != payload["model"]:
                raise RuntimeError("Unexpected speech model")
            item = result["data"][0]
            with urllib.request.urlopen(BASE + item["url"], timeout=120) as response:
                data = response.read()
            if hashlib.sha256(data).hexdigest() != item["sha256"] or len(data) != item["bytes"]:
                raise RuntimeError("Audio integrity check failed")
            (ROOT / (slug + ".wav")).write_bytes(data)
            record["completed"] = True
            save(receipt, record)
            print("Downloaded " + slug, flush=True)
        except Exception as error:
            record["error"] = str(error)
            save(receipt, record)
            raise


if __name__ == "__main__":
    main()
