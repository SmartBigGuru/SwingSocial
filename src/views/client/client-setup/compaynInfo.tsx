/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from "react"

import { Button, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, InputAdornment, TextField, Tooltip, Typography } from "@mui/material"

import type { User } from "@supabase/supabase-js"

import { toast } from "react-toastify"

import { Commet } from "react-loading-indicators"

import CustomIconButton from "@/@core/components/mui/IconButton"
import { supabase } from "@/utils/supabase"

type CompanyInfoType = {
  advertiser_id: string
  company_name: string
  company_address: string
  company_phone: string
  company_url: string
}

interface CompanyInfoPropsType {
  userInfo?: User | null;
}

const CompanyInfo: React.FC<CompanyInfoPropsType> = ({ userInfo }) => {

  const [companyInfoEditable, setCompanyInfoEditable] = useState(false)
  const [companyInfoExist, setCompanyInfoExist] = useState(false);
  const [companyDataProcessing, setCompanyDataProcessing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoType | null>(null);
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null | undefined>(null);
  const [formDataError, setFormDataError] = useState(false)

  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_url: ''
  })

  useEffect(() => {
    if (userInfo)
      setUser(userInfo);
  }, [userInfo]);

  useEffect(() => {
    if (user === null) return

    const getCompanyInfo = async (user_id: string) => {
      setLoading(true)
      console.log(user_id)

      try {
        const { data, error } = await supabase
          .from('advertisers')
          .select(`*,companies (*)`)
          .eq('auth_id', user_id)
          .single()

        if (error)
          throw error

        if (data) {
          setCompanyInfoExist(true)
          setCompanyInfo(data.companies)
          setFormData({
            company_name: data.company_name,
            company_address: data.company_address,
            company_phone: data.company_phone,
            company_url: data.company_url,
          })
        }

        setLoading(false)
      } catch (error: any) {
        console.error('Error fetching session:', error.message);
        setCompanyInfo(null);
        setCompanyInfoExist(false)
      }
    }

    if (user)
      getCompanyInfo(user.id)
  }, [user])

  const EditCompanyInfo = () => {

    return (
      <>
        {!companyInfoEditable &&
          <div>
            <Tooltip
              title={
                <Typography variant='body2' component='span' className='text-inherit'>
                  {companyInfoExist ? 'Change CompanyInfo' : 'Insert CompanyInfo'}
                </Typography>
              }>
              <CustomIconButton aria-label='edit company'
                variant='outlined'
                color={companyInfoEditable ? 'secondary' : 'success'}
                onClick={() => setCompanyInfoEditable(true)}>
                <i className={companyInfoExist ? 'ri-edit-line' : 'ri-add-line'} />
              </CustomIconButton >
            </Tooltip>
          </div>
        }
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (formData.company_address == '' || formData.company_name == '' || formData.company_phone == '' || formData.company_url == '') {
      setFormDataError(true)

      return null
    } else
      setFormDataError(false)
    setCompanyDataProcessing(true)

    try {
      const companyData = {
        advertiser_id: user.id,
        company_name: formData.company_name,
        company_address: formData.company_address,
        company_phone: formData.company_phone,
        company_url: formData.company_url,
      };

      let error;

      if (!companyInfoExist) {
        ({ error } = await supabase
          .from('companies')
          .insert(companyData));
      } else {
        ({ error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('advertiser_id', user.id));
      }

      if (error) throw error;

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select("*")
        .eq('advertiser_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (data && isCompanyDataEqual(data, formData)) {
        setCompanyInfo(data);

        if (companyInfoExist) {
          toast.success(`Updated CompanyInfo`, {
            autoClose: 3000,
            type: 'success'
          })
        } else {
          setCompanyInfoExist(true);
          toast.success(`Inserted CompanyInfo`, {
            autoClose: 3000,
            type: 'success'
          })
        }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setCompanyInfoEditable(false);
      setCompanyDataProcessing(false)
    }
  };

  const isCompanyDataEqual = (data: any, formData: any) => (
    data.company_name === formData.company_name &&
    data.company_address === formData.company_address &&
    data.company_phone === formData.company_phone &&
    data.company_url === formData.company_url
  );

  return (
    <Card>
      <CardHeader title='Company Info' action={<EditCompanyInfo />} />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12} textAlign={'center'}>
              <img
                src='/images/apps/company/company2.png'
                className='max-md:hidden is-72 mx-auto'
                alt='john image'
              />
            </Grid>
            <Grid item xs={0} sm={2} />
            {loading && (
              <Grid item xs={12} sm={12}>
                <div className="text-center">
                  <Commet color="#3bcde4" size="medium" text="" textColor="" />
                </div>
              </Grid>
            )}
            {
              companyInfo && (
                <>
                  <Grid item xs={12} sm={12} >
                    <div hidden={companyInfoEditable}>
                      <span>
                        <Typography className='font-extrabold text-lg select-none' >
                          Company Name:
                        </Typography>
                        <Typography color='text.primary' className='select-none text-lg' >{companyInfo?.company_name}</Typography>
                      </span>
                    </div>
                    <div hidden={!companyInfoEditable}>
                      <TextField
                        fullWidth
                        label='Company Name'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='ri-bank-line' />
                            </InputAdornment>
                          )
                        }}
                        placeholder='Berkshire'
                        value={formData.company_name}
                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                        {...formData.company_name === "" && formDataError && { error: true, helperText: 'This field is required' }}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <div hidden={companyInfoEditable}>
                      <span>
                        <Typography className='font-extrabold text-lg select-none' >
                          Company Address:
                        </Typography>
                        <Typography color='text.primary' className='select-none text-lg'>{companyInfo?.company_address}</Typography>
                      </span>
                    </div>
                    <div hidden={!companyInfoEditable}>
                      <TextField
                        fullWidth
                        label='Company Address'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='ri-gps-line' />
                            </InputAdornment>
                          )
                        }}
                        placeholder='123 Main St, New York, NY 10001'
                        value={formData.company_address}
                        onChange={e => setFormData({ ...formData, company_address: e.target.value })}
                        {...formData.company_address === "" && formDataError && { error: true, helperText: 'This field is required' }}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <div hidden={companyInfoEditable}>
                      <span>
                        <Typography className='font-extrabold text-lg select-none' >
                          Company Phone:
                        </Typography>
                        <Typography color='text.primary' className='select-none text-lg'>{companyInfo?.company_phone}</Typography>
                      </span>
                    </div>
                    <div hidden={!companyInfoEditable}>
                      <TextField
                        fullWidth
                        label='Company Phone'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='ri-phone-fill' />
                            </InputAdornment>
                          )
                        }}
                        placeholder='+1 (917) 543-9876'
                        value={formData.company_phone}
                        onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                        {...formData.company_phone === "" && formDataError && { error: true, helperText: 'This field is required' }}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <div hidden={companyInfoEditable}>
                      <span>
                        <Typography className='font-extrabold text-lg select-none'>
                          Company URL:
                        </Typography>
                        <Typography color='text.primary' className='select-none text-lg'>{companyInfo?.company_url}</Typography>
                      </span>
                    </div>
                    <div hidden={!companyInfoEditable}>
                      <TextField
                        fullWidth
                        label='Company URL'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='ri-links-line' />
                            </InputAdornment>
                          )
                        }}
                        placeholder='https://rms-sepia.vercel.app/user/client/setup'
                        value={formData.company_url}
                        onChange={e => setFormData({ ...formData, company_url: e.target.value })}
                        {...formData.company_url === "" && formDataError && { error: true, helperText: 'This field is required' }}
                      />
                    </div>
                  </Grid>
                </>
              )}
          </Grid>
          <div hidden={!companyInfoEditable}>
            <Grid item xs={12} className='flex gap-4 flex-wrap my-4' >
              <Button variant='contained' type='submit' disabled={companyDataProcessing}>
                <CircularProgress thickness={5} variant={companyDataProcessing ? 'indeterminate' : 'determinate'} color='success' size={15} className="mr-2"/>
                Save Changes
              </Button>
              <Button
                variant='outlined'
                type='button'
                color='secondary'
                disabled={companyDataProcessing}
                onClick={() => setCompanyInfoEditable(false)} >
                Cancel
              </Button>
            </Grid>
          </div>
        </form>
      </CardContent>
    </Card >
  )
}

export default CompanyInfo
