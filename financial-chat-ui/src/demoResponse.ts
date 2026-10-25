import { ChatResponse } from './types';

export const DEMO_RESPONSE: ChatResponse = {
  question: "Quel était le chiffre d'affaires net de 3M en 2018 ?",
  answer:
    "Pour l'exercice clos le 31 décembre 2018, le chiffre d'affaires net (*Net Sales*) de **3M Company** s'est élevé à **32 765 millions de dollars américains**, contre 31 657 millions de dollars en 2017, représentant une croissance de **3,50 %**.\n\n### Répartition et faits marquants\n- La division **Industrial** demeure la principale contributrice aux revenus consolidés.\n- Le coût des ventes s'est établi à **16 682 millions USD**, dégageant ainsi un bénéfice brut de **16 083 millions USD**.\n- Le résultat d'exploitation s'est élevé à **7 207 millions USD**, impacté par des charges de restructuration ciblées.",
  entreprises: ['3M'],
  annees: [2018],
  preuves: [
    {
      doc_name: '3M_2018_10K',
      page: 63,
      extrait: 'Net sales $ 32,765 $ 31,657 $ 30,109',
      verifiee: true,
    },
    {
      doc_name: '3M_2018_10K',
      page: 63,
      extrait: 'Cost of sales 16,682 16,055 15,252',
      verifiee: true,
    },
    {
      doc_name: '3M_2018_10K',
      page: 63,
      extrait: 'Operating income 7,207 7,666 7,490',
      verifiee: true,
    },
    {
      doc_name: '3M_2019_10K',
      page: 48,
      extrait: 'prior period revisions for dual-distribution network adjustment',
      verifiee: false,
    },
  ],
  expression_calcul: '(32765 - 31657) / 31657 * 100',
  resultat_calcul: 3.5,
  avertissements: [
    "Un ajustement mineur de présentation comptable a été rapporté dans le rapport 10-K ultérieur de 2019.",
    "La preuve citée pour la note de bas de page (3M_2019_10K, p. 48) n'a pas pu être recoupée mot à mot de manière univoque."
  ],
  sources: [
    {
      rang: 1,
      doc_name: '3M_2018_10K',
      company: '3M',
      year: 2018,
      doc_type: '10-K',
      page: 63,
      score: 0.942,
      texte:
        'Consolidated Statement of Income (Millions, except per share amounts). Years ended December 31, 2018, 2017 and 2016.\nNet sales $ 32,765 $ 31,657 $ 30,109.\nCost of sales 16,682 16,055 15,252.\nGross profit 16,083 15,602 14,857.\nOperating expenses: Selling, general and administrative expenses 6,701 6,108 5,595.\nResearch, development and related expenses 1,821 1,828 1,772.\nGain on sale of businesses (646) — —.\nOperating income 7,207 7,666 7,490.\nOther expense (income), net 84 89 284.\nIncome before income taxes 7,123 7,577 7,206.',
    },
    {
      rang: 2,
      doc_name: '3M_2018_10K',
      company: '3M',
      year: 2018,
      doc_type: '10-K',
      page: 31,
      score: 0.887,
      texte:
        "Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations.\nWorldwide net sales totaled $32.765 billion in 2018, an increase of 3.5 percent compared to $31.657 billion in 2017. Organic local-currency sales increased 3.2 percent, acquisitions added 0.4 percent, while foreign currency translation decreased sales by 0.1 percent.",
    },
    {
      rang: 3,
      doc_name: '3M_2018_10K',
      company: '3M',
      year: 2018,
      doc_type: '10-K',
      page: 70,
      score: 0.814,
      texte:
        'Note 3. Revenue from Contracts with Customers.\nDisaggregated Revenue Information: The company disaggregates net sales by business segment and geographic area. Industrial segment sales were $11,547 million in 2018 compared to $11,048 million in 2017. Safety and Graphics net sales were $6,832 million.',
    },
    {
      rang: 4,
      doc_name: '3M_2019_10K',
      company: '3M',
      year: 2019,
      doc_type: '10-K',
      page: 48,
      score: 0.763,
      texte:
        'Selected Financial Data (Recast). Years ended December 31, 2018 Net sales were recast to reflect discontinued operations of the ballistic protection business. Prior period revisions for dual-distribution network adjustment remained immaterial to total operating cash flows.',
    },
  ],
};