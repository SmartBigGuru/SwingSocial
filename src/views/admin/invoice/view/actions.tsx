'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

// Component Imports
import SendInvoiceDrawer from '@views/apps/invoice/shared/SendInvoiceDrawer'
import { supabase } from '@/utils/supabase'

interface SetTaxProps {
  download: () => void;
  send: () => void;
  edit: () => void;
  id: string;
}

const AddActions = (props: SetTaxProps) => {
  // States
  const { download, send, edit, id } = props
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [tax, setTax] = useState(21)

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
                  onClick={send}
                  startIcon={<i className='ri-send-plane-line' />}
                >
                  Send Invoice
                </Button>
              </Grid>
              <Grid item md={6}>
                <Button fullWidth color='primary'
                  variant='outlined' className='capitalize'
                  disabled={status === 'Paid' || status === 'Canceled'}
                  startIcon={<i className="ri-edit-box-line"></i>}
                  onClick={edit}
                >
                  Edit
                </Button>
              </Grid>
              <Grid item md={6}>
                <Button
                  fullWidth
                  color='success'
                  variant='outlined'
                  disabled={status === 'Canceled'}
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
    </Grid>
  )
}

export default AddActions
