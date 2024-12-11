'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns';

import { useRouter, useSearchParams } from 'next/navigation'

import Card from '@mui/material/Card'
import { rankItem, type RankingInfo } from '@tanstack/match-sorter-utils'
import { createColumnHelper, flexRender, getCoreRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type FilterFn } from '@tanstack/react-table'
import { CardHeader, Skeleton, TablePagination, Typography, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material'
import classNames from 'classnames'

import { toast } from 'react-toastify'

import { supabase } from '@/utils/supabase'
import tableStyles from '@core/styles/table.module.css'
import type { EditDialogHandle } from '../edit';
import EditDialog from '../edit'
import type { DetailViewHandle } from '../view/detail';
import HistoryViewHandle from '../view/history';
import DetailView from '../view/detail'
import CustomAvatar from '@/@core/components/mui/Avatar'
import OptionMenu from '@/@core/components/option-menu'
import Link from '@/components/Link'
import Swal from 'sweetalert2';

import { Email } from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Dynamically import a rich-text editor (like React Quill)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
const colors = [
  'rgba(255, 99, 132, 0.1)',
  'rgba(54, 162, 235, 0.1)',
  'rgba(255, 206, 86, 0.1)',
  'rgba(75, 192, 192, 0.1)',
  'rgba(153, 102, 255, 0.1)',
  'rgba(255, 159, 64, 0.1)',
  'rgba(255, 99, 132, 0.1)',
  'rgba(255, 205, 86, 0.1)',
  'rgba(75, 192, 192, 0.1)',
  'rgba(54, 162, 235, 0.1)',
];

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface UserType {
  Avatar: string;
  Username: string;
  Email: string;
  AccountType: string;
  Title: string;
  Price: string;
  AppOrWeb: string;
  CreatedAt: string;
}

type TableAction = UserType & {
  action?: string;
  Id: string;
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

const UserTable = forwardRef<RefreshHandle>(({ }, ref) => {
  const searchParams = useSearchParams()
  const [rowSelection, setRowSelection] = useState({});
  const [searchData, setSearchData] = useState<UserType[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [size, setSize] = useState(Number(searchParams.get('size') ?? 10));
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(Number(searchParams.get('page') ?? 0));
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? '')
  const router = useRouter()
  const editRef = useRef<EditDialogHandle>(null)
  const detailRef = useRef<DetailViewHandle>(null)
  const [openHistory, setOpenHistory] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendEmail = () => {
    console.log('Email Subject:', emailSubject);
    console.log('Email Body:', emailBody);
    // Add API call here to send the email
    handleCloseDialog();
  };
  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchData();
    }
  }))

  const changeParam = () => {
    const searchParams = new URLSearchParams()

    if (type) searchParams.set('type', type)
    if (search) searchParams.set('search', search)

    console.log(String(size));
    searchParams.set('size', String(size))
    searchParams.set('page', String(pageIndex))
    const queryString = searchParams.toString()

    router.push(`/admin/sp/advertiser-manage/${queryString ? `?${queryString}` : ''}`)
  }
  async function deleteUser(userId: string) {
    try {
      console.log(userId, "====userId");

      // Confirm before deleting
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete the user with ID ${userId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      });

      // If user confirms deletion
      if (result.isConfirmed) {
        const apiUrl = `/api/admin/user?id=${userId}`;

        const response = await fetch(apiUrl, {
          method: 'DELETE', // Specify the HTTP method
        });

        if (!response.ok) {
          throw new Error(`Failed to delete user with ID ${userId}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        // Show success alert
        Swal.fire('Deleted!', `User with ID ${userId} has been deleted.`, 'success');

        // Optionally, refetch data to update the UI
      } else {
        console.log('User deletion cancelled.');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      // Show error alert
      Swal.fire('Error!', 'An error occurred while deleting the user.', 'error');
    }
  }


  async function upgradeUser(userId: string) {
    try {
      console.log(userId, "====userId");

      // Confirm before upgrading
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to upgrade the user with ID ${userId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, upgrade it!',
        cancelButtonText: 'Cancel',
      });

      // If user confirms the upgrade
      if (result.isConfirmed) {
        const apiUrl = `/api/admin/user/upgrade`;

        const response = await fetch(apiUrl, {
          method: 'POST', // Specify the HTTP method
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileId: userId }), // Pass profileId in the request body
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || `Failed to upgrade user with ID ${userId}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        // Show success alert
        await Swal.fire('Upgraded!', `User with ID ${userId} has been upgraded successfully.`, 'success');
        fetchData()
        // Optionally, refetch data to update the UI
        // Example: fetchUsers(); // Call a function to refresh the user list
      } else {
        console.log('User upgrade cancelled.');
      }
    } catch (error: any) {
      console.error('Error upgrading user:', error.message);
      // Show error alert
      await Swal.fire('Error!', `An error occurred: ${error.message}`, 'error');
    }
  }

  async function downgradeUser(userId: string) {
    try {
      console.log(userId, "====userId");

      // Confirm before upgrading
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to downgrade the user with ID ${userId}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, downgrade it!',
        cancelButtonText: 'Cancel',
      });

      // If user confirms the downgrade
      if (result.isConfirmed) {
        const apiUrl = `/api/admin/user/downgrade`;

        const response = await fetch(apiUrl, {
          method: 'POST', // Specify the HTTP method
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileId: userId }), // Pass profileId in the request body
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || `Failed to downgrade user with ID ${userId}`);
        }

        const responseData = await response.json();
        console.log(responseData);

        // Show success alert
        await Swal.fire('Downgraded!', `User with ID ${userId} has been downgraded successfully.`, 'success');
        fetchData();
        // Optionally, refetch data to update the UI
        // Example: fetchUsers(); // Call a function to refresh the user list
      } else {
        console.log('User downgrade cancelled.');
      }
    } catch (error: any) {
      console.error('Error upgrading user:', error.message);
      // Show error alert
      await Swal.fire('Error!', `An error occurred: ${error.message}`, 'error');
    }
  }

  async function getHistoryData(userId: string) {
    setOpenHistory(true);
  }
  const fetchData = async () => {
    const sType = (searchParams.get('type') ?? '');
    const sSearch = (searchParams.get('search') ?? '');
    var sPage = (Number(searchParams.get('page') ?? 1))
    const sSize = (Number(searchParams.get('size') ?? 10))

    try {
      let query = '/api/admin/user?'
      const params = new URLSearchParams();

      if (sType) params.append('type', sType);
      if (sSearch) params.append('search', sSearch);
      if (sPage == 0) {
        sPage = 1
      }
      params.append('page', sPage.toString());
      params.append('size', sSize.toString());
      const apiUrl = `${query}${params}`
      console.log(apiUrl)
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log(data);
      setSearchData(data?.profiles)
      setLoading(false)
      setTotalCount(Number(data.totalCount))
    } catch (error: any) {
    }
  }

  const genColor = (name: string) => {
    const hashCode = (str: string): number => {
      let hash = 0;

      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }

      return hash;
    };

    const hash = hashCode(name);
    const colorIndex = Math.abs(hash) % colors.length;

    return colors[colorIndex];
  }

  // Hooks
  useEffect(() => {

    changeParam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, pageIndex, type, search])

  useEffect(() => {
    const debouncedFetch = setTimeout(() => {
      fetchData()
    }, 500)

    setType(searchParams.get('type') ?? '');
    setSearch(searchParams.get('search') ?? '');
    setPageIndex(Number(searchParams.get('page') ?? 0))
    setSize(Number(searchParams.get('size') ?? 10))

    return () => clearTimeout(debouncedFetch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const DeactiveAction = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ type: 'Deactive' })
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
      {
        id: 'contact',
        header: ({ table }) => (
          <>Avatar</>
        ),
        cell: ({ row }) => {
          const username = `${row.original.Username}`;
          const avatarColor = genColor(username);

          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar style={{ backgroundColor: avatarColor }} skin='light-static' src={row.original.Avatar} />
            </div>
          )
        }
      },
      columnHelper.accessor('Username', {
        header: 'Username',
        cell: ({ row }) => row.original.Username && <Typography>{row.original.Username}</Typography>
      }),
      columnHelper.accessor('Email', {
        header: 'Email',
        cell: ({ row }) => row.original.Email && <Typography>{row.original.Email}</Typography>
      }),
      columnHelper.accessor('AccountType', {
        header: 'Type',
        cell: ({ row }) => <Typography>{row.original.AccountType}</Typography>
      }),
      columnHelper.accessor('AppOrWeb', {
        header: 'AppOrWeb',
        cell: ({ row }) => <Typography>{row.original.AppOrWeb}</Typography>
      }),
      columnHelper.accessor('Title', {
        header: 'Subscription Status',
        cell: ({ row }) => (row.original.Title === "Free Member") ? <div><Chip label={`${row.original.Title} $${row.original.Price}`} color='primary' variant='outlined' /></div> :
          <div><Chip label={`${row.original.Title} $${row.original.Price}`} color='success' variant='outlined'></Chip></div>
      }),

      columnHelper.accessor('CreatedAt', {
        header: 'Created Date',
        cell: ({ row }) => <Typography>{format(new Date(row.original.CreatedAt), 'MM/dd/yyyy')}</Typography>
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
                text: 'Delete',
                menuItemProps: {
                  onClick: () => deleteUser(row?.original?.Id), // Use a function to call deleteUser
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Upgrade',
                menuItemProps: {
                  onClick: () => upgradeUser(row?.original?.Id),
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Downgrade',
                menuItemProps: {
                  onClick: () => downgradeUser(row?.original?.Id),
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'View',
                menuItemProps: {
                  onClick: () => {
                    console.log("Clicked View");
                    detailRef.current?.open(row.original.Id)
                  },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'History',
                menuItemProps: {
                  onClick: () => {
                    console.log("Clicked History");
                    setOpenHistory(true);
                    setProfileId(row?.original?.Id);
                  },
                  className: 'flex items-center gap-2'
                }
              }
            ]}
          />
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
        <CardHeader title='User Management Panel' action={
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={handleOpenDialog}
          >
            Send Email
          </Button>
        } />
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
      <EditDialog refresh={fetchData} ref={editRef} />
      <DetailView ref={detailRef} refresh={fetchData} />
      <HistoryViewHandle open={openHistory} setOpen={setOpenHistory} profileId={profileId} />
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            variant="outlined"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            margin="normal"
          />
          <ReactQuill
            theme="snow"
            value={emailBody}
            onChange={setEmailBody}
            placeholder="Write your email here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSendEmail} variant="contained" color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>

    </>
  )
})

export default UserTable
