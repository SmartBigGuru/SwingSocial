'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'

import { rankItem, type RankingInfo } from '@tanstack/match-sorter-utils'
import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type FilterFn } from '@tanstack/react-table'
import { Badge, CardHeader, Skeleton, TablePagination, Typography } from '@mui/material'
import classNames from 'classnames'

import { toast } from 'react-toastify'

import { supabase } from '@/utils/supabase'
import tableStyles from '@core/styles/table.module.css'
import OptionMenu from '@/@core/components/option-menu'
import DetailView, { DetailViewHandle } from '../view'
import EditEventDialogue from '../edit'
import type { EditEventHandle } from '../edit';
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface CompanyType {
  company_name: string;
}

interface ContractType {
  status: string;
  budget_limit: number;
}

interface PartnerType {
  auth_id: string;
  partner_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  spent: number;
  companies: CompanyType;
  status: string
}

type TableAction = PartnerType & {
  action?: string;
  Id: string;
  Name: string;
  EndTime: string;
  StartTime: string;
  Username: string;
  Address: string;
  Venue: string;
  Category: string;
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

const PartnerTable = forwardRef<RefreshHandle>(({ }, ref) => {
  const searchParams = useSearchParams()
  const [rowSelection, setRowSelection] = useState({});
  const [searchData, setSearchData] = useState<PartnerType[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [size, setSize] = useState(Number(searchParams.get('size') ?? 10));
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(Number(searchParams.get('page') ?? 0));
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [status, setStatus] = useState(searchParams.get('status') ?? '')
  const [company, setCompany] = useState(searchParams.get('company') ?? '')
  const [eventDetail, setEventDetail] = useState<any>('')

  const [userProfiles, setUserProfiles] = useState([]); // User profiles state
  const [selectedProfile, setSelectedProfile] = useState(''); // Selected user profile
  const router = useRouter()
  const detailRef = useRef<DetailViewHandle>(null)
  const editEventRef = useRef<EditEventHandle>(null)


  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchData();
    }
  }))

  const changeParam = () => {
    const searchParams = new URLSearchParams()

    if (status) searchParams.set('status', status)
    if (company) searchParams.set('company', company)
    if (search) searchParams.set('search', search)
    searchParams.set('size', String(size))
    searchParams.set('page', String(pageIndex))
    const queryString = searchParams.toString()

    router.push(`/admin/sp/partner-manage/${queryString ? `?${queryString}` : ''}`)
  }

  const fetchData = async () => {
    const sStatus = (searchParams.get('status') ?? '');
    const sSearch = (searchParams.get('search') ?? '');
    const sCompany = (searchParams.get('company') ?? '');
    const sPage = (Number(searchParams.get('page') ?? 0));
    const sSize = (Number(searchParams.get('size') ?? 10));

    try {
      let companyId;

      // Fetch company ID based on company name
      if (sCompany) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('company_id')
          .eq('company_name', sCompany)
          .single();

        if (companyError) throw companyError;

        companyId = companyData.company_id;
      }

      // Build query parameters for fetching events from API
      const queryParams = new URLSearchParams();
      if (sStatus) queryParams.append('status', sStatus);
      if (sSearch) queryParams.append('search', sSearch);
      if (companyId) queryParams.append('company', sCompany);
      queryParams.append('page', sPage.toString());
      queryParams.append('size', sSize.toString());

      const apiUrl = `/api/admin/events?${queryParams.toString()}`;

      // Fetch event data from your API
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch event data');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Set the fetched data
      setSearchData(result.events);
      setTotalCount(result.totalCount);
      console.log(result.events);

    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };


  // Hooks
  useEffect(() => {
    changeParam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, pageIndex, status, company, search])

  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      fetchData()
    }, 500)

    setStatus(searchParams.get('status') ?? '');
    setSearch(searchParams.get('search') ?? '');
    setCompany(searchParams.get('company') ?? '');
    setPageIndex(Number(searchParams.get('page') ?? 0))
    setSize(Number(searchParams.get('size') ?? 10))

    return () => clearTimeout(debouncedFetch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const DeactiveAction = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ status: 'Deactive' })
        .eq('auth_id', userId)

      if (error) throw error

      fetchData()
    } catch (error: any) {
      toast.error(`${error.message}`, {
        autoClose: 3000,
        type: 'error'
      })
    }
  }

  const columns = useMemo<ColumnDef<TableAction, any>[]>(

    () => [
      {
        id: 'no',
        header: ({ table }) => (
          <>No</>
        ),
        cell: ({ row }) => (
          <>{size * pageIndex + row.index + 1}</>
        )
      },
      columnHelper.accessor('Name', {
        header: 'Event Name',
        cell: ({ row }) => <Typography>{row.original.Name}</Typography>
      }),
      columnHelper.accessor('StartTime', {
        header: 'Start Time',
        cell: ({ row }) => {
          const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
          return (
            <Typography>
              {new Date(row.original.StartTime).toLocaleDateString('en-US')}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('EndTime', {
        header: 'End Date',
        cell: ({ row }) => {
          const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
          return (
            <Typography>
              {new Date(row.original.EndTime).toLocaleDateString('en-US')}
            </Typography>
          );
        }
      }),
      columnHelper.accessor('Category', {
        header: 'Category',
        cell: ({ row }) => <Typography>{row.original.Category}</Typography>
      }),
      columnHelper.accessor('Venue', {
        header: 'Venue',
        cell: ({ row }) => <Typography>{row.original.Venue}</Typography>
      }),
      columnHelper.accessor('Address', {
        header: 'Address',
        cell: ({ row }) => <Typography>{row.original.Address}</Typography>
      }),
      columnHelper.accessor('Username', {
        header: 'Username',
        cell: ({ row }) => <Typography>{row.original.Username}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <>
            <OptionMenu
              leftAlignMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary text-[22px]'
              options={[
                {
                  text: 'View',
                  menuItemProps: {
                    onClick: () => {
                      // Implement View action
                      detailRef.current?.open(row.original.Id)
                    },
                    className: 'flex items-center gap-2'
                  }
                },
                {
                  text: 'Edit',
                  menuItemProps: {
                    onClick: () => {
                      // Implement Edit action
                      setEventDetail(row.original);
                      editEventRef.current?.open();
                    },
                    className: 'flex items-center gap-2'
                  }
                },
                {
                  text: 'Deactive',
                  menuItemProps: {
                    onClick: () => {
                      DeactiveAction(row.original.Id); // Use Id from new data
                    },
                    className: 'flex items-center gap-2'
                  }
                }
              ]}
            />
          </>
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
        <CardHeader title='Partner' />
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
      <DetailView ref={detailRef} refresh={fetchData} />
      <EditEventDialogue
        ref={editEventRef}
        eventDetail={eventDetail}
        refresh={fetchData}
        id={eventDetail?.Id}
      />
    </>
  )
})

export default PartnerTable
