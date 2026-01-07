import CommissionRequestForm from "@/components/CommissionRequestForm";

export const metadata = {
  title: "Commission an Artwork",
  description: "Request a custom commission from our artist",
};

export default function CommissionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
          Commission an Artwork
        </h1>
        <p className="text-lg text-gray-600">
          Have a specific vision in mind? Request a custom commission tailored to your needs. Our artist will review your request and get back to you with details and pricing.
        </p>
      </div>

      <CommissionRequestForm />

      {/* Info Section */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-100">
          <h3 className="font-semibold text-lg mb-3 text-gray-900">Process</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">1.</span>
              <span>Submit your commission details</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">2.</span>
              <span>We review and provide a quote</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">3.</span>
              <span>Finalize details and timeline</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-teal-600 flex-shrink-0">4.</span>
              <span>Payment and creation begin</span>
            </li>
          </ol>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="font-semibold text-lg mb-3 text-gray-900">Tips for Your Request</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="text-purple-600">✓</span>
              <span>Be specific about size and style</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600">✓</span>
              <span>Include reference images if you have them</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600">✓</span>
              <span>Mention your preferred timeline</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600">✓</span>
              <span>Describe colors and mood you want</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
