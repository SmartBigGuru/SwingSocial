'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { TextField } from '@mui/material'

// Component Imports
import SendInvoiceDrawer from '@views/apps/invoice/shared/SendInvoiceDrawer'
import { supabase } from '@/utils/supabase'

interface SetTaxProps {
  changeTax: (tax: number) => void;
  save: () => void;
  send: () => void;
  download: () => void;
  id: string;
}

const AddActions = (props: SetTaxProps) => {
  // States
  const { changeTax, save, send, download, id } = props
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)
  const [tax, setTax] = useState(21)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (id)
      fetchStatu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchStatu = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_status')
        .eq('invoice_id', id)
        .single()

      if (error) throw error

      setStatus(data.invoice_status)
    } catch (error: any) {
      console.log(error.message)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <Grid container spacing={3}>
              <Grid item md={12}>
                <Button
                  fullWidth
                  variant='contained'
                  className='capitalize'
                  disabled={status !== 'Draft'}
                  startIcon={<i className='ri-send-plane-line' />}
                  onClick={send}
                >
                  Send Invoice
                </Button>
              </Grid>
              <Grid item md={6}>
                <Button fullWidth color='secondary'
                  variant='outlined' className='capitalize'
                  startIcon={<i className="ri-save-line"></i>}
                  onClick={save}
                >
                  Save
                </Button>
              </Grid>
              <Grid item md={6}>
                <Button
                  fullWidth
                  color='secondary'
                  variant='outlined'
                  startIcon={<i className="ri-arrow-down-line"></i>}
                  onClick={download}
                >
                  Download
                </Button>
              </Grid>
              <Grid item md={12}>
                <Button
                  fullWidth
                  color='secondary'
                  variant='outlined'
                  href='/admin/sp/invoice'
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <SendInvoiceDrawer open={sendDrawerOpen} handleClose={() => setSendDrawerOpen(false)} />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth className='mbe-4'>
          <InputLabel id='payment-select'>Accept payments via</InputLabel>
          <Select fullWidth defaultValue='Internet Banking' label='Accept payments via' labelId='payment-select'>
            <MenuItem value='Internet Banking'>Internet Banking</MenuItem>
            <MenuItem value='Debit Card'>Debit Card</MenuItem>
            <MenuItem value='Credit Card'>Credit Card</MenuItem>
            <MenuItem value='Paypal'>Paypal</MenuItem>
            <MenuItem value='UPI Transfer'>UPI Transfer</MenuItem>
          </Select>
        </FormControl>
        <div className='flex items-center justify-between'>
          <InputLabel htmlFor='invoice-edit-client-notes' className='cursor-pointer'>
            Tax
          </InputLabel>
          <TextField
            className='max-is-[75px]'
            fullWidth
            size="small"
            type="number"
            value={tax}
            onChange={e => {
              setTax(Number(e.target.value))
              changeTax(Number(e.target.value))
            }}
          />
        </div>
      </Grid>
    </Grid>
  )
}

export default AddActions
