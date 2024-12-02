/* eslint-disable react-hooks/exhaustive-deps */
// React Imports
import { useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'

import { Button, IconButton, InputLabel, MenuItem, Select } from '@mui/material';

import type { AddNewAdverterHandle } from '../add';
import AddNewAdvertiserDialog from '../add';


type SearchDataFormat = {
  type: string
  search: string
  company?: string
}

interface RefreshProps {
  refresh: () => void
}

const TableFilters = (props: RefreshProps) => {
  const searchParams = useSearchParams()
  const { refresh } = props;

  // States
  const [size, setSize] = useState(searchParams.get('size') ?? '10');
  const [pageIndex, setPageIndex] = useState(searchParams.get('page') ?? '1');
  const [type, setType] = useState<SearchDataFormat['type']>('')
  const [searchString, setSearchString] = useState<SearchDataFormat['search']>('')

  const addAdvertiserRef = useRef<AddNewAdverterHandle>(null)

  const router = useRouter()

  const handleSearch = () => {
    const searchParams = new URLSearchParams()

    if (type) searchParams.set('type', type)

    if (searchString) searchParams.set('search', searchString)

    searchParams.set('size', String(size))
    searchParams.set('page', String(pageIndex))

    const queryString = searchParams.toString()

    router.push(`/admin/sp/advertiser-manage/${queryString ? `?${queryString}` : ''}`)
  }

  useEffect(() => {
    setType(searchParams.get('type') || '')
    setSearchString(searchParams.get('search') || '')
    setSize(searchParams.get('size') ?? '10')
    setPageIndex(searchParams.get('page') ?? '1')
  }, [searchParams])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchString, handleSearch])



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


        <Grid item xs={4} md={2} lg={1.5}>
          <FormControl fullWidth>
            <InputLabel size='small' id='role-select'>Type</InputLabel>
            <Select
              fullWidth
              id='type'
              value={type}
              onChange={e => {
                setType(e.target.value)
                setPageIndex('0')
              }}
              label='Type'
              size='small'
              inputProps={{ placeholder: 'Select Role' }}
            >
              <MenuItem value=''>Select Type</MenuItem>
              <MenuItem value='Email'>Email</MenuItem>
              <MenuItem value='Username'>Username</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={1} md={1} lg={0.5}>
          <IconButton
            disabled={type === '' && searchString === ''}
            onClick={() => {
              setPageIndex('0')
              setType('')
              setSearchString('')
            }}
          >
            <i className='ri-close-line text-actionActive text-2xl' />
          </IconButton>
        </Grid>
        <Grid item xs={1} md={0.1} lg={2.5} />
        <Grid item xs={6} md={2.8} lg={2.5} >
          {/* <Button variant='outlined'
            color='success' fullWidth
            startIcon={<i className='ri-add-line' />}
            onClick={() => { addAdvertiserRef.current?.open() }}
          >
            Add New User
          </Button> */}
        </Grid>

      </Grid>
      <AddNewAdvertiserDialog ref={addAdvertiserRef} refresh={refresh} />
    </CardContent>
  )
}

export default TableFilters
