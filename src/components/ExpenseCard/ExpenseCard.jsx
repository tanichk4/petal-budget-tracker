import { CATEGORIES } from '../CategoryFilter/CategoryFilter'
import styles from './ExpenseCard.module.css'

const CURRENCY_SYMBOLS = { UAH: '₴', USD: '$', EUR: '€' }

const CATEGORY_ICONS = Object.fromEntries(CATEGORIES.map(c => [c.id, c.icon]))

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default function ExpenseCard({ expense, onDelete }) {
  const { id, name, amount, currency, date, category, notes, photo_url } = expense
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  const icon = CATEGORY_ICONS[category] ?? '💸'

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return (
    <article
      className={styles.card}
      data-category={category}
      aria-label={`${name}, ${symbol}${formattedAmount}`}
    >
      <div className={styles.topRow}>
        <div className={styles.iconWrap} aria-hidden="true">{icon}</div>
        <span className={styles.amount}>{symbol}{formattedAmount}</span>
      </div>

      <div>
        <p className={styles.name}>{name}</p>
        <p className={styles.date}>
          <span aria-hidden="true">📅</span>
          <time dateTime={date}>{formatDate(date)}</time>
        </p>
        {notes && <p className={styles.notes}>{notes}</p>}
        {photo_url && (
          <img
            className={styles.photo}
            src={photo_url}
            alt={`Photo for ${name}`}
            loading="lazy"
          />
        )}
      </div>

      <div className={styles.bottomRow}>
        <span className={styles.badge} aria-label={`Category: ${category}`}>
          {category}
        </span>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(id)}
          aria-label={`Delete ${name}`}
          title="Delete expense"
        >
          🗑️
        </button>
      </div>
    </article>
  )
}
