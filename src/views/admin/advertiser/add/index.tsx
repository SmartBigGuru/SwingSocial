'use client'

import type { SyntheticEvent } from "react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, Divider, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, Switch, Tab, TextField, Typography } from "@mui/material"

import type { Session } from "@supabase/supabase-js";

import { toast } from "react-toastify";

import TabContext from "@mui/lab/TabContext";

import TabList from "@mui/lab/TabList";

import TabPanel from "@mui/lab/TabPanel";

import { supabase } from "@/utils/supabase";

import { USER_ROLE } from '@/@core/roles'
import AppReactDatepicker from "@/libs/styles/AppReactDatepicker";


// MUI Imports
export interface AddNewAdverterHandle {
  open: () => void;
}

interface RefreshProps {
  refresh: () => void;
}

interface CompanyType {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_url: string;
}

interface AdvertiserType {
  company_id: string;
  first_name: string;
  last_name: string
  email: string;
  phone: string;
  password: string;
  showAlbe: boolean;
}

interface VerticalType {
  vertical_id: string
  name: string
}

interface ContractType {
  contract_id?: string
  vertical_id?: string
  advertiser_id?: string
  start_date?: Date
  end_date?: Date
  budget_limit?: number
  payment_term?: string
  status?: string
  contract_term?: string
  contract_name?: string
}

const AddNewAdvertiserDialog = forwardRef<AddNewAdverterHandle, RefreshProps>((props, ref) => {
  const { refresh } = props
  const [openDialog, setOpenDialog] = useState(false);
  const [session, setSession] = useState<Session | null>(null)
  const [adding, setAdding] = useState(false)
  const [emptyError, setEmptyError] = useState(false)
  const [assign, setAssign] = useState(false)

  const [companyInfo, setCompanyInfo] = useState<CompanyType>({
    company_address: '',
    company_name: '',
    company_url: '',
    company_phone: ''
  })

  const [advertiserInfo, setAdvertiserInfo] = useState<AdvertiserType>({
    company_id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    showAlbe: false
  })

  //vertical option
  const [verticalLoading, setVerticalLoading] = useState(false)
  const [openVertical, setOpenVertical] = useState(false)
  const [verticalOption, setVerticalOption] = useState<VerticalType[]>([])
  const [verticalInput, setVerticalInput] = useState('')
  const [contract, setContract] = useState<ContractType | undefined>(undefined)
  const [value, setValue] = useState<string>('1')

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

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

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true)
    }
  }))

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error)
          throw error
        setSession(session)
      } catch (error: any) {
        console.log(error.message)
      }
    }

    getUserInfo()
  }, [])

  const AddNewContract = async () => {
    if (!advertiserInfo || !companyInfo || !session) return;

    const hasEmptyFields = (fields: any[]) => fields.some(field => field === '');

    const advertiserFields = [advertiserInfo.email, advertiserInfo.first_name, advertiserInfo.last_name, advertiserInfo.phone];
    const companyFields = [companyInfo.company_address, companyInfo.company_name, companyInfo.company_phone, companyInfo.company_url];

    if (hasEmptyFields(advertiserFields) || hasEmptyFields(companyFields)) {
      setEmptyError(true);
      toast.error(`Complete advertiser info!`, {
        autoClose: 5000,
        type: 'error'
      })

      return
    }

    if (assign && (contract?.contract_name === '' || contract?.vertical_id === '' || contract?.budget_limit === null ||
      contract?.start_date === undefined || contract?.end_date === undefined)) {
      toast.error(`Complete contract!`, {
        autoClose: 5000,
        type: 'error'
      })

      return
    }

    setAdding(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: advertiserInfo.email,
        password: advertiserInfo.password,
        options: {
          data: {
            userName: advertiserInfo.first_name + " " + advertiserInfo.last_name,
            role_id: USER_ROLE.ROLE_CLIENT
          }
        }
      })

      if (authError && authError.code !== 'user_already_exists') {
        throw authError
      }

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert(companyInfo)
        .select()
        .single()

      if (companyError) throw companyError

      if (!companyData) return

      const { data: advertiserData, error: advertiserError } = await supabase
        .from('advertisers')
        .insert({
          auth_id: authData.user?.id,
          company_id: companyData.company_id,
          first_name: advertiserInfo.first_name,
          last_name: advertiserInfo.last_name,
          email: advertiserInfo.email,
          phone: advertiserInfo.phone,
          role_id: USER_ROLE.ROLE_CLIENT
        })
        .select()
        .single()

      if (advertiserError && advertiserError.code !== 'user_already_exists') throw advertiserError

      setContract({ ...contract, advertiser_id: authData.user?.id })

      if (contract?.contract_name || contract?.vertical_id || contract?.budget_limit || contract?.start_date || contract?.end_date) {

        const { data: contractData, error: contractError } = await supabase
          .from('contracts')
          .insert({
            company_id: companyData.company_id,
            advertiser_id: advertiserData.advertiser_id,
            vertical_id: contract.vertical_id,
            start_date: contract.start_date,
            end_date: contract.end_date,
            contract_name: contract.contract_name,
            budget_limit: contract.budget_limit
          })

        if (contractError) throw contractError
      }

      toast.success(`Creating Successed!`, {
        autoClose: 3000,
        type: 'success'
      })

      refresh()
      setOpenDialog(false)
      setCompanyInfo({
        company_address: '',
        company_name: '',
        company_url: '',
        company_phone: ''
      })

      setAdvertiserInfo({
        company_id: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        showAlbe: false
      })

      await supabase.auth.setSession(session)
      setContract(undefined)
      setEmptyError(false)
      setAssign(false)
      setVerticalInput('')

    } catch (error: any) {
      toast.error(`${error.message}`, {
        type: 'error'
      })
    } finally {
      setAdding(false)
    }

  }

  const ContactPanel = (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='First Name'
            placeholder='Doug'
            value={advertiserInfo?.first_name}
            onChange={e => setAdvertiserInfo({ ...advertiserInfo, first_name: e.target.value })}
            {...advertiserInfo.first_name === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            value={advertiserInfo?.last_name}
            onChange={e => setAdvertiserInfo({ ...advertiserInfo, last_name: e.target.value })}
            {...advertiserInfo.last_name === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            {...advertiserInfo.email === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            {...advertiserInfo.phone === "" && emptyError && { error: true, helperText: 'This field is required' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-phone-fill' />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} >
          <TextField
            fullWidth
            label='Password'
            value={advertiserInfo.password}
            onChange={e => setAdvertiserInfo({ ...advertiserInfo, password: e.target.value })}
            {...advertiserInfo.password === "" && emptyError && { error: true, helperText: 'This field is required' }}
            type={advertiserInfo.showAlbe ? 'text' : 'password'}
            placeholder='**************'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-lock-password-line' />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    onClick={() => setAdvertiserInfo({ ...advertiserInfo, showAlbe: !advertiserInfo.showAlbe })}
                    onMouseDown={e => e.preventDefault()}
                    aria-label='toggle password visibility'
                  >
                    <i className={advertiserInfo.showAlbe ? 'ri-eye-off-line' : 'ri-eye-line'} />
                  </IconButton>
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
            {...companyInfo.company_name === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            {...companyInfo.company_phone === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            {...companyInfo.company_address === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            {...companyInfo.company_url === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
        <Grid item xs={12} sm={6}>
          <FormControlLabel control={<Switch checked={assign} onChange={() => setAssign(!assign)} />} label='Assign contract?' />
        </Grid>
      </Grid>
    </>
  )

  const ContractPanel = (
    <Grid container spacing={6} >
      <Grid item xs={12} sm={12}>
        <Typography className='pb-2' color='text.primary'>Contract Name</Typography>
        <FormControl fullWidth>
          <TextField
            fullWidth
            onChange={e => setContract({ ...contract, contract_name: e.target.value })}
            placeholder='Enter contract name'
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography className='pb-2' color='text.primary'>Vertical (Case Type)</Typography>
        <Autocomplete
          id="vertical-list"
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
      <Grid item xs={6} sm={6}>
        <Typography className='pb-2' color='text.primary'>Start Date</Typography>
        <AppReactDatepicker
          id='custom-format'
          selected={contract?.start_date}
          dateFormat='MMMM d, yyyy'
          onChange={(date: Date) => setContract({ ...contract, start_date: date })}
          placeholderText='Pick a date'
          customInput={<TextField fullWidth />}
        />
      </Grid>
      <Grid item xs={6} sm={6}>
        <Typography className='pb-2' color='text.primary'>End Date</Typography>
        <AppReactDatepicker
          id='custom-format'
          selected={contract?.end_date}
          dateFormat='MMMM d, yyyy'
          onChange={(date: Date) => setContract({ ...contract, end_date: date })}
          placeholderText='Pick a date'
          customInput={<TextField fullWidth />}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography className='pb-2' color='text.primary'>Budget Limit</Typography>
        <TextField
          fullWidth
          type='number'
          onChange={e => setContract({ ...contract, budget_limit: Number(e.target.value) })}
          placeholder='Enter budget limit'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>$</InputAdornment>
            )
          }}
        />
      </Grid>
    </Grid>
  )

  const BillingPanel = (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          name='number'
          autoComplete='off'
          label='Card Number'
          placeholder='0000 0000 0000 0000'
          value={cardData.number}
          onChange={e => setCardData({ ...cardData, number: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name='name'
          label='Name on Card'
          autoComplete='off'
          placeholder='John Doe'
          value={cardData.name}
          onChange={e => setCardData({ ...cardData, name: e.target.value })}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField
          fullWidth
          name='expiry'
          autoComplete='off'
          label='Expiry'
          placeholder='MM/YY'
          value={cardData.expiry}
          onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <TextField
          fullWidth
          name='cvv'
          label='CVV'
          autoComplete='off'
          placeholder='123'
          value={cardData.cvv}
          onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel control={<Switch defaultChecked />} label='Save Card for future billing?' />
      </Grid>
    </Grid>
  )

  return (
    <Dialog
      open={openDialog}
      maxWidth='sm'
      fullWidth
      aria-labelledby='max-width-dialog-title'>
      <DialogContent >
        <TabContext value={value}>
          <TabList centered onChange={handleChange} aria-label='icon tabs example'>
            <Tab value='1' label='Contacts' icon={<i className='ri-account-circle-line' />} />
            {assign && <Tab value='2' label='Contract' icon={<i className='ri-file-text-line' />} />}
            <Tab value='3' label='Billing' icon={<i className='ri-bank-card-line' />} />
          </TabList>
          <TabPanel value='1'>
            {ContactPanel}
          </TabPanel>
          <TabPanel value='2'>
            {ContractPanel}
          </TabPanel>
          <TabPanel value='3'>
            {BillingPanel}
          </TabPanel>
        </TabContext>

      </DialogContent>
      <Divider />
      <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
        <Button variant='contained' className="mt-6" type='button' color='error' disabled={adding} onClick={AddNewContract}>
          {adding ? <CircularProgress color="inherit" size={20} className="mr-2"/> : null}
          Save
        </Button>
        <Button variant='contained' className="mt-6" onClick={() => setOpenDialog(false)} type='button'>
          Cancel
        </Button>
      </DialogActions>

    </Dialog >
  )
})

export default AddNewAdvertiserDialog
