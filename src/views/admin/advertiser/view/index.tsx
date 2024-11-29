'use client'
import { forwardRef, useImperativeHandle, useState } from "react";

import { CardContent, Chip, Dialog, Divider, Grid, Typography, useMediaQuery } from "@mui/material";

import classNames from "classnames";

import type { Theme } from "@mui/material/styles/createTheme";


import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";

import { Commet } from "react-loading-indicators";

import { supabase } from "@/utils/supabase";
import CustomAvatar from "@/@core/components/mui/Avatar";



export interface DetailViewHandle {
  open: (id: string) => void;
}

interface RefreshAction {
  refresh: () => void
}

interface CompanyType {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_url: string;
}

interface AdvertiserType {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  companies: CompanyType;
}

interface OfferType {
  name: string
}

interface ContractType {
  contract_id: number
  contract_name: string
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

const DetailView = forwardRef<DetailViewHandle, RefreshAction>((props, ref) => {
  const { refresh } = props
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [advertiser, setAdvertiser] = useState<AdvertiserType | undefined>(undefined)
  const [contract, setContract] = useState<ContractType[] | undefined>(undefined)
  const isSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.only('sm'))
  const isMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.only('md'))
  const isLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  useImperativeHandle(ref, () => ({
    open: (id) => {
      setOpen(true)
      fetchData(id)
    }
  }))

  const fetchData = async (userId: string) => {
    console.log(userId, "======userId in view");
    setLoading(true);

    try {
      // Fetch advertiser data using the custom API
      const response = await fetch(`/api/admin/user?id=${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch advertiser data:', response.statusText);
        setAdvertiser(null);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { user: advertiserData } = await response.json();
      if (!advertiserData) {
        console.error('Advertiser not found');
        setAdvertiser(null);
      } else {
        console.log(advertiserData, "=========advertiser data");
        setAdvertiser(advertiserData);
      }

      // Fetch contracts related to the advertiser
      const contractsResponse = await fetch(`/api/admin/contracts?advertiser_id=${userId}`);
      if (!contractsResponse.ok) {
        console.error('Failed to fetch contract data:', contractsResponse.statusText);
        throw new Error(`HTTP error! status: ${contractsResponse.status}`);
      }

      const contractData = await contractsResponse.json();
      console.log(contractData, "=========contract data");
      setContract(contractData);

    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };




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

  const contractList = (
    contract &&
    <Timeline sx={{
      [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
      },
    }}>
      {
        contract.map((item, id) => (
          <div key={id}>
            <TimelineItem >
              <TimelineSeparator>
                <TimelineDot color={
                  item.status === 'Active' ? 'success' :
                    item.status === 'Pending' ? 'primary' :
                      'warning'
                } />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent >
                <div className='flex items-center justify-between flex-wrap gap-x-4 pbe-1.5'>

                  <Typography className='font-medium' color='text.primary'>
                    {`#CTR-${item.contract_id} (${item.contract_name})`}
                  </Typography>
                  <Typography variant='caption'>{DateDifference(item.created_date)}</Typography>
                </div>
                <Grid container xs={12} spacing={2}>

                  <Grid item className="container gap-2" xs={12} md={4} spacing={4}>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-calendar-schedule-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span>
                          {item.start_date} -
                        </span>
                        <span>{item.end_date}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-money-dollar-circle-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Budget: ${item.budget_limit}
                        </span>
                      </div>
                    </div>
                    {/* <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-bank-card-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">

                        </span>
                      </div>
                    </div> */}
                  </Grid>

                  <Grid item className="container gap-2" xs={12} md={4} spacing={4}>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-file-text-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Offer: {Array.isArray(item.offer) ? item.offer.length : 0}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-group-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Partner: {Array.isArray(item.offer) ? item.offer.length : 0}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-gradienter-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Status: {item.status}
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
                          Retainers Generated: {item.retainers}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 pb-1'>
                      <i className="ri-refresh-line h-5 w-5 text-muted-foreground" />
                      <div className='flex items-center flex-wrap gap-2 text-sm text-muted-foreground'>
                        <span className="text-sm text-muted-foreground">
                          Return Rates: {item.return_rate}%
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
     <Dialog
  open={open}
  scroll="paper"
  onClose={() => {
    setAdvertiser(undefined)
    setContract(undefined)
    setOpen(false)
  }}
  maxWidth='sm'
  fullWidth
  aria-labelledby='max-width-dialog-title'>
  <Grid container className="scrollbar-custom overflow-y-auto p-4">
    <Grid item lg={12} md={12}>
      {advertiser && (
        <CardContent className='flex flex-col gap-6'>
          <Grid container spacing={4}>
            {/* Left side: Avatar and basic info */}
            <Grid item lg={5} md={5} xs={12} className="flex flex-col items-center">
              <div className='flex flex-col gap-6'>
                <CustomAvatar
                  alt='user-profile'
                  src={advertiser?.Avatar || '/images/avatars/default.png'}
                  variant='rounded'
                  size={120}
                />
                <Typography variant='h5' className='font-semibold'>{advertiser?.Username}</Typography>
                <Typography variant='subtitle1' color="text.secondary">{advertiser?.Title}</Typography>
                <Chip label={advertiser?.AccountType} color='primary' size='small' variant='tonal' />
              </div>
            </Grid>

            {/* Right side: Detailed information */}
            <Grid item lg={7} md={7} xs={12}>
              <div className='flex flex-col gap-4'>
                <Typography variant='h5' className='font-semibold'>Details</Typography>
                <Divider className='mb-4' />

                <div className='flex items-center gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Username:
                  </Typography>
                  <Typography>{advertiser?.Username}</Typography>
                </div>

                <div className='flex items-center gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Account Type:
                  </Typography>
                  <Typography>{advertiser?.AccountType}</Typography>
                </div>

                <div className='flex items-center gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Price:
                  </Typography>
                  <Typography>{advertiser?.Price}</Typography>
                </div>

                <div className='flex items-center gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Created At:
                  </Typography>
                  <Typography>{new Date(advertiser?.CreatedAt).toLocaleString()}</Typography>
                </div>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      )}
    </Grid>
  </Grid>
</Dialog>

    </>
  )
})

export default DetailView;
