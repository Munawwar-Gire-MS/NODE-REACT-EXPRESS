import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Toast } from "@/components/toast";
import { Link } from "wouter";

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const { toast, showToast } = useToast();
  const { login, user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const form = useForm<LoginForm>();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setLocation(user.role === 'agent' ? '/agent' : '/client');
    }
  }, [user, authLoading, setLocation]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoggingIn(true);
    try {
      await login(data.username, data.password);
      showToast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
      form.reset();
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative p-4">
      <div className="mb-12">
        <img src="/images/tf-logo.png" alt="Talent Portal" className="h-48" />
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-400">
        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 text-gray-900"
                disabled={isLoggingIn}
                {...form.register("username", { required: true })}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 text-gray-900"
                disabled={isLoggingIn}
                {...form.register("password", { required: true })}
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full px-4 py-2 text-white bg-primary hover:bg-primary/80 cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isLoggingIn ? (
                <>
                  <span className="opacity-0">Login</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}