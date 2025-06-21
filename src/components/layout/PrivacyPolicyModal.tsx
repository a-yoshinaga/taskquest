import React from 'react';
import { X, Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Privacy Policy</h2>
              <p className="text-purple-100 mt-1">Your privacy and data protection</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-orange-800 mb-2">Important Notice - Hackathon Project</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  This application is developed for hackathon purposes and may be discontinued suddenly. 
                  Please <strong>do not input important personal information</strong> such as real names, 
                  addresses, phone numbers, financial information, or any sensitive data.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Data Collection */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">What Information We Collect</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Account Information:</strong> Email address for authentication purposes only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Task Data:</strong> Task titles, descriptions, categories, and completion status that you create</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Game Progress:</strong> Your level, points, achievements, and streak information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Usage Data:</strong> Basic app usage patterns to improve functionality</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Protection */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-800">How We Protect Your Data</h3>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">No Third-Party Sharing</p>
                      <p className="text-sm">We do not share, sell, or distribute your personal information or task data to any third parties.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Secure Storage</p>
                      <p className="text-sm">Your data is stored securely using Supabase with industry-standard encryption and security measures.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Local Backup</p>
                      <p className="text-sm">Data is also stored locally in your browser as a backup, giving you control over your information.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-3">How We Use Your Information</h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>To provide and maintain the TaskQuest application functionality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>To sync your tasks and progress across devices when you're logged in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>To calculate your game statistics, achievements, and progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>To improve the application based on usage patterns (anonymized data only)</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* User Rights */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Your Rights and Control</h3>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Data Access:</strong> You can view all your data within the application at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Data Deletion:</strong> You can delete all your data using the "Reset All Data" option in your profile menu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Account Deletion:</strong> Contact us to permanently delete your account and all associated data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Data Export:</strong> Your data is accessible through the application interface</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Security Recommendations */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Security Recommendations</h3>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold text-red-800 mb-2">Please DO NOT include:</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Real names, addresses, or phone numbers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Financial information, credit card numbers, or bank details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Social security numbers or government ID numbers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Passwords or sensitive login credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>Medical information or other highly sensitive personal data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Contact Us</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 mb-2">
                  If you have any questions about this Privacy Policy or your data, please contact us:
                </p>
                <p className="text-purple-600 font-medium">
                  📧 <a href="mailto:a.yoshinaga0314@gmail.com" className="hover:underline">a.yoshinaga0314@gmail.com</a>
                </p>
              </div>
            </section>

            {/* Last Updated */}
            <section className="text-center pt-4 border-t border-gray-200">
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Your privacy is important to us. We're committed to protecting your data.
            </div>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyModal;