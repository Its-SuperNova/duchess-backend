import { Suspense } from "react";
import ConfirmationClient from "./confirmation-client";

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ConfirmationClient />
    </Suspense>
  );
}
