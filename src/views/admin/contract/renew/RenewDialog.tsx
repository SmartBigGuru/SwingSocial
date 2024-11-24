'use client'

import { forwardRef, useImperativeHandle, useState } from "react"

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from "@mui/material"

import AppReactDatepicker from "@/libs/styles/AppReactDatepicker"
import { supabase } from "@/utils/supabase"

export interface RenewOpenHandle {
  open: (id: string) => void
}

interface RefreshAction {
  refresh: () => void
}

interface ContractType {
  contract_id?: string
  contract_name?: string
  budget_limit?: number
  status?: string
  start_date?: Date
  end_date?: Date
}

const RenewContractDialog = forwardRef<RenewOpenHandle, RefreshAction>((props, ref) => {
  const { refresh } = props;
  const [open, setOpen] = useState(false)
  const [contract, setContract] = useState<ContractType | undefined>(undefined)
  const [uploading, setUploading] = useState(false)

  useImperativeHandle(ref, () => ({
    open: (id: string) => {
      setOpen(true)
      fetchContract(id)
    }
  }))

  const fetchContract = async (id: string) => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`*`)
        .eq('contract_id', id)
        .single()

      if (error) throw error

      console.log(data)
      setContract(data)
    } catch (error: any) {
      console.log(error.message)
    } finally {
    }
  }

  const updateContract = async () => {
    try {
      setUploading(true)

      const { data, error } = await supabase
        .from('contracts')
        .update({
          end_date: contract?.end_date,
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
        maxWidth='xs'
        fullWidth
        aria-labelledby='max-width-dialog-title'
      >
        <DialogTitle>
          <Typography className="text-lg" color='text.primary'>
            Renew Contract
          </Typography>
        </DialogTitle>
        <Divider className="mx-6" />
        <DialogContent>
          <Typography className="text-lg" color='text.primary'>
            {contract?.contract_name}
          </Typography>
          <Typography >
            Contract ID: CTR-0{contract?.contract_id}
          </Typography>
          <Typography >
            Budget Limit: ${contract?.budget_limit}
          </Typography>
          <Typography >
            Status: {contract?.status}
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} lg={12}>
              <Typography className='pb-2 mt-6' color='text.primary'>Start Date</Typography>
              <AppReactDatepicker
                id='custom-format'
                selected={contract?.start_date}
                dateFormat='MMMM d, yyyy'
                readOnly
                onChange={(date: Date) => { setContract({ ...contract, start_date: date }) }}
                placeholderText='Pick a date'
                customInput={<TextField size='small' fullWidth InputProps={{ readOnly: true }} />}
              />
            </Grid>
            <Grid item xs={12} lg={12}>
              <Typography className='pb-2' color='text.primary'>End Date</Typography>
              <AppReactDatepicker
                id='custom-format'
                selected={contract?.end_date}
                dateFormat='MMMM d, yyyy'
                onChange={(date: Date) => { setContract({ ...contract, end_date: date }) }}
                placeholderText='Pick a date'
                customInput={<TextField size='small' fullWidth />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-right'>
          <Button variant='contained' onClick={updateContract} type='button' color='error' disabled={uploading}
          >
            {uploading ? <CircularProgress color="inherit" size={15} className="mr-2" /> : null}
            Save
          </Button>
          <Button variant='contained' onClick={() => setOpen(false)} type='button'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
})

export default RenewContractDialog