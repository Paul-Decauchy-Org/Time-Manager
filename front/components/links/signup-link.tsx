import Link from "next/link";

export default function SignupLink() {
  return (
    <Link
      href="/signup"
      className="text-sm font-medium text-primary hover:underline"
    >
      Sign up
    </Link>
  )
}