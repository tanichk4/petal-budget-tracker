import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setExpenses(data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Realtime subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` },
        () => { fetchExpenses() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchExpenses])

  const addExpense = useCallback(async ({ name, amount, currency, date, category, notes, photoFile }) => {
    let photo_url = null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('expense-photos')
        .upload(path, photoFile)

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from('expense-photos')
          .getPublicUrl(path)
        photo_url = urlData.publicUrl
      }
    }

    const { error: err } = await supabase
      .from('expenses')
      .insert({ name, amount, currency, date, category, notes: notes || null, photo_url, user_id: userId })

    if (err) throw err
    await fetchExpenses()
  }, [userId, fetchExpenses])

  const deleteExpense = useCallback(async (id) => {
    // Remove photo from storage if exists
    const expense = expenses.find(e => e.id === id)
    if (expense?.photo_url) {
      const path = expense.photo_url.split('/expense-photos/')[1]
      if (path) {
        await supabase.storage.from('expense-photos').remove([path])
      }
    }

    const { error: err } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (err) throw err
    setExpenses(prev => prev.filter(e => e.id !== id))
  }, [expenses])

  return { expenses, loading, error, addExpense, deleteExpense, refetch: fetchExpenses }
}
