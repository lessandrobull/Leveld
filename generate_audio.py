import sys
import json
import asyncio
import os
import re
import edge_tts

VOICE_AVA = "en-US-AvaMultilingualNeural"
VOICE_ANDREW = "en-US-AndrewMultilingualNeural"

# Taxas relativas para o edge-tts
RATES_AVA = {
    "A1": "-20%",  # 0.80
    "A2": "-20%",  # 0.80
    "B1": "-15%",  # 0.85
    "B2": "-15%",  # 0.85
    "C1": "-10%",  # 0.90
    "C2": "-10%"   # 0.90
}

RATES_ANDREW = {
    "A1": "-10%",  # 0.90
    "A2": "-10%",  # 0.90
    "B1": "-5%",   # 0.95
    "B2": "-5%",   # 0.95
    "C1": "+0%",   # 1.00
    "C2": "+0%"    # 1.00
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

    # Identifica o número da lição para alternar ímpar (Ava) / par (Andrew)
    match = re.search(r"\d+", lesson_id)
    lesson_num = int(match.group()) if match else 1
    is_odd = (lesson_num % 2) != 0

    voice = VOICE_AVA if is_odd else VOICE_ANDREW
    rates = RATES_AVA if is_odd else RATES_ANDREW
    data["voice"] = "Ava" if is_odd else "Andrew"

    print(f"-> Lição #{lesson_num}: {data['title']}")
    print(f"-> Voz Selecionada: {'Ava (Ímpar)' if is_odd else 'Andrew (Par)'} [{voice}]\n")

    for level, content in data["levels"].items():
        rate = rates.get(level, "+0%")
        
        # 1. Áudio completo
        full_file_name = f"{level.lower()}.mp3"
        full_output = os.path.join(output_dir, full_file_name)
        print(f"[{level}] Texto completo (Taxa: {rate})...")
        comm = edge_tts.Communicate(content["fullText"], voice, rate=rate)
        await comm.save(full_output)
        content["audio"] = f"/audio/{lesson_id}/{full_file_name}"

        # 2. Áudios individuais por frase
        content["sentenceAudios"] = []
        for idx, sentence in enumerate(content.get("sentences", [])):
            s_file_name = f"{level.lower()}_s{idx}.mp3"
            s_output = os.path.join(output_dir, s_file_name)
            s_comm = edge_tts.Communicate(sentence, voice, rate=rate)
            await s_comm.save(s_output)
            content["sentenceAudios"].append(f"/audio/{lesson_id}/{s_file_name}")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nTodos os áudios foram salvos com sucesso em: {output_dir}")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else "data/lessons/01-coffee-culture.json"
    asyncio.run(generate(target_file))
