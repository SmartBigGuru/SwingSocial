'use client'
import { forwardRef, useImperativeHandle, useState } from "react";

import { CardContent,Card, Chip, Dialog, Divider, Grid, Typography, useMediaQuery } from "@mui/material";
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
  Images:any;
  EndTime:string;
  StartTime:string;
  EmailDescription:string;
  Description:string;
  Category:string;
  Venue:string;
  Name:string;
  CoverImageUrl:string;

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
  const [rsvp, setRSVP] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

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

  const fetchData = async (eventId: string) => {
    console.log(eventId, "======eventId in view");
    setLoading(true);

    try {
      // Fetch event data using the custom API
      const response = await fetch(`/api/admin/events?id=${eventId}`);
      if (!response.ok) {
        console.error('Failed to fetch event data:', response.statusText);
        setEvent(undefined);
        setRSVP([]);
        setAttendees([]);
        setTickets([]); // Clear tickets data in case of error
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { event, rsvp, attendees, tickets } = await response.json();
      if (!event) {
        console.error('Event not found');
        setEvent(undefined);
        setRSVP([]);
        setAttendees([]);
        setTickets([]); // Clear tickets data if event not found
      } else {
        console.log(event, "=========event data");
        setEvent(event);
        setRSVP(rsvp || []); // Set RSVP data if available
        setAttendees(attendees || []); // Set Attendees data if available
        setTickets(tickets || []); // Set Tickets data if available
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
  maxWidth="lg"
  fullWidth
  aria-labelledby="event-dialog-title"
>
  <Grid container className="scrollbar-custom overflow-y-auto p-6">
    <Grid item lg={12} md={12}>
      {event && (
        <CardContent className="flex flex-col gap-6">
          <Grid container spacing={4}>
            {/* Left side: Event Image, Title, RSVP, and Attendees */}
            <Grid item lg={5} md={5} xs={12} className="flex flex-col items-center">
              <div className="flex flex-col gap-6 items-center">
                <img
                  src={event?.CoverImageUrl || '/images/default-event.png'}
                  alt="event-cover"
                  className="w-full rounded-lg shadow-lg"
                />
                <Typography variant="h4" className="font-semibold mt-4">
                  {event?.Name}
                </Typography>
                <Typography variant="body1" color="text.secondary" className="text-center">
                  {event?.Venue}
                </Typography>
                <Chip
                  label={event?.Category}
                  color="primary"
                  size="small"
                  variant="outlined"
                  className="mt-2"
                />

                {/* RSVP Section */}
                <div className="w-full mt-6">
                  <Typography variant="h6" className="font-medium mb-2">
                    RSVP List
                  </Typography>
                  {rsvp.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {rsvp.map((user, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={user.Avatar}
                            alt={user.Username}
                            className="w-10 h-10 rounded-full object-cover shadow-md"
                          />
                          <Typography variant="body2">{user.Username}</Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No RSVP data available.
                    </Typography>
                  )}
                </div>

                {/* Attendees Section */}
                <div className="w-full mt-6">
                  <Typography variant="h6" className="font-medium mb-2">
                    Attendees List
                  </Typography>
                  {attendees.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {attendees.map((user, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <img
                            src={user.Avatar}
                            alt={user.Username}
                            className="w-10 h-10 rounded-full object-cover shadow-md"
                          />
                          <Typography variant="body2">{user.Username}</Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No attendees data available.
                    </Typography>
                  )}
                </div>
              </div>
            </Grid>

            {/* Right side: Event Details and Tickets */}
            <Grid item lg={7} md={7} xs={12}>
              <div className="flex flex-col gap-6">
                <Typography variant="h5" className="font-semibold">
                  Event Details
                </Typography>
                <Divider className="mb-4" />

                <div className="flex flex-col gap-4">
                  <Typography variant="h6" className="font-medium">Description</Typography>
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: event?.Description }}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Typography variant="h6" className="font-medium">Email Description</Typography>
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: event?.EmailDescription }}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Typography className="font-medium" color="text.primary">
                    Start Time:
                  </Typography>
                  <Typography>{new Date(event?.StartTime).toLocaleString()}</Typography>
                </div>

                <div className="flex items-center gap-4">
                  <Typography className="font-medium" color="text.primary">
                    End Time:
                  </Typography>
                  <Typography>{new Date(event?.EndTime).toLocaleString()}</Typography>
                </div>

                <div className="flex flex-col gap-4">
                  <Typography variant="h6" className="font-medium">Images</Typography>
                  <Grid container spacing={2}>
                    {event?.Images?.map((image:any, index:number) => (
                      <Grid item xs={4} key={index}>
                        <img
                          src={image}
                          alt={`event-image-${index}`}
                          className="w-full h-auto rounded-lg shadow-sm"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </div>

                {/* Ticket Section */}
                <div className="w-full mt-6">
                  <Typography variant="h6" className="font-medium mb-4">
                    Tickets
                  </Typography>
                  <Grid container spacing={3}>
                    {tickets.length > 0 ? (
                      tickets.map((ticket, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
                            <CardContent className="flex flex-col gap-4">
                              <Typography variant="h6" className="font-semibold">
                                {ticket.Name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Type: {ticket.Type}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Description: {ticket.Description || 'No description available'}
                              </Typography>
                              <Typography variant="body1" color="primary" className="font-medium">
                                Price: ${ticket.Price}
                              </Typography>
                              <Typography
                                variant="body2"
                                color={ticket.Quantity > 0 ? 'success.main' : 'error.main'}
                              >
                                Quantity: {ticket.Quantity > 0 ? `${ticket.Quantity} Available` : 'Sold Out'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tickets available for this event.
                      </Typography>
                    )}
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
