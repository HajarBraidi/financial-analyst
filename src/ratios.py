"""Calculs financiers en Python pur : le LLM n'effectue jamais ces calculs.

Toutes les fonctions renvoient None si une donnée manque ou si le calcul n'a pas de sens,
et un pourcentage arrondi à 2 décimales sinon."""


def _manquant(*valeurs):
    return any(v is None for v in valeurs)


def marge(numerateur, chiffre_affaires):
    """Marge en % : numérateur / chiffre d'affaires."""
    if _manquant(numerateur, chiffre_affaires) or chiffre_affaires == 0:
        return None
    return round(numerateur / chiffre_affaires * 100, 2)


def marge_brute(chiffre_affaires, cout_des_ventes):
    """Marge brute en % : (chiffre d'affaires - coût des ventes) / chiffre d'affaires."""
    if _manquant(chiffre_affaires, cout_des_ventes):
        return None
    return marge(chiffre_affaires - cout_des_ventes, chiffre_affaires)


def roe(resultat_net, capitaux_propres):
    """Rentabilité des capitaux propres en %, sur les capitaux propres de fin d'exercice.
    Sans signification si les capitaux propres sont négatifs ou nuls : on renvoie None."""
    if _manquant(resultat_net, capitaux_propres) or capitaux_propres <= 0:
        return None
    return round(resultat_net / capitaux_propres * 100, 2)


def croissance(actuel, precedent):
    """Variation en % entre deux exercices : (actuel - précédent) / |précédent|."""
    if _manquant(actuel, precedent) or precedent == 0:
        return None
    return round((actuel - precedent) / abs(precedent) * 100, 2)


# --- Calcul demandé par une question libre ---------------------------------------------------
# Le LLM ne donne jamais le résultat : il écrit une expression (ex. "(32765-16682)/32765*100")
# que Python évalue ici, avec seulement des nombres et + - * / ( ).
import ast
import operator

_OPERATEURS = {
    ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv,
}


def _evaluer(noeud):
    if isinstance(noeud, ast.Expression):
        return _evaluer(noeud.body)
    if isinstance(noeud, ast.Constant) and isinstance(noeud.value, (int, float)) \
            and not isinstance(noeud.value, bool):
        return float(noeud.value)
    if isinstance(noeud, ast.UnaryOp) and isinstance(noeud.op, (ast.USub, ast.UAdd)):
        valeur = _evaluer(noeud.operand)
        return -valeur if isinstance(noeud.op, ast.USub) else valeur
    if isinstance(noeud, ast.BinOp) and type(noeud.op) in _OPERATEURS:
        return _OPERATEURS[type(noeud.op)](_evaluer(noeud.left), _evaluer(noeud.right))
    raise ValueError("expression non autorisée")


def evaluer_expression(expression):
    """Résultat (arrondi à 2 décimales) d'une expression arithmétique simple, sinon None."""
    if not expression or len(expression) > 200:
        return None
    try:
        return round(_evaluer(ast.parse(expression.strip(), mode="eval")), 2)
    except (ValueError, SyntaxError, ZeroDivisionError, OverflowError, RecursionError):
        return None


def nombres_de(expression):
    """Les nombres écrits dans l'expression (pour vérifier qu'ils viennent des passages)."""
    try:
        arbre = ast.parse((expression or "").strip(), mode="eval")
    except SyntaxError:
        return []
    return [n.value for n in ast.walk(arbre)
            if isinstance(n, ast.Constant) and isinstance(n.value, (int, float))]