'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@/@core/components/mui/Avatar'
import { supabase } from '@/utils/supabase'

interface PerformanceType {
  title: string;
  subtitle: string;
  icon: string;
}

// Vars
const data: PerformanceType[] = [
  {
    title: '0',
    subtitle: 'Clients',
    icon: 'ri-user-3-line'
  },
  {
    title: '0',
    subtitle: 'Invoices',
    icon: 'ri-pages-line'
  },
  {
    title: '$0',
    subtitle: 'Paid',
    icon: 'ri-wallet-line'
  },
  {
    title: '$0',
    subtitle: 'Unpaid',
    icon: 'ri-money-dollar-circle-line'
  }
]

const InvoiceCard = () => {
  // Hooks
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const [performance, setPerformance] = useState<PerformanceType[]>(data)

  useEffect(() => {
    fetchInvoice()
    fetchClient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatCount = (amount: number): string => {
    if (amount < 1000) {
      return amount.toString();
    } else if (amount < 1_000_000) {
      return (amount / 1000).toFixed(2) + 'k';
    } else if (amount < 1_000_000_000) {
      return (amount / 1_000_000).toFixed(2) + 'm';
    } else {
      return (amount / 1_000_000_000).toFixed(2) + 'b';
    }
  };

  const fetchInvoice = async () => {
    try {
      const { data: invoiceData, count: invoiceCount, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount, invoice_status', { count: 'exact' })

      if (invoiceError) throw invoiceError

      const paidAmount = invoiceData.reduce((sum, item) => {
        if (item.invoice_status !== 'Canceled') {
          return sum + item.paid_amount;
        }

        
return sum;
      }, 0);

      const totalAmount = invoiceData.reduce((sum, item) => {
        if (item.invoice_status !== 'Canceled') {
          return sum + item.total_amount;
        }

        
return sum;
      }, 0);

      setPerformance(
        prevItems =>
          prevItems.map(item =>
            item.subtitle === 'Invoices'
              ? { ...item, title: formatCount(invoiceCount ?? 0) }
              : item
          ))
      setPerformance(
        prevItems =>
          prevItems.map(item =>
            item.subtitle === 'Paid'
              ? { ...item, title: `$${formatCount(paidAmount ?? 0)}` }
              : item
          ))
      setPerformance(
        prevItems =>
          prevItems.map(item =>
            item.subtitle === 'Unpaid'
              ? { ...item, title: `$${formatCount(Number(totalAmount - paidAmount) ?? 0)}` }
              : item
          ))
    } catch (error: any) {
      console.log(error.message)
    }
  }

  const fetchClient = async () => {
    try {
      const { data: clientData, count: clientCount, error: clientError } = await supabase
        .from('advertisers')
        .select('', { count: 'exact' })

      if (clientError) throw clientError

      setPerformance(
        prevItems =>
          prevItems.map(item =>
            item.subtitle === 'Clients'
              ? { ...item, title: String(clientCount) }
              : item
          ))
    } catch (error: any) {
      console.log(error.message)
    }
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {performance.map((item, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={index}
              className='sm:[&:nth-of-type(odd)>div]:pie-6 sm:[&:nth-of-type(odd)>div]:border-ie md:[&:not(:last-child)>div]:pie-6 md:[&:not(:last-child)>div]:border-ie'
            >
              <div className='flex justify-between'>
                <div className='flex flex-col'>
                  <Typography variant='h4'>{item.title}</Typography>
                  <Typography>{item.subtitle}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42}>
                  <i className={classnames('text-[26px]', item.icon)} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < data.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < data.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default InvoiceCard
