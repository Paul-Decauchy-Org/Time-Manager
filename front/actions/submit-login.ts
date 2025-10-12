"use server";

import { getUser } from "@/apollo/getUser";

// Define a proper state type
type FormState = {
    success: boolean;
    error?: string;
    data?: any;
} | null;

export async function submitUserForm(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    try {
        const email = formData.get('email');
        console.log(email)
        if (!email){
            return { success: false, error: "User ID is required" };
        }

        const data = await getUser(Number(2));

        console.log('Form data:', name);
        console.log('User data:', data);

        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error?.message ?? "Unknown error" };
    }
}