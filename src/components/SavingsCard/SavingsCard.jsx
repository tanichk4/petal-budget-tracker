import styles from './SavingsCard.module.css'

export default function SavingsCard({ onAddExpense }) {
  return (
    <div className={styles.card}>
      <span className={styles.sparkle} aria-hidden="true">✨</span>
      <h3 className={styles.heading}>Ready to save?</h3>
      <p className={styles.sub}>Track your daily habits and see where your magic goes!</p>
      <button className={styles.cta} onClick={onAddExpense}>
        Add New Expense
      </button>
    </div>
  )
}
