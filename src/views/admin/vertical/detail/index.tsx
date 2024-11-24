'use client'

import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from 'next/navigation'

import { Button, Dialog, DialogActions, DialogTitle, Divider, Grid, Typography } from "@mui/material"

import Timeline from "@mui/lab/Timeline"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem"
import TimelineDot from "@mui/lab/TimelineDot"

// Third-party Imports
import classnames from 'classnames'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

import { FourSquare } from "react-loading-indicators";

import CustomAvatar from "@/@core/components/mui/Avatar"
import type { ContractFormat } from "./type"
import { supabase } from "@/utils/supabase"

interface AdvertiserType {
  company_id: string
  created_date: string
  email: string
  first_name: string
  last_name: string
  phone: string
  type: string
}

interface OfferType {
  name: string
}

interface ContractType {
  contract_id: number
  name: string
  contract_term: string
  budget_limit: number
  created_date: string
  start_date: string
  end_date: string
  payment_term: string
  status: string
  retainers: number
  return_rate: number
  advertisers: AdvertiserType
  offer: OfferType[]
}

interface DetailInfoType {
  name: string
  summary: string
  description: string
  contracts: ContractType[]
}

const VerticalDeatilDialog = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [id, setID] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);
  const [detailInfo, setDetailInfo] = useState<DetailInfoType | null>(null)
  const [contractList, setContractList] = useState<ContractFormat[] | null>(null);

  // Hooks
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  useEffect(() => {
    setID(searchParams.get('id') || null)
  }, [searchParams])

  useEffect(() => {
    const searchParams = new URLSearchParams()

    if (id !== null)
      searchParams.set('id', id)
    const queryString = searchParams.toString()

    router.push(`/admin/sp/vertical/${queryString ? `?${queryString}` : ''}`)
  }, [router, id])

  useEffect(() => {
    if (!id) return
    setLoading(true)

    const fetchData = async () => {
      try {
        const query = supabase
          .from('verticals')
          .select(`*,
        contracts (*,
          advertisers (*),
          offers (*)
        )
      `)
          .eq('vertical_id', id)
          .single()

        const { data, error } = await query

        if (error)
          throw error
        setDetailInfo(data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  type DataType = {
    title: string
    value: string
    icon: string
    desc: string
    change?: number
  }

  // Vars
  const data: DataType[] = [
    {
      title: 'In-Store Sales',
      value: '$5,345',
      icon: 'ri-home-6-line',
      desc: '5k',
      change: 5.7
    },
    {
      title: 'Website Sales',
      value: '$74,347',
      icon: 'ri-computer-line',
      desc: '21k',
      change: 12.4
    },
    {
      title: 'Discount',
      value: '$14,235',
      icon: 'ri-gift-line',
      desc: '6k'
    },
    {
      title: 'Affiliate',
      value: '$8,345',
      icon: 'ri-money-dollar-circle-line',
      desc: '150',
      change: -3.5
    }
  ]

  const DateDifference = (createDate: string) => {
    const currentDate = new Date();
    const createdDate = new Date(createDate);

    const calculateDifference = (startDate: Date, endDate: Date) => {
      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();

      // Adjust the months and days if necessary
      if (days < 0) {
        months -= 1;
        days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); // Get days in the previous month
      }

      if (months < 0) {
        years -= 1;
        months += 12; // Adjust to the previous year
      }

      return { years, months, days };
    };

    const { years, months, days } = calculateDifference(createdDate, currentDate);

    const output = [];

    if (years > 0) output.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) output.push(`${months} month${months > 1 ? 's' : ''}`);
    if (days > 0) output.push(`${days} day${days > 1 ? 's' : ''}`);

    return output.length > 0 ? output.join(', ') + ' ago' : 'Today';
  }

  const contracts = (
    detailInfo?.contracts !== null &&
    <Timeline sx={{
      [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
      },
    }}>
      {
        detailInfo?.contracts.map((contractItem, id) => (
          <div key={id}>
            <TimelineItem >
              <TimelineSeparator>
                <TimelineDot color={
                  contractItem.status === 'Active' ? 'success' :
                    contractItem.status === 'Pending' ? 'primary' :
                      'warning'
                } />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent >
                <div className='flex items-center justify-between flex-wrap gap-x-4 pbe-1.5'>

                  <Typography className='font-medium' color='text.primary'>
                    #CTR-{contractItem.contract_id}
                  </Typography>
                  <Typography variant='caption'>{DateDifference(contractItem.created_date)}</Typography>
                </div>
                <Typography className='mbe-2'>Advertiser: {`${contractItem.advertisers.first_name} ${contractItem.advertisers.last_name}`}</Typography>
                <Grid container xs={12} spacing={2}>

                  <Grid item className="container gap-2" xs={12} md={4} spacing={4}>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-calendar-schedule-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span>
                          {contractItem.start_date} -
                        </span>
                        <span>{contractItem.end_date}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-money-dollar-circle-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Budget: ${contractItem.budget_limit}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-bank-card-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Payment Term: {contractItem.payment_term}
                        </span>
                      </div>
                    </div>
                  </Grid>

                  <Grid item className="container gap-2" xs={12} md={4} spacing={4}>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-file-text-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Offer: {Array.isArray(contractItem.offer) ? contractItem.offer.length : 0}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-group-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Partner: {Array.isArray(contractItem.offer) ? contractItem.offer.length : 0}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-gradienter-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Status: {contractItem.status}
                        </span>
                      </div>
                    </div>
                  </Grid>

                  <Grid item className="container gap-2" xs={12} md={4} spacing={4}>
                    <Typography>Performance Metrics:</Typography>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-focus-2-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Retainers Generated: {contractItem.retainers}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-refresh-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Return Rates: {contractItem.return_rate}%
                        </span>
                      </div>
                    </div>
                  </Grid>

                </Grid>
              </TimelineContent>
            </TimelineItem>
          </div>
        )
        )
      }
    </Timeline>
  )

  return (
    <>
      {id &&
        (
          <Dialog
            open={true}
            maxWidth='md'
            fullWidth
            aria-labelledby='max-width-dialog-title'
          >
            {!loading && detailInfo && (<>
              <DialogTitle id='scroll-dialog-title'>{detailInfo.name}</DialogTitle>

              <Divider />
              <div className="scrollbar-custom overflow-y-auto">
                <div className='flex flex-col gap-6 p-5 '>
                  <div className='flex flex-col gap-4'>
                    <Typography variant='h5'>Summary</Typography>
                    <Typography>{detailInfo.summary}</Typography>
                  </div>
                  <Divider />

                  <div className='flex flex-col gap-4'>
                    <Typography variant='h5'>Description</Typography>
                    <Typography >
                      {detailInfo.description}
                    </Typography>
                  </div>

                  <div className='flex flex-col gap-4'>
                    <Typography variant='h5'>Performance Metrics</Typography>
                    <Grid container spacing={6} className="p-is-6">
                      {data.map((item, index) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={3}
                          key={index}
                          className={classnames({
                            '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie': isBelowMdScreen && !isSmallScreen,
                            '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
                          })}
                        >
                          <div className='flex flex-col gap-6'>
                            <div className='flex justify-between'>
                              <div className='flex flex-col gap-1'>
                                <Typography>{item.title}</Typography>
                                <Typography variant='h6'>{item.value}</Typography>
                              </div>
                              <CustomAvatar variant='rounded' size={44}>
                                <i className={classnames('text-[28px]', item.icon)} />
                              </CustomAvatar>
                            </div>

                          </div>
                          {isBelowMdScreen && !isSmallScreen && index < data.length - 2 && (
                            <Divider
                              className={classnames('mbs-6', {
                                'mie-6': index % 2 === 0
                              })}
                            />
                          )}
                          {isSmallScreen && index < data.length - 1 && <Divider className='mbs-6' />}
                        </Grid>
                      ))}
                    </Grid>
                  </div>

                </div>
                <div className='flex flex-col gap-1 px-5'>
                  <Typography variant='h5'>Contracts ({Array.isArray(detailInfo.contracts) ? detailInfo.contracts.length : 0})</Typography>
                  {contracts}
                </div>
              </div>
              <Divider />
            </>)}

            {loading && (
              <>
                <DialogTitle />
                <div className="text-center">
                  <FourSquare color="#32cd32" size="medium" text="loading.." textColor="#c34242" />
                </div>
              </>
            )}

            <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
              <Button variant='contained' className="mt-6" onClick={() => setID(null)} type='button'>
                Cancel
              </Button>
            </DialogActions>
          </Dialog >
        )
      }
    </>
  )


}

export default VerticalDeatilDialog
