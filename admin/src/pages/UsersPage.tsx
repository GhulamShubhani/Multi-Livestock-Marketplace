import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Chip,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useSnackbar } from 'notistack';
import { usersApi, type AdminUser } from '@/lib/api/users';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader, PrimaryAction } from '@/components/common/PageHeader';
import { DataTableShell } from '@/components/common/DataTableShell';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

const ROLE_OPTIONS = ['admin', 'manager', 'staff', 'customer'];
const STATUS_OPTIONS = ['active', 'inactive', 'banned', 'pending'];

const emptyForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  roleName: 'staff',
  status: 'active',
};

export function UsersPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const perms = useAuthStore((s) => s.user?.permissions);
  const canCreate = hasPermission(perms, 'users:create');
  const canUpdate = hasPermission(perms, 'users:update');
  const canDelete = hasPermission(perms, 'users:delete');

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['users', page, q, status],
    queryFn: () =>
      usersApi.list({
        page,
        limit: 20,
        q: q || undefined,
        status: status || undefined,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return usersApi.update(editing.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
          roleName: form.roleName,
        });
      }
      return usersApi.create({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        roleName: form.roleName,
        status: form.status,
      });
    },
    onSuccess: async () => {
      enqueueSnackbar(editing ? 'User updated' : 'User created', { variant: 'success' });
      setOpen(false);
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => usersApi.setStatus(id, next),
    onSuccess: async () => {
      enqueueSnackbar('Status updated', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: async () => {
      enqueueSnackbar('User deactivated', { variant: 'success' });
      setDeleteId(null);
      await qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  const users = query.data?.data.users ?? [];
  const meta = query.data?.meta;

  const columns = useMemo(
    () => [
      { key: 'name', label: 'User' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'login', label: 'Last login' },
      { key: 'actions', label: '', align: 'right' as const },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage staff and customer accounts."
        action={
          canCreate ? (
            <PrimaryAction
              label="Add user"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setOpen(true);
              }}
            />
          ) : null
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTableShell
        columns={columns}
        loading={query.isLoading}
        error={query.isError ? getApiErrorMessage(query.error) : null}
        page={meta?.page}
        totalPages={meta?.totalPages}
        onPageChange={setPage}
      >
        {users.map((u) => (
          <TableRow key={u.id} hover>
            <TableCell>
              {u.firstName} {u.lastName}
              <br />
              <span style={{ opacity: 0.7, fontSize: 12 }}>{u.email}</span>
            </TableCell>
            <TableCell>{u.role}</TableCell>
            <TableCell>
              <Chip size="small" label={u.status} color={u.status === 'active' ? 'success' : 'default'} />
            </TableCell>
            <TableCell>{formatDate(u.lastLoginAt)}</TableCell>
            <TableCell align="right">
              {canUpdate ? (
                <>
                  <IconButton
                    size="small"
                    aria-label="Edit"
                    onClick={() => {
                      setEditing(u);
                      setForm({
                        ...emptyForm,
                        email: u.email,
                        firstName: u.firstName,
                        lastName: u.lastName,
                        phone: u.phone ?? '',
                        roleName: u.role === 'super_admin' ? 'admin' : u.role,
                        status: u.status,
                      });
                      setOpen(true);
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <Button
                    size="small"
                    onClick={() =>
                      statusMutation.mutate({
                        id: u.id,
                        next: u.status === 'active' ? 'inactive' : 'active',
                      })
                    }
                  >
                    {u.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </>
              ) : null}
              {canDelete ? (
                <IconButton size="small" aria-label="Delete" onClick={() => setDeleteId(u.id)}>
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit user' : 'Add user'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!editing ? (
              <>
                <TextField
                  label="Email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </>
            ) : null}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="First name"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Last name"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </Stack>
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <TextField
              select
              label="Role"
              value={form.roleName}
              onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
              disabled={editing?.role === 'super_admin'}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Deactivate user"
        description="This soft-deletes the account (status → inactive) and revokes sessions."
        confirmLabel="Deactivate"
        loading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
