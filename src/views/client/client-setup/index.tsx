'use client'

// MUI Imports


import { useEffect, useState } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import Grid from '@mui/material/Grid'

// React Imports
// Type Imports
import Divider from '@mui/material/Divider'


import type { Session, User } from '@supabase/supabase-js'

import { supabase } from '@/utils/supabase'
import CompanyInfo from './compaynInfo'
import CompanyContact from './contacts'
import { USER_ROLE } from '@/@core/roles'

const UserList = () => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPath = usePathname()

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error)
          throw error
        setRole(session?.user.user_metadata?.role_id || null)
        setUser(session?.user ? session.user : null);
        setSession(session)
      } catch (error) {
        console.log(error)
      }
    }

    getUserInfo()
  }, [])

  return (
    <Grid container spacing={6}>
      {role === USER_ROLE.ROLE_CLIENT &&
        (<>
          <Grid item xs={12} sm={3.5}>
            <CompanyInfo userInfo={user} />
            <Divider />
          </Grid>
          <Grid item xs={12} sm={8.5}>
            <CompanyContact userInfo={user} session={session} />
          </Grid>
        </>)}
    </Grid>
  )
}

export default UserList
