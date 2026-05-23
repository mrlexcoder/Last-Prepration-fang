import type { StudioFeature } from '@/notebook-app/types/notebook'

export const STUDIO_FEATURES: StudioFeature[] = [
  {
    id: 'audio',
    title: 'Audio Overview',
    icon: 'headphones',
    colorClass: 'bg-[#e8f0fe] text-[#1a73e8]',
  },
  {
    id: 'slides',
    title: 'Slide deck',
    icon: 'slideshow',
    colorClass: 'bg-[#fef7e0] text-[#b06000]',
    beta: true,
  },
  {
    id: 'video',
    title: 'Video Overview',
    icon: 'videocam',
    colorClass: 'bg-[#e6f4ea] text-[#137333]',
  },
  {
    id: 'mindmap',
    title: 'Mind Map',
    icon: 'account_tree',
    colorClass: 'bg-[#f3e8fd] text-[#7b1fa2]',
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'description',
    colorClass: 'bg-[#f5efe6] text-[#6d4c41]',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    icon: 'style',
    colorClass: 'bg-[#fce8e6] text-[#c5221f]',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    icon: 'quiz',
    colorClass: 'bg-[#e0f7fa] text-[#007b83]',
  },
  {
    id: 'infographic',
    title: 'Infographic',
    icon: 'insert_chart',
    colorClass: 'bg-[#fce4ec] text-[#ad1457]',
    beta: true,
  },
  {
    id: 'datatable',
    title: 'Data table',
    icon: 'table_chart',
    colorClass: 'bg-[#e8eaf6] text-[#283593]',
  },
]
