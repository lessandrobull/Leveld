import sys
import json
import asyncio
import os
import edge_tts

# Voz Neural Selecionada: Andrew
SELECTED_VOICE = "en-US-AndrewMultilingualNeural"

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

    print(f"Gerando áudios com a voz do Andrew ({SELECTED_VOICE}) para: {data['title']}\n")

    for level, content in data["levels"].items():
        rate = RATES.get(level, "+0%")
        
        # 1. Áudio completo do nível (Passos 1, 2 e 6)
        full_file_name = f"{level.lower()}.mp3"
        full_output_path = os.path.join(output_dir, full_file_name)
        print(f"-> [{level}] Gerando texto completo...")
        comm = edge_tts.Communicate(content["fullText"], SELECTED_VOICE, rate=rate)
        await comm.save(full_output_path)
        content["audio"] = f"/audio/{lesson_id}/{full_file_name}"

        # 2. Áudios individuais por frase (Passos 3, 4 e 5)
        content["sentenceAudios"] = []
        for idx, sentence in enumerate(content.get("sentences", [])):
            s_file_name = f"{level.lower()}_s{idx}.mp3"
            s_output_path = os.path.join(output_dir, s_file_name)
            print(f"   -> [{level}] Frase {idx + 1}: \"{sentence[:30]}...\"")
            s_comm = edge_tts.Communicate(sentence, SELECTED_VOICE, rate=rate)
            await s_comm.save(s_output_path)
            content["sentenceAudios"].append(f"/audio/{lesson_id}/{s_file_name}")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nTodos os áudios neurais do Andrew foram salvos em: {output_dir}")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "data/lessons/01-coffee-culture.json"
    asyncio.run(generate(target_file))