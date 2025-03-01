// Function to get address from coordinates using Google Maps Geocoding API
export async function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      throw new Error("No address found for this location");
    }
  } catch (error) {
    console.error("Error getting address:", error);
    throw error;
  }
}

// Function to copy text to clipboard
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    throw error;
  }
}

// Combined function to get address and copy it
export async function getAndCopyAddress(
  lat: number,
  lng: number
): Promise<string> {
  const address = await getAddressFromCoordinates(lat, lng);
  await copyToClipboard(address);
  return address;
}
