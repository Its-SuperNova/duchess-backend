import fs from "fs";
import path from "path";

// File-based OTP storage for persistence across API calls
const OTP_FILE_PATH = path.join(process.cwd(), "otp-store.json");

interface OTPData {
  otp: string;
  expiresAt: number;
}

interface OTPStore {
  [email: string]: OTPData;
}

// Read OTP store from file
function readOTPStore(): OTPStore {
  try {
    if (fs.existsSync(OTP_FILE_PATH)) {
      const data = fs.readFileSync(OTP_FILE_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading OTP store:", error);
  }
  return {};
}

// Write OTP store to file
function writeOTPStore(store: OTPStore) {
  try {
    fs.writeFileSync(OTP_FILE_PATH, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error("Error writing OTP store:", error);
  }
}

export function getOTPStore() {
  return readOTPStore();
}

export function setOTP(email: string, otp: string, expiresAt: number) {
  const store = readOTPStore();
  store[email] = { otp, expiresAt };
  writeOTPStore(store);
  console.log("💾 OTP stored:", { email, otp, expiresAt });
}

export function getOTP(email: string) {
  const store = readOTPStore();
  const data = store[email];
  console.log("🔍 OTP retrieved:", { email, data });
  return data;
}

export function deleteOTP(email: string) {
  const store = readOTPStore();
  delete store[email];
  writeOTPStore(store);
  console.log("🗑️ OTP deleted:", email);
}

export function clearExpiredOTPs() {
  const now = Date.now();
  const store = readOTPStore();
  let hasExpired = false;

  for (const email in store) {
    if (now > store[email].expiresAt) {
      delete store[email];
      hasExpired = true;
    }
  }

  if (hasExpired) {
    writeOTPStore(store);
    console.log("🧹 Expired OTPs cleared");
  }
}
