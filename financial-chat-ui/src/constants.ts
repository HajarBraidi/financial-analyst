export const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SuggestionItem {
  iconName: 'Building' | 'TrendingUp' | 'ShieldAlert' | 'Calculator';
  title: string;
  question: string;
  company?: string;
  year?: number;
}

export const SUGGESTIONS: SuggestionItem[] = [
  {
    iconName: 'Building',
    title: "Chiffre d'affaires net 3M",
    question: "Quel était le chiffre d'affaires net de 3M en 2018 ?",
    company: '3M',
    year: 2018,
  },
  {
    iconName: 'TrendingUp',
    title: "Résultat opérationnel Netflix",
    question:
      "What was Netflix's operating income for the three months ended June 30, 2023?",
    company: 'Netflix',
    year: 2023,
  },
  {
    iconName: 'ShieldAlert',
    title: 'Facteurs de risque Coca-Cola',
    question: 'What were the main risk factors mentioned by Coca-Cola in 2017?',
    company: 'Coca-Cola',
    year: 2017,
  },
  {
    iconName: 'Calculator',
    title: 'Marge brute Activision',
    question: 'Calculate the FY2019 gross margin for Activision Blizzard.',
    company: 'Activision Blizzard',
    year: 2019,
  },
];