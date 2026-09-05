'use client';

import * as React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import type { ImageSourceType } from '@/types/api';
import { imageSourceLabel } from '@/lib/image-source';

type Props = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sourceType?: ImageSourceType;
  sourceLabel?: string;
  showSourceBadge?: boolean;
  showSkeleton?: boolean;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  wrapperSx?: object;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

/**
 * Uses a native <img> for remote URLs so images still load when the Next.js
 * image optimizer cannot fetch remotes (common with local TLS/proxy issues).
 */
export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  sourceType,
  sourceLabel,
  showSourceBadge,
  showSkeleton = true,
  objectFit = 'cover',
  objectPosition,
  wrapperSx,
  priority,
  className,
  style,
  loading,
  onLoad,
  onError,
}: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const badge = showSourceBadge ? imageSourceLabel(sourceType, sourceLabel) : null;

  React.useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <Box
        sx={{
          position: fill ? 'absolute' : 'relative',
          inset: fill ? 0 : undefined,
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          backgroundColor: 'action.hover',
          ...wrapperSx,
        }}
        aria-hidden={!alt}
      />
    );
  }

  return (
    <Box
      sx={{
        position: fill ? 'absolute' : 'relative',
        inset: fill ? 0 : undefined,
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        overflow: 'hidden',
        ...wrapperSx,
      }}
    >
      {showSkeleton && !loaded ? (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: 'absolute', inset: 0, height: '100%', width: '100%', zIndex: 0 }}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={priority ? 'eager' : (loading ?? 'lazy')}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={className}
        style={{
          ...(fill
            ? {
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
              }
            : {
                width: width ? undefined : '100%',
                height: height ? undefined : 'auto',
                display: 'block',
              }),
          objectFit,
          objectPosition,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
          ...style,
        }}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setFailed(true);
          onError?.(e);
        }}
      />
      {badge ? (
        <Typography
          component="span"
          sx={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            zIndex: 2,
            px: 1,
            py: 0.35,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: '#F7F4EF',
            backgroundColor: 'rgba(12,23,20,0.72)',
            borderRadius: 1,
          }}
        >
          {badge}
        </Typography>
      ) : null}
    </Box>
  );
}
