'use client'

// React Imports
import { useState, useMemo, useEffect, useRef } from 'react'

// MUI Imports
import { useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
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

import { Button, Skeleton, TablePagination } from '@mui/material'

import { supabase } from '@/utils/supabase'

// Type Imports
import type { ThemeColor } from '@core/types'

import tableStyles from '@core/styles/table.module.css'

import type { ContractType } from './contractType'
import OptionMenu from '@/@core/components/option-menu'

import type { ContractEditHandle } from '../edit'

import type { ContractDialogHandle } from '../detail'
import ContractDetailDialog from '../detail'

import type { AddContractDialogHandle } from '../add';
import AddNewContractDialog from '../add'
import ContractEditDialog from '../edit'
import type { AssignDialogHandle } from '../assign';
import AssignDialog from '../assign'
import type { RenewOpenHandle } from '../renew/RenewDialog';
import RenewContractDialog from '../renew/RenewDialog'


declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ContractTypeWithAction = ContractType & {
  action?: string
}

type StatusType = {
  [key: string]: ThemeColor
}

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

const ColorOfStatus: StatusType = {
  Active: 'success',
  Pending: 'primary',
  Expired: 'warning',
}

// Column Definitions
const columnHelper = createColumnHelper<ContractTypeWithAction>()



const ContractListComponent = () => {
  // States
  const [rowSelection, setRowSelection] = useState({});
  const [searchData, setSearchData] = useState<ContractType[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [perPage, setPerpage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  const childRef = useRef<ContractDialogHandle>(null);
  const newContractRef = useRef<AddContractDialogHandle>(null);
  const editRef = useRef<ContractEditHandle>(null);
  const assignHandle = useRef<AssignDialogHandle>(null)
  const searchParams = useSearchParams()
  const renewRef = useRef<RenewOpenHandle>(null);
  const router = useRouter()

  const fetchContract = async () => {
    try {
      const status = searchParams.get('status');
      const vertical = searchParams.get('vertical');
      const advertiser = searchParams.get('advertiser');
      const search = searchParams.get('search');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      let verticalId
      let companyId

      if (vertical) {
        const verticalQuery = supabase
          .from('verticals')
          .select('vertical_id')
          .eq('name', vertical)
          .single()

        const { data } = await verticalQuery

        if (data)
          verticalId = data.vertical_id
      }

      if (advertiser) {
        const companyQuery = supabase
          .from('companies')
          .select('company_id')
          .eq('company_name', advertiser)
          .single()

        const { data, error } = await companyQuery

        console.log(data)
        if (data)
          companyId = data.company_id
      }

      let query = supabase.from('contracts').select(`
          *,
          verticals (vertical_id, name),
          assigns (partner_id),
          advertisers (*, 
          companies (*))
        `, { count: 'exact' })

      const textColumns = [
        'contract_name'
      ]

      if (search) {
        query.or(textColumns.map(item => `${item}.ilike.%${search}%`).join(','));
      }

      if (status) query = query.eq('status', status)
      if (verticalId) query = query.eq('vertical_id', verticalId)
      if (companyId) query = query.eq('company_id', companyId)

      if (startDate && endDate)
        query = query
          .gte('created_date', startDate)  // greater than or equal to start date
          .lte('created_date', endDate);
      query = query.range(pageIndex * perPage, (pageIndex + 1) * perPage - 1)
        .order('created_date', { ascending: false })
      const { data, count, error } = await query;

      if (error) throw error;

      const transformedData = data.map(item => ({
        contract_id: item.contract_id,
        contract_name: item.contract_name,
        advertiser: item.advertisers.companies.company_name,
        verticals: item.verticals.name,
        start_date: item.start_date,
        end_date: item.end_date,
        budget: item.budget_limit,
        cost: item.cost,
        offer: 0,
        partner: item.assigns.length,
        payment_term: item.payment_term,
        status: item.status,
      }))

      setTotalCount(Number(count))
      setSearchData(transformedData);
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Hooks
  useEffect(() => {
    fetchContract()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, pageIndex, searchParams])

  useEffect(() => {
    setPageIndex(0)
  }, [perPage, searchParams])

  const AddContractAction = () => {
    return (
      <>
        <Button variant='outlined'
          color='success'
          onClick={() => { newContractRef.current?.open() }}
        >
          Add New Contract
        </Button>
      </>
    )
  }

  const columns = useMemo<ColumnDef<ContractTypeWithAction, any>[]>(
    () => [
      {
        id: 'contract_id',
        header: ({ table }) => (
          <div>Contract ID</div>
        ),
        cell: ({ row }) =>
          <div>
            <Typography>
              #CTR-{row.original.contract_id}
            </Typography>
          </div>
      },
      columnHelper.accessor('contract_name', {
        header: 'Contract Name',
        cell: ({ row }) => (row.original.contract_name !== null) && <Typography>{row.original.contract_name}</Typography>
      }),
      columnHelper.accessor('verticals', {
        header: 'Vertical',
        cell: ({ row }) => (row.original.verticals !== null) && <Typography>{row.original.verticals}</Typography>
      }),
      columnHelper.accessor('advertiser', {
        header: 'Adverttiser',
        cell: ({ row }) => (row.original.advertiser !== null) && <Typography>{row.original.advertiser}</Typography>
      }),
      columnHelper.accessor('start_date', {
        header: 'Start Date',
        cell: ({ row }) => (row.original.start_date !== null) && <Typography>{row.original.start_date}</Typography>
      }),
      columnHelper.accessor('end_date', {
        header: 'End Date',
        cell: ({ row }) => (row.original.end_date !== null) && <Typography>{row.original.end_date}</Typography>
      }),
      columnHelper.accessor('budget', {
        header: 'Budget Limit',
        cell: ({ row }) => (row.original.budget !== null) && <Typography>${row.original.budget}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (row.original.status !== null) && (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original.status}
              size='small'
              color={ColorOfStatus[row.original.status]}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary text-[22px]'
            leftAlignMenu
            options={[
              {
                text: 'View',
                menuItemProps: {
                  onClick: () => {
                    childRef.current?.open(row.original.contract_id)
                  },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Edit',
                menuItemProps: {
                  onClick: () => {
                    editRef.current?.open(row.original.contract_id)
                  },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Assign',
                menuItemProps: {
                  onClick: () => { assignHandle.current?.open(row.original.contract_id) },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Renew',
                menuItemProps: {
                  onClick: () => { renewRef.current?.open(row.original.contract_id) },
                  className: 'flex items-center gap-2'
                }
              }
            ]}
          />
        ),
        enablePinning: true,
        enableSorting: false,
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
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter,
      columnPinning: { right: ['action'] }
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

  return (
    <>
      <Card>
        <CardHeader title='Contract' action={<AddContractAction />} />
        <div className='scrollbar-custom overflow-x-auto '>
          <table className={`${tableStyles.table}`}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className={classnames({
                      'sticky left-0 z-10': header.id === 'contract_id',
                    })}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
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
                            <tr key={row.id} className={classnames({
                              selected: row.getIsSelected(),
                              'hover:bg-actionHover': true,
                            })}>
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className={classnames({
                                  'sticky left-0 z-10 bg-backgroundPaper': cell.column.id === 'contract_id',
                                })}
                                >
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
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
      <AddNewContractDialog ref={newContractRef} refresh={fetchContract} />
      <AssignDialog ref={assignHandle} refresh={fetchContract} />
      <ContractEditDialog ref={editRef} refresh={fetchContract} />
      <ContractDetailDialog ref={childRef} />
      <RenewContractDialog ref={renewRef}  refresh={fetchContract} />
    </>
  )
}

export default ContractListComponent
