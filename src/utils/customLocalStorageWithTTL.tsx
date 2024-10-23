export function setItemWithTTL(key: string, value: any, ttlHours: number) {
  if (typeof window === 'undefined') {
    // localStorage is not available on the server
    return;
  }

  const now = new Date().getTime();
  const ttlMilliseconds = ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
  const item = {
    value: value,
    expiry: now + ttlMilliseconds,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getItemWithTTL(key: string) {
  // const router = useRouter();
  if (typeof window === 'undefined') {
    // localStorage is not available on the server
    return null;
  }

  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date().getTime();

  // Check if the item is expired
  if (now > item.expiry) {
    localStorage.removeItem(key); // Remove expired item
    // router.push("/")
    return null;
  }

  return item.value;
}
