// Category definitions ordered from most specific to least specific.
// IMPORTANT: More specific categories (e.g. "Natural Sciences") must appear
// BEFORE generic ones (e.g. "Methodology") to avoid false matches on
// multi-discipline strings like "Mathematics / Problem-Solving Methodology".

export const CATEGORY_ORDER = [
  { category: 'Software Engineering', match: ['Software Engineering'] },
  { category: 'Frontend Engineering', match: ['Frontend Engineering', 'web'] },
  { category: 'iOS Development', match: ['iOS Development', 'iOS', 'ios'] },
  { category: 'Android Development', match: ['Android Development', 'Android', 'android'] },
  { category: 'Go BFF', match: ['Go BFF', 'Go', 'server'] },
  { category: 'AI/ML', match: ['AI/ML', 'Artificial Intelligence', 'Machine Learning'] },
  { category: 'System Design', match: ['System Design', 'Software Design'] },
  { category: 'Thinking & Learning', match: ['Thinking', 'Learning', 'Psychology', 'Education'] },
  { category: 'Writing & Literature', match: ['Writing', 'Literature'] },
  { category: 'Humanities & Social Sciences', match: ['Philosophy', 'Linguistics', 'History', 'Law', 'Political Science', 'Sociology', 'Art'] },
  { category: 'Economics & Business', match: ['Economics', 'Finance', 'Management', 'Accounting', 'Marketing', 'International Trade'] },
  { category: 'Natural Sciences', match: ['Mathematics', 'Physics', 'Chemistry', 'Geography', 'Astronomy', 'Ecology'] },
  { category: 'Life & Medical Sciences', match: ['Biology', 'Medicine', 'Medical', 'Traditional Chinese', 'Public Health', 'Nursing', 'Veterinary'] },
  { category: 'Engineering & Technology', match: ['Computer Science', 'Electronic', 'Mechanical', 'Civil', 'Architecture', 'Materials', 'Energy', 'Environmental', 'Urban', 'Traffic'] },
  { category: 'Agriculture & Forestry', match: ['Agronomy', 'Forestry', 'Horticulture', 'Aquaculture', 'Animal Husbandry'] },
  { category: 'Interdisciplinary', match: ['Big Data', 'Bioinformatics', 'Food Science', 'Pharmacy', 'Kinesiology'] },
  { category: 'Practical Skills', match: ['English', 'Database', 'Operating System', 'UI/UX', 'Software Testing', 'Programming', 'Design'] },
  { category: 'Cross-Platform', match: ['cross-platform'] },
  // Methodology is last — avoids matching "Problem-Solving Methodology" before "Mathematics"
  { category: 'Methodology', match: ['Methodology'] },
]

export function categorize(discipline) {
  const d = discipline.toLowerCase()
  for (const { category, match } of CATEGORY_ORDER) {
    if (match.some(m => d.includes(m.toLowerCase()))) return category
  }
  return 'Other'
}
