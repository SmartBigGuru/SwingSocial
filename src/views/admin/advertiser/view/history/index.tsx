'use client'

// React Imports
import { Fragment, useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'

// Type Imports
import type { ThemeColor } from '@core/types'

type TimelineItemData = {
    name: string
    address: string
}

const Timeline = styled(MuiTimeline)<TimelineProps>({
    paddingLeft: 0,
    paddingRight: 0,
    '& .MuiTimelineItem-root': {
        width: '100%',
        '&:before': {
            display: 'none'
        }
    },
    '& .MuiTimelineDot-root': {
        border: 0,
        padding: 0
    }
})

const HistoryViewHandle = (props: any) => {
    // States

    const [historyData, setHistoryData] = useState([]);

    const handleClose = () => {
        props.setOpen(false)
    }

    const fetchData = async (userId: string) => {
        console.log(userId, "======userId in view");
        try {
            let query = '/api/admin/user/history?'
            const params = new URLSearchParams();

            if (userId) params.append('id', userId);

            const apiUrl = `${query}${params}`

            console.log(apiUrl);
            const response = await fetch(apiUrl)

            if (!response.ok) {
                console.error('Failed to get the history data:', response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setHistoryData(data.history);

            console.log(data)

        }
        catch (error: any) {
            console.error('Error fetching data:', error.message);
        }
    }

    useEffect(() => {
        console.log(props.profileId)
        setHistoryData([]);
        fetchData(props.profileId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.open])

    return (
        <Dialog open={props.open} onClose={handleClose}>
            <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                {'Profile History'}
                <Typography component='span' className='flex flex-col text-center'>
                    {'Subscription History for the Profile'}
                </Typography>
            </DialogTitle>
            <CardContent>
                {historyData && historyData.length > 0 ? (
                    historyData.map((item: any, index: number) => (
                        <Fragment key={index}>
                            <Timeline>
                                <TimelineItem>
                                    <TimelineSeparator>
                                        <TimelineDot variant='outlined' className='mlb-0'>
                                            <i className='ri-checkbox-circle-line text-xl text-success' />
                                        </TimelineDot>
                                        {/* Only show the connector if it's not the last item */}
                                        {index < historyData.length - 1 && <TimelineConnector />}
                                    </TimelineSeparator>
                                    <TimelineContent className='flex flex-col gap-0.5 pbs-0 pis-5 pbe-5'>
                                        <Typography variant='caption' className='uppercase' color='success.main'>
                                            {new Date(item.CreatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit'
                                            })}
                                        </Typography>
                                        <Typography color='text.primary' className='font-medium'>
                                            {item.Username}
                                        </Typography>
                                        <Typography variant='body2' className='line-clamp-1'>
                                            {item.Modification}
                                        </Typography>
                                    </TimelineContent>
                                </TimelineItem>
                            </Timeline>
                        </Fragment>
                    ))
                ) : (
                    <Typography variant='body1' className='text-center'>
                        No history data
                    </Typography>
                )}
            </CardContent>
        </Dialog>
    )
}

export default HistoryViewHandle
