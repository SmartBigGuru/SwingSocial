// MUI Imports

import Grid from '@mui/material/Grid'

import { Card, CardContent, CardHeader, CircularProgress, Divider, Typography } from '@mui/material'

// Type Imports
import type { ThemeColor } from '@core/types'

import CustomAvatar from '@/@core/components/mui/Avatar'
import OptionMenu from '@/@core/components/option-menu'


type DataType = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}

type TopVerticalType = {
  title: string
  revenue: string
  progress: number
  color: ThemeColor
}

type TopClientType = {
  name: string
  profession: string
  totalCourses: number
  avatar: string
}

// Vars
const data: DataType[] = [
  {
    stats: '12.5k',
    title: 'Users',
    color: 'success',
    icon: 'ri-group-line'
  },
  {
    stats: '1.54k',
    color: 'warning',
    title: 'Contracts',
    icon: 'ri-macbook-line'
  },
]

// Vars
const topclients: TopClientType[] = [
  { name: 'Jordan Stevenson', profession: 'Business Intelligence', totalCourses: 33, avatar: '/images/avatars/1.png' },
  { name: 'Bentlee Emblin', profession: 'Digital Marketing', totalCourses: 52, avatar: '/images/avatars/2.png' },
  { name: 'Benedetto Rossiter', profession: 'UI/UX Design', totalCourses: 12, avatar: '/images/avatars/3.png' },
  { name: 'Beverlie Krabbe', profession: 'Vue', totalCourses: 8, avatar: '/images/avatars/4.png' }
]

// Vars
const topVerticals: TopVerticalType[] = [
  { title: 'User Experience Design', revenue: '120k', progress: 72, color: 'primary' },
  { title: 'Basic fundamentals', revenue: '112.4k', progress: 48, color: 'success' },
  { title: 'React Native components', revenue: '85k', progress: 15, color: 'error' },
  { title: 'Basic of music theory', revenue: '45k', progress: 24, color: 'info' }
]

const OtherInfoShows = () => {
  return (
    <Grid container xs={12} md={12} spacing={6}>

      <Grid item xs={12} md={12} >
        <Card className='bs-full'>
          <CardHeader
            title='Transactions'
            subheader={
              <p className='mbs-1'>
                <span className='font-medium text-textPrimary'>Total 48.5% Growth 😎</span>
                <span className='text-textSecondary'>this month</span>
              </p>
            }
          />
          <CardContent>
            <Grid container spacing={1}>
              {data.map((item, index) => (
                <Grid item xs={6} sm={6} md={6} key={index}>
                  <div className='flex items-center gap-3'>
                    <CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
                      <i className={item.icon}></i>
                    </CustomAvatar>
                    <div>
                      <Typography>{item.title}</Typography>
                      <Typography variant='h5'>{item.stats}</Typography>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={12}>
        <Card className='bs-full'>
          <CardHeader
            title='Active Vertical'
            action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Update', 'Share']} />}
          />
          <CardContent className='flex flex-col gap-6 pbs-5'>
            {topVerticals.map((item, i) => (
              <div key={i} className='flex items-center gap-4'>
                <div className='relative flex items-center justify-center'>
                  <CircularProgress
                    variant='determinate'
                    size={54}
                    value={100}
                    thickness={3}
                    className='absolute text-[var(--mui-palette-customColors-trackBg)]'
                  />
                  <CircularProgress
                    variant='determinate'
                    size={54}
                    value={item.progress}
                    thickness={3}
                    color={item.color}
                    sx={{ '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
                  />
                  <Typography className='absolute font-medium' color='text.primary'>
                    {`${item.progress}%`}
                  </Typography>
                </div>
                <div className='flex justify-between items-center is-full gap-4'>
                  <div>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    <Typography variant='body2'>{`${item.revenue} Revenue`}</Typography>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={12}>
        <Card className='bs-full'>
          <CardHeader
            title='Top Clients'
            action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Update', 'Share']} />}
          />
          <Divider />
          <div className='flex justify-between plb-4 pli-5'>
            <Typography variant='overline'>clients</Typography>
            <Typography variant='overline'>success</Typography>
          </div>
          <Divider />
          <CardContent className='flex flex-col gap-4'>
            {topclients.map((item, i) => (
              <div key={i} className='flex items-center gap-4'>
                <CustomAvatar size={34} src={item.avatar} />
                <div className='flex justify-between items-center is-full gap-4'>
                  <div className='flex flex-col gap-1'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.name}
                    </Typography>
                    <Typography>{item.profession}</Typography>
                  </div>
                  <Typography color='text.primary'>{item.totalCourses}</Typography>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>

    </Grid >

  )
}

export default OtherInfoShows
