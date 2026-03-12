import { useMemo } from 'react'
import styles from './CategorySplitChart.module.css'

export default function CategorySplitChart({ expenses, convertToUAH }) {
  const categoryTotals = useMemo(() => {
    const totals = {}
    for (const e of expenses) {
      const uah = convertToUAH(Number(e.amount), e.currency)
      totals[e.category] = (totals[e.category] ?? 0) + uah
    }
    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [expenses, convertToUAH])

  const maxTotal = categoryTotals[0]?.total ?? 1

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        <span className={styles.titleIcon} aria-hidden="true">📈</span>
        Category Split
      </h2>

      {categoryTotals.length === 0 ? (
        <p className={styles.empty}>No expenses yet</p>
      ) : (
        <ul className={styles.rows} aria-label="Spending by category">
          {categoryTotals.map(({ category, total }) => {
            const pct = (total / maxTotal) * 100
            return (
              <li key={category} className={styles.row}>
                <span className={styles.label}>{category}</span>
                <div
                  className={styles.barTrack}
                  role="progressbar"
                  aria-label={`${category} spending`}
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={styles.bar}
                    data-category={category}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
