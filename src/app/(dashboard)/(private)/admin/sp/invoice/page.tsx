'use client'

// Next Imports
import { useState, useEffect } from 'react'

import { supabase } from '@/utils/supabase'

import InvoiceList from '@/views/admin/invoice/list'

const Recharts = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setUser(session?.user.user_metadata?.userName || null)
    }

    getUser()
  }, []);

  return (
    <InvoiceList />
  )
}

export default Recharts
