'use client'

import { forwardRef, useImperativeHandle, useState } from "react"

import { Avatar, AvatarGroup, Chip, Dialog, DialogTitle, Divider, Grid, LinearProgress, Tooltip, Typography } from "@mui/material"

import { FourSquare } from "react-loading-indicators";

import classNames from "classnames";

import { supabase } from "@/utils/supabase";

export interface ContractDialogHandle {
  open: (contractId: string) => void;
}

interface CompanyType {
  company_name: string;
}

interface AdvertiserType {
  type?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  companies: CompanyType;
}

interface VerticalType {
  name?: string;
}

interface PartnerType {
  name?: string;
  email?: string;
  phone?: string;
}

interface OfferType {
  offer_name?: string;
  budget?: number;
  used?: number;
  partner?: PartnerType;
}

interface AssignType {
  budget: number;
  start_date: Date;
  end_date: Date;
  status: string;
  partners?: PartnerType;
}

interface ContractType {
  status: string;
  contract_name?: string;
  contract_id?: string;
  start_date?: Date;
  end_date?: Date;
  payment_term?: string;
  budget_limit: number;
  contract_term?: string;
  advertisers?: AdvertiserType;
  verticals?: VerticalType;
  offer?: OfferType[];
  assigns: AssignType[];
}

const ContractDetailDialog = forwardRef<ContractDialogHandle>(({ }, ref) => {

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false)

  const [contract, setContract] = useState<ContractType | undefined>(undefined)

  useImperativeHandle(ref, () => ({
    open: (contractId) => {
      setOpen(true)
      loadContract(contractId)
    }
  }))

  const loadContract = (contractId: string) => {
    if (!contractId) return
    setLoading(true)

    const fetchContract = async () => {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select(`*,
          advertisers (*,
            companies (company_name)
          ),
          verticals (*),
          offers (*),
          assigns (*, partners (*))
          `)
          .eq('contract_id', contractId)
          .single()

        if (error) throw error

        console.log(data)
        setContract(data)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
        }
        }
        maxWidth='sm'
        fullWidth
        aria-labelledby='max-width-dialog-title'
      >
        {!loading && contract && (<>
          <DialogTitle>
            <Typography className="text-lg" color='text.primary'>
              {contract.contract_name}
            </Typography>
            <Typography component='span'>
              Contract ID: CTR-0{contract.contract_id}
            </Typography>
            <Chip
              variant='tonal'
              label={contract.status}
              size='small'
              color={
                contract.status === 'Active' ? 'success' :
                  contract.status === 'Pending' ? 'primary' :
                    'warning'
              }
              className='absolute top-6 right-6'
            />
          </DialogTitle>
          <Divider className="mx-6" />

          <Grid container className="px-6 py-3" spacing={3}>
            <Grid item md={12} xs={12}
              className={classNames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie': true,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': false
              })}>

              {/* advertiser */}
              <Typography variant="h5" color='text.primary'>
                Advertiser
              </Typography>
              <Typography className="text-muted-foreground">
                Company: {contract.advertisers?.companies.company_name}
              </Typography>
              <Typography className="text-muted-foreground">
                Name: {contract.advertisers?.first_name + '' + contract.advertisers?.last_name}
              </Typography>
              <Typography className="text-muted-foreground">
                Email: {contract.advertisers?.email}
              </Typography>
              <Typography className="text-muted-foreground">
                Phone: {contract.advertisers?.phone}
              </Typography>

              {/* vertical */}
              <Typography variant='h5' color='text.primary' className="pt-2">
                Vertical (Case of Type)
              </Typography>
              <Typography className="text-muted-foreground">
                {contract.verticals?.name}
              </Typography>

              {/* contract duration */}
              <Typography variant='h5' color='text.primary' className="pt-2">
                Contract Duration
              </Typography>
              <div className='mb-2'>
                <Grid container >
                  <Grid item md={4} xs={6}>
                    <Typography className="text.primary mr-6" >
                      From: {String(contract.start_date)}
                    </Typography>
                  </Grid>
                  <Grid item md={5} xs={6}>
                    <Typography className="text.primary">
                      To: {String(contract.end_date)}
                    </Typography>
                  </Grid>
                </Grid>
              </div>
              <Typography variant='h5' color='text.primary '>
                Performance Metrics
              </Typography>
              <LinearProgress
                color='primary'
                value={Math.floor(
                  contract.assigns?.filter((assing: { budget: number }) => assing.budget)
                    .reduce((sum, assign) => sum + assign.budget, 0) /
                  contract.budget_limit *
                  100
                )}
                variant='determinate'
                className='is-full bs-2 mt-1'
              />
              <div>
                <Grid container >
                  <Grid item md={4} xs={12}>
                    <Typography className="text-muted-foreground">
                      Budget: ${contract.budget_limit}
                    </Typography>
                    <Typography className="text-muted-foreground">
                      Utilization: {
                        (contract.assigns?.filter((assing: { budget: number }) => assing.budget)
                          .reduce((sum, assign) => sum + assign.budget, 0) /
                          contract.budget_limit *
                          100).toFixed(1)
                      }%
                    </Typography>
                  </Grid>
                  <Grid item md={5} xs={12}>
                    <Typography className="text-muted-foreground">
                      Retainers Generated: 45
                    </Typography>
                    <Typography className="text-muted-foreground">
                      Return Rates: 5%
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            </Grid>
            <Grid item md={12} xs={12} >
              <Typography variant='h5' color='text.primary'>
                Assigned Partner
              </Typography>
              <div className="scrollbar-custom">

                <AvatarGroup className='pull-up' >
                  {
                    contract && contract.assigns.map((assign, index) => (
                      <Tooltip key={index} title={(
                        <>
                          <Typography variant="body2" color={'var(--mui-palette-background-paper)'}>Name: {assign.partners?.name}</Typography>
                          <Typography variant="body2" color={'var(--mui-palette-background-paper)'}>Email: {assign.partners?.email}</Typography>
                          <Typography variant="body2" color={'var(--mui-palette-background-paper)'}>Phone: {assign.partners?.phone}</Typography>
                          <Typography variant="body2" color={'var(--mui-palette-background-paper)'}>Allocated: ${assign.budget}</Typography>
                          <Typography variant="body2" color={'var(--mui-palette-background-paper)'}>Start: {String(assign.start_date)}</Typography>
                          <Typography variant="body2" color={'var(--mui-palette-background-paper)'}>End: {String(assign.end_date)}</Typography>
                          <Typography variant="body2" color={'var(--mui-palette-background-paper)'}>Status: {String(assign.status)}</Typography>
                        </>
                      )}
                        arrow>
                        <Avatar src='/images/avatars/4.png' alt='Olivia Sparks' />
                      </Tooltip>
                    ))
                  }
                  <Tooltip title='Howard Lloyd'>
                    <Avatar src='/images/avatars/5.png' alt='Howard Lloyd' />
                  </Tooltip>
                  <Tooltip title='Hallie Richards'>
                    <Avatar src='/images/avatars/6.png' alt='Hallie Richards' />
                  </Tooltip>
                  <Tooltip title='Alice Cobb'>
                    <Avatar src='/images/avatars/8.png' alt='Alice Cobb' />
                  </Tooltip>
                  <Tooltip title='Jeffery Warner'>
                    <Avatar src='/images/avatars/7.png' alt='Jeffery Warner' />
                  </Tooltip>
                </AvatarGroup>
              </div>
            </Grid>
          </Grid>

        </>
        )}

        {loading && (
          <>
            <DialogTitle />
            <div className="text-center">
              <FourSquare color="#32cd32" size="medium" text="loading.." textColor="#c34242" />
            </div>
          </>
        )}
      </Dialog>
    </>
  )


})

export default ContractDetailDialog
