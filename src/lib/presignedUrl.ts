/** True when the URL carries AWS SigV4 presign query params. */
export function isAwsPresignedQueryUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.searchParams.has('X-Amz-Algorithm') || u.searchParams.has('X-Amz-Signature');
  } catch {
    return false;
  }
}

/**
 * Returns true if a presigned GET URL is expired (or cannot be parsed).
 * Uses preSignedUrlExpiresAt when present; otherwise parses X-Amz-Date + X-Amz-Expires.
 */
export function isPresignedUrlExpired(url: string, expiresAtIso?: string | null): boolean {
  if (expiresAtIso) {
    const expiresAt = Date.parse(expiresAtIso);
    if (Number.isFinite(expiresAt)) {
      return Date.now() >= expiresAt;
    }
  }

  if (!isAwsPresignedQueryUrl(url)) {
    return false;
  }

  try {
    const u = new URL(url);
    const amzDate = u.searchParams.get('X-Amz-Date');
    const amzExpires = u.searchParams.get('X-Amz-Expires');
    if (!amzDate || !amzExpires) {
      return true;
    }
    const signedAt = Date.parse(
      `${amzDate.slice(0, 4)}-${amzDate.slice(4, 6)}-${amzDate.slice(6, 8)}T${amzDate.slice(9, 11)}:${amzDate.slice(11, 13)}:${amzDate.slice(13, 15)}Z`
    );
    const expiresSeconds = Number(amzExpires);
    if (!Number.isFinite(signedAt) || !Number.isFinite(expiresSeconds)) {
      return true;
    }
    return Date.now() >= signedAt + expiresSeconds * 1000;
  } catch {
    return true;
  }
}

/** The URL itself when it is usable now; undefined for empty or expired presigned URLs. */
export function usableImageUrl(url?: string | null, expiresAtIso?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  return isPresignedUrlExpired(trimmed, expiresAtIso) ? undefined : trimmed;
}
