import sys
import json
import asyncio
import os
import edge_tts

# Vozes Multilingues Neurais (Natural)
VOICE_AVA = "en-US-AvaMultilingualNeural"
VOICE_ANDREW = "en-US-AndrewMultilingualNeural"

# Escolha da voz (padrão Ava; para Andrew, altere para VOICE_ANDREW)
SELECTED_VOICE = VOICE_AVA

# Velocidades calibradas
RATES = {
    "A1": "-20%",  # 0.8
    "A2": "-20%",  # 0.8
    "B1": "-15%",  # 0.85
    "B2": "-15%",  # 0.85
    "C1": "-10%",  # 0.9
    "C2": "-10%"   # 0.9
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

    print(f"Processando lição: {data['title']} (Voz: {SELECTED_VOICE})\n")

    for level, content in data["levels"].items():
        text = content["fullText"]
        rate = RATES.get(level, "+0%")
        file_name = f"{level.lower()}.mp3"
        output_file = os.path.join(output_dir, file_name)

        print(f"-> Gerando {level} | Vel: {rate}...")
        communicate = edge_tts.Communicate(text, SELECTED_VOICE, rate=rate)
        await communicate.save(output_file)
        
        content["audio"] = f"/audio/{lesson_id}/{file_name}"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nÁudios finalizados em: {output_dir}")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "data/lessons/01-coffee-culture.json"
    asyncio.run(generate(target_file))