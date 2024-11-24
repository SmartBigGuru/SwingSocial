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
export interface AddNewPartnerHandle {
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

interface CampaignType {
  campaign_id?: string
  vertical_id?: string
  partner_id?: string
  start_date?: Date
  end_date?: Date
  budget_limit?: number
  payment_term?: string
  status?: string
  campaign_term?: string
  campaign_name?: string
}

const AddNewAdvertiserDialog = forwardRef<AddNewPartnerHandle, RefreshProps>((props, ref) => {
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

  const [partnerInfo, setAdvertiserInfo] = useState<AdvertiserType>({
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
  const [campaign, setCampaign] = useState<CampaignType | undefined>(undefined)
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

  const AddNewPartner = async () => {
    if (!partnerInfo || !companyInfo || !session) return;

    const hasEmptyFields = (fields: any[]) => fields.some(field => field === '');

    const partnerFields = [partnerInfo.email, partnerInfo.first_name, partnerInfo.last_name, partnerInfo.phone];
    const companyFields = [companyInfo.company_address, companyInfo.company_name, companyInfo.company_phone, companyInfo.company_url];

    if (hasEmptyFields(partnerFields) || hasEmptyFields(companyFields)) {
      setEmptyError(true);
      toast.error(`Complete partner info!`, {
        autoClose: 5000,
        type: 'error'
      })

      return
    }

    if (assign && (campaign?.campaign_name === '' || campaign?.vertical_id === '' || campaign?.budget_limit === null ||
      campaign?.start_date === undefined || campaign?.end_date === undefined)) {
      toast.error(`Complete campaign!`, {
        autoClose: 5000,
        type: 'error'
      })

      return
    }

    setAdding(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: partnerInfo.email,
        password: partnerInfo.password,
        options: {
          data: {
            userName: partnerInfo.first_name + " " + partnerInfo.last_name,
            role_id: USER_ROLE.ROLE_PARTNER
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

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .insert({
          auth_id: authData.user?.id,
          company_id: companyData.company_id,
          first_name: partnerInfo.first_name,
          last_name: partnerInfo.last_name,
          email: partnerInfo.email,
          phone: partnerInfo.phone,
          role_id: USER_ROLE.ROLE_CLIENT
        })
        .select()
        .single()

      if (partnerError && partnerError.code !== 'user_already_exists') throw partnerError

      setCampaign({ ...campaign, partner_id: authData.user?.id })

      if (campaign?.campaign_name || campaign?.vertical_id || campaign?.budget_limit || campaign?.start_date || campaign?.end_date) {

        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            company_id: companyData.company_id,
            partner_id: partnerData.partner_id,
            vertical_id: campaign.vertical_id,
            start_date: campaign.start_date,
            end_date: campaign.end_date,
            campaign_name: campaign.campaign_name,
            budget_limit: campaign.budget_limit
          })

        if (campaignError) throw campaignError
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
      setCampaign(undefined)
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
            value={partnerInfo?.first_name}
            onChange={e => setAdvertiserInfo({ ...partnerInfo, first_name: e.target.value })}
            {...partnerInfo.first_name === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            value={partnerInfo?.last_name}
            onChange={e => setAdvertiserInfo({ ...partnerInfo, last_name: e.target.value })}
            {...partnerInfo.last_name === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            value={partnerInfo?.email}
            onChange={e => setAdvertiserInfo({ ...partnerInfo, email: e.target.value })}
            {...partnerInfo.email === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            value={partnerInfo?.phone}
            onChange={e => setAdvertiserInfo({ ...partnerInfo, phone: e.target.value })}
            {...partnerInfo.phone === "" && emptyError && { error: true, helperText: 'This field is required' }}
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
            value={partnerInfo.password}
            onChange={e => setAdvertiserInfo({ ...partnerInfo, password: e.target.value })}
            {...partnerInfo.password === "" && emptyError && { error: true, helperText: 'This field is required' }}
            type={partnerInfo.showAlbe ? 'text' : 'password'}
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
                    onClick={() => setAdvertiserInfo({ ...partnerInfo, showAlbe: !partnerInfo.showAlbe })}
                    onMouseDown={e => e.preventDefault()}
                    aria-label='toggle password visibility'
                  >
                    <i className={partnerInfo.showAlbe ? 'ri-eye-off-line' : 'ri-eye-line'} />
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
          <FormControlLabel control={<Switch checked={assign} onChange={() => setAssign(!assign)} />} label='Assign campaign?' />
        </Grid>
      </Grid>
    </>
  )

  const CampaignPanel = (
    <Grid container spacing={6} >
      <Grid item xs={12} sm={12}>
        <Typography className='pb-2' color='text.primary'>Campaign Name</Typography>
        <FormControl fullWidth>
          <TextField
            fullWidth
            onChange={e => setCampaign({ ...campaign, campaign_name: e.target.value })}
            placeholder='Enter campaign name'
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
            setCampaign({ ...campaign, vertical_id: newValue?.vertical_id })
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select vertical"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {verticalLoading ? <CircularProgress color="inherit" size={20} className="mr-2"/> : null}
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
          selected={campaign?.start_date}
          dateFormat='MMMM d, yyyy'
          onChange={(date: Date) => setCampaign({ ...campaign, start_date: date })}
          placeholderText='Pick a date'
          customInput={<TextField fullWidth />}
        />
      </Grid>
      <Grid item xs={6} sm={6}>
        <Typography className='pb-2' color='text.primary'>End Date</Typography>
        <AppReactDatepicker
          id='custom-format'
          selected={campaign?.end_date}
          dateFormat='MMMM d, yyyy'
          onChange={(date: Date) => setCampaign({ ...campaign, end_date: date })}
          placeholderText='Pick a date'
          customInput={<TextField fullWidth />}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography className='pb-2' color='text.primary'>Budget Limit</Typography>
        <TextField
          fullWidth
          type='number'
          onChange={e => setCampaign({ ...campaign, budget_limit: Number(e.target.value) })}
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
            {assign && <Tab value='2' label='Campaign' icon={<i className='ri-file-text-line' />} />}
            <Tab value='3' label='Billing' icon={<i className='ri-bank-card-line' />} />
          </TabList>
          <TabPanel value='1'>
            {ContactPanel}
          </TabPanel>
          <TabPanel value='2'>
            {CampaignPanel}
          </TabPanel>
          <TabPanel value='3'>
            {BillingPanel}
          </TabPanel>
        </TabContext>

      </DialogContent>
      <Divider />
      <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
        <Button variant='contained' className="mt-6" type='button' color='error' disabled={adding} onClick={AddNewPartner} >
          {adding ? <CircularProgress color="inherit" className="mr-2" size={20} /> : null}
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
