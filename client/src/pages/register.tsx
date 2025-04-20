import { useForm, FieldErrors } from "react-hook-form";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Toast } from "@/components/toast";
import { Link } from "wouter";

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  registrationCode: string;
  name: string;
}

export default function Register() {
  const { toast, showToast } = useToast();
  const { register: registerUser, user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<RegisterForm>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasCode, setHasCode] = useState(false);

  // Set registration code from URL on component mount
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setValue('registrationCode', code);
      setHasCode(true);
    } else {
      setHasCode(false);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (!authLoading && user) {
      setLocation(user.role === 'agent' ? '/agent' : '/client');
    }
  }, [user, authLoading, setLocation]);

  const onSubmit = async (data: RegisterForm) => {
    console.log("register submit: ", data);
    if (data.password !== data.confirmPassword) {
      showToast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    try {
      await registerUser(data.email, data.password, data.registrationCode, data.name);
      showToast({
        title: "Registration Successful",
        description: "Welcome to the platform!",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      reset();
    } finally {
      setIsRegistering(false);
    }
  };

  const onError = (errors: FieldErrors<RegisterForm>) => {
    console.log("Form validation errors:", errors);
  };

  if (authLoading) {
    return null;
  }

  if (user) {
    return null;
  }

  if (!hasCode) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative p-4">
        <div className="mb-12">
          <img src="/images/tf-logo.png" alt="Talent Portal" className="h-48" />
        </div>
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-400 p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Registration Code Required</h2>
          <p className="text-gray-600 text-center mb-6">
            You need a registration code to create an account. Please contact your administrator to get a registration code.
          </p>
          <div className="text-center">
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative p-4">
      <div className="mb-12">
        <img src="/images/tf-logo.png" alt="Talent Portal" className="h-48" />
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-400 p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", { required: "Please confirm your password" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="registrationCode" className="block text-sm font-medium text-gray-700">
              Registration Code
            </label>
            <input
              type="text"
              id="registrationCode"
              {...register("registrationCode", { required: "Registration code is required" })}
              disabled={true}
              className="disabled:opacity-50 disabled:cursor-not-allowed w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            {errors.registrationCode && (
              <p className="mt-1 text-sm text-red-600">{errors.registrationCode.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-primary hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
} 