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


  //vertical option
  const [verticalLoading, setVerticalLoading] = useState(false)
  const [openVertical, setOpenVertical] = useState(false)
  const [verticalOption, setVerticalOption] = useState<VerticalType[]>([])
  const [verticalInput, setVerticalInput] = useState('')
  const [campaign, setCampaign] = useState<CampaignType | undefined>(undefined)
  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  useEffect(() => {
    if (!openVertical) {
      setVerticalOption([])
    }
  }, [openVertical])


  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true)
    }
  }))
  const addPromoCode = async () => {
    // Ensure required fields are provided
    const { promoCodeText, description, displayMessage, freeDays, expireDate } = promoCodeData;
    if (!promoCodeText || !freeDays || !expireDate) {
        setEmptyError(true);
        toast.error('Complete Promocode info!', {
            autoClose: 5000,
            type: 'error',
        });
        return;
    }

    // Validate for any empty fields
    const hasEmptyFields = [promoCodeText, freeDays, expireDate].some(field => field === '');
    if (hasEmptyFields) {
        setEmptyError(true);
        toast.error('Complete Promocode info!', {
            autoClose: 5000,
            type: 'error',
        });
        return;
    }

    try {
        // Call the API with promo code data
        const response = await fetch('/api/admin/promocode/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                promoCodeText,
                description,
                displayMessage,
                freeDays,
                expireDate,
            }),
        });

        // Handle response
        if (response.ok) {
            const responseData = await response.json();
            toast.success('Promo code added successfully!', {
                autoClose: 5000,
                type: 'success',
            });
            setOpenDialog(false);
            console.log('Response:', responseData);
        } else {
            const errorData = await response.json();
            toast.error(errorData.message || 'Failed to add promo code!', {
                autoClose: 5000,
                type: 'error',
            });
            console.error('Error Response:', errorData);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('An error occurred while adding the promo code!', {
            autoClose: 5000,
            type: 'error',
        });
    }
};

  const [promoCodeData, setPromoCodeData] = useState({
    promoCodeText: '',
    description: '',
    displayMessage: '',
    freeDays: '',
    expireDate: '',
  });
  return (
    <Dialog
      open={openDialog}
      maxWidth='sm'
      fullWidth
      aria-labelledby='max-width-dialog-title'>
      <DialogContent >
      <Grid container spacing={5}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          name='promoCodeText'
          label='Promo Code'
          autoComplete='off'
          placeholder='Enter Promo Code'
          value={promoCodeData.promoCodeText}
          onChange={e => setPromoCodeData({ ...promoCodeData, promoCodeText: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          name='description'
          label='Description'
          autoComplete='off'
          placeholder='Description'
          value={promoCodeData.description}
          onChange={e => setPromoCodeData({ ...promoCodeData, description: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          name='displayMessage'
          label='Display Message'
          autoComplete='off'
          placeholder='Display Message'
          value={promoCodeData.displayMessage}
          onChange={e => setPromoCodeData({ ...promoCodeData, displayMessage: e.target.value })}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          name='freeDays'
          label='Free Days'
          autoComplete='off'
          placeholder='Enter Free Days'
          value={promoCodeData.freeDays}
          onChange={e => setPromoCodeData({ ...promoCodeData, freeDays: e.target.value })}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          name='expireDate'
          label='Expire Date'
          type='date'
          autoComplete='off'
          InputLabelProps={{
            shrink: true,
          }}
          value={promoCodeData.expireDate}
          onChange={e => setPromoCodeData({ ...promoCodeData, expireDate: e.target.value })}
        />
      </Grid>
    </Grid>

      </DialogContent>
      <Divider />
      <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
        <Button variant='contained' className="mt-6" type='button' color='error' disabled={adding} onClick={addPromoCode} >
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
