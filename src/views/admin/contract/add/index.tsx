'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, InputAdornment, TextField, Typography } from "@mui/material"
import { toast } from "react-toastify";

import AppReactDatepicker from "@/libs/styles/AppReactDatepicker"

import { supabase } from "@/utils/supabase";


// MUI Imports
export interface AddContractDialogHandle {
  open: () => void;
}

interface VerticalType {
  vertical_id: string
  name: string
}

interface CompanyType {
  company_name: string
  company_id: string
}

interface AdvertiserType {
  advertiser_id: string
  first_name: string
  last_name: string
  companies: CompanyType
}

interface ContractType {
  contract_id?: string
  vertical_id?: string
  company_id?: string
  advertiser_id?: string
  start_date?: Date
  end_date?: Date
  budget_limit?: number
  cost?: number
  payment_term?: string
  status?: string
  contract_term?: string
  contract_name?: string
}

export interface RefreshList {
  refresh: () => void
}

const AddNewContractDialog = forwardRef<AddContractDialogHandle, RefreshList>((props, ref) => {
  const { refresh } = props
  const [openNewContract, setOpenNewContract] = useState(false);

  //vertical option
  const [verticalLoading, setVerticalLoading] = useState(false)
  const [openVertical, setOpenVertical] = useState(false)
  const [verticalOption, setVerticalOption] = useState<VerticalType[]>([])
  const [verticalInput, setVerticalInput] = useState('')

  //advertiser option
  const [advertiserLoading, setAdvertiserLoading] = useState(false)
  const [openAdvertiser, setOpenAdvertiser] = useState(false)
  const [advertiserOption, setAdvertiserOption] = useState<AdvertiserType[]>([])
  const [advertiserInput, setAdvertiserInput] = useState('')

  const [contract, setContract] = useState<ContractType | undefined>(undefined)
  const [adding, setAdding] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenNewContract(true)
    }
  }))

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
          .select('vertical_id, name')
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

  useEffect(() => {
    if (!openAdvertiser) {
      setAdvertiserOption([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAdvertiser])

  useEffect(() => {
    const fetchData = async () => {
      if (!openAdvertiser) return
      setAdvertiserLoading(true)

      try {
        const { data, error } = await supabase
          .from('advertisers')
          .select(`*,
            companies (company_name, company_id)`)
          .ilike('first_name', `%${advertiserInput}%`)

        if (error) throw error

        if (data) {
          setAdvertiserOption(data)
        }

      } catch (error) {
        console.log(error)
      } finally {
        setAdvertiserLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserInput, openAdvertiser])

  const createNewContract = async () => {
    try {
      setAdding(true)

      const { data: newData, error: insertError } = await supabase
        .from('contracts')
        .insert(contract)

      if (insertError) {
        console.log(insertError.message)
        throw insertError
      }

      toast.success(`Created Contract`, {
        autoClose: 3000,
        type: 'success'
      })
      setOpenNewContract(false)
      refresh()
      setVerticalInput('')
      setAdvertiserInput('')
      setContract(undefined)
    } catch (error) {
      toast.error(`${error}`, {
        autoClose: 3000,
        type: 'error'
      })
    } finally {
      setAdding(false)
    }
  }

  return (
    <Dialog
      open={openNewContract}
      maxWidth='sm'
      fullWidth
      aria-labelledby='max-width-dialog-title'>
      <DialogTitle>Add New Contract</DialogTitle>
      <Divider />
      <DialogContent >

        <Grid container spacing={6} className='overflow-visible pbs-0 sm:pli-4'>
          <Grid item xs={12}>
            <Typography className='pb-2' color='text.primary'>Contract Name</Typography>
            <FormControl fullWidth>
              <TextField
                fullWidth
                size='small'
                onChange={e => setContract({ ...contract, contract_name: e.target.value })}
                placeholder='Enter contract name'
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>

            <Typography className='pb-2' color='text.primary'>Advertiser (Law Firm)</Typography>
            <Autocomplete
              id="advertiser-list"
              size="small"
              open={openAdvertiser}
              onOpen={() => setOpenAdvertiser(true)}
              onClose={() => setOpenAdvertiser(false)}
              isOptionEqualToValue={(option, value) => option.advertiser_id === value.advertiser_id}
              getOptionLabel={(option) => option.first_name + ' ' + option.last_name + ' (' + option.companies.company_name + ')'}
              options={advertiserOption}
              loading={advertiserLoading}
              onInputChange={(event, newInputValue) => {
                setAdvertiserInput(newInputValue)
              }}
              onChange={(event, newValue) => {
                setContract({ ...contract, advertiser_id: newValue?.advertiser_id, company_id: newValue?.companies.company_id })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select vertical"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {advertiserLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography className='pb-2' color='text.primary'>Vertical (Case Type)</Typography>
            <Autocomplete
              id="vertical-list"
              size="small"
              open={openVertical}
              onOpen={() => setOpenVertical(true)}
              onClose={() => setOpenVertical(false)}
              isOptionEqualToValue={(option, value) => option.vertical_id === value.vertical_id}
              getOptionLabel={(option) => option.name}
              options={verticalOption}
              loading={verticalLoading}
              onInputChange={(event, newInputValue) => {
                setVerticalInput(newInputValue)
              }}
              onChange={(event, newValue) => {
                setContract({ ...contract, vertical_id: newValue?.vertical_id })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select advertiser"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {verticalLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>Start Date</Typography>
            <AppReactDatepicker
              id='custom-format'
              selected={contract?.start_date}
              dateFormat='MMMM d, yyyy'
              onChange={(date: Date) => setContract({ ...contract, start_date: date })}
              placeholderText='Pick a date'
              customInput={<TextField size='small' fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>End Date</Typography>
            <AppReactDatepicker
              id='custom-format'
              selected={contract?.end_date}
              dateFormat='MMMM d, yyyy'
              onChange={(date: Date) => setContract({ ...contract, end_date: date })}
              placeholderText='Pick a date'
              customInput={<TextField size='small' fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>Budget Limit</Typography>
            <TextField
              fullWidth
              type='number'
              size='small'
              onChange={e => setContract({ ...contract, budget_limit: Number(e.target.value) })}
              placeholder='Enter budget limit'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>$</InputAdornment>
                )
              }}
            />
          </Grid>
          {/* <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>Cost(Per Retainer Signed)</Typography>
            <TextField
              fullWidth
              type='number'
              size='small'
              onChange={e => setContract({ ...contract, cost: Number(e.target.value) })}
              placeholder='Enter Cost'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>$</InputAdornment>
                )
              }}
            />
          </Grid> */}
        </Grid>
      </DialogContent>

      <Divider />
      <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
        <Button variant='contained' className="mt-6" onClick={createNewContract} type='button' color='error' disabled={adding}
        >
          {adding ? <CircularProgress className="mr-2" color="inherit" size={20}/> : null}
          Save Contract
        </Button>
        <Button variant='contained' className="mt-6" onClick={() => setOpenNewContract(false)} type='button'>
          Cancel
        </Button>
      </DialogActions>

    </Dialog >
  )
})

export default AddNewContractDialog
