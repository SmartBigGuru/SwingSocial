'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, InputAdornment, TextField, Typography } from "@mui/material"

import { FourSquare } from "react-loading-indicators";

import { supabase } from "@/utils/supabase";


export interface ContractEditHandle {
  open: (contractId: string) => void;
}

interface CompanyType {
  company_name: string
}

interface VerticalType {
  vertical_id: string
  name: string
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
  advertiser_id?: string
  start_date?: Date
  end_date?: Date
  budget_limit?: number
  cost?: number
  payment_term?: string
  status?: string
  contract_term?: string
  contract_name?: string
  advertisers?: AdvertiserType
  verticals?: VerticalType
}

interface RefreshList {
  refresh: () => void
}

const ContractEditDialog = forwardRef<ContractEditHandle, RefreshList>((props, ref) => {

  const { refresh } = props
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false)

  //vertical option
  const [verticalLoading, setVerticalLoading] = useState(false)
  const [openVertical, setOpenVertical] = useState(false)
  const [verticalOption, setVerticalOption] = useState<VerticalType[]>([])
  const [verticalInput, setVerticalInput] = useState<string | undefined>(undefined)

  //advertiser option
  const [advertiserLoading, setAdvertiserLoading] = useState(false)
  const [openAdvertiser, setOpenAdvertiser] = useState(false)
  const [advertiserOption, setAdvertiserOption] = useState<AdvertiserType[]>([])
  const [advertiserInput, setAdvertiserInput] = useState<string | undefined>(undefined)

  const [contract, setContract] = useState<ContractType | undefined>(undefined)
  const [uploading, setUploading] = useState(false)

  useImperativeHandle(ref, () => ({
    open: (contractId) => {
      setOpen(true)
      loadContract(contractId)
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
            companies (*)`)
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

  const loadContract = (contractId: string) => {
    if (!contractId) return

    setLoading(true)

    const fetchContract = async () => {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select(`*,
              verticals (name),
              advertisers (first_name, last_name,
              companies (company_name))`)
          .eq('contract_id', contractId)
          .single()

        if (error) throw error

        console.log(data.advertisers?.companies?.company_name)
        setContract(data)
        setAdvertiserInput(data.advertisers?.first_name + ' ' + data.advertisers?.last_name + ' (' + data.advertisers?.companies?.company_name + ')')
        setVerticalInput(data.verticals?.name)

      } catch (error: any) {
        console.log(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }

  const updateContract = async () => {
    try {
      setUploading(true)

      const { data, error } = await supabase
        .from('contracts')
        .update({
          contract_id: contract?.contract_id,
          vertical_id: contract?.vertical_id,
          advertiser_id: contract?.advertiser_id,
          start_date: contract?.start_date,
          end_date: contract?.end_date,
          budget_limit: contract?.budget_limit,
          cost: contract?.cost,
          payment_term: contract?.payment_term,
          status: contract?.status,
          contract_term: contract?.contract_term,
          contract_name: contract?.contract_name
        })
        .eq('contract_id', contract?.contract_id)

      if (error) throw error
      setOpen(false)

      refresh()

    } catch (error: any) {
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
        }
        }
        maxWidth='md'
        fullWidth
        aria-labelledby='max-width-dialog-title'
      >
        {!loading && contract && (<>
          <DialogTitle>Edit Contract</DialogTitle>
          <Divider />
          <DialogContent >

            <Grid container spacing={6} className='overflow-visible pbs-0 sm:pli-4'>
              <Grid item xs={9} lg={9}>
                <Typography className='pb-2' color='text.primary'>Contract Name</Typography>
                <FormControl fullWidth>
                  <TextField
                    fullWidth
                    onChange={e => setContract({ ...contract, contract_name: e.target.value })}
                    value={contract.contract_name}
                  />
                </FormControl>
              </Grid>

              {/* <Grid item xs={12}>

                <Typography className='pb-2' color='text.primary'>Advertiser (Law Firm)</Typography>
                <Autocomplete
                  id="advertiser-list"
                  size="small"
                  open={openAdvertiser}
                  isOptionEqualToValue={(option, value) => option.advertiser_id === value.advertiser_id}
                  getOptionLabel={(option) => option.first_name + ' ' + option.last_name + ' (' + option.companies.company_name + ')'}
                  options={advertiserOption}
                  loading={advertiserLoading}
                  inputValue={advertiserInput}
                  renderInput={(params) => (
                    <TextField
                      {...params}
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
                  isOptionEqualToValue={(option, value) => option.vertical_id === value.vertical_id}
                  getOptionLabel={(option) => option.name}
                  options={verticalOption}
                  loading={verticalLoading}
                  inputValue={verticalInput}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select vertical"
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
                  open={false}
                  onChange={(date: Date) => { }}
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
                  open={false}
                  onChange={(date: Date) => { }}
                  placeholderText='Pick a date'
                  customInput={<TextField size='small' fullWidth />}
                />
              </Grid> */}
              <Grid item xs={3} lg={3}>
                <Typography className='pb-2' color='text.primary'>Budget Limit</Typography>
                <TextField
                  fullWidth
                  type='number'
                  value={contract.budget_limit}
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
                  value={contract.cost}
                  onChange={e => setContract({ ...contract, cost: Number(e.target.value) })}
                  placeholder='Enter Cost'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>$</InputAdornment>
                    )
                  }}
                />
              </Grid>  */}
            </Grid>
          </DialogContent>

          <Divider />
          <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
            <Button variant='contained' className="mt-6" onClick={updateContract} type='button' color='error'
            >
              {uploading ? <CircularProgress color="inherit" size={20} className="mr-2"/> : null}
              Save
            </Button>
            <Button variant='contained' className="mt-6" onClick={() => setOpen(false)} type='button'>
              Cancel
            </Button>
          </DialogActions>
        </>
        )}

        {loading && (
          <>
            <DialogTitle />
            <div className="text-center">
              <FourSquare color="#32cd32" size="medium" text="loading.." textColor="#c34242" />
            </div>
          </>
        )}
      </Dialog>
    </>
  )


})

export default ContractEditDialog
