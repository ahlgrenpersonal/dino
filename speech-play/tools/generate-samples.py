"""Optional local-only media trial. Public HTTP queue only; never replays a submission.

Run from speech-play: python tools/generate-samples.py
Results and receipts stay in ignored local-media/. Nothing is uploaded or published.
"""
import hashlib
import json
from pathlib import Path
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1] / "local-media"
BASE = "http://127.0.0.1:8080"
MODEL = "minimax-h3-fl2va-int8"
SAMPLES = [
    ("cow-moo", "Animal hello", "Moo", "animal", "A friendly rounded clay-animation cow with cream fur and brown patches stands centered in a simple pale mint meadow. Static medium close-up, face fully visible. After a quiet moment the cow faces the viewer, opens its mouth and gently says one long, clear moo, then closes its mouth and smiles. The cow is the only speaker, speaker_1: <d>[English] Moo.</d> The action is slow and welcoming, mouth movement follows the sound. One continuous shot; no text.", "One gentle sustained moo from the cow, otherwise quiet. No other voices or effects."),
    ("person-pop", "Watch a person", "Pop", "human", "An adult woman in a plain mustard-yellow shirt is centered against an uncluttered warm cream studio background, shoulders and whole face visible. Static camera. She smiles gently, pauses, then visibly brings her lips together and clearly says a single word at a natural, unhurried pace. Speaker_1: <d>[English] Pop.</d> She pauses, smiles and waits with a relaxed expression. One continuous shot, no text, no props, no other people.", "A single clear adult female voice saying pop. Quiet studio room, no other speech or effects."),
    ("puppet-ma", "Copy a puppet", "Ma", "puppet", "A friendly soft teal felt puppet with large kind eyes and a simple rounded mouth is centered against a clean pale peach background. Static medium close-up with the full head visible. It looks at the viewer, gently opens its mouth and clearly says ma twice, with a short quiet pause between. Speaker_1: <d>[English] Ma. Ma.</d> Its mouth closes between syllables. It smiles and waits at the end. One continuous shot, no text, no cuts.", "A gentle, clear warm voice saying ma, then ma, separated by a pause. Otherwise quiet, no sound effects.")
]


def request(route, payload=None, timeout=30):
    req = urllib.request.Request(BASE + route, data=None if payload is None else json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.load(response)


def save(target, value):
    target.write_text(json.dumps(value, indent=2), encoding="utf-8")


def main():
    ROOT.mkdir(exist_ok=True)
    catalog = []
    for index, (slug, title, word, style, scene, sound) in enumerate(SAMPLES):
        capabilities = request("/v1/videos/capabilities")
        if not any(row["id"] == MODEL and row.get("installed") for row in capabilities.get("models", [])):
            raise RuntimeError("Requested H3 engine is unavailable; no model substitution.")
        receipt = ROOT / (slug + ".receipt.json")
        if receipt.exists():
            prior = json.loads(receipt.read_text())
            if prior.get("completed") and (ROOT / (slug + ".mp4")).exists():
                catalog.append(prior["catalog"])
                continue
            raise RuntimeError("Submission marker exists: inspect/recover that accepted job; do not resubmit.")
        payload = {
            "model": MODEL,
            "prompt": "integrated_multimodal_description: [Shot 1] " + scene + "\noverall_soundscape: " + sound + "\nnon_diegetic_music: N/A (no background score)",
            "width": 768, "height": 512, "frames": 124, "fps": 24,
            "steps": 20, "audio": True, "seed": 3700 + index,
            "additional_loras": [],
            "queue": {"priority": "low", "gpu_policy": "gpu_only", "client": "speech_play_media_trial", "workload": "test"}
        }
        record = {"request": payload, "started": time.time(), "completed": False}
        save(receipt, record)
        print("Submitting " + slug + " at LOW priority", flush=True)
        try:
            result = request("/v1/videos/generations", payload, timeout=10800)
            record["response"] = result
            save(receipt, record)
            if result.get("model") != MODEL:
                raise RuntimeError("Unexpected response model")
            item = result["data"][0]
            with urllib.request.urlopen(BASE + item["url"], timeout=120) as download:
                data = download.read()
            if hashlib.sha256(data).hexdigest() != item["sha256"] or len(data) != item["bytes"]:
                raise RuntimeError("Downloaded clip failed integrity checks")
            (ROOT / (slug + ".mp4")).write_bytes(data)
            row = {"id": slug, "title": title, "word": word, "style": style, "src": slug + ".mp4"}
            catalog.append(row)
            record.update(completed=True, catalog=row, seconds=time.time() - record["started"])
            save(receipt, record)
            save(ROOT / "catalog.json", catalog)
            print("Downloaded " + slug, flush=True)
        except Exception as error:
            record["error"] = str(error)
            save(receipt, record)
            raise
    save(ROOT / "catalog.json", catalog)


if __name__ == "__main__":
    main()
