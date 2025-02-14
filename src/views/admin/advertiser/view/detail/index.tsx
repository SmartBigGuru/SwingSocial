'use client'
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { CardContent, Chip, Dialog, Divider, Grid, Popover, Typography, useMediaQuery } from "@mui/material";

import type { Theme } from "@mui/material/styles/createTheme";

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
  const [openPopOver, setOpenPopOver] = useState(false);
  const [loading, setLoading] = useState(false)
  const [advertiser, setAdvertiser] = useState<any>({})
  const [phone, setPhone] = useState("")
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


  const deleteImage = async (data: any) => {
    console.log(data, "======data in deleteImage");
    await fetch(`/api/admin/deleteImage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: data, userId: advertiser?.Id }),
    });
    setOpen(false)
    setOpenPopOver(false)
    setLoading(true);

  }

  useEffect(() => {
    if (open && refresh) {
      refresh()
      
    }
  }, [loading])

  const fetchData = async (userId: string) => {
    // console.log(userId, "======userId in view", advertiser.Id);
    setLoading(true);

    try {
      //Fetch the Phone
      const phoneResponse = await fetch(`/api/admin/getphone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      const data = await phoneResponse.json();
      if(data.status == 200){
        console.log(data, "=========data in getPhone");
        setPhone(data.phone);
      }
      

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
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg" onMouseOver={() => {setOpenPopOver(!openPopOver); console.log("openPopOver", openPopOver)}} >
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
          <div className="flex flex-col gap-6 p-4 rounded-lg shadow-sm">
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
                Phone:
              </Typography>
              <Typography variant="body1">{phone || 'Not provided'}</Typography>
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
              <div>
            <Typography>
              {advertiser?.About
                ? advertiser.About.replace(/<\/?[^>]+(>|$)/g, "")
                : 'No additional information provided.'}
            </Typography>
          </div>
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
<Popover
  open={openPopOver}
  onClose={() => setOpenPopOver(false)}
  anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
  transformOrigin={{ vertical: 'center', horizontal: 'center' }}
>
  <div
    style={{
      width: '60vh',
      height: '60vh',
      position: 'relative',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      backgroundColor: '#fff',
      display: 'flex', // Flexbox for alignment
      flexDirection: 'column', // Stack elements vertically
      justifyContent: 'center', // Center content vertically
      alignItems: 'center', // Center content horizontally
    }}
  >
    {/* Close Button */}

    {/* Image */}
    <h1>Avatar</h1>
    <div
      style={{
        width: '50%',
        height: '50%',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #ddd',
      }}
    >
      <img
        src={advertiser?.Avatar || '/images/avatars/default-avatar.png'}
        alt="user-avatar"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
    </div>
    <button
      onClick={() => deleteImage("avatar")}
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#333',
        padding: '5px 10px',
        borderRadius: '10px 10px 10px',
        backgroundColor: '#eb0d72b3'
      }}
    >
      Delete Avatar
    </button>
  </div>
  <div
    style={{
      width: '60vh',
      height: '60vh',
      position: 'relative',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      backgroundColor: '#fff',
      display: 'flex', // Flexbox for alignment
      flexDirection: 'column', // Stack elements vertically
      justifyContent: 'center', // Center content vertically
      alignItems: 'center', // Center content horizontally
    }}
  >
    {/* Close Button */}


    {/* Image */}
    <h1>Profile Banner</h1>
    <div
      style={{
        width: '50%',
        height: '50%',
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid #ddd',
      }}
    >
      
    
      <img
        src={advertiser?.ProfileBanner || '/images/avatars/default-avatar.png'}
        alt="user-avatar"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
    </div>
    <button
      onClick={() => deleteImage("profilebanner")}
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#333',
        padding: '5px 10px',
        borderRadius: '10px 10px 10px',
        backgroundColor: '#eb0d72b3'
      }}
    >
      Delete Profile Banner
    </button>
  </div>
</Popover>
  </>
  )
})

export default DetailView;
