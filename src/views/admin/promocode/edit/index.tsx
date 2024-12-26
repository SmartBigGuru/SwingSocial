'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, Divider, FormControl, FormControlLabel, Grid, TextField } from "@mui/material"
import { toast } from "react-toastify";
// MUI Imports
export interface EditPromocodeHandle {
  open: () => void;
}

interface RefreshProps {
  refresh: () => void;
  id: any;
  promocodeDetail?: any; // Add this line
}

const EditPromocodeDialogue = forwardRef<EditPromocodeHandle, RefreshProps>((props, ref) => {
  const { refresh, id, promocodeDetail } = props;
  const [openDialog, setOpenDialog] = useState(false);
  const [adding, setAdding] = useState(false);
  const [emptyError, setEmptyError] = useState(false);

  const [promoCodeData, setPromoCodeData] = useState({
    id: promocodeDetail?.Id || "",
    promoCodeText: promocodeDetail?.PromoCodeText || "",
    description: promocodeDetail?.Description || "",
    displayMessage: promocodeDetail?.DisplayMessage || "",
    freeDays: promocodeDetail?.FreeDays || "",
    expireDate: promocodeDetail?.ExpireDate && promocodeDetail?.ExpireDate || "",
    active: true
  });

  const updatePromoCode = async () => {
    // Ensure required fields are provided
    const { id, promoCodeText, description, displayMessage, freeDays, expireDate } = promoCodeData;
    if (!promoCodeText || !freeDays || !expireDate) {
      setEmptyError(true);
      toast.error('Complete Promocode info!', {
        autoClose: 5000,
        type: 'error',
      });
      return;
    }

    // Validate for any empty fields
    const hasEmptyFields = [id, promoCodeText, freeDays, expireDate].some(field => field === '');
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
      const response = await fetch('/api/admin/promocode/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          promoCodeText,
          description,
          displayMessage,
          freeDays,
          expireDate,
          active: 1
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
  useImperativeHandle(ref, () => ({
    open: () => {
      setOpenDialog(true);
    },
  }));

  useEffect(() => {
    if (promocodeDetail) {
      setPromoCodeData({
        id: promocodeDetail.Id || "",
        promoCodeText: promocodeDetail.PromoCodeText || "",
        description: promocodeDetail.Description || "",
        displayMessage: promocodeDetail.DisplayMessage || "",
        freeDays: promocodeDetail.FreeDays || "",
        expireDate: promocodeDetail?.ExpireDate && promocodeDetail.ExpireDate || "",
        active: true
      });
    }
  }, [promocodeDetail]);
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
        <Button variant='contained' className="mt-6" type='button' color='error' disabled={adding} onClick={updatePromoCode} >
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

export default EditPromocodeDialogue
