'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'

import { rankItem, type RankingInfo } from '@tanstack/match-sorter-utils'
import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type FilterFn } from '@tanstack/react-table'
import { Button, CardContent, FormControl, IconButton, InputLabel, MenuItem, Select, Skeleton, TablePagination, TextField, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'


import tableStyles from '@core/styles/table.module.css'
import OptionMenu from '@/@core/components/option-menu'
import Link from '@/components/Link'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { supabase } from '@/utils/supabase'
import type { ThemeColor } from '@/@core/types'
import InvoicetoPdf from '../export/export'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface AdvertiserType {
  first_name: string;
  last_name: string;
  email: string;
}

interface InvoiceType {
  invoice_id: string;
  issued_date: Date;
  retainer: number;
  total_amount: number;
  invoice_status: string;
  due_date: Date;
  paid_amount: number;
  payment_term: string;
  payment_status: string;
  advertisers: AdvertiserType;
  updated_date: Date;
}

type TableAction = InvoiceType & {
  action?: string
}

type InvoiceStatusObj = {
  [key: string]: {
    icon: string
    color: ThemeColor
  }
}

// Vars
const invoiceStatusObj: InvoiceStatusObj = {
  Sent: { color: 'secondary', icon: 'ri-send-plane-2-line' },
  Paid: { color: 'success', icon: 'ri-check-line' },
  Draft: { color: 'error', icon: 'ri-mail-line' },
  Received: { color: 'primary', icon: 'ri-mail-open-line' },
  Canceled: { color: 'secondary', icon: 'ri-mail-close-line' }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

export interface RefreshHandle {
  refresh: () => void
}

const columnHelper = createColumnHelper<TableAction>()

const InvoiceTable = forwardRef<RefreshHandle>(({ }, ref) => {

  const searchParams = useSearchParams()
  const [size, setSize] = useState(Number(searchParams.get('size') ?? 10));
  const [pageIndex, setPageIndex] = useState(Number(searchParams.get('page') ?? 0));
  const [totalCount, setTotalCount] = useState(0)
  const [invoiceStatus, setInvoiceStatus] = useState(searchParams.get('status') ?? '')
  const [searchString, setSearchString] = useState(searchParams.get('search') ?? '')
  const [searchData, setSearchData] = useState<InvoiceType[]>([])
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const changeParam = () => {
    const searchParams = new URLSearchParams()

    if (invoiceStatus) searchParams.set('status', invoiceStatus)
    if (searchString) searchParams.set('search', searchString)
    searchParams.set('size', String(size))
    searchParams.set('page', String(pageIndex))
    const queryString = searchParams.toString()

    router.push(`/admin/sp/invoice/${queryString ? `?${queryString}` : ''}`)
  }

  const fetchData = async () => {
    const sStatus = (searchParams.get('status') ?? '');
    const sSearch = (searchParams.get('search') ?? '');
    const sPage = (Number(searchParams.get('page') ?? 0))
    const sSize = (Number(searchParams.get('size') ?? 10))

    try {
      let query = supabase
        .from('invoices')
        .select(`*,
          advertisers (*)
          `, { count: 'exact' })
        .order('issued_date', { ascending: false })

      if (sStatus) query = query.eq('invoice_status', sStatus)
      if (sSearch) query = query.eq('invoice_id', sSearch)
      query = query.range(sPage * sSize, (sPage + 1) * sSize - 1)
      const { data: invoiceData, count: invoiceCount, error: invoiceError } = await query;

      if (invoiceError) throw invoiceError

      setSearchData(invoiceData)
      setTotalCount(invoiceCount ?? 0)
    } catch (error: any) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hooks
  useEffect(() => {
    changeParam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, pageIndex, invoiceStatus, searchString])

  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      fetchData()
    }, 500)

    setInvoiceStatus(searchParams.get('status') ?? '');
    setSearchString(searchParams.get('search') ?? '');
    setPageIndex(Number(searchParams.get('page') ?? 0))
    setSize(Number(searchParams.get('size') ?? 10))

    return () => clearTimeout(debouncedFetch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const columns = useMemo<ColumnDef<TableAction, any>[]>(
    () => [
      {
        id: 'id',
        header: ({ table }) => (
          <>#</>
        ),
        cell: ({ row }) => (
          <>#{row.original.invoice_id}</>
        )
      },
      columnHelper.accessor('invoice_status', {
        header: 'Status',
        cell: ({ row }) => {
          const date = new Date(row.original.updated_date).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })

          return (
            <Tooltip
              title={
                <div>
                  <Typography variant='body2' component='span' className='text-inherit'>
                    {row.original.invoice_status}
                  </Typography>
                  <br />
                  <Typography variant='body2' component='span' className='text-inherit'>
                    Update Date:
                  </Typography>{' '}
                  {date}
                </div>
              }
            >
              <CustomAvatar skin='light' color={invoiceStatusObj[row.original.invoice_status].color} size={28}>
                <i className={classNames('bs-4 is-4', invoiceStatusObj[row.original.invoice_status].icon)} />
              </CustomAvatar>
            </Tooltip>
          )
        }
      }),
      columnHelper.accessor('advertisers', {
        header: 'Advertiser',
        cell: ({ row }) => {

          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar color={'warning'} skin='light-static'>
                {(row.original.advertisers.first_name.charAt(0) + row.original.advertisers.last_name.charAt(0)).toUpperCase()}
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography className='font-medium' color='text.primary'>
                  {`${row.original.advertisers.first_name} ${row.original.advertisers.last_name}`}
                </Typography>
                <Typography variant='body2'>{row.original.advertisers.email}</Typography>

              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('total_amount', {
        header: 'Total Amount',
        cell: ({ row }) => <Typography>${Number(row.original.total_amount)}</Typography>
      }),
      columnHelper.accessor('issued_date', {
        header: 'Issued Date',
        cell: ({ row }) => {
          const date = new Date(row.original.issued_date).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })

          return <Typography>{date}</Typography>
        }
      }),
      columnHelper.accessor('due_date', {
        header: 'Due Date',
        cell: ({ row }) => {
          const date = new Date(row.original.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })

          return <Typography>{date}</Typography>
        }
      }),
      columnHelper.accessor('payment_term', {
        header: 'Payment Term',
        cell: ({ row }) => <Typography>{String(row.original.payment_term)}</Typography>
      }),
      columnHelper.accessor('paid_amount', {
        header: 'Paid Amount',
        cell: ({ row }) => <Typography>${String(row.original.paid_amount)}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link
                href={`/admin/sp/invoice/view/${row.original.invoice_id}`}
                className='flex'
              >
                <i className='ri-eye-line text-textSecondary' />
              </Link>
            </IconButton>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={
                row.original.invoice_status === 'Paid' || row.original.invoice_status === 'Canceled' ?
                  [
                    {
                      text: 'Download',
                      icon: 'ri-download-line',
                      menuItemProps: {
                        onClick: () => {
                          InvoicetoPdf(row.original.invoice_id)
                        },
                        className: 'flex items-center gap-2'
                      }
                    }
                  ] :
                  [
                    {
                      text: 'Download',
                      icon: 'ri-download-line',
                      menuItemProps: {
                        onClick: () => {
                          InvoicetoPdf(row.original.invoice_id)
                        },
                        className: 'flex items-center gap-2'
                      }
                    },
                    {
                      text: 'Edit',
                      icon: 'ri-pencil-line',
                      href: `/admin/sp/invoice/edit/${row.original.invoice_id}`,
                      linkProps: {
                        className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
                      }
                    }
                  ]
              }
            />
          </div>
        ),
        enableSorting: false,
        enablePinning: true,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        enableHiding: false,
        enableResizing: false,
      })
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchData]
  )

  const table = useReactTable({
    data: searchData as any,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,

    },
    state: {
      rowSelection,
      globalFilter,
      columnPinning: { right: ['action'] }
    },
    initialState: {
      pagination: {
        pageSize: size
      },
      columnPinning: {
        right: ['action']
      }
    },
    enableColumnPinning: true,
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

  for (let i = 0; i < size; i++) {
    skeletonTableRows.push(<tr key={`tr-${i}`}>{skeletonTableRow}</tr>);
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between gap-4 flex-wrap flex-col sm:flex-row items-center'>
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            href='invoice/create'
            className='is-full sm:is-auto'
          >
            Create Invoice
          </Button>
          <div className='flex flex-col sm:flex-row is-full sm:is-auto items-center gap-4'>
            <TextField
              size='small'
              value={searchString}
              onChange={e => setSearchString(e.target.value)}
              placeholder='Search invoice id'
              className='is-full sm:is-auto min-is-[200px]'
            />
            <FormControl fullWidth size='small' className='min-is-[175px]'>
              <InputLabel id='status-select'>Invoice Status</InputLabel>
              <Select
                fullWidth
                id='select-status'
                value={invoiceStatus}
                onChange={e => setInvoiceStatus(e.target.value)}
                label='Invoice Status'
                labelId='status-select'
              >
                <MenuItem value=''>none</MenuItem>
                <MenuItem value='Draft'>Draft</MenuItem>
                <MenuItem value='Sent'>Sent</MenuItem>
                <MenuItem value='Received'>Received</MenuItem>
                <MenuItem value='Canceled'>Canceled</MenuItem>
                <MenuItem value='Paid'>Paid</MenuItem>
              </Select>
            </FormControl>
          </div>
        </CardContent>
        <div className='scrollbar-custom overflow-x-auto '>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classNames({
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
                            <tr key={row.id} className={classNames({ selected: row.getIsSelected() })}>
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  )}
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={totalCount}
          rowsPerPage={size}
          page={pageIndex}

          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            setSize(Number(e.target.value))
            table.setPageSize(Number(e.target.value))
            setPageIndex(0)
          }}
        />
      </Card>
    </>
  )
})

export default InvoiceTable
