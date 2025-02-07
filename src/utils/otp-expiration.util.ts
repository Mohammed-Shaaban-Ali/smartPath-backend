// Default OTP expiry time in minutes
const DEFAULT_EXPIRY_MINUTES = 10;

// Function to calculate the expiration time of the OTP
export const getExpirationTime = (
  minutes: number = DEFAULT_EXPIRY_MINUTES,
): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// Function to check if the OTP is expired
export const isOtpExpired = (expirationTime: Date): boolean => {
  return Date.now() > expirationTime.getTime();
};
