"""Formats de données de l'étape d'analyse : extraction, SWOT et résultat final."""
from typing import List, Optional

from pydantic import BaseModel, Field


# --- Ce que le LLM doit extraire des passages ---------------------------------
class Mesure(BaseModel):
    """Un montant lu dans un passage, avec sa source."""

    valeur: Optional[float] = Field(
        default=None,
        description=(
            "Montant tel que publié : nombre seul, sans symbole ni séparateur de milliers, "
            "négatif s'il est entre parenthèses. null s'il n'apparaît pas clairement."
        ),
    )
    page: Optional[int] = Field(
        default=None,
        description="Numéro de page indiqué dans l'en-tête du passage d'où vient le montant.",
    )
    doc_name: Optional[str] = Field(
        default=None,
        description="Nom du document indiqué dans l'en-tête du passage d'où vient le montant.",
    )


class ChiffresAnnee(BaseModel):
    """Les chiffres d'un exercice."""

    chiffre_affaires: Mesure = Field(
        default_factory=Mesure, description="Chiffre d'affaires total (net sales / revenues)."
    )
    cout_des_ventes: Mesure = Field(
        default_factory=Mesure,
        description="Coût des ventes (cost of sales / cost of revenues), en valeur positive.",
    )
    resultat_operationnel: Mesure = Field(
        default_factory=Mesure, description="Résultat opérationnel (operating income)."
    )
    resultat_net: Mesure = Field(
        default_factory=Mesure, description="Résultat net (net income), part du groupe si indiquée."
    )
    capitaux_propres: Mesure = Field(
        default_factory=Mesure,
        description="Capitaux propres à la fin de l'exercice (equity), part du groupe si indiquée.",
    )


class Extraction(BaseModel):
    """Chiffres extraits pour l'exercice demandé et le précédent."""

    unite: str = Field(
        default="",
        description="Unité des montants telle qu'indiquée dans les tableaux, par exemple 'millions de USD'.",
    )
    annee_courante: ChiffresAnnee = Field(default_factory=ChiffresAnnee)
    annee_precedente: ChiffresAnnee = Field(default_factory=ChiffresAnnee)


# --- Matrice SWOT ---------------------------------------------------------------
class ElementSwot(BaseModel):
    texte: str = Field(description="Un élément, en une phrase en français.")
    page: Optional[int] = Field(default=None, description="Page indiquée dans l'en-tête du passage source.")
    doc_name: Optional[str] = Field(default=None, description="Document indiqué dans l'en-tête du passage source.")


class Swot(BaseModel):
    forces: List[ElementSwot] = Field(default_factory=list, description="Facteurs internes favorables.")
    faiblesses: List[ElementSwot] = Field(default_factory=list, description="Facteurs internes défavorables.")
    opportunites: List[ElementSwot] = Field(default_factory=list, description="Facteurs externes favorables.")
    menaces: List[ElementSwot] = Field(default_factory=list, description="Facteurs externes défavorables.")
    conclusion: str = Field(default="", description="Conclusion de deux phrases en français.")


# --- Résultat final renvoyé par l'analyseur ---------------------------------------
class LigneChiffre(BaseModel):
    nom: str
    annee: int
    valeur: Optional[float] = None
    source: Optional[str] = None  # "3M_2019_10K, p. 46"
    verifiee: bool = False  # la valeur a été retrouvée dans la page citée


class LigneRatio(BaseModel):
    nom: str
    annee: int
    valeur: Optional[float] = None  # en pourcentage
    formule: str = ""


class ResultatAnalyse(BaseModel):
    type_analyse: str
    entreprise: str
    annee: int
    unite_montants: str = ""
    chiffres: List[LigneChiffre] = Field(default_factory=list)
    ratios: List[LigneRatio] = Field(default_factory=list)
    swot: Optional[Swot] = None
    commentaire: str = ""
    avertissements: List[str] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)  # passages fournis au LLM


# --- Analyse complète : les trois volets en un seul rapport --------------------------------
class ResultatComplet(BaseModel):
    entreprise: str
    annee: int
    rentabilite: Optional[ResultatAnalyse] = None
    croissance: Optional[ResultatAnalyse] = None
    swot: Optional[ResultatAnalyse] = None
    avertissements: List[str] = Field(default_factory=list)


# --- Question libre -------------------------------------------------------------------------
class PreuveLLM(BaseModel):
    """Ce que le LLM annonce comme preuve."""

    doc_name: Optional[str] = Field(default=None, description="Document indiqué dans l'en-tête du passage.")
    page: Optional[int] = Field(default=None, description="Page indiquée dans l'en-tête du passage.")
    extrait: str = Field(
        default="",
        description="Recopie EXACTE, mot pour mot, d'au plus 200 caractères du passage qui prouve l'affirmation.",
    )


class ReponseLLM(BaseModel):
    """Réponse du LLM à une question libre."""

    reponse: str = Field(description="Réponse concise. Sans résultat de calcul (voir expression_calcul).")
    preuves: List[PreuveLLM] = Field(default_factory=list, description="Une preuve par affirmation chiffrée.")
    expression_calcul: Optional[str] = Field(
        default=None,
        description=(
            "Si la question demande un calcul : expression arithmétique n'utilisant que des nombres "
            "lus dans les passages, par exemple (32765-16682)/32765*100. Sinon null."
        ),
    )
    suffisant: bool = Field(
        default=True, description="Faux si les passages ne permettent pas de répondre avec certitude."
    )


class Preuve(BaseModel):
    doc_name: Optional[str] = None
    page: Optional[int] = None
    extrait: str = ""
    verifiee: bool = False  # la page existe parmi les passages ET l'extrait y est retrouvé


class ReponseQuestion(BaseModel):
    question: str
    entreprises: List[str] = Field(default_factory=list)
    annees: List[int] = Field(default_factory=list)
    reponse: str = ""
    preuves: List[Preuve] = Field(default_factory=list)
    expression_calcul: Optional[str] = None
    resultat_calcul: Optional[float] = None
    avertissements: List[str] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)  # passages fournis au LLM