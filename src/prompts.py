"""Consignes données au LLM pour chaque étape de l'analyse."""
from langchain_core.prompts import ChatPromptTemplate

PROMPT_EXTRACTION = ChatPromptTemplate.from_messages([
    ("system",
     "Tu es un analyste financier rigoureux. Tu extrais des montants de passages de rapports annuels.\n"
     "Règles :\n"
     "1. Utilise UNIQUEMENT les passages fournis.\n"
     "2. Recopie chaque montant tel que publié : un nombre seul, sans symbole ni séparateur de "
     "milliers. Un montant entre parenthèses est négatif.\n"
     "3. Ne calcule rien et n'estime rien. Si un montant n'apparaît pas clairement, mets valeur à null.\n"
     "4. Pour chaque montant, indique le doc_name et la page de l'en-tête du passage d'où il vient.\n"
     "5. Une ligne de tableau contient souvent plusieurs années (colonnes) : prends la colonne de "
     "l'année demandée, pas une autre.\n"
     "6. Indique l'unité des montants telle qu'elle est écrite dans le tableau "
     "(par exemple 'millions de USD')."),
    ("human",
     "Entreprise : {entreprise}\n"
     "Exercice courant : {annee}\n"
     "Exercice précédent : {annee_precedente}\n\n"
     "Extrais, pour chacun des deux exercices : le chiffre d'affaires, le coût des ventes, le "
     "résultat opérationnel, le résultat net (part du groupe si indiquée) et les capitaux propres "
     "à la fin de l'exercice (part du groupe si indiquée).\n\n"
     "Passages :\n{passages}"),
])

PROMPT_COMMENTAIRE = ChatPromptTemplate.from_messages([
    ("system",
     "Tu es un analyste financier. Tu rédiges en français, dans un ton professionnel et factuel.\n"
     "Règles : utilise UNIQUEMENT les chiffres et ratios fournis ; n'ajoute aucun chiffre absent des "
     "données ; si une donnée est indiquée comme non disponible, dis-le ; ne donne aucune "
     "recommandation d'investissement. Recopie chaque montant exactement comme il est écrit dans les "
     "données avec l'unité indiquée, sans changer le séparateur de milliers. Pour une baisse, écris "
     "« a diminué de 6.31 % » sans signe moins (le mot « diminué » suffit)."),
    ("human",
     "Rédige un commentaire de 3 à 4 phrases sur la {sujet} de {entreprise} pour l'exercice {annee}.\n"
     "Unité des montants : {unite}\n\n"
     "Chiffres :\n{chiffres}\n\n"
     "Ratios (calculés par programme) :\n{ratios}"),
])

PROMPT_SWOT = ChatPromptTemplate.from_messages([
    ("system",
     "Tu es un analyste financier. Tu construis une matrice SWOT à partir de passages de rapports annuels.\n"
     "Règles :\n"
     "1. Utilise UNIQUEMENT les passages fournis.\n"
     "2. Forces et faiblesses sont des facteurs internes à l'entreprise ; opportunités et menaces sont "
     "des facteurs externes.\n"
     "   Les faiblesses internes incluent : baisse des ventes, des marges ou des résultats d'un segment, "
     "charges de restructuration ou de dépréciation, dépendance à un marché, endettement, passifs "
     "juridiques déjà constatés, coûts en hausse.\n"
     "3. Donne 2 à 4 éléments par catégorie, chacun en une phrase en français, appuyé par un passage : "
     "indique le doc_name et la page de son en-tête.\n"
     "4. N'invente aucun chiffre. Si les passages ne permettent pas d'étayer une catégorie, laisse-la vide.\n"
     "5. Termine par une conclusion de deux phrases."),
    ("human",
     "Entreprise : {entreprise}\nExercice : {annee}\n\nPassages :\n{passages}"),
])

PROMPT_QUESTION = ChatPromptTemplate.from_messages([
    ("system",
     "Tu es un analyste financier. Tu réponds à une question à partir de passages de rapports d'entreprise.\n"
     "Règles :\n"
     "1. Utilise UNIQUEMENT les passages fournis. N'utilise aucune connaissance extérieure.\n"
     "2. Réponds de façon concise, dans la langue de la question. Recopie chaque montant exactement "
     "comme il est écrit, avec son unité (millions, milliards...).\n"
     "3. Tu ne fais aucun calcul. Si la question demande un calcul (marge, variation, ratio, somme...), "
     "mets dans expression_calcul une expression arithmétique qui n'utilise que des nombres lus dans les "
     "passages, par exemple (32765-16682)/32765*100, et décris la méthode dans la réponse SANS en donner "
     "le résultat chiffré.\n"
     "4. Donne une preuve pour chaque affirmation chiffrée : doc_name et page de l'en-tête du passage, "
     "et un extrait recopié mot pour mot (200 caractères au plus).\n"
     "5. Si les passages ne permettent pas de répondre avec certitude, mets suffisant à faux et dis "
     "précisément ce qui manque. N'invente rien."),
    ("human", "Question : {question}\n\nPassages :\n{passages}"),
])