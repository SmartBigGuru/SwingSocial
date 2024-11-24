'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

import { Button, CircularProgress, Dialog, DialogActions, DialogTitle, Divider, TextField } from "@mui/material"

import { FourSquare } from "react-loading-indicators";

import { toast } from "react-toastify";

import { supabase } from "@/utils/supabase";


const Description = 'The Healthcare vertical encompasses a wide range of sectors and services dedicated to enhancing individual and public health, wellness, and medical care.This includes hospitals, clinics, and other healthcare providers who work to diagnose, treat, and prevent physical and mental illnesses.\nWithin this vertical, there’s also a significant emphasis on pharmaceutical companies, which research, develop, and distribute medications that play a critical role in treating and managing health conditions.\n In addition to healthcare providers and pharmaceuticals, this vertical includes services that support patient care, such as telemedicine, medical technology, and health informatics.Telemedicine offers remote medical consultations, \n improving access to care, especially in underserved areas, while advancements in medical technology and informatics help streamline operations, enhance diagnostic accuracy, and improve patient outcomes.\n This sector is driven by the constant evolution of healthcare standards, regulatory requirements, and an increasing focus on personalized medicine and preventative care.Through innovations in areas like artificial intelligence, \n biotechnology, and genomics, the healthcare vertical strives to deliver patient - centered care and improve healthcare accessibility, affordability, and effectiveness for individuals and communities alike.'

interface VerticalDataFromat {
  name: string
  summary: string
  description: string
}

export interface VerticalEditDialogHandle {
  open: (id: string) => void
}

interface RefreshVerticalListAction {
  refresh: () => void
}

const VerticalEditDialog = forwardRef<VerticalEditDialogHandle, RefreshVerticalListAction>((props, ref) => {
  const { refresh } = props;
  const [id, setID] = useState<string | null>(null)
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState<VerticalDataFromat | null>(null);

  useImperativeHandle(ref, () => ({ open: (id) => openDialog(id) }))

  const openDialog = (id: string) => {
    setID(id)
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)

    const fetchData = async () => {
      try {
        const query = supabase
          .from('verticals')
          .select(`*`)
          .eq('vertical_id', id)
          .single()

        const { data, error } = await query

        if (error)
          throw error

        setData(data)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const updateVertical = async () => {
    setUploading(true)

    try {
      const { data: newVetical, error: uploadingError } = await supabase
        .from('verticals')
        .update(data)
        .eq('vertical_id', id);

      if (uploadingError) throw uploadingError
      setID(null)
      refresh();
    } catch (error: any) {
      toast.error(`${error.message}`, {
        autoClose: 3000,
        type: 'error'
      })
    } finally {
      setUploading(false)
      setID(null)
    }
  }

  return (
    <>
      {id && data &&
        (
          <Dialog
            open={true}
            maxWidth='md'
            fullWidth
            aria-labelledby='max-width-dialog-title'
          >
            {!loading && (<>
              <DialogTitle>Edit Vertical</DialogTitle>
              <Divider />
              <div className="scrollbar-custom overflow-y-auto">
                <div className='flex flex-col gap-6 p-5 '>
                  <div className='flex flex-col gap-4'>
                    <TextField
                      fullWidth
                      label='Title'
                      onChange={e => setData({ ...data, name: e.target.value })}
                      value={data.name}
                    />
                  </div>

                  <div className='flex flex-col gap-4'>
                    <TextField
                      fullWidth
                      label='Summary'
                      onChange={e => setData({ ...data, summary: e.target.value })}
                      value={data.summary}
                    />
                  </div>
                  <Divider />

                  <div className='flex flex-col gap-4'>
                    <TextField
                      fullWidth
                      rows={6}
                      multiline
                      variant='filled'
                      label='Description'
                      onChange={e => setData({ ...data, description: e.target.value })}
                      value={data.description}
                      className='scrollbar-custom'
                    />
                  </div>
                </div>
              </div>
              <Divider />
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

            <DialogActions className='justify-center pbs-0 sm:pbe-6 sm:pli-6'>
              <Button variant='contained' className="mt-6" onClick={updateVertical} type='button' color='error'>
                {uploading ? <CircularProgress color="inherit" size={20} className="mr-2"/> : null}
                Submit
              </Button>
              <Button variant='contained' className="mt-6" onClick={() => setID(null)} type='button'>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        )
      }
    </>
  )

}
)

export default VerticalEditDialog
