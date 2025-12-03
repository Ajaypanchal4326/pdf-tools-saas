import React from 'react';
import { FileText, Shield, Zap, Heart} from 'lucide-react';


const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Process files instantly with our optimized tools that work directly in your browser."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Secure",
      description: "Your privacy matters. All processing happens locally - we never store your files."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Completely Free",
      description: "No hidden fees, no subscriptions. All tools are free to use, forever."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "No Limits",
      description: "Convert, merge, and compress as many files as you need, whenever you need."
    }
  ];

  const stats = [
    { number: "12+", label: "Tools Available" },
    { number: "100%", label: "Free Forever" },
    { number: "50MB", label: "Max File Size" },
    { number: "0", label: "Files Stored" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              About PDF<span className="text-blue-600">Tools</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make PDF and image manipulation simple, fast, and accessible to everyone — without downloads or subscriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
          Why Choose PDFTools?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-8">
            Our Story
          </h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <p>
              PDFTools was created from a simple idea — essential digital tools should be fast, secure, and completely free.
            </p>
            <p>
              No software downloads, no bloated apps, and no subscriptions. Just clean, powerful tools anyone can use instantly.
            </p>
            <p>
              That's why our platform is fully browser-based, making it accessible for students, professionals, and everyday users alike.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
