import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useExpenses } from './hooks/useExpenses'
import { useExchangeRates } from './hooks/useExchangeRates'
import AuthPage from './components/AuthPage/AuthPage'
import Header from './components/Header/Header'
import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import ExpenseCard from './components/ExpenseCard/ExpenseCard'
import CategorySplitChart from './components/CategorySplitChart/CategorySplitChart'
import SavingsCard from './components/SavingsCard/SavingsCard'
import AddExpenseModal from './components/AddExpenseModal/AddExpenseModal'
import './App.css'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = not authed
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id

  const { expenses, loading: expensesLoading, addExpense, deleteExpense } = useExpenses(userId)
  const { convertToUAH } = useExchangeRates()

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesCategory = activeCategory === 'All' || e.category === activeCategory
      const matchesSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [expenses, activeCategory, searchQuery])

  const totalUAH = useMemo(() => {
    return expenses.reduce((sum, e) => sum + convertToUAH(Number(e.amount), e.currency), 0)
  }, [expenses, convertToUAH])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const handleSave = useCallback(async (data) => {
    await addExpense(data)
  }, [addExpense])

  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
        <div className="skeleton" style={{ width: 200, height: 20 }} />
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalUAH={totalUAH}
        onSignOut={handleSignOut}
      />

      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="main-grid">
        <CategorySplitChart
          expenses={expenses}
          convertToUAH={convertToUAH}
        />

        {expensesLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton card-skeleton" style={{ animationDelay: `${i * 100}ms` }} />
          ))
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found</p>
            {searchQuery && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginTop: 'var(--space-2)' }}>
                Try a different search
              </p>
            )}
          </div>
        ) : (
          filteredExpenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={deleteExpense}
            />
          ))
        )}

        <SavingsCard onAddExpense={() => setModalOpen(true)} />
      </main>

      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
