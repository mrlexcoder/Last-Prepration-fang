import type { FeaturedNotebook } from '@/notebook-app/types/notebook'

export const FEATURED_NOTEBOOKS: FeaturedNotebook[] = [
  {
    id: 'feat-travel',
    category: 'Travel',
    categoryIcon: 'flight',
    title: "The Science Fan's Guide To Visiting National Parks",
    date: '12 May 2025',
    sourceCount: 17,
    gradient: 'from-[#5f6368] to-[#9aa0a6]',
    imageHint: 'travel',
  },
  {
    id: 'feat-business',
    category: 'Business',
    categoryIcon: 'business_center',
    title: 'Earnings Reports For Top 50 Corporations',
    date: '8 May 2025',
    sourceCount: 24,
    gradient: 'from-[#3c4043] to-[#70757a]',
    imageHint: 'business',
  },
  {
    id: 'feat-research',
    category: 'Research',
    categoryIcon: 'science',
    title: 'CRISPR Gene Editing: Latest Clinical Trials',
    date: '3 May 2025',
    sourceCount: 31,
    gradient: 'from-[#1a73e8]/80 to-[#34a853]/60',
    imageHint: 'dna',
  },
  {
    id: 'feat-data',
    category: 'Finance',
    categoryIcon: 'show_chart',
    title: 'Market Trends Q1 2025 — Visual Summary',
    date: '1 May 2025',
    sourceCount: 12,
    gradient: 'from-[#e8f0fe] to-[#fce8e6]',
    imageHint: 'chart',
  },
]
