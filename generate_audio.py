import sys
import json
import asyncio
import os
import edge_tts

VOICE_FEMALE = "en-US-JennyNeural"

RATES = {
    "A1": "-20%",
    "A2": "-10%",
    "B1": "+0%",
    "B2": "+0%",
    "C1": "+0%",
    "C2": "+5%"
}

async def generate(file_path):
    if not os.path.exists(file_path):
        print(f"Erro: Arquivo '{file_path}' não encontrado.")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    lesson_id = data["id"]
    output_dir = f"public/audio/{lesson_id}"
    os.makedirs(output_dir, exist_ok=True)

    print(f"Processando lição: {data['title']} (ID: {lesson_id})\n")

    for level, content in data["levels"].items():
        text = content["fullText"]
        rate = RATES.get(level, "+0%")
        file_name = f"{level.lower()}.mp3"
        output_file = os.path.join(output_dir, file_name)

        print(f"-> Gerando áudio {level}...")
        communicate = edge_tts.Communicate(text, VOICE_FEMALE, rate=rate)
        await communicate.save(output_file)
        
        content["audio"] = f"/audio/{lesson_id}/{file_name}"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nConcluído! Áudios salvos em: {output_dir}")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "data/lessons/01-coffee-culture.json"
    asyncio.run(generate(target_file))