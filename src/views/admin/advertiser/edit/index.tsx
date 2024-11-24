'use client'

import { forwardRef, useImperativeHandle, useState } from "react"

import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, TextField } from "@mui/material"

import { toast } from "react-toastify";

import { supabase } from "@/utils/supabase";

export interface EditDialogHandle {
  open: (id: string) => void
}

interface RefreshAction {
  refresh: () => void
}

interface CompanyType {
  company_id?: string;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_url?: string;
}

interface AdvertiserType {
  advertiser_id?: string;
  auth_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

const EditDialog = forwardRef<EditDialogHandle, RefreshAction>((props, ref) => {
  const { refresh } = props;
  const [open, setOpen] = useState(false)
  const [id, setId] = useState('');
  const [updating, setUpdating] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<CompanyType | undefined>(undefined)

  const [advertiserInfo, setAdvertiserInfo] = useState<AdvertiserType | undefined>(undefined)

  useImperativeHandle(ref, () => ({
    open: (id) => {
      fetchAdvertiser(id)
      setId(id)
      setOpen(true)
    }
  }))

  const fetchAdvertiser = async (advertiserId: string) => {
    try {
      const { data, error } = await supabase
        .from('advertisers')
        .select(`*,
        companies (*)`)
        .eq('advertiser_id', advertiserId)
        .single()

      if (error) throw error

      if (data) {
        setAdvertiserInfo(data)
        setCompanyInfo(data.companies)
      }
    } catch (error: any) {
      console.log(error.message)
    }
  }

  const updateAdvertiser = async () => {
    setUpdating(true)

    try {
      const { data, error } = await supabase
        .from('advertisers')
        .update({
          first_name: advertiserInfo?.first_name,
          last_name: advertiserInfo?.last_name,
          phone: advertiserInfo?.phone,
          email: advertiserInfo?.email,
        })
        .eq('auth_id', advertiserInfo?.auth_id)

      if (error) throw error

      const { error: companyErro } = await supabase
        .from('companies')
        .update(companyInfo)
        .eq('company_id', companyInfo?.company_id)

      if (companyErro) throw companyErro

      toast.success(`Update success!`, {
        autoClose: 1000,
        type: 'success'
      })

      refresh()
    } catch (error: any) {
      console.log(error)
      toast.error(`${error.message}`, {
        type: 'error'
      })
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  }

  return (
    <Dialog
      open={open}
      maxWidth='sm'
      fullWidth
      aria-labelledby='max-width-dialog-title'>
      <DialogTitle>Edit</DialogTitle>
      <Divider />
      <DialogContent>
        {
          advertiserInfo && companyInfo &&
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='First Name'
                placeholder='Doug'
                value={advertiserInfo?.first_name}
                onChange={e => setAdvertiserInfo({ ...advertiserInfo, first_name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-user-3-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Last Name'
                placeholder='Percy'
                value={advertiserInfo?.last_name ?? ''}
                onChange={e => setAdvertiserInfo({ ...advertiserInfo, last_name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-user-3-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                placeholder='superman@gmail.com'
                value={advertiserInfo?.email}
                onChange={e => setAdvertiserInfo({ ...advertiserInfo, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-mail-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Phone'
                placeholder=' (917) 543-9876'
                value={advertiserInfo?.phone}
                onChange={e => setAdvertiserInfo({ ...advertiserInfo, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-phone-fill' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Company Name'
                value={companyInfo?.company_name}
                onChange={e => setCompanyInfo({ ...companyInfo, company_name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-bank-line' />
                    </InputAdornment>
                  )
                }}
                placeholder='Berkshire'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Company Phone'
                onChange={e => setCompanyInfo({ ...companyInfo, company_phone: e.target.value })}
                value={companyInfo?.company_phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-phone-fill' />
                    </InputAdornment>
                  )
                }} />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label='Company Address'
                onChange={e => setCompanyInfo({ ...companyInfo, company_address: e.target.value })}
                value={companyInfo?.company_address}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-map-pin-line' />
                    </InputAdornment>
                  )
                }} />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label='Company URL'
                onChange={e => setCompanyInfo({ ...companyInfo, company_url: e.target.value })}
                value={companyInfo?.company_url}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-links-line' />
                    </InputAdornment>
                  )
                }}
                placeholder='https://rms-sepia.vercel.app/user/client/setup' />
            </Grid>
          </Grid>
        }
      </DialogContent>
      <Divider />
      <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
        <Button variant='contained' className="mt-6" type='submit' color='error' onClick={updateAdvertiser} disabled={updating}>
          {updating ? <CircularProgress color="inherit" size={15} className="mr-2"/> : null}
          Save
        </Button>
        <Button variant='contained' className="mt-6" onClick={() => {
          setOpen(false)
          setAdvertiserInfo(undefined)
          setCompanyInfo(undefined)
        }} type='button'>
          Cancel
        </Button>
      </DialogActions>
    </Dialog >
  )

})

export default EditDialog