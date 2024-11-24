'use client'

import { useParams } from 'next/navigation'

import ViewInvoice from '@/views/admin/invoice/view'

const Recharts = () => {
  const {id} = useParams<{ id: string }>();

  
return (
    <>
      <ViewInvoice id={id} />
    </>
  )
}

export default Recharts