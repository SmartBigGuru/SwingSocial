'use client'

// MUI Imports


import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'

// React Imports
// Type Imports
import Divider from '@mui/material/Divider'

// Component Imports
import TableFilters from './LeadTableFilters'

// Component Imports
import LeadListTable from './LeadListTable'


import { supabase } from '@/utils/supabase'
import { USER_ROLE } from '@/@core/roles'

const UserList = () => {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setRole(session?.user.user_metadata?.role_id || null)
    }

    getUserRole()
  }, [])

  return (
    <Grid container spacing={6}>
      {role === USER_ROLE.ROLE_PARTNER && (<>
        <Grid item xs={12}>
          <TableFilters />
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <LeadListTable />
        </Grid>
      </>
      )}
    </Grid>
  )
}

export default UserList
