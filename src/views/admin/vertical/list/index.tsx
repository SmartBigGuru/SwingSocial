// MUI Imports
import Grid from '@mui/material/Grid'

import VerticalTable from './verticalTable'
import DetailView from '../detail'
import OtherInfoShows from './others'

const VerticalList = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={12} md={12} lg={9}>
        <VerticalTable />
      </Grid>
      <DetailView />
      <Grid item xs={12} sm={12} md={12} lg={3}>
        <OtherInfoShows />
      </Grid>
    </Grid>
  )
}

export default VerticalList
