/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { useSignUp } from "@/hooks/signup";
import { MockedProvider } from "@apollo/client/testing";
import { SignUpDocument } from "@/generated/graphql";

describe("useSignUp hook", () => {
    const mockSignUpInput = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: "password123",
    };

    const mockSignUpResponse = {
        signUp: {
            token: "test-token",
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            phone: "1234567890",
            role: "EMPLOYEE",
        },
    };

    const mocks = [
        {
            request: {
                query: SignUpDocument,
                variables: {
                    input: mockSignUpInput,
                },
            },
            result: {
                data: mockSignUpResponse,
            },
        },
    ];

    it("should initialize with correct default values", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

    const { result } = renderHook(() => useSignUp(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
    expect(typeof result.current.signUp).toBe("function");
});

it("should call signUp mutation with correct variables", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useSignUp(), { wrapper });

await waitFor(async () => {
    const signUpResult = await result.current.signUp(mockSignUpInput);
    expect(signUpResult).toEqual(mockSignUpResponse.signUp);
});
  });

it("should handle signup errors", async () => {
    const errorMocks = [
        {
            request: {
                query: SignUpDocument,
                variables: {
                    input: mockSignUpInput,
                },
            },
            error: new Error("Email already exists"),
        },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { errorMocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useSignUp(), { wrapper });

await waitFor(async () => {
    try {
        await result.current.signUp(mockSignUpInput);
    } catch (error) {
        expect(error).toBeDefined();
    }
});
  });
});
