'use client'

// React Imports
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'

// MUI Imports
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import { Autocomplete, CircularProgress, MenuItem, Select } from '@mui/material'

// Styled Component Imports
import { toast } from 'react-toastify'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { supabase } from '@/utils/supabase'
import InvoicetoPdf from '../export/export'

interface CompanyType {
  company_id: string
  company_name: string
  company_address: string
  company_phone: string
}

interface AdvertiserType {
  advertiser_id: string
  first_name: string
  last_name: string
  companies: CompanyType
  email: string
  phone: string
}

interface PartnerType {
  partner_id: string
  first_name: string
  last_name: string
  companies: CompanyType
  email: string
  phone: string
}

interface InvoiceItemType {
  id?: number;
  contract_id?: number
  retainer: number
  unit_price: number
}

interface ContractType {
  contract_id?: number
  contract_name: string
}

export interface InvoiceHandle {
  setTax: (tax: number) => void;
  save: () => void;
  send: () => void;
  download: () => void;
}

interface IdType {
  id: string;
}

const Content = forwardRef<InvoiceHandle, IdType>((props, ref) => {
  // States
  const { id } = props
  const [issuedDate, setIssuedDate] = useState<Date | null | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | null | undefined>(null)
  const [paymentTerm, setStatePaymentTerm] = useState('prepay')
  const [note, setNote] = useState('')
  const [invoiceStatus, setStatus] = useState('')
  const [tax, setTax] = useState(21);
  const router = useRouter()

  // Hooks
  const isMDScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const [items, setItems] = useState<InvoiceItemType[]>([])

  const updateItem = useCallback((index: number, field: keyof InvoiceItemType, value: number) => {
    setItems(prevItems =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }, [])

  const removeItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index))
  }

  useImperativeHandle(ref, () => ({
    setTax: (tax: number) => setTax(tax),
    save: () => updateInvoice('Update'),
    send: () => updateInvoice('Sent'),
    download: () => { InvoicetoPdf(id) }
  }))


  const updateInvoice = async (status: string) => {
    let itemError = false

    if (advertiser === null || partner === null || dueDate === null) {
      toast.error('All fields are required. Please complete the form.', {
        type: 'error',
        closeOnClick: true
      })

      return
    }

    items.map(item => {
      if (item.retainer * item.unit_price === 0 || item.contract_id === undefined)
        itemError = true
    })

    if (itemError && items.length === 0) {
      toast.error('Complete line item', {
        type: 'error',
        closeOnClick: true
      })

      return
    }

    try {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          advertiser_id: advertiser?.advertiser_id,
          partner_id: partner?.partner_id,
          issued_date: issuedDate,
          due_date: dueDate,
          payment_term: paymentTerm,
          total_amount: items.reduce((sum, item) => sum + item.retainer * item.unit_price, 0),
          invoice_status: status === 'Sent' ? 'Sent' : invoiceStatus,
          note: note,
          tax: tax,
          updated_date: new Date()
        })
        .eq('invoice_id', id)

      if (invoiceError) throw invoiceError

      items.map(async item => {
        console.log(item)

        const { error } = await supabase
          .from('invoice_items')
          .update({
            retainer: item.retainer,
            unit_price: item.unit_price,
            contract_id: item.contract_id
          })
          .eq('id', item.id)

        if (error) throw error
      })

      toast.success(`${status} invoice`, {
        type: 'success',
        closeOnClick: true
      })
      router.push('/admin/sp/invoice')
    } catch (error: any) {
      toast.error(`${error.message}`, {
        type: 'error',
        closeOnClick: true
      })
    }
  }

  const [advertiserLoading, setAdvertiserLoading] = useState(false)
  const [openAdvertiser, setOpenAdvertiser] = useState(false)
  const [advertiserOption, setAdvertiserOption] = useState<AdvertiserType[]>([])
  const [advertiserInput, setAdvertiserInput] = useState('')
  const [advertiser, setAdvertiser] = useState<AdvertiserType | null>(null)

  useEffect(() => {
    if (!openAdvertiser) {
      setAdvertiserOption([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAdvertiser])

  useEffect(() => {
    const fetchData = async () => {
      if (!openAdvertiser) return
      setAdvertiserLoading(true)

      try {
        let query = supabase
          .from('advertisers')
          .select(`*,
            companies (*)`)

        const textColumns = [
          'first_name', 'last_name'
        ]

        if (advertiserInput)
          query = query.or(textColumns.map(item => `${item}.ilike.%${advertiserInput}%`).join(','));

        const { data, error } = await query;

        if (error) throw error

        if (data) {
          setAdvertiserOption(data)
        }

      } catch (error) {
        console.log(error)
      } finally {
        setAdvertiserLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserInput, openAdvertiser])

  //partner option
  const [partnerLoading, setPartnerLoading] = useState(false)
  const [openPartner, setOpenPartner] = useState(false)
  const [partnerOption, setPartnerOption] = useState<PartnerType[]>([])
  const [partnerInput, setPartnerInput] = useState('')
  const [partner, setPartner] = useState<PartnerType | null>(null)

  useEffect(() => {
    if (!openPartner) {
      setPartnerOption([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPartner])

  useEffect(() => {
    const fetchData = async () => {
      if (!openPartner) return
      setPartnerLoading(true)

      try {
        let query = supabase
          .from('partners')
          .select(`*,
          companies (*)`)

        const textColumns = [
          'first_name', 'last_name'
        ]

        if (partnerInput)
          query = query.or(textColumns.map(item => `${item}.ilike.%${partnerInput}%`).join(','));

        const { data, error } = await query;

        if (error) throw error

        if (data) {
          setPartnerOption(data)
        }

      } catch (error) {
        console.log(error)
      } finally {
        setPartnerLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerInput, openPartner])

  useEffect(() => {
    fetchInvoiceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchInvoiceData = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`*`)
        .eq('invoice_id', id)
        .single()

      if (invoiceError) throw invoiceError
      setIssuedDate(invoiceData.issued_date)
      setDueDate(invoiceData.due_date)

      const { data: advertiserDate, error: advertiserError } = await supabase
        .from('advertisers')
        .select(`*,
        companies (*)`)
        .eq('advertiser_id', invoiceData.advertiser_id)
        .single()

      if (advertiserError) throw advertiserError

      setAdvertiser(advertiserDate)
      setAdvertiserInput(`${advertiserDate.first_name} ${advertiserDate.last_name}`)

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select(`*,
          companies (*)`)
        .eq('partner_id', invoiceData.partner_id)
        .single()

      if (partnerError) throw partnerError

      setPartner(partnerData)
      setPartnerInput(`${partnerData.first_name} ${partnerData.last_name}`)

      const { data: lineItemData, error: lineItemError } = await supabase
        .from('invoice_items')
        .select(`*`)
        .eq('invoice_id', invoiceData.invoice_id)

      if (lineItemError) throw lineItemError
      setItems(lineItemData)
      setStatePaymentTerm(invoiceData.payment_term)
      setNote(invoiceData.note)
      setStatus(invoiceData.invoice_status)
    } catch (error: any) {
      console.log(error.message)
    }
  }

  return (
    <>
      <Card>
        <CardContent className='sm:!p-12'>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <div className='p-6 bg-actionHover rounded'>
                <div className='flex items-center'>
                  <Typography variant='h3'>{`INVOICE (#${id})`}</Typography>
                </div>
                <div className='flex justify-between gap-4 flex-col sm:flex-row'>
                  <div className='flex flex-col mt-1 gap-1'>
                    <Typography color='text.primary'>Office 149, 450 South Brand Brooklyn</Typography>
                    <Typography color='text.primary'>Carlsbad, California, United States</Typography>
                    <Typography color='text.primary'>(760) 888-0229</Typography>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center'>
                      <Typography className='min-is-[95px] mie-4' color='text.primary'>
                        Date Issued:
                      </Typography>
                      <AppReactDatepicker
                        boxProps={{ className: 'is-full' }}
                        selected={issuedDate}
                        autoComplete='off'
                        placeholderText='YYYY-MM-DD'
                        dateFormat={'yyyy-MM-dd'}
                        onChange={(date: Date) => setIssuedDate(date)}
                        customInput={<TextField fullWidth size='small' />}
                      />
                    </div>
                    <div className='flex items-center'>
                      <Typography className='min-is-[95px] mie-4' color='text.primary'>
                        Date Due:
                      </Typography>
                      <AppReactDatepicker
                        boxProps={{ className: 'is-full' }}
                        selected={dueDate}
                        autoComplete='off'
                        placeholderText='YYYY-MM-DD'
                        dateFormat={'yyyy-MM-dd'}
                        onChange={(date: Date) => setDueDate(date)}
                        customInput={<TextField fullWidth size='small' />}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={12}>
              <div >
                <Grid container spacing={6}>
                  <Grid item md={12} lg={6}>
                    <Typography className='font-medium mb-3' color='text.primary'>
                      Invoice To:
                    </Typography>
                    <Autocomplete
                      id="advertiser-list"
                      className={classnames('min-is-[320px]', {
                        'max-is-[280px]': isMDScreen
                      })}
                      size="small"
                      open={openAdvertiser}
                      onOpen={() => setOpenAdvertiser(true)}
                      onClose={() => setOpenAdvertiser(false)}
                      isOptionEqualToValue={(option, value) => option.advertiser_id === value.advertiser_id}
                      getOptionLabel={(option) => option.first_name + ' ' + option.last_name}
                      options={advertiserOption}
                      loading={advertiserLoading}
                      inputValue={advertiserInput}
                      onInputChange={(event, newInputValue) => {
                        if (event?.type === 'change' || event?.type === 'click')
                          setAdvertiserInput(newInputValue)
                      }}
                      onChange={(event, newValue) => {
                        setAdvertiser(newValue)
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select advertiser"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {advertiserLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                    {advertiser && (<div className='flex flex-col gap-4 p-1'>
                      <div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Company</Typography>
                          <Typography>{advertiser.companies.company_name}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Address:</Typography>
                          <Typography>{advertiser.companies.company_address}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Email:</Typography>
                          <Typography>{advertiser.email}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Phone:</Typography>
                          <Typography>{advertiser.phone}</Typography>
                        </div>
                      </div>
                    </div>)}
                  </Grid>
                  <Grid item md={12} lg={6}>
                    <Typography className='font-medium mb-3' color='text.primary'>
                      Bill To:
                    </Typography>
                    <Autocomplete
                      id="partner-list"
                      className={classnames('min-is-[320px]', {
                        'max-is-[280px]': isMDScreen
                      })}
                      size="small"
                      open={openPartner}
                      onOpen={() => setOpenPartner(true)}
                      onClose={() => setOpenPartner(false)}
                      isOptionEqualToValue={(option, value) => option.partner_id === value.partner_id}
                      getOptionLabel={(option) => option.first_name + ' ' + option.last_name}
                      options={partnerOption}
                      loading={partnerLoading}
                      inputValue={partnerInput}
                      onInputChange={(event, newInputValue) => {
                        if (event?.type === 'change' || event?.type === 'click')
                          setPartnerInput(newInputValue)
                      }}
                      onChange={(event, newValue) => {
                        setPartner(newValue)
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select partner"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {partnerLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                    {partner && (<div className='flex flex-col gap-4 p-1'>
                      <div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Company</Typography>
                          <Typography>{partner.companies.company_name}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Address:</Typography>
                          <Typography>{partner.companies.company_address}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Email:</Typography>
                          <Typography>{partner.email}</Typography>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Typography className='min-is-[100px]'>Phone:</Typography>
                          <Typography>{partner.phone}</Typography>
                        </div>
                      </div>
                    </div>)}
                  </Grid>
                </Grid>
              </div>
            </Grid>

            <Grid item xs={12}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid item xs={12}>
              <div
                className={classnames('repeater-item flex relative mbe-4')}
              >
                {isMDScreen ? (<Grid container spacing={5} className='m-0 mr-10'>
                  <Grid item lg={6} md={6} xs={12}>
                    <Typography className='font-medium md:-top-8' color='text.primary'>
                      Contract
                    </Typography>
                  </Grid>
                  <Grid item lg={2} md={2} xs={12}>
                    <Typography className='font-medium md:-top-8'>Cost</Typography>
                  </Grid>
                  <Grid item md={2} xs={12}>
                    <Typography className='font-medium md:-top-8'>Retainers</Typography>
                  </Grid>
                  <Grid item md={2} xs={12}>
                    <Typography className='font-medium md:-top-8'>Price</Typography>
                  </Grid>
                </Grid>) : (
                  <Typography className='font-medium md:-top-8' color='text.primary'>
                    Item
                  </Typography>
                )
                }
              </div>
              {items.map((item, index) => (
                <LineItem
                  key={index}
                  item={item}
                  index={index}
                  updateItem={updateItem}
                  removeItem={removeItem}
                />
              ))}

              <Grid item xs={12}>
                <Button
                  size='small'
                  variant='contained'
                  disabled={true}
                  onClick={() => {
                    const newItem: InvoiceItemType = {
                      id: undefined,
                      contract_id: undefined,
                      retainer: 0,
                      unit_price: 0
                    };

                    setItems(prevItems => [...prevItems, newItem]);
                  }}
                  startIcon={<i className='ri-add-line' />}
                >
                  Add Item
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid item xs={12}>
              <div className='flex justify-between flex-col gap-4 sm:flex-row'>
                <div className='flex flex-col gap-4 order-2 sm:order-[unset]'>
                  <div className='flex flex-col gap-4'>
                    <Typography className='font-medium' color='text.primary'>
                      Payment Term:
                    </Typography>
                    <Select
                      className='min-is-[200px]'
                      size='small'
                      value={paymentTerm}
                      onChange={e => setStatePaymentTerm(e.target.value)}
                    >
                      <MenuItem value='prepay'>Prepay</MenuItem>
                      <MenuItem value='30'>Net 30</MenuItem>
                      <MenuItem value='60'>Net 60</MenuItem>
                      <MenuItem value='90'>Net 90</MenuItem>
                    </Select>
                  </div>
                </div>
                <div className='min-is-[200px]'>
                  <div className='flex items-center justify-between'>
                    <Typography>Subtotal:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      ${items.reduce((sum, item) => sum + item.retainer * item.unit_price, 0).toFixed(1)}
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
              <InputLabel htmlFor='invoice-note' className='inline-flex mbe-1 text-textPrimary'>
                Note:
              </InputLabel>
              <TextField
                id='invoice-note'
                rows={2}
                fullWidth
                multiline
                value={note}
                onChange={e => {
                  setNote(e.target.value)
                }}
                className='border rounded'
                placeholder='Notes - any relevant information not covered, additional terms and conditions'
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
})


const LineItemInput = ({ value, placeholder, onChange }: { value: number, placeholder: string, onChange: (value: number) => void }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? 0 : Number(e.target.value)

    if (!isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      type="number"
      value={value === 0 ? '' : value}
      onChange={handleChange}
      inputProps={{ step: "1" }}
    />
  )
}

const LineItem = ({
  item,
  index,
  updateItem,
  removeItem
}: {
  item: InvoiceItemType,
  index: number,
  updateItem: (index: number, field: keyof InvoiceItemType, value: number) => void,
  removeItem: (index: number) => void
}) => {
  //advertiser option
  const [contractLoading, setContractLoading] = useState(false)
  const [openContract, setOpenContract] = useState(false)
  const [contractOption, setContractOption] = useState<ContractType[]>([])
  const [contractInput, setContractInput] = useState('')

  // Hooks
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (item.contract_id) {
          const { data, error } = await supabase
            .from('contracts')
            .select('contract_name')
            .eq('contract_id', item.contract_id)
            .single()

          if (error) throw error
          setContractInput(data.contract_name)
        }
      } catch (error: any) {
        console.log(error.message)
      }
    }

    if (item.contract_id)
      fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!openContract) {
      setContractOption([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openContract])

  useEffect(() => {
    const fetchData = async () => {
      if (!openContract) return
      setContractLoading(true)

      try {
        const query = supabase
          .from('contracts')
          .select(`contract_id, contract_name`)
          .ilike('contract_name', `%${contractInput}%`)

        const { data, error } = await query;

        if (error) throw error

        if (data) {
          setContractOption(data)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setContractLoading(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(debounce)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInput, openContract])

  const handleChange = useCallback((field: keyof InvoiceItemType) => (value: number) => {
    updateItem(index, field, value)
  }, [index, updateItem])

  return (
    <>
      <div
        className={classnames('repeater-item flex relative mbe-4 border rounded')}
      >
        <Grid container spacing={5} className={classnames('m-0 pbe-5', {
          'mr-6': isBelowSmScreen
        })}>
          <Grid item lg={6} md={6} xs={12}>
            <Autocomplete
              id="contract-list"
              size="small"
              open={openContract}
              onOpen={() => setOpenContract(true)}
              onClose={() => setOpenContract(false)}
              isOptionEqualToValue={(option, value) => option.contract_id === value.contract_id}
              getOptionLabel={(option) => option.contract_name}
              options={contractOption}
              loading={contractLoading}
              inputValue={contractInput}
              onInputChange={(event, newInputValue) => {
                if (event?.type === 'change' || event?.type === 'click')
                  setContractInput(newInputValue)
              }}
              onChange={(event, newValue) => {
                updateItem(index, 'contract_id', Number(newValue?.contract_id))
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={isBelowSmScreen ? 'Select Contract' : ''}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {contractLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item lg={2} md={2} xs={12}>
            <LineItemInput
              placeholder={isBelowSmScreen ? 'Input cost' : ''}
              value={item.unit_price}
              onChange={handleChange('unit_price')}
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <LineItemInput
              placeholder={isBelowSmScreen ? 'Input retainers' : ''}
              value={item.retainer}
              onChange={handleChange('retainer')}
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <Typography className='mt-2'>
              ${(item.retainer * item.unit_price).toFixed(1)}
            </Typography>
          </Grid>
        </Grid>
        <div className='flex flex-col justify-start border-is'>
          <IconButton size='small' onClick={() => removeItem(index)} disabled={true}>
            <i className='ri-close-line text-actionActive text-2xl' />
          </IconButton>
        </div>
      </div>
    </>
  )
}

export default Content
