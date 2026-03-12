import styles from './Header.module.css'

export default function Header({ searchQuery, onSearchChange, totalUAH, onSignOut }) {
  const formatted = new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(totalUAH ?? 0)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>🌸</div>
          <div className={styles.brandText}>
            <h1>Petal</h1>
            <p>Your cute spending buddy</p>
          </div>
        </div>

        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search your expenses…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search expenses"
          />
        </div>

        <div className={styles.right}>
          <div className={styles.totalBadge} aria-label={`Total spent: ${formatted}`}>
            <div className={styles.totalIcon}>💳</div>
            <div className={styles.totalInfo}>
              <span className={styles.totalLabel}>Total Spent</span>
              <span className={styles.totalAmount}>{formatted}</span>
            </div>
          </div>

          <button
            className={styles.signOutBtn}
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
          >
            ↪
          </button>
        </div>
      </div>
    </header>
  )
}
