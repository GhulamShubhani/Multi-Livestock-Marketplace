'use client';

import * as React from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

type Props = Omit<TextFieldProps, 'type'>;

export const PasswordField = React.forwardRef<HTMLInputElement, Props>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = React.useState(false);
    const { slotProps, ...rest } = props;
    const inputSlot =
      slotProps && typeof slotProps === 'object' && 'input' in slotProps
        ? (slotProps.input as Record<string, unknown>)
        : {};

    return (
      <TextField
        {...rest}
        type={visible ? 'text' : 'password'}
        inputRef={ref}
        slotProps={{
          ...slotProps,
          input: {
            ...inputSlot,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  size="small"
                >
                  {visible ? (
                    <VisibilityOffOutlinedIcon fontSize="small" />
                  ) : (
                    <VisibilityOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  },
);
