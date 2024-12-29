interface ReportExceptionProps {
  exception: unknown;
  key: string;
  value: unknown;
  message: string;
}

export function reportException(parameters: ReportExceptionProps) {
  const { exception, key, value, message } = parameters;
  console.warn(message, key, value);
  console.error(exception);
}
