'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import { useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import classnames from 'classnames'

// Third-party Imports
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'


import { Skeleton, TablePagination, Tooltip } from '@mui/material'

import { Parser } from "json2csv"

import { supabase } from '@/utils/supabase'


// Type Imports
import type { ThemeColor } from '@core/types'



// Util Imports

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import CustomIconButton from '@/@core/components/mui/IconButton'

import type { LeadsType } from './leadType'


// Style Imports

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type LeadsTypeWithAction = LeadsType & {
  action?: string
}

type LeadStatusType = {
  [key: string]: ThemeColor
}

type returnedStatusType = {
  [key: string]: ThemeColor
}

type retainedStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const leadStatusObj: LeadStatusType = {
  retained: 'primary',
  newLead: 'info',
  returned: 'success',
  contacting: 'warning'
}

const returnedStatusObj: returnedStatusType = {
  true: 'success',
  false: 'error',
}

const retainedStatusObj: retainedStatusType = {
  true: 'success',
  false: 'error',
}

const sampleData = [
  {
    lead_id: '3JX9ES',
    created_date: '02/03/2023',
    campaign: 'LDS',
    status: 'retained',
    first_name: 'Doug',
    last_name: 'Jones',
    email: 'doug@yahoo.com',
    phone: '(123) 123-3388',
    retained: true,
    retained_date: '02/14/2023',
    revenue: 3720.00,
    returned: false,
    return_date: null
  },
  {
    lead_id: '8DJS3J',
    created_date: '02/03/2023',
    campaign: 'Rideshare',
    status: 'newLead',
    first_name: 'Carl',
    last_name: 'Smith',
    email: 'carl@gmail.com',
    phone: '(347) 123-3388',
    retained: false,
    retained_date: null,
    revenue: null,
    returned: null,
    return_date: null
  },
  {
    lead_id: '4F2UU2',
    created_date: '02/03/2023',
    campaign: 'LDS',
    status: 'returned',
    first_name: 'Ken',
    last_name: 'Jones',
    email: 'ken@yahoo.com',
    phone: '(123) 123-3388',
    retained: true,
    retained_date: '02/03/2023',
    revenue: 3720.00,
    returned: true,
    return_date: '02/05/2023'
  },
  {
    lead_id: '3JX9ES',
    created_date: '02/30/2023',
    campaign: 'AFFF',
    status: 'retained',
    first_name: 'Jone',
    last_name: 'Smith',
    email: 'jone@yahoo.com',
    phone: '(408) 348-3483',
    retained: true,
    retained_date: '01/31/2023',
    revenue: 2300.00,
    returned: false,
    return_date: null
  }
]

// Column Definitions
const columnHelper = createColumnHelper<LeadsTypeWithAction>()

const LeadListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [searchData, setSearchData] = useState<any[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false);
  const [perPage, setPerpage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const searchParams = useSearchParams()

  // Hooks
  useEffect(() => {

    const fetchLeads = async () => {
      try {
        setLoading(true);

        const status = searchParams.get('status');
        const retained = searchParams.get('retained');
        const returned = searchParams.get('returned');
        const campaign = searchParams.get('campaign')
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query = supabase.from('leads').select('*', { count: 'exact' });

        const textColumns = [
          'lead_id', 'status',
          'first_name', 'last_name', 'email', 'phone'
        ]

        const dateColumns = ['created_date', 'retained_date', 'return_date']

        if (search) {
          query.or(textColumns.map(item => `${item}.ilike.%${search}%`).join(','));
        }

        if (status) query = query.eq('status', status)
        if (retained) query = query.eq('retained', retained === 'Yes' ? true : false)
        if (returned) query = query.eq('returned', returned === 'Yes' ? true : false)
        if (campaign) query = query.eq('campaign', campaign)

        if (startDate && endDate)
          query = query
            .gte('created_date', startDate)  // greater than or equal to start date
            .lte('created_date', endDate);
        query = query.range(pageIndex * perPage, (pageIndex + 1) * perPage - 1)
          .order('created_date', { ascending: false })
        const { data, count, error } = await query;

        if (error) throw error;
        setTotalCount(Number(count))
        setSearchData(data);
      } catch (error: any) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads()
  }, [perPage, pageIndex, searchParams])

  useEffect(() => {
    setPageIndex(0)
  }, [perPage, searchParams])

  const columns = useMemo<ColumnDef<LeadsTypeWithAction, any>[]>(
    () => [
      // {
      //   id: 'select',
      //   header: ({ table }) => (
      //     <Checkbox
      //     {...{
      //       checked: table.getIsAllRowsSelected(),
      //       indeterminate: table.getIsSomeRowsSelected(),
      //       onChange: table.getToggleAllRowsSelectedHandler()
      //     }}
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //     {...{
      //       checked: row.getIsSelected(),
      //       disabled: !row.getCanSelect(),
      //       indeterminate: row.getIsSomeSelected(),
      //       onChange: row.getToggleSelectedHandler()
      //     }}
      //     />
      //   )
      // },
      // columnHelper.accessor('lead_id', {
      //   header: 'Lead ID',
      //   cell: ({ row }) => <Typography>{row.original.lead_id}</Typography>
      // }),

      columnHelper.accessor('first_name', {
        header: 'First',
        cell: ({ row }) => (row.original.first_name !== null) && <Typography>{row.original.first_name}</Typography>
      }),
      columnHelper.accessor('last_name', {
        header: 'Last',
        cell: ({ row }) => (row.original.last_name !== null) && <Typography>{row.original.last_name}</Typography>
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (row.original.email !== null) && <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('created_date', {
        header: 'Created Date',
        cell: ({ row }) => (row.original.created_date !== null) && <Typography>{row.original.created_date}</Typography>
      }),
      columnHelper.accessor('campaign', {
        header: 'Campaign',
        cell: ({ row }) => (row.original.campaign !== null) && <Typography>{row.original.campaign}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (row.original.status !== null) && (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original.status}
              size='small'
              color={leadStatusObj[row.original.status]}
              className='capitalize'
            />
          </div>
        )
      }),

      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (row.original.phone !== null) && <Typography>{row.original.phone}</Typography>
      }),
      columnHelper.accessor('retained', {
        header: 'Retained',
        cell: ({ row }) => (row.original.retained !== null) && (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original.retained ? 'Yes' : 'No'}
              size='small'
              color={returnedStatusObj[String(row.original.retained)]}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('retained_date', {
        header: 'Retained Date',
        cell: ({ row }) => (row.original.retained_date !== null) && <Typography>{row.original.retained_date}</Typography>
      }),
      columnHelper.accessor('revenue', {
        header: 'Revenue',
        cell: ({ row }) => (row.original.revenue !== null) && <Typography>{`$${row.original.revenue}`}</Typography>
      }),
      columnHelper.accessor('returned', {
        header: 'Returned',
        cell: ({ row }) => (row.original.returned !== null) && (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original.returned ? 'Yes' : 'No'}
              size='small'
              color={retainedStatusObj[String(row.original.returned)]}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('return_date', {
        header: 'Returned Date',
        cell: ({ row }) => (row.original.return_date !== null) && <Typography>{row.original.return_date}</Typography>
      }),
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchData]
  )

  const table = useReactTable({
    data: searchData as any,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: perPage
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const columnCount = table.getVisibleFlatColumns().length;
  const skeletonTableRow = [];
  const skeletonTableRows = [];

  for (let i = 0; i < columnCount; i++) {
    skeletonTableRow.push(<td key={`td-${i}`}><Skeleton /></td>);
  }

  for (let i = 0; i < perPage; i++) {
    skeletonTableRows.push(<tr key={`tr-${i}`}>{skeletonTableRow}</tr>);
  }

  const ExpertLead = () => {
    const [isLoading, setIsDownload] = useState(false)

    const download = async () => {
      try {
        setIsDownload(true)
        const status = searchParams.get('status');
        const retained = searchParams.get('retained');
        const returned = searchParams.get('returned');
        const campaign = searchParams.get('campaign')
        const search = searchParams.get('search');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query = supabase.from('leads').select('*');

        const textColumns = [
          'lead_id', 'status',
          'first_name', 'last_name', 'email', 'phone'
        ]

        if (search) {
          query.or(textColumns.map(item => `${item}.ilike.%${search}%`).join(','));
        }

        if (status) query = query.eq('status', status)
        if (retained) query = query.eq('retained', retained === 'Yes' ? true : false)
        if (returned) query = query.eq('returned', returned === 'Yes' ? true : false)
        if (campaign) query = query.eq('campaign', campaign)

        if (startDate && endDate)
          query = query
            .gte('created_date', startDate)
            .lte('created_date', endDate);

        query = query.order('created_date', { ascending: false })
        const { data, error } = await query;
        const filteredData = data?.map(({ id, ...rest }) => rest) || [];

        const fields = [
          { label: 'Lead ID', value: 'lead_id' },
          { label: 'Created Date', value: 'created_date' },
          { label: 'Campaign', value: 'campaign' },
          { label: 'Status', value: 'status' },
          { label: 'First', value: 'first_name' },
          { label: 'Last', value: 'last_name' },
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Retained', value: 'retained' },
          { label: 'Retained Date', value: 'retained_date' },
          { label: 'Revenue', value: 'revenue' },
          { label: 'Returned', value: 'returned' },
          { label: 'Return Date', value: 'return_date' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(filteredData);

        const blob = new Blob([csv], {
          type: "text/plain;charset=utf-8"
        });

        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.download = "export.csv";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (error) throw error;
      } catch (error: any) {
        console.log(error.message);
      } finally {
        setIsDownload(false);
      }

    }

    return (
      <Tooltip title={
        <Typography variant='body2' component='span' className='text-inherit'>
          Download
        </Typography>
      }>
        <CustomIconButton aria-label='download data' color={isLoading ? 'info' : 'success'} disabled={isLoading} onClick={download}>
          <i className='ri-save-2-line' />
        </CustomIconButton>
      </Tooltip>)

  }

  return (
    <>
      <Card>
        <CardHeader title='Leads'
          action={<ExpertLead />}
        />

        <div className='scrollbar-custom overflow-x-auto '>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {
              loading ? (
                <>
                  <tbody>
                    {skeletonTableRows}
                  </tbody>
                </>) :
                table.getFilteredRowModel().rows.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                        No data available
                      </td>
                    </tr>
                  </tbody>
                ) :
                  (
                    <tbody className='scrollbar-custom overflow-y-scroll '>
                      {table
                        .getRowModel()
                        .rows
                        .map(row => {
                          return (
                            <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                              ))}
                            </tr>
                          )
                        })}
                    </tbody>
                  )}
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={totalCount}
          rowsPerPage={perPage}
          page={pageIndex}

          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            setPerpage(Number(e.target.value))
            table.setPageSize(Number(e.target.value))
            setPageIndex(0)
          }}
        />
      </Card>
    </>
  )
}

export default LeadListTable
