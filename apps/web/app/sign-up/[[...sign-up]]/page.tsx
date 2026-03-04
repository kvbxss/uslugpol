import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { clerkAuthAppearance } from "@/lib/auth/clerk-appearance";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }

  return (
    <main className="auth-shell">
      <div className="auth-frame">
        <SignUp appearance={clerkAuthAppearance} />
      </div>
    </main>
  );
}
