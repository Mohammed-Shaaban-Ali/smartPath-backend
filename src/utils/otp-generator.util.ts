// otp-generator.util.ts
import * as otpGenerator from "otp-generator";

// Interface to define the configuration for generating OTPs
interface OtpConfig {
  length: number;
  expiryMinutes: number;
  allowDigits: boolean;
  allowUppercase: boolean;
  allowLowercase: boolean;
  allowSpecial: boolean;
}

// Default configuration for generating OTPs
const DEFAULT_CONFIG: OtpConfig = {
  length: 6,
  expiryMinutes: 10,
  allowDigits: true,
  allowUppercase: false,
  allowLowercase: false,
  allowSpecial: false,
};

// Function to generate an OTP based on the provided configuration
export const generateOtp = (config?: Partial<OtpConfig>): string => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return otpGenerator.generate(finalConfig.length, {
    digits: finalConfig.allowDigits,
    upperCaseAlphabets: finalConfig.allowUppercase,
    lowerCaseAlphabets: finalConfig.allowLowercase,
    specialChars: finalConfig.allowSpecial,
  });
};
