/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { useUpdateProfile } from "@/hooks/update-profile";
import { MockedProvider } from "@apollo/client/testing";
import { UpdateProfileDocument } from "@/generated/graphql";

describe("useUpdateProfile hook", () => {
    const mockUpdateInput = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "9876543210",
        password: "",
    };

    const mockUpdateResponse = {
        updateProfile: {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "9876543210",
            role: "EMPLOYEE",
        },
    };

    const mocks = [
        {
            request: {
                query: UpdateProfileDocument,
                variables: {
                    input: {
                        firstName: mockUpdateInput.firstName,
                        lastName: mockUpdateInput.lastName,
                        email: mockUpdateInput.email,
                        phone: mockUpdateInput.phone,
                    },
                },
            },
            result: {
                data: mockUpdateResponse,
            },
        },
    ];

    it("should initialize with correct default values", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
    expect(typeof result.current.updateProfile).toBe("function");
});

it("should call updateProfile mutation without password", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useUpdateProfile(), { wrapper });

await waitFor(async () => {
    const updateResult = await result.current.updateProfile(mockUpdateInput);
    expect(updateResult).toEqual(mockUpdateResponse.updateProfile);
});
  });

it("should include password when provided", async () => {
    const inputWithPassword = {
        ...mockUpdateInput,
        password: "newPassword123",
    };

    const mocksWithPassword = [
        {
            request: {
                query: UpdateProfileDocument,
                variables: {
                    input: {
                        firstName: inputWithPassword.firstName,
                        lastName: inputWithPassword.lastName,
                        email: inputWithPassword.email,
                        phone: inputWithPassword.phone,
                        password: inputWithPassword.password,
                    },
                },
            },
            result: {
                data: mockUpdateResponse,
            },
        },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { mocksWithPassword } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useUpdateProfile(), { wrapper });

await waitFor(async () => {
    const updateResult = await result.current.updateProfile(
        inputWithPassword
    );
    expect(updateResult).toEqual(mockUpdateResponse.updateProfile);
});
  });

it("should handle update errors", async () => {
    const errorMocks = [
        {
            request: {
                query: UpdateProfileDocument,
                variables: {
                    input: {
                        firstName: mockUpdateInput.firstName,
                        lastName: mockUpdateInput.lastName,
                        email: mockUpdateInput.email,
                        phone: mockUpdateInput.phone,
                    },
                },
            },
            error: new Error("Update failed"),
        },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { errorMocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useUpdateProfile(), { wrapper });

await waitFor(async () => {
    try {
        await result.current.updateProfile(mockUpdateInput);
    } catch (error) {
        expect(error).toBeDefined();
    }
});
  });
});
