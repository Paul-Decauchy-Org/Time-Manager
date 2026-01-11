/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { useLogin } from "@/hooks/login";
import { MockedProvider } from "@apollo/client/testing";
import { LoginDocument, MeDocument } from "@/generated/graphql";

describe("useLogin hook", () => {
    const mockLoginResponse = {
        login: {
            token: "test-token",
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            phone: "1234567890",
            role: "EMPLOYEE",
        },
    };

    const mocks = [
        {
            request: {
                query: LoginDocument,
                variables: {
                    email: "test@example.com",
                    password: "password123",
                },
            },
            result: {
                data: mockLoginResponse,
            },
        },
        {
            request: {
                query: MeDocument,
            },
            result: {
                data: { me: mockLoginResponse.login },
            },
        },
    ];

    it("should initialize with correct default values", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
    expect(typeof result.current.login).toBe("function");
});

it("should call login mutation with correct variables", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useLogin(), { wrapper });

await waitFor(async () => {
    const loginResult = await result.current.login(
        "test@example.com",
        "password123"
    );
    expect(loginResult).toEqual(mockLoginResponse.login);
});
  });

it("should handle login errors", async () => {
    const errorMocks = [
        {
            request: {
                query: LoginDocument,
                variables: {
                    email: "wrong@example.com",
                    password: "wrong",
                },
            },
            error: new Error("Invalid credentials"),
        },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { errorMocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useLogin(), { wrapper });

await waitFor(async () => {
    try {
        await result.current.login("wrong@example.com", "wrong");
    } catch (error) {
        expect(error).toBeDefined();
    }
});
  });
});
