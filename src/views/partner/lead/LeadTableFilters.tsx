/* eslint-disable react-hooks/exhaustive-deps */
// React Imports
import type { KeyboardEvent } from 'react';
import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';

type SearchDataFormat = {
  status: string
  campaign: string
  retained: string
  returned: string
  search: string
}

const TableFilters = () => {
  // States
  const [status, setStatus] = useState<SearchDataFormat['status']>('')
  const [campaign, setCampaign] = useState<SearchDataFormat['campaign']>('')
  const [retained, setRetained] = useState<SearchDataFormat['retained']>('')
  const [returned, setReturned] = useState<SearchDataFormat['returned']>('')
  const [dateRange, setDateRange] = useState<(Date | null)[]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [searchString, setSearchString] = useState<SearchDataFormat['search']>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = () => {
    const searchParams = new URLSearchParams()

    if (status) searchParams.set('status', status)
    if (campaign) searchParams.set('campaign', campaign)
    if (retained) searchParams.set('retained', retained)
    if (returned) searchParams.set('returned', returned)

    if (startDate && endDate) {

      const formattedStartDate = startDate.toISOString().slice(0, 10);
      const formattedEndDate = endDate.toISOString().slice(0, 10);

      searchParams.set('startDate', formattedStartDate);
      searchParams.set('endDate', formattedEndDate);
    }

    if (searchString) searchParams.set('search', searchString)

    const queryString = searchParams.toString()

    router.push(`/user/partner/campaign/${queryString ? `?${queryString}` : ''}`)
  }


  useEffect(() => {
    setStatus(searchParams.get('status') || '')
    setCampaign(searchParams.get('campaign') || '')
    setRetained(searchParams.get('retained') || '')
    setReturned(searchParams.get('returned') || '')

    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    setDateRange([
      startDateParam ? new Date(startDateParam) : null,
      endDateParam ? new Date(endDateParam) : null
    ])
    setSearchString(searchParams.get('search') || '')
  }, [searchParams])

  useEffect(() => {
    handleSearch()
  }, [status, retained, returned, campaign, startDate, endDate])

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchString, handleSearch])

  return (
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={2.5}>
          <FormControl fullWidth >
            <TextField size='small'
              placeholder='Search'
              value={searchString}
              onKeyPress={handleKeyPress}
              onChange={e => setSearchString(e.target.value)}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={1} ></Grid>
        <Grid item xs={12} sm={2.5} >
          <AppReactDatepicker
            startDate={startDate}
            endDate={endDate}
            showYearDropdown
            showMonthDropdown
            selectsRange
            isClearable
            onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
            placeholderText='MM/DD/YYYY'
            customInput={<TextField size='small' fullWidth label='Date' placeholder='MM-DD-YYYY' />}
          />
        </Grid>

        <Grid item xs={6} sm={1.5}>
          <FormControl fullWidth>
            <InputLabel size='small' id='role-select'>Status</InputLabel>
            <Select
              fullWidth
              id='select-role'
              value={status}
              onChange={e => setStatus(e.target.value)}
              label='Status'
              size='small'
              inputProps={{ placeholder: 'Select Role' }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='retained'>Retained</MenuItem>
              <MenuItem value='newLead'>New Lead</MenuItem>
              <MenuItem value='returned'>Returned</MenuItem>
              <MenuItem value='contacting'>Contacting</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={1.5}>
          <FormControl fullWidth>
            <InputLabel size='small' id='plan-select'>Retained</InputLabel>
            <Select
              fullWidth
              id='select-plan'
              value={retained}
              size='small'
              onChange={e => setRetained(e.target.value)}
              label='Retained'
              inputProps={{ placeholder: 'Select Plan' }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Yes'>Yes</MenuItem>
              <MenuItem value='No'>No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={1.5}>
          <FormControl fullWidth>
            <InputLabel size='small' id='status-select'>Returned</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Returned'
              value={returned}
              size='small'
              onChange={e => setReturned(e.target.value)}
              inputProps={{ placeholder: 'Select Status' }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Yes'>Yes</MenuItem>
              <MenuItem value='No'>No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={1.5}>
          <FormControl fullWidth>
            <InputLabel size='small' id='role-select'>Campaign</InputLabel>
            <Select
              fullWidth
              id='select-campaign'
              value={campaign}
              onChange={e => setCampaign(e.target.value)}
              label='Campaign'
              size='small'
              inputProps={{ placeholder: 'Select Campaign' }}
            >
              <MenuItem value=''>Select Campaign</MenuItem>
              <MenuItem value='LDS'>LDS</MenuItem>
              <MenuItem value='AFFF'>AFFF</MenuItem>
              <MenuItem value='Rideshare'>Rideshare</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
