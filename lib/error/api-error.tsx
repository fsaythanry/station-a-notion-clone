export function getApiError(error: unknown) {
  return error instanceof Error && error.message && typeof error.message === "string"
    ? error.message
    : "Something went wrong! Try again in a few minutes"
}