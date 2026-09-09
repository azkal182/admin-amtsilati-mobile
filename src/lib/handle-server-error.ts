import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(toSafeLogValue(error))
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const title = error.response?.data?.title
    if (typeof title === 'string' && title.length > 0) {
      errMsg = title
    }
  }

  if (error instanceof ApiRequestError) {
    errMsg = error.message
  }

  toast.error(errMsg)
}

function toSafeLogValue(error: unknown) {
  if (error instanceof ApiRequestError) {
    return {
      name: error.name,
      status: error.status,
      code: error.code,
      requestId: error.requestId,
    }
  }

  if (error instanceof AxiosError) {
    return { name: error.name, message: error.message, status: error.status }
  }

  return error instanceof Error
    ? { name: error.name, message: error.message }
    : { name: 'UnknownError' }
}
