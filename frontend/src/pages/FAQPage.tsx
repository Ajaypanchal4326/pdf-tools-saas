import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { MAX_UPLOAD_FILE_SIZE_MB } from "../lib/uploadLimits";

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Are your PDF and image tools completely free?",
      answer:
        "Yes! All our tools are 100% free to use. You can convert, merge, compress, and transform files without any hidden charges or subscription fees.",
    },
    {
      question: "Is my data secure when using your tools?",
      answer:
        "Absolutely. All file processing happens in your browser - nothing is uploaded or stored.",
    },
    {
      question: "What file size limits do you have?",
      answer: `Most tools support files up to ${MAX_UPLOAD_FILE_SIZE_MB}MB. For larger files, compress first.`,
    },
    {
      question: "Do I need to create an account?",
      answer:
        "No account required! All tools work instantly without signup.",
    },
    {
      question: "Which image formats do you support?",
      answer:
        "We support JPG, PNG, WEBP, and more.",
    },
    {
      question: "How long does processing take?",
      answer:
        "Most conversions happen in seconds.",
    },
    {
      question: "Can I use these tools on mobile?",
      answer:
        "Yes! Everything works smoothly on mobile devices.",
    },
    {
      question: "What's the maximum number of files?",
      answer:
        "Up to ~20 files at once depending on the tool.",
    },
    {
      question: "Do you offer an API?",
      answer:
        "API access coming soon - stay tuned.",
    },
    {
      question: "How can I report a bug?",
      answer:
        "Use our contact form on the About page.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Got questions? We've got answers.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-blue-50 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? We're here to help!
          </p>

          <Link
            to="/about"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
