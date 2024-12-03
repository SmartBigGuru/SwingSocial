'use client'

// Next Imports
import { useState, useEffect, useRef } from 'react'
import type { SyntheticEvent } from 'react'

// Next Imports
import dynamic from 'next/dynamic'
// MUI Imports
import Grid from '@mui/material/Grid'
import CardStatWithImage from '@components/card-statistics/Character'
// Mui Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grow from '@mui/material/Grow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Popper from '@mui/material/Popper'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import ButtonGroup from '@mui/material/ButtonGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { useTheme } from '@mui/material/styles'

import type { ApexOptions } from 'apexcharts'
// Component Imports

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const options = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const MonthButton = () => {
  // States
  const [open, setOpen] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  // Refs
  const anchorRef = useRef<HTMLDivElement | null>(null)

  const handleMenuItemClick = (event: SyntheticEvent, index: number) => {
    setSelectedIndex(index)
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <ButtonGroup variant='outlined' ref={anchorRef} aria-label='split button' size='small'>
        <Button>{options[selectedIndex]}</Button>
        <Button
          className='pli-0'
          aria-haspopup='menu'
          onClick={handleToggle}
          aria-label='select merge strategy'
          aria-expanded={open ? 'true' : undefined}
          aria-controls={open ? 'split-button-menu' : undefined}
        >
          <i className='ri-arrow-down-s-line text-lg' />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition placement='bottom-end'>
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id='split-button-menu'>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={event => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

const series = [
  {
    name: 'Shipment',
    type: 'column',
    data: [38, 45, 33, 38, 32, 48, 45, 40, 42, 37]
  },
  {
    name: 'Delivery',
    type: 'line',
    data: [23, 28, 23, 32, 25, 42, 32, 32, 26, 24]
  }
]


const Recharts = () => {
  const [reportData, setReportData] = useState([]);
  const theme = useTheme()

  const fetchData = async () => {
    try {
      let query = '/api/admin/reports';
      const apiUrl = `${query}`
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch the report data');
      }

      const data = await response.json();
      setReportData(data.reports);
      console.log(data)
      // setUser(data.user)
      // console.log(user[0]);

    } catch (error: any) {

    }
  }

  const options: ApexOptions = {
    chart: {
      type: 'line',
      stacked: false,
      parentHeightOffset: 0,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    markers: {
      size: 5,
      colors: '#fff',
      strokeColors: 'var(--mui-palette-primary-main)',
      hover: {
        size: 6
      },
      radius: 4
    },
    stroke: {
      curve: 'smooth',
      width: [0, 3],
      lineCap: 'round'
    },
    legend: {
      show: true,
      position: 'bottom',
      markers: {
        width: 8,
        height: 8,
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 8 : -4
      },
      height: 40,
      itemMargin: {
        horizontal: 10,
        vertical: 0
      },
      fontSize: '15px',
      fontFamily: 'Open Sans',
      fontWeight: 400,
      labels: {
        colors: 'var(--mui-palette-text-primary)'
      },
      offsetY: 10
    },
    grid: {
      strokeDashArray: 8,
      borderColor: 'var(--mui-palette-divider)'
    },
    colors: ['var(--mui-palette-warning-main)', 'var(--mui-palette-primary-main)'],
    fill: {
      opacity: [1, 1]
    },
    plotOptions: {
      bar: {
        columnWidth: '30%',
        borderRadius: 4,
        borderRadiusApplication: 'end'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      tickAmount: 10,
      categories: ['1 Jan', '2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan', '8 Jan', '9 Jan', '10 Jan'],
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)',
          fontSize: '13px',
          fontWeight: 400
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      tickAmount: 5,
      labels: {
        style: {
          colors: 'var(--mui-palette-text-disabled)',
          fontSize: '13px',
          fontWeight: 400
        }
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={3} className='self-end'>
        {reportData.length > 0 && <CardStatWithImage
          stats={reportData[0].totalsubs}
          trend='negative'
          title='All Members'
          trendNumber='15.6%'
          chipColor='primary'
          src='/images/illustrations/characters/9.png'
          chipText={reportData[0].monchar}
        />}
      </Grid>
      <Grid item xs={12} sm={6} md={3} className='self-end'>
        <CardStatWithImage
          stats={reportData[1].totalsubs}
          title='All Members'
          trendNumber='20%'
          chipText={reportData[1].monchar}
          src='/images/illustrations/characters/11.png'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3} className='self-end'>
        <CardStatWithImage
          stats={reportData[2].totalsubs}
          trend='negative'
          title='All Members'
          trendNumber='20%'
          chipText={reportData[2].monchar}
          src='/images/illustrations/characters/12.png'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3} className='self-end'>
        <CardStatWithImage
          stats={reportData[3].totalsubs}
          trend='negative'
          title='All Members'
          trendNumber='20%'
          chipText={reportData[3].monchar}
          src='/images/illustrations/characters/10.png'
        />
      </Grid>
      <Grid item xs={12} sm={6} md={6} className='self-end'>
        <Card>
          <CardHeader title='Subscript' subheader='Total number of deliveries 23.8k' action={<MonthButton />} />
          <CardContent>
            <AppReactApexCharts
              id='shipment-statistics'
              type='line'
              height={313}
              width='100%'
              series={series}
              options={options}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={6} className='self-end'>
        <Card>
          <CardHeader title='Subscript' subheader='Total number of deliveries 23.8k' action={<MonthButton />} />
          <CardContent>
            <AppReactApexCharts
              id='shipment-statistics'
              type='line'
              height={313}
              width='100%'
              series={series}
              options={options}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Recharts
