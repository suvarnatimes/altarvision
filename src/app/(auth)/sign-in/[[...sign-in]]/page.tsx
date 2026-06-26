import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[var(--bg-root)] geo-grid dot-matrix">
      <div className="crystal p-6 md:p-8 max-w-[440px] w-full relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--prism-violet)] via-[var(--prism-sky)] to-[var(--prism-cyan)]"></div>
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black tracking-tight text-prism">
            Welcome Back
          </h1>
          <p className="text-sm mt-2 text-[var(--ink-500)] font-semibold">
            Sign in to access your purchased prompts & dashboard
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              card: "bg-transparent shadow-none border-none w-full",
              header: "hidden",
              socialButtonsBlockButton: "crystal-sm text-[var(--ink-700)] hover:bg-[rgba(91,79,207,0.1)] border-white/40 font-bold",
              formButtonPrimary: "btn-prism w-full py-3",
              footerActionLink: "text-prism font-bold hover:opacity-80",
              formFieldInput: "bg-white/40 border border-white/50 text-[var(--ink-900)] rounded-lg focus:border-[var(--prism-violet)]",
              dividerLine: "bg-white/30",
              dividerText: "text-[var(--ink-500)]",
              formFieldLabel: "text-[var(--ink-700)] font-bold",
              footer: "bg-transparent",
              formFieldSuccessText: "text-[var(--prism-emerald)]",
              formFieldErrorText: "text-[var(--prism-rose)]",
            }
          }}
        />
      </div>
    </div>
  );
}
