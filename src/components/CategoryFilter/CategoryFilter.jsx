import styles from './CategoryFilter.module.css'

export const CATEGORIES = [
  { id: 'Bills', label: 'Bills', icon: '💲' },
  { id: 'Entertainment', label: 'Entertainment', icon: '✨' },
  { id: 'Food', label: 'Food', icon: '🍴' },
  { id: 'Health', label: 'Health', icon: '🩷' },
  { id: 'Other', label: 'Other', icon: '😊' },
  { id: 'Shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'Travel', label: 'Travel', icon: '✈️' },
]

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <nav className={styles.wrapper} aria-label="Filter by category">
      <ul className={styles.list} role="tablist">
        <li>
          <button
            role="tab"
            aria-selected={activeCategory === 'All'}
            data-category="All"
            className={`${styles.pill} ${activeCategory === 'All' ? styles.pillActive : ''}`}
            onClick={() => onCategoryChange('All')}
          >
            All
          </button>
        </li>
        {CATEGORIES.map(cat => (
          <li key={cat.id}>
            <button
              role="tab"
              aria-selected={activeCategory === cat.id}
              data-category={cat.id}
              className={`${styles.pill} ${activeCategory === cat.id ? styles.pillActive : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <span className={styles.icon} aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
