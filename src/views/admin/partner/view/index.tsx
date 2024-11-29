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
  const [event, setEvent] = useState<AdvertiserType | undefined>(undefined)
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
      const response = await fetch(`/api/admin/events?id=${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch advertiser data:', response.statusText);
        setEvent(null);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { event: advertiserData } = await response.json();
      if (!advertiserData) {
        console.error('Advertiser not found');
        setEvent(null);
      } else {
        console.log(advertiserData, "=========advertiser data");
        setEvent(advertiserData);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
   <Dialog
  open={open}
  scroll="paper"
  onClose={() => {
    setEvent(undefined);
    setContract(undefined);
    setOpen(false);
  }}
  maxWidth='lg'
  fullWidth
  aria-labelledby='event-dialog-title'>
  <Grid container className="scrollbar-custom overflow-y-auto p-6">
    <Grid item lg={12} md={12}>
      {event && (
        <CardContent className='flex flex-col gap-6'>
          <Grid container spacing={4}>
            {/* Left side: Event Image and Title */}
            <Grid item lg={5} md={5} xs={12} className="flex flex-col items-center">
              <div className="flex flex-col gap-6 items-center">
                <img
                  src={event?.CoverImageUrl || '/images/default-event.png'}
                  alt='event-cover'
                  className="w-full rounded-lg shadow-lg"
                />
                <Typography variant='h4' className='font-semibold mt-4'>{event?.Name}</Typography>
                <Typography variant='body1' color="text.secondary" className='text-center'>{event?.Venue}</Typography>
                <Chip label={event?.Category} color='primary' size='small' variant='outlined' className="mt-2" />
              </div>
            </Grid>

            {/* Right side: Event Details */}
            <Grid item lg={7} md={7} xs={12}>
              <div className='flex flex-col gap-6'>
                <Typography variant='h5' className='font-semibold'>Event Details</Typography>
                <Divider className='mb-4' />

                <div className='flex flex-col gap-4'>
                  <Typography variant='h6' className='font-medium'>Description</Typography>
                  <div
                    className='text-sm'
                    dangerouslySetInnerHTML={{ __html: event?.Description }}
                  />
                </div>

                <div className='flex flex-col gap-4'>
                  <Typography variant='h6' className='font-medium'>Email Description</Typography>
                  <div
                    className='text-sm'
                    dangerouslySetInnerHTML={{ __html: event?.EmailDescription }}
                  />
                </div>

                <div className='flex items-center gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Start Time:
                  </Typography>
                  <Typography>{new Date(event?.StartTime).toLocaleString()}</Typography>
                </div>

                <div className='flex items-center gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    End Time:
                  </Typography>
                  <Typography>{new Date(event?.EndTime).toLocaleString()}</Typography>
                </div>

                <div className="flex flex-col gap-4">
                  <Typography variant='h6' className='font-medium'>Images</Typography>
                  <Grid container spacing={2}>
                    {event?.Images?.map((image, index) => (
                      <Grid item xs={4} key={index}>
                        <img src={image} alt={`event-image-${index}`} className="w-full h-auto rounded-lg shadow-sm" />
                      </Grid>
                    ))}
                  </Grid>
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
