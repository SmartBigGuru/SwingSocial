'use client'

// Next Imports
import { useState, useEffect } from 'react'

// MUI Imports

import { supabase } from '@/utils/supabase'
import PromocodeList from '@/views/admin/promocode/list'

// Component Imports

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
    <PromocodeList />
  )
}

export default Recharts
