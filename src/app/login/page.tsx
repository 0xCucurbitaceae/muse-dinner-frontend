"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAuth from "@/shared/hooks/useAuth";

interface LoginFormValues {
  username: string;
}

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .required("Username is required"),
});

const LoginPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, isLoading, upsertUser } = useAuth();
  
  // If user is signed in, redirect to dashboard
  if (isSignedIn && !isLoading) {
    router.push("/dashboard");
  }

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Use the upsertUser function to create/update the user in the API
      await upsertUser({
        username: values.username,
        displayName: values.username
      });

      // Redirect to register page after successful login
      router.push("/register");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.response?.data?.message || "Failed to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              Muse Dinners
            </h2>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to your account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your username to get started
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
              {error}
            </div>
          )}

          <Formik
            initialValues={{ username: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid }) => (
              <Form className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Username
                  </label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    placeholder="Enter your username"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
