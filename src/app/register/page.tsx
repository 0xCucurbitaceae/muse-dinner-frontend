"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import useAuth from "@/shared/hooks/useAuth";

// Map UI group size to API enum values
const GroupSizeMapping = {
  "one-on-one": "ONE_ON_ONE",
  "small-group": "SMALL",
  "large-group": "LARGE",
} as const;

type GroupSize = "one-on-one" | "small-group" | "large-group";
type ApiGroupSize = typeof GroupSizeMapping[GroupSize];

interface RegisterFormValues {
  groupSize: GroupSize;
}

const RegisterSchema = Yup.object().shape({
  groupSize: Yup.string()
    .oneOf(["one-on-one", "small-group", "large-group"], "Please select a valid group size")
    .required("Please select a group size"),
});

interface UserUpsertResponse {
  user_id: number;
}

const RegisterPage = () => {
  const router = useRouter();
  const { isSignedIn, username, getTelegramId, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If authentication check is complete and user is not signed in, redirect to login
    if (!isLoading && !isSignedIn) {
      router.push("/login");
    }
  }, [isSignedIn, isLoading, router]);

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!username) {
        throw new Error("Username not found. Please sign in again.");
      }
      
      // Get the telegramId for API calls
      const telegramId = getTelegramId();
      
      // Join the appropriate queue based on group size preference
      await axios.post(`${API_BASE_URL}/queues/join`, {
        telegram_id: telegramId,  // Use telegram_id as required by the backend
        group_pref: GroupSizeMapping[values.groupSize]
      });
      
      // Store group size preference locally for UI purposes
      localStorage.setItem("museDinnersGroupSize", values.groupSize);
      localStorage.setItem("museDinnersGroupSizeApi", GroupSizeMapping[values.groupSize]);
      
      // Redirect to dashboard after successful registration
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error?.response?.data?.message || "There was an error registering your preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!username) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Link href="/">
            <h2 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              Muse Dinners
            </h2>
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {username}!
          </h1>
          <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
            Select your preferred dinner group size
          </p>
        </div>

        <Formik
          initialValues={{ groupSize: "" as GroupSize }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isValid }) => (
            <Form>
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                    {error}
                  </div>
                )}

                <ErrorMessage 
                  name="groupSize" 
                  component="div" 
                  className="text-center text-red-600 dark:text-red-400" 
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* One-on-One Option */}
                  <label 
                    className={`relative flex flex-col rounded-lg border-2 ${
                      values.groupSize === "one-on-one" 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" 
                        : "border-gray-200 dark:border-gray-700"
                    } p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors`}
                  >
                    <Field 
                      type="radio" 
                      name="groupSize" 
                      value="one-on-one" 
                      className="absolute h-0 w-0 opacity-0" 
                    />
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
                        <Image
                          src="/one-on-one.svg"
                          alt="One-on-one icon"
                          width={24}
                          height={24}
                          className="text-blue-600 dark:text-blue-300"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">1-on-1</h3>
                    </div>
                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                      Perfect for meaningful conversations and making new friends.
                    </p>
                    {values.groupSize === "one-on-one" && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>

                  {/* Small Group Option */}
                  <label 
                    className={`relative flex flex-col rounded-lg border-2 ${
                      values.groupSize === "small-group" 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" 
                        : "border-gray-200 dark:border-gray-700"
                    } p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors`}
                  >
                    <Field 
                      type="radio" 
                      name="groupSize" 
                      value="small-group" 
                      className="absolute h-0 w-0 opacity-0" 
                    />
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
                        <Image
                          src="/small-group.svg"
                          alt="Small group icon"
                          width={24}
                          height={24}
                          className="text-blue-600 dark:text-blue-300"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Small Group (2-4)</h3>
                    </div>
                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                      Ideal for intimate gatherings with diverse perspectives.
                    </p>
                    {values.groupSize === "small-group" && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>

                  {/* Large Group Option */}
                  <label 
                    className={`relative flex flex-col rounded-lg border-2 ${
                      values.groupSize === "large-group" 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" 
                        : "border-gray-200 dark:border-gray-700"
                    } p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors`}
                  >
                    <Field 
                      type="radio" 
                      name="groupSize" 
                      value="large-group" 
                      className="absolute h-0 w-0 opacity-0" 
                    />
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
                        <Image
                          src="/large-group.svg"
                          alt="Large group icon"
                          width={24}
                          height={24}
                          className="text-blue-600 dark:text-blue-300"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Large Group (5+)</h3>
                    </div>
                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                      Great for lively discussions and meeting multiple people at once.
                    </p>
                    {values.groupSize === "large-group" && (
                      <div className="absolute top-3 right-3">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                </div>

                <div className="mt-10 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="w-full max-w-xs flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterPage;
