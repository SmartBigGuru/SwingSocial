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

import { Autocomplete, CircularProgress } from '@mui/material';

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';
import { supabase } from '@/utils/supabase';
import { USER_ROLE } from '@/@core/roles';


type SearchDataFormat = {
  status: string;
  search: string;
  vertical?: string;
  advertiser?: string;
}

interface VerticalType {
  name: string;
}

interface AdvertiserType {
  company_name: string;
}

const TableFilters = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const parseDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);

    return isNaN(date.getTime()) ? null : date;
  };

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const startDate = parseDate(searchParams.get('startDate'));
    const endDate = parseDate(searchParams.get('endDate'));

    return [startDate, endDate];
  });

  const [startDate, endDate] = dateRange;
  const [status, setStatus] = useState<SearchDataFormat['status']>(searchParams.get('status') ?? '')
  const [searchString, setSearchString] = useState<SearchDataFormat['search']>(searchParams.get('search') ?? '')
  const [vertical, setVertical] = useState<SearchDataFormat['vertical']>(searchParams.get('vertical') ?? '');
  const [advertiser, setAdvertiser] = useState<SearchDataFormat['advertiser']>(searchParams.get('advertiser') ?? '');

  //vertical option
  const [verticalLoading, setVerticalLoading] = useState(false)
  const [openVertical, setOpenVertical] = useState(false)
  const [verticalOption, setVerticalOption] = useState<VerticalType[]>([])
  const [verticalInput, setVerticalInput] = useState(searchParams.get('vertical') ?? '')

  useEffect(() => {
    if (!openVertical) {
      setVerticalOption([])
    }
  }, [openVertical])

  useEffect(() => {
    if (!openVertical) return

    const fetchData = async () => {
      setVerticalLoading(true)

      try {
        const { data, error } = await supabase
          .from('verticals')
          .select('name')
          .ilike('name', `%${verticalInput}%`)

        if (error) throw error

        if (data) {
          setVerticalOption(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setVerticalLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [verticalInput, openVertical])

  //advertiser option
  const [advertiserLoading, setAdvertiserLoading] = useState(false)
  const [openAdvertiser, setOpenAdvertiser] = useState(false)
  const [advertiserOption, setAdvertiserOption] = useState<AdvertiserType[]>([])
  const [advertiserInput, setAdvertiserInput] = useState(searchParams.get('advertiser') ?? '')

  useEffect(() => {
    if (!openAdvertiser) {
      setAdvertiserOption([])
    }
  }, [openAdvertiser])

  useEffect(() => {
    if (!openAdvertiser) return

    const fetchData = async () => {
      setAdvertiserLoading(true)

      try {

        const { data: advertiserData, error: advertiserError } = await supabase
          .from('advertisers')
          .select('company_id')
          .eq('role_id', USER_ROLE.ROLE_CLIENT)

        if (advertiserError) throw advertiserError

        const filterAdvertiser = advertiserData.map(item => {
          return item.company_id
        })

        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .in('company_id', filterAdvertiser)
          .ilike('company_name', `%${advertiserInput}%`)

        if (companyError) throw companyError

        setAdvertiserOption(companyData)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setAdvertiserLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [advertiserInput, openAdvertiser])

  const handleSearch = () => {
    const searchParams = new URLSearchParams()

    if (status) searchParams.set('status', status)
    if (vertical) searchParams.set('vertical', vertical)
    if (advertiser) searchParams.set('advertiser', advertiser)

    if (startDate && endDate) {

      const formattedStartDate = startDate.toISOString().slice(0, 10);
      const formattedEndDate = endDate.toISOString().slice(0, 10);

      searchParams.set('startDate', formattedStartDate);
      searchParams.set('endDate', formattedEndDate);
    }

    if (searchString) searchParams.set('search', searchString)

    const queryString = searchParams.toString()

    router.push(`/admin/sp/contract/${queryString ? `?${queryString}` : ''}`)
  }

  useEffect(() => {
    handleSearch()
  }, [status, startDate, endDate, vertical, advertiser])

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

  useEffect(() => {
    const verticalParam = searchParams.get('vertical')

    if (verticalParam) {
      setVerticalInput(verticalParam)
      console.log(verticalParam)
    }
  }, [searchParams])

  return (
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={2.5}>
          <FormControl fullWidth >
            <TextField size='small'
              placeholder='Search'
              value={searchString}
              autoComplete='off'
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
            autoComplete='off'
            showYearDropdown
            showMonthDropdown
            selectsRange
            isClearable
            onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
            placeholderText='MM/DD/YYYY'
            customInput={<TextField size='small' fullWidth label='Date' placeholder='MM-DD-YYYY' />}
          />
        </Grid>

        <Grid item xs={12} sm={2.5}>
          <FormControl fullWidth>
            <Autocomplete
              id="vertical-list"
              size="small"
              open={openVertical}
              onOpen={() => setOpenVertical(true)}
              onClose={() => setOpenVertical(false)}
              isOptionEqualToValue={(option, value) => option.name === value.name}
              getOptionLabel={(option) => option.name}
              options={verticalOption}
              loading={verticalLoading}
              inputValue={verticalInput}
              onInputChange={(event, newInputValue) => {
                if (event?.type === 'change' || event?.type === 'click')
                  setVerticalInput(newInputValue)
              }}
              onChange={(event, newValue) => {
                setVertical(newValue?.name)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select vertical"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {verticalLoading ? <CircularProgress color="inherit" size={15} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <Autocomplete
              id="advertiser-list"
              size="small"
              open={openAdvertiser}
              onOpen={() => setOpenAdvertiser(true)}
              onClose={() => setOpenAdvertiser(false)}
              getOptionLabel={(option) => option.company_name}
              options={advertiserOption}
              loading={advertiserLoading}
              inputValue={advertiserInput}
              onInputChange={(event, newInputValue) => {
                if (event?.type === 'change' || event?.type === 'click')
                  setAdvertiserInput(newInputValue)
              }}
              onChange={(event, newValue) => {
                setAdvertiser(newValue?.company_name)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Advertiser"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {advertiserLoading ? <CircularProgress color="inherit" size={15} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={1.5}>
          <FormControl fullWidth>
            <InputLabel size='small' id='role-select'>Status</InputLabel>
            <Select
              fullWidth
              id='status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              label='Status'
              size='small'
              inputProps={{ placeholder: 'Select Role' }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Expired'>Expired</MenuItem>
            </Select>
          </FormControl>
        </Grid>

      </Grid>
    </CardContent>
  )
}

export default TableFilters
