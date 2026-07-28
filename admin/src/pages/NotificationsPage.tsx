import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { contentApi } from '@/lib/api/system';
import { getApiErrorMessage } from '@/lib/api/client';
import { hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader } from '@/components/common/PageHeader';

export function NotificationsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const canCreate = hasPermission(useAuthStore((s) => s.user?.permissions), 'notifications:create');
  const [form, setForm] = useState({
    title: '',
    body: '',
    mode: 'broadcast' as 'broadcast' | 'user',
    userId: '',
    roleNames: 'customer',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (form.mode === 'user') {
        return contentApi.createNotification({
          userId: form.userId,
          title: form.title,
          body: form.body,
          channel: 'in_app',
        });
      }
      return contentApi.broadcast({
        title: form.title,
        body: form.body,
        roleNames: form.roleNames
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
      });
    },
    onSuccess: (res) => {
      const recipients =
        res.data && typeof res.data === 'object' && 'recipients' in res.data
          ? (res.data as { recipients: number }).recipients
          : undefined;
      enqueueSnackbar(
        recipients != null ? `Broadcast sent to ${recipients} users` : 'Notification created',
        { variant: 'success' },
      );
      setForm((f) => ({ ...f, title: '', body: '', userId: '' }));
    },
    onError: (e) => enqueueSnackbar(getApiErrorMessage(e), { variant: 'error' }),
  });

  return (
    <Box>
      <PageHeader title="Notifications" description="Send in-app notifications to users." />
      {!canCreate ? (
        <Alert severity="warning">You need `notifications:create` to send messages.</Alert>
      ) : (
        <Paper sx={{ p: 3, maxWidth: 560, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Mode"
              value={form.mode}
              onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as 'broadcast' | 'user' }))}
            >
              <MenuItem value="broadcast">Broadcast by role</MenuItem>
              <MenuItem value="user">Single user</MenuItem>
            </TextField>
            {form.mode === 'broadcast' ? (
              <TextField
                label="Role names (comma-separated)"
                value={form.roleNames}
                onChange={(e) => setForm((f) => ({ ...f, roleNames: e.target.value }))}
                helperText="e.g. customer, staff"
              />
            ) : (
              <TextField
                label="User ID"
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              />
            )}
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Body"
              multiline
              minRows={4}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
            <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Send
            </Button>
            <Typography variant="body2" color="text.secondary">
              There is no admin-wide notification inbox API yet — this screen focuses on outbound sends.
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
