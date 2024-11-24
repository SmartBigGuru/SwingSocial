// MUI Imports
import Grid from '@mui/material/Grid'

import { Divider } from '@mui/material'

import ContractTable from './ContractTable'
import TableFilters from './ContractFilter'

const ContractList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={12}>
        <TableFilters />
      </Grid>
      <Divider />
      <Grid item xs={12} md={12}>
        <ContractTable />
      </Grid>
    </Grid>
  )
}

export default ContractList
