const defaultHost = process.env.NEXT_PUBLIC_HOST_IP || 'localhost';

function resolveProtocol() {
  if (typeof window !== 'undefined') {
    return window.location.protocol || 'http:';
  }

  return 'http:';
}

function resolveHostname() {
  if (typeof window !== 'undefined') {
    return window.location.hostname || defaultHost;
  }

  return defaultHost;
}

export function buildServiceBase(port: number) {
  return `${resolveProtocol()}//${resolveHostname()}:${port}`;
}

