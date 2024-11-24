'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, TextField, Typography } from "@mui/material"

import { toast } from "react-toastify";

import { supabase } from "@/utils/supabase";
import AppReactDatepicker from "@/libs/styles/AppReactDatepicker";

export interface AssignDialogHandle {
  open: (id: string) => void
}

interface RefreshAction {
  refresh: () => void
}

interface ContractType {
  contract_name: string
}

interface AssignType {
  start_date?: Date
  end_date?: Date
  budget?: number
  cost?: number
  partner_id?: string
  contract_id?: string
  status?: string
}

interface CompanyType {
  company_name: string
}

interface PartnerType {
  partner_id: string;
  name: string;
  companies: CompanyType;
}

const AssignDialog = forwardRef<AssignDialogHandle, RefreshAction>((props, ref) => {
  const {refresh} = props;
  const [open, setOpen] = useState(false)
  const [contract, setContract] = useState<ContractType | null>(null);
  const [assign, setAssign] = useState<AssignType | undefined>(undefined)

  //partner option
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [openPartner, setOpenPartner] = useState(false)
  const [partnerOption, setPartnerOption] = useState<PartnerType[]>([])
  const [partnerInput, setPartnerInput] = useState('')

  useImperativeHandle(ref, () => ({
    open(id) {
      openAssign(id)
    },
  }))

  useEffect(() => {
    if (!openPartner) {
      setPartnerOption([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPartner])

  useEffect(() => {
    const fetchData = async () => {
      if (!openPartner) return
      setPartnerLoading(true)

      try {
        const { data, error } = await supabase
          .from('partners')
          .select(`*,
            companies (*)`)
          .ilike('name', `%${partnerInput}%`)

        if (error) throw error

        console.log(data)

        if (data) {
          setPartnerOption(data)
        }

      } catch (error) {
        console.log(error)
      } finally {
        setPartnerLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerInput, openPartner])

  const openAssign = (id: string) => {
    if (id === undefined) return

    setAssign({ ...assign, contract_id: id, status: 'Active' })

    const fetchContract = async () => {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('contract_name')
          .eq('contract_id', id)
          .single()

        if (error) throw error

        setContract(data)
        setOpen(true)
        console.log(data)
      } catch (error: any) {
        console.log(error.message)
      } finally {

      }
    }

    fetchContract()
  }

  const saveAssign = async () => {
    try {
      const { data, error } = await supabase
        .from('assigns')
        .insert(assign)

      if (error) throw error

      toast.success(`Created Contract`, {
        autoClose: 3000,
        type: 'success'
      })
      refresh()
      setOpen(false)
    } catch (error: any) {
      toast.error(`${error.message}`, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      fullWidth
      aria-labelledby='max-width-dialog-title'>
      <DialogTitle>Assign ({contract?.contract_name})</DialogTitle>
      <Divider />
      <DialogContent>

        <Grid container spacing={6} className='overflow-visible pbs-0 sm:pli-4'>

          <Grid item xs={12}>
            <Typography className='pb-2' color='text.primary'>Partner</Typography>
            <Autocomplete
              id="advertiser-list"
              size="small"
              open={openPartner}
              onOpen={() => setOpenPartner(true)}
              onClose={() => setOpenPartner(false)}
              isOptionEqualToValue={(option, value) => option.partner_id === value.partner_id}
              getOptionLabel={(option) => option.name + ' (' + option.companies.company_name + ')'}
              options={partnerOption}
              loading={partnerLoading}
              onInputChange={(event, newInputValue) => {
                setPartnerInput(newInputValue)
              }}
              onChange={(event, newValue) => {
                setAssign({ ...assign, partner_id: newValue?.partner_id })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select vertical"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {partnerLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>Budget Limit</Typography>
            <TextField
              fullWidth
              type='number'
              size='small'
              placeholder='Enter budget limit'
              onChange={e => setAssign({ ...assign, budget: Number(e.target.value) })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>$</InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>Cost(Per a Retainer)</Typography>
            <TextField
              fullWidth
              type='number'
              size='small'
              placeholder='Enter cost'
              onChange={e => setAssign({ ...assign, cost: Number(e.target.value) })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>$</InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>Start Date</Typography>
            <AppReactDatepicker
              id='custom-format'
              selected={assign?.start_date}
              dateFormat='MMMM d, yyyy'
              onChange={(date: Date) => setAssign({ ...assign, start_date: date })}
              placeholderText='Pick a date'
              customInput={<TextField size='small' fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography className='pb-2' color='text.primary'>End Date</Typography>
            <AppReactDatepicker
              id='custom-format'
              selected={assign?.end_date}
              dateFormat='MMMM d, yyyy'
              onChange={(date: Date) => setAssign({ ...assign, end_date: date })}
              placeholderText='Pick a date'
              customInput={<TextField size='small' fullWidth />}
            />
          </Grid>

        </Grid>
      </DialogContent>

      <Divider />
      <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
        <Button variant='contained' className="mt-6" type='submit' color='error' onClick={saveAssign}>
          Confirm
        </Button>
        <Button variant='contained' className="mt-6" onClick={() => setOpen(false)} type='button'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog >
  )

})

export default AssignDialog