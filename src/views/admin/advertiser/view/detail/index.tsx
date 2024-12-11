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
  CreatedAt:string;
  Price:string;
  AccountType:string;
  Username:string;
  Avatar:string;
  Title:string;
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
  const [advertiser, setAdvertiser] = useState<any>({})
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
        setAdvertiser(undefined);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { user: advertiserData } = await response.json();
      if (!advertiserData) {
        console.error('Advertiser not found');
        setAdvertiser(undefined);
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

  return (
    <>
  <Dialog
  open={open}
  scroll="paper"
  onClose={() => {
    setAdvertiser(undefined);
    setContract(undefined);
    setOpen(false);
  }}
  maxWidth="lg"
  fullWidth
  aria-labelledby="user-profile-dialog"
>
  <div className="relative">
    {/* Banner Section */}
    <div
      className="h-48 w-full bg-cover bg-center"
      style={{
        backgroundImage: `url(${advertiser?.ProfileBanner || '/images/banners/default-banner.jpg'})`,
      }}
    >
    </div>

    {/* Avatar and Basic Info */}
    <div className="relative -mt-16 px-6">
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <img
            src={advertiser?.Avatar || '/images/avatars/default-avatar.png'}
            alt="user-avatar"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="text-white mt-4">
          <Typography variant="h4" className="font-semibold" style={{color:'white'}}>
            {advertiser?.Username || 'Unknown User'}
          </Typography>
          <Typography variant="subtitle1" className="opacity-90">
            {advertiser?.Tagline || 'No tagline available'}
          </Typography>
          <Chip
            label={advertiser?.AccountType || 'N/A'}
            color="primary"
            size="small"
            variant="filled"
          />
        </div>
      </div>
    </div>

    {/* Content Section */}
    <CardContent className="mt-8">
    <Typography variant="subtitle1">
            Email:   <Typography variant="subtitle1" className="opacity-90">
            {advertiser?.Email || 'Email not provided'}
          </Typography>
          </Typography>
          <Typography variant="subtitle1">
            Subscription:   <Chip
            label={advertiser?.Subscription || 'N/A'}
            color={advertiser?.Subscription == "FreeUser" ?  "primary":"success"}
            size="small"
            variant="filled"
            sx={{mb:1}}
          />
          </Typography>
      <Grid container spacing={4}>
        {/* Left Column: Overview Section */}

        <Grid item lg={4} md={5} xs={12}>
          <div className="flex flex-col gap-6 bg-gray-50 p-4 rounded-lg shadow-sm">
            <Typography variant="h6" className="font-semibold">
              Profile Overview
            </Typography>
            <Divider />
            <div>
              <Typography variant="body2" color="textSecondary">
                Location:
              </Typography>
              <Typography variant="body1">{advertiser?.Location || 'Not provided'}</Typography>
            </div>
            <div>
              <Typography variant="body2" color="textSecondary">
                Sexual Orientation:
              </Typography>
              <Typography variant="body1">{advertiser?.SexualOrientation || 'N/A'}</Typography>
            </div>
            <div>
              <Typography variant="body2" color="textSecondary">
                Gender:
              </Typography>
              <Typography variant="body1">{advertiser?.Gender || 'Not specified'}</Typography>
            </div>
          </div>
        </Grid>

        {/* Right Column: Detailed Information */}
        <Grid item lg={8} md={7} xs={12}>
          <div className="flex flex-col gap-6">
            <div>
              <Typography variant="h6" className="font-semibold">
                Personal Details
              </Typography>
              <Divider className="mb-4" />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Body Type:
                  </Typography>
                  <Typography>{advertiser?.BodyType || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Hair Color:
                  </Typography>
                  <Typography>{advertiser?.HairColor || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Eye Color:
                  </Typography>
                  <Typography>{advertiser?.EyeColor || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Miles:
                  </Typography>
                  <Typography>{advertiser?.miles?.toFixed(2) || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </div>

            <div>
              <Typography variant="h6" className="font-semibold">
                Preferences
              </Typography>
              <Divider className="mb-4" />
              <Typography>{advertiser?.About || 'No additional information provided.'}</Typography>
              <div className="mt-4">
                <Typography variant="body2" color="textSecondary">
                  Swing Style Tags:
                </Typography>
                <Typography>
                  {advertiser?.SwingStyleTags?.join(', ') || 'No preferences listed.'}
                </Typography>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </CardContent>
  </div>
</Dialog>



    </>
  )
})

export default DetailView;
