import { useState, useEffect, useRef } from 'react'
import { CATEGORIES } from '../CategoryFilter/CategoryFilter'
import styles from './AddExpenseModal.module.css'

const CURRENCIES = ['UAH', 'USD', 'EUR']

function today() {
  return new Date().toISOString().slice(0, 10)
}

const INITIAL_FORM = {
  name: '',
  amount: '',
  currency: 'UAH',
  date: today(),
  category: '',
  notes: '',
  photoFile: null,
  photoPreview: null,
}

export default function AddExpenseModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const firstInputRef = useRef(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM, date: today() })
      setErrors({})
      setSaving(false)
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid amount greater than 0'
    if (!form.category) errs.category = 'Please pick a category'
    if (!form.date) errs.date = 'Date is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        amount: Number(form.amount),
        currency: form.currency,
        date: form.date,
        category: form.category,
        notes: form.notes.trim(),
        photoFile: form.photoFile,
      })
      onClose()
    } catch (err) {
      setErrors({ submit: err.message })
      setSaving(false)
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    set('photoFile', file)
    const reader = new FileReader()
    reader.onload = ev => set('photoPreview', ev.target.result)
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Add new expense"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.handle} aria-hidden="true" />

        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIcon} aria-hidden="true">🩷</div>
            <h2 className={styles.title}>New Sweet Treat</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="exp-name">What did you get?</label>
            <input
              id="exp-name"
              ref={firstInputRef}
              className={`${styles.input} ${errors.name ? styles.invalid : ''}`}
              type="text"
              placeholder="e.g. Lavender Latte"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
            {errors.name && <span className={styles.errorText} role="alert">{errors.name}</span>}
          </div>

          {/* Amount + Date */}
          <div className={styles.rowFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="exp-amount">How much?</label>
              <div className={styles.amountWrapper}>
                <input
                  id="exp-amount"
                  className={`${styles.input} ${styles.amountInput} ${errors.amount ? styles.invalid : ''}`}
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                />
                <div className={styles.currencyToggle} aria-label="Select currency">
                  {CURRENCIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={form.currency === c}
                      className={`${styles.currencyBtn} ${form.currency === c ? styles.currencyBtnActive : ''}`}
                      onClick={() => set('currency', c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {errors.amount && <span className={styles.errorText} role="alert">{errors.amount}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="exp-date">When?</label>
              <input
                id="exp-date"
                className={`${styles.input} ${errors.date ? styles.invalid : ''}`}
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
              {errors.date && <span className={styles.errorText} role="alert">{errors.date}</span>}
            </div>
          </div>

          {/* Category */}
          <div className={styles.fieldGroup}>
            <span className={styles.label} id="category-label">Category</span>
            <div className={styles.categoryPills} role="group" aria-labelledby="category-label">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={form.category === cat.id}
                  data-cat={cat.id}
                  className={`${styles.catPill} ${form.category === cat.id ? styles.catPillActive : ''}`}
                  onClick={() => set('category', cat.id)}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && <span className={styles.errorText} role="alert">{errors.category}</span>}
          </div>

          {/* Notes */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="exp-notes">Notes (optional)</label>
            <textarea
              id="exp-notes"
              className={styles.textarea}
              placeholder="Add a little note…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Photo */}
          <div className={styles.fieldGroup}>
            <span className={styles.label}>Photo (optional)</span>
            {form.photoPreview ? (
              <img
                src={form.photoPreview}
                alt="Preview"
                className={styles.photoPreview}
                onClick={() => { set('photoFile', null); set('photoPreview', null) }}
                title="Click to remove photo"
              />
            ) : (
              <label className={styles.photoBtn}>
                <span className={styles.photoIcon} aria-hidden="true">📷</span>
                <span>Add</span>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  aria-label="Upload photo"
                />
              </label>
            )}
          </div>

          {errors.submit && (
            <p className={styles.errorText} role="alert" style={{ fontSize: 'var(--font-size-sm)' }}>
              {errors.submit}
            </p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}
