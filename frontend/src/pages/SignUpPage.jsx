import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MessageCircleIcon } from "lucide-react";
import { Link } from "react-router";
import { SignUp } from "@clerk/react";

function SignUpPage() {
  return (
    <div className="w-full h-full flex items-center justify-center md:p-4 bg-slate-900">
      <div className="relative w-full h-full max-w-6xl md:h-[800px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* FORM COLUMN - LEFT SIDE */}
            <div className="w-full md:w-1/2 h-full p-8 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Create Account
                  </h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>

                {/* CLERK SIGN UP */}
                <div className="flex justify-center">
                  <SignUp
                    forceRedirectUrl="/"
                    appearance={{
                      elements: {
                        card: "bg-transparent shadow-none",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton:
                          "bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors",
                        formButtonPrimary:
                          "bg-cyan-600 hover:bg-cyan-700 text-white font-semibold w-full py-2.5 rounded-lg transition-colors",
                        formFieldInput:
                          "bg-slate-800 border-slate-700 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-lg",
                        formFieldLabel: "text-slate-300 text-sm font-medium",
                        footerActionLink: "text-cyan-400 hover:text-cyan-300",
                        identityPreviewEditButton: "text-cyan-400",
                        dividerLine: "bg-slate-700",
                        dividerText: "text-slate-500",
                        footer: "hidden",
                      },
                    }}
                  />
                </div>

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            {/* ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Start Your Journey Today
                  </h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default SignUpPage;

