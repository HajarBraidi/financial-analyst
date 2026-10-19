import io
import requests
from pypdf import PdfReader

# Le PDF est lu directement depuis GitHub : rien n'est stocké sur votre PC
URL = "https://raw.githubusercontent.com/patronus-ai/financebench/main/pdfs/3M_2018_10K.pdf"

print("Téléchargement du PDF...")
reponse = requests.get(URL, timeout=60)
reponse.raise_for_status()

lecteur = PdfReader(io.BytesIO(reponse.content))
print("Nombre de pages :", len(lecteur.pages))

# Page 0 = couverture, page 59 = tableau des flux de trésorerie
for numero in [0, 59]:
    texte = lecteur.pages[numero].extract_text()
    print(f"\n===== Page {numero} =====")
    print(texte[:1500])