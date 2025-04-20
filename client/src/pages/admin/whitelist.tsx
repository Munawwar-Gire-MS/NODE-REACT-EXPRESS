import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Toast } from "@/components/toast";

interface WhitelistForm {
  email: string;
  userType: 'agent' | 'client';
}

export default function AdminWhitelist() {
  const { toast, showToast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WhitelistForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationInfo, setRegistrationInfo] = useState<{ code: string; email: string } | null>(null);

  const onSubmit = async (data: WhitelistForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add whitelisted email');
      }

      const result = await response.json();
      setRegistrationInfo({
        code: result.registrationCode,
        email: data.email
      });
      showToast({
        title: "Success",
        description: "Email whitelisted successfully",
      });
      reset();
    } catch (error) {
      console.error(error);
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add whitelisted email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrationUrl = registrationInfo 
    ? `${window.location.origin}/register?code=${registrationInfo.code}`
    : '';

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Whitelisted Emails</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              User Type
            </label>
            <select
              id="userType"
              className="p-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              {...register("userType", { required: "User type is required" })}
            >
              <option value="">Select a user type</option>
              <option value="agent">Agent</option>
              <option value="client">Client</option>
            </select>
            {errors.userType && (
              <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add to Whitelist"}
          </button>
        </form>

        {registrationInfo && (
          <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Registration Information</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {registrationInfo.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Registration Code:</span> {registrationInfo.code}
              </p>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Registration URL:</p>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={registrationUrl}
                    className="w-full p-2 pr-20 text-sm bg-white border border-gray-300 rounded-md"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(registrationUrl);
                      showToast({
                        title: "Copied!",
                        description: "Registration URL copied to clipboard",
                      });
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast toast={toast} />
    </div>
  );
} 