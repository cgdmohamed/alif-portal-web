import type { ComponentType } from 'react'
import WordSearchPreview from './WordSearchPreview'
import MatchingPreview from './MatchingPreview'
import RankingSelectionPreview from './RankingSelectionPreview'

const registry: Record<string, ComponentType> = {
  'بحث عن كلمات': WordSearchPreview,
  'مطابقة': MatchingPreview,
  'اختيار وترتيب': RankingSelectionPreview,
}

export function getActivityPreview(activityType: string): ComponentType | null {
  return registry[activityType] ?? null
}

export { WordSearchPreview, MatchingPreview, RankingSelectionPreview }
