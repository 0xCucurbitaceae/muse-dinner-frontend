import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Muse Dinners</span>
              <span className="block text-blue-600 dark:text-blue-400">Connect Over Food</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 dark:text-gray-300 max-w-2xl mx-auto">
              Join random dinner groups with other residents in your community.
              Share meals, stories, and build connections.
            </p>
            <div className="mt-10">
              <Link href="/login" className="rounded-full bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mx-auto">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Sign up</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Register with your Telegram account and select your preferred group size.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mx-auto">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Get matched</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Our algorithm matches you with others at the designated time.
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mx-auto">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Enjoy dinner</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Plan your dinner together - restaurant, home-cooked, or takeout.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Group Size Options */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
              Choose Your Group Size
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
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
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Perfect for meaningful conversations and making new friends.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
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
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Ideal for intimate gatherings with diverse perspectives.
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
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
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Great for lively discussions and meeting multiple people at once.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Muse Dinners. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
