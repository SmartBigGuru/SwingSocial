// MUI Imports
import { useRef } from 'react'

import Grid from '@mui/material/Grid'

import { Divider } from '@mui/material'

import AdvertiserFilter from './AdvertiserFilter'
import type { RefreshHandle } from './AdvertiserTable';
import AdvertiserTable from './AdvertiserTable'

const ContractList = () => {
  const refreshRef = useRef<RefreshHandle>(null)

  const refresh = () => {
    refreshRef.current?.refresh()
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={12}>
        <AdvertiserFilter refresh={refresh} />
      </Grid>
      <Divider />
      <Grid item xs={12} md={12}>
        <AdvertiserTable ref={refreshRef} />
      </Grid>
    </Grid>
  )
}

export default ContractList
