function parseIPAddress(ipWithPort) {
  const ipRegex = /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)|(\[[0-9a-f:]+\])/i;
  const ip = ipWithPort.match(ipRegex)[0]
  return ip
}

export { parseIPAddress };