// MUI Imports
import { useRef } from 'react'

import Grid from '@mui/material/Grid'

import { Divider } from '@mui/material'

import TableFilter from './TableFilter'
import type { RefreshHandle } from './PartnerTable';
import PartnerTable from './PartnerTable'

const PartnerList = () => {
  const refreshRef = useRef<RefreshHandle>(null)

  const refresh = () => {
    refreshRef.current?.refresh()
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={12}>
        <TableFilter refresh={refresh} />
      </Grid>
      <Divider />
      <Grid item xs={12} md={12}>
        <PartnerTable ref={refreshRef} />
      </Grid>
    </Grid>
  )
}

export default PartnerList
