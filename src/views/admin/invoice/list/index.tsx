// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports

// Component Imports
import InvoiceListTable from './InvoiceListTable'
import InvoiceCard from './InvoiceCard'

const InvoiceList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <InvoiceListTable />
      </Grid>
    </Grid>
  )
}

export default InvoiceList
