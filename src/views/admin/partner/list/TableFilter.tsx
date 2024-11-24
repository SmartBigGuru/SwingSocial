/* eslint-disable react-hooks/exhaustive-deps */
// React Imports
import { useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'

import { Autocomplete, Button, CircularProgress, IconButton, InputLabel, MenuItem, Select } from '@mui/material';

import { supabase } from '@/utils/supabase';
import type { AddNewPartnerHandle } from '../add';
import AddNewAdvertiserDialog from '../add';


type SearchDataFormat = {
  status: string
  search: string
  company?: string
}

interface CompanyType {
  company_name: string
}

interface RefreshProps {
  refresh: () => void
}

const TableFilters = (props: RefreshProps) => {
  const searchParams = useSearchParams()
  const { refresh } = props;

  // States
  const [size, setSize] = useState(searchParams.get('size') ?? '10');
  const [pageIndex, setPageIndex] = useState(searchParams.get('page') ?? '0');
  const [status, setStatus] = useState<SearchDataFormat['status']>('')
  const [searchString, setSearchString] = useState<SearchDataFormat['search']>('')
  const [company, setCompany] = useState<SearchDataFormat['company']>(searchParams.get('company') ?? '');

  //company option
  const [companyLoading, setCompanyLoading] = useState(false)
  const [openCompany, setOpenCompany] = useState(false)
  const [companyOption, setCompanyOption] = useState<CompanyType[]>([])
  const [companyInput, setCompanyInput] = useState(searchParams.get('company') ?? '')
  const addAdvertiserRef = useRef<AddNewPartnerHandle>(null)

  const router = useRouter()

  const handleSearch = () => {
    const searchParams = new URLSearchParams()

    if (status) searchParams.set('status', status)
    if (company) searchParams.set('company', company)

    if (searchString) searchParams.set('search', searchString)

    searchParams.set('size', String(size))
    searchParams.set('page', String(pageIndex))

    const queryString = searchParams.toString()

    router.push(`/admin/sp/partner-manage/${queryString ? `?${queryString}` : ''}`)
  }

  useEffect(() => {
    setStatus(searchParams.get('status') || '')
    setCompany(searchParams.get('company') || '')
    setSearchString(searchParams.get('search') || '')
    setSize(searchParams.get('size') ?? '10')
    setPageIndex(searchParams.get('page') ?? '0')
  }, [searchParams])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchString, handleSearch])


  useEffect(() => {
    if (!openCompany) {
      setCompanyOption([])
    }
  }, [openCompany])

  useEffect(() => {
    if (!openCompany) return

    const fetchData = async () => {
      setCompanyLoading(true)

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('company_name')
          .ilike('company_name', `%${companyInput}%`)

        if (error) throw error

        if (data) {
          setCompanyOption(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setCompanyLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [companyInput, openCompany])

  return (
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3} lg={2.5}>
          <FormControl fullWidth >
            <TextField size='small'
              placeholder='Search'
              value={searchString}
              autoComplete='off'
              onChange={e => {
                setSearchString(e.target.value)
                setPageIndex('0')
              }}
            />
          </FormControl>
        </Grid>

        <Grid item xs={6} md={3} lg={2.5}>
          <FormControl fullWidth>
            <Autocomplete
              id="company-list"
              size="small"
              open={openCompany}
              clearOnBlur
              onOpen={() => setOpenCompany(true)}
              onClose={() => setOpenCompany(false)}
              isOptionEqualToValue={(option, value) => option.company_name === value.company_name}
              getOptionLabel={(option) => option.company_name}
              options={companyOption}
              loading={companyLoading}
              inputValue={companyInput}
              onInputChange={(event, newInputValue) => {
                if (event?.type === 'change' || event?.type === 'click')
                  setCompanyInput(newInputValue)
              }}
              onChange={(event, newValue) => {
                setPageIndex('0')
                setCompany(newValue?.company_name)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Company"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {companyLoading ? <CircularProgress color="inherit" size={15} className="mr-2"/> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4} md={2} lg={1.5}>
          <FormControl fullWidth>
            <InputLabel size='small' id='role-select'>Status</InputLabel>
            <Select
              fullWidth
              id='status'
              value={status}
              onChange={e => {
                setStatus(e.target.value)
                setPageIndex('0')
              }}
              label='Status'
              size='small'
              inputProps={{ placeholder: 'Select Role' }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              <MenuItem value='Active'>Active</MenuItem>
              <MenuItem value='Deactive'>Deactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={1} md={1} lg={0.5}>
          <IconButton 
            disabled={status==='' && company === '' && searchString === ''}
            onClick={() => {
              setPageIndex('0')
              setStatus('')
              setCompany('')
              setSearchString('')
              setCompanyInput('')
            }}
          >
            <i className='ri-close-line text-actionActive text-2xl' />
          </IconButton>
        </Grid>
        <Grid item xs={1} md={0.1} lg={2.5} />
        <Grid item xs={6} md={2.8} lg={2.5} >
          <Button variant='outlined'
            color='success' fullWidth
            startIcon={<i className='ri-add-line' />}
            onClick={() => { addAdvertiserRef.current?.open() }}
          >
            New Partner
          </Button>
        </Grid>

      </Grid>
      <AddNewAdvertiserDialog ref={addAdvertiserRef} refresh={refresh} />
    </CardContent>
  )
}

export default TableFilters
