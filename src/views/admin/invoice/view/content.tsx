'use client'

// React Imports
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

// MUI Imports
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import InputLabel from '@mui/material/InputLabel'
import { Skeleton } from '@mui/material'

import { toast } from 'react-toastify'

import { supabase } from '@/utils/supabase'
import tableStyles from '@core/styles/table.module.css'
import InvoicetoPdf from '../export/export'

interface CompanyType {
  company_name: string
  company_address: string
  company_phone: string
}

interface AdvertiserType {
  first_name: string
  last_name: string
  companies: CompanyType
  email: string
}

interface PartnerType {
  first_name: string
  last_name: string
  companies: CompanyType
  email: string
}

interface InvoiceItemType {
  retainer: number
  unit_price: number
  contracts: ContractType
}

interface VerticalType {
  name: string
}

interface ContractType {
  verticals: VerticalType
  contract_name: string
}

interface InvoiceType {
  issued_date: Date;
  due_date: Date;
  total_amount: number;
  invoice_status: string;
  payment_term: string;
  note: string;
}

export interface InvoiceHandle {
  send: () => void;
  download: () => void;
  edit: () => void;
}

interface IdType {
  id: string;
}

const Content = forwardRef<InvoiceHandle, IdType>((props, ref) => {
  const { id } = props
  const [tax, setTax] = useState(21);
  const [invoice, setInvoice] = useState<InvoiceType | undefined>(undefined)
  const [advertiser, setAdvertiser] = useState<AdvertiserType | undefined>(undefined)
  const [partner, setPartner] = useState<PartnerType | undefined>(undefined)
  const [items, setItems] = useState<InvoiceItemType[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    download: () => { InvoicetoPdf(id) },
    send: () => { updateInvoice('Sent') },
    edit: () => { router.push(`/admin/sp/invoice/edit/${id}`) }
  }))

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateInvoice = async (status: string) => {
    try {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          invoice_status: 'Sent',
          updated_date:new Date()
        })
        .eq('invoice_id', id)

      if (invoiceError) throw invoiceError

      toast.success(`Sent invoice`, {
        type: 'success',
        closeOnClick: true
      })
      router.push('/admin/sp/invoice')
    } catch (error: any) {
      console.log(error.message)
    }
  }

  const fetchData = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_id', id)
        .single()

      if (invoiceError) throw invoiceError
      setLoading(false)
      setInvoice(invoiceData)

      const { data: advertiserData, error: advertiserError } = await supabase
        .from('advertisers')
        .select(`*,
          companies (company_name, company_address, company_phone)`)
        .eq('advertiser_id', invoiceData.advertiser_id)
        .single()

      if (advertiserError) throw advertiserError
      setAdvertiser(advertiserData)

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select(`*,
          companies (company_name, company_address, company_phone)`)
        .eq('partner_id', invoiceData.partner_id)
        .single()

      if (partnerError) throw partnerError
      setPartner(partnerData)

      const { data: lineItemData, error: lineItemError } = await supabase
        .from('invoice_items')
        .select(`*,
          contracts (contract_name,
          verticals (name))`)
        .eq('invoice_id', invoiceData.invoice_id)

      if (lineItemError) throw lineItemError
      setItems(lineItemData)

    } catch (error: any) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className='sm:!p-12'>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <div className='p-6 bg-actionHover rounded'>
                <div className='flex justify-between gap-y-4 flex-col sm:flex-row'>
                  <div className='flex flex-col gap-6'>
                    <div className='flex items-center'>
                      <Typography variant='h5'>INVOICE </Typography>
                    </div>
                    <div>
                      <Typography color='text.primary'>Office 149, 450 South Brand Brooklyn</Typography>
                      <Typography color='text.primary'>Carlsbad, California, United States</Typography>
                      <Typography color='text.primary'>(760) 888-0229</Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-6'>
                    <Typography variant='h5'>{`Invoice #${id}`}</Typography>
                    <div className='flex flex-col gap-1'>
                      <Typography color='text.primary'>
                        {loading ? (
                          <Skeleton className="min-is-[50px]" />
                        ) : (
                          `Date Issued: ${new Date(invoice!.issued_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                          })}`
                        )}
                      </Typography>
                      <Typography color='text.primary'>
                        {loading ? (
                          <Skeleton className="min-is-[50px]" />
                        ) : (
                          `Date Due: ${new Date(invoice!.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                          })}`
                        )}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={12}>
              <div className='px-3'>
                <Grid container spacing={6}>
                  <Grid item md={12} lg={6}>
                    <Typography className='font-medium mb-3' color='text.primary'>
                      Invoice To:
                    </Typography>
                    <div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Name:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : advertiser ? `${advertiser?.first_name} ${advertiser?.last_name}` : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Company:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : advertiser ? advertiser?.companies.company_name : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Address:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : advertiser ? advertiser?.companies.company_address : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Email:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : advertiser ? advertiser?.email : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Phone:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : advertiser ? advertiser?.companies.company_phone : ''}</Typography>
                      </div>
                    </div>
                  </Grid>
                  <Grid item md={12} lg={6}>
                    <Typography className='font-medium mb-3' color='text.primary'>
                      Bill To:
                    </Typography>
                    <div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Name:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : partner ? `${partner?.first_name} ${partner?.last_name}` : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Company:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : partner ? partner?.companies.company_name : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Address:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : partner ? partner?.companies.company_address : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Email:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : partner ? partner?.email : ''}</Typography>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Typography className='min-is-[100px]'>Phone:</Typography>
                        <Typography>{loading ? <Skeleton className='min-is-[100px]' /> : partner ? partner?.companies.company_phone : ''}</Typography>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <Grid item xs={12}>
              <div className='overflow-x-auto border rounded'>
                <table className={tableStyles.table}>
                  <thead>
                    <tr className='border-be'>
                      <th className='!bg-transparent'>Virtical</th>
                      <th className='!bg-transparent'>Contract</th>
                      <th className='!bg-transparent'>Coast</th>
                      <th className='!bg-transparent'>Retainers</th>
                      <th className='!bg-transparent'>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Typography color='text.primary'>{item.contracts.verticals.name}</Typography>
                        </td>
                        <td>
                          <Typography color='text.primary'>{item.contracts.contract_name}</Typography>
                        </td>
                        <td>
                          <Typography color='text.primary'>${item.unit_price}</Typography>
                        </td>
                        <td>
                          <Typography color='text.primary'>{item.retainer}</Typography>
                        </td>
                        <td>
                          <Typography color='text.primary'>${item.retainer * item.unit_price}</Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className='flex justify-between flex-col gap-4 sm:flex-row'>
                <div className='flex flex-col gap-4 order-2 sm:order-[unset]'>
                  <div className='flex gap-4'>
                    <Typography className='font-medium' color='text.primary'>
                      Payment Term:
                    </Typography>
                    <Typography color='text.primary'>{invoice?.payment_term}</Typography>
                  </div>
                </div>
                <div className='min-is-[200px]'>
                  <div className='flex items-center justify-between'>
                    <Typography>Subtotal:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      ${items.reduce((sum, item) => sum + item.retainer * item.unit_price, 0)}
                    </Typography>
                  </div>
                  <div className='flex items-center justify-between'>
                    <Typography>Tax:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      {tax}%
                    </Typography>
                  </div>
                  <Divider className='mlb-2' />
                  <div className='flex items-center justify-between'>
                    <Typography>Total:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      ${(items.reduce((sum, item) => sum + item.retainer * item.unit_price, 0) * (1 - tax / 100)).toFixed(1)}
                    </Typography>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid item xs={12}>
              <div className='flex'>
                <InputLabel htmlFor='invoice-note' className='inline-flex mbe-1 text-textPrimary'>
                  Note:
                </InputLabel>
                <Typography >{invoice?.note}</Typography>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
})

export default Content
