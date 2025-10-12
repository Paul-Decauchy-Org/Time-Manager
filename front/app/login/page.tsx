import { LoginForm } from "@/components/login-form"
import {getUser} from "@/apollo/getUser";

export default async function LoginPage() {
    const data = await getUser(1)
    console.log(data?.name)
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
