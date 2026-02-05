import requests
import json

url = "http://localhost:8000/api/ner/analyze-death-cause"
payload = {
    "findings_text": "Paciente varón 45 años. Accidente tránsito. Examen: Fractura parietal derecha con hematoma epidural. Hemorragia subaracnoidea. Pulmones con contusiones bilaterales. Hígado con laceración grado III. Hemoperitoneo 1500cc."
}

try:
    response = requests.post(url, json=payload)
    with open("test_result.txt", "w", encoding="utf-8") as f:
        f.write(f"Status Code: {response.status_code}\n")
        f.write(json.dumps(response.json(), indent=2, ensure_ascii=False))
except Exception as e:
    with open("test_result.txt", "w", encoding="utf-8") as f:
        f.write(f"Error: {e}")
