export const parseError = (error: any): { status: number; message: string } => {
  let status = typeof error?.status === 'number' ? error.status : 500;
  let message =
    typeof error?.message === 'string' ? error.message : 'Request Failed.';
  if (typeof error === 'string') message = error;

  return { status, message };
};
