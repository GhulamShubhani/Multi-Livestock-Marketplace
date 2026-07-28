import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { systemApi } from '@/lib/api/system';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate, hasPermission } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { PageHeader } from '@/components/common/PageHeader';

export function SettingsPage() {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const canUpdate = hasPermission(useAuthStore((s) => s.user?.permissions), 'settings:update');
  const [selectedKey, setSelectedKey] = useState('');
  const [jsonText, setJsonText] = useState('{}');

  const query = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => systemApi.listSettings(),
  });

  const settings = query.data?.data.settings ?? [];

  useEffect(() => {
    if (!selectedKey && settings.length) {
      setSelectedKey(settings[0].key);
      setJsonText(JSON.stringify(settings[0].value ?? {}, null, 2));
    }
  }, [settings, selectedKey]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const value = JSON.parse(jsonText) as Record<string, unknown>;
      return systemApi.putSetting(selectedKey, value);
    },
    onSuccess: async () => {
      enqueueSnackbar('Settings saved', { variant: 'success' });
      await qc.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (e) =>
      enqueueSnackbar(e instanceof SyntaxError ? 'Invalid JSON' : getApiErrorMessage(e), {
        variant: 'error',
      }),
  });

  return (
    <Box>
      <PageHeader title="Settings" description="Key/value configuration documents for the platform." />
      {query.isError ? <Alert severity="error">{getApiErrorMessage(query.error)}</Alert> : null}
      <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', maxWidth: 720 }}>
        <Stack spacing={2}>
          <TextField
            select
            label="Setting key"
            value={selectedKey}
            onChange={(e) => {
              const key = e.target.value;
              setSelectedKey(key);
              const found = settings.find((s) => s.key === key);
              setJsonText(JSON.stringify(found?.value ?? {}, null, 2));
            }}
          >
            {settings.map((s) => (
              <MenuItem key={s.key} value={s.key}>
                {s.key}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" color="text.secondary">
            Updated {formatDate(settings.find((s) => s.key === selectedKey)?.updatedAt)}
          </Typography>
          <TextField
            label="Value (JSON)"
            multiline
            minRows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            disabled={!canUpdate}
            sx={{ '& textarea': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 } }}
          />
          {canUpdate ? (
            <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={!selectedKey || saveMutation.isPending}>
              Save
            </Button>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
