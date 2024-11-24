'use client'

// Next Imports
import { useState, useEffect } from 'react'

import VerticalManagement from '@views/admin/vertical/list'

import { supabase } from '@/utils/supabase'


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
      <VerticalManagement />
  )
}

export default Recharts
