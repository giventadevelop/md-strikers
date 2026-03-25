export type LogMeta = Record<string, unknown> | undefined;

/**
 * Scoped logger for middleware, proxy, etc. Uses console so logs survive Next.js stripping.
 */
export function createLogger(scope: string) {
  const prefix = `[${scope}]`;
  return {
    info(message: string, meta?: LogMeta) {
      if (meta !== undefined) {
        console.log(prefix, message, meta);
      } else {
        console.log(prefix, message);
      }
    },
  };
}
