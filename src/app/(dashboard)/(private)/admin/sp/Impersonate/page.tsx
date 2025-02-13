'use client'

// Next Imports
import { useState, useEffect } from 'react'

// MUI Imports

import { supabase } from '@/utils/supabase'
import Impersonate from '@/views/admin/Impersonate'

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
    <Impersonate />
  )
}

export default Recharts
