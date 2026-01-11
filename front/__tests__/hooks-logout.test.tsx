/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { useLogout } from "@/hooks/logout";
import { MockedProvider } from "@apollo/client/testing";
import { LogoutDocument } from "@/generated/graphql";

describe("useLogout hook", () => {
    const mockLogoutResponse = {
        logout: true,
    };

    const mocks = [
        {
            request: {
                query: LogoutDocument,
            },
            result: {
                data: mockLogoutResponse,
            },
        },
    ];

    it("should initialize with correct default values", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

    const { result } = renderHook(() => useLogout(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
    expect(typeof result.current.logout).toBe("function");
});

it("should call logout mutation", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useLogout(), { wrapper });

await waitFor(async () => {
    const logoutResult = await result.current.logout();
    expect(logoutResult).toBe(true);
});
  });

it("should handle logout errors", async () => {
    const errorMocks = [
        {
            request: {
                query: LogoutDocument,
            },
            error: new Error("Logout failed"),
        },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { errorMocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useLogout(), { wrapper });

await waitFor(async () => {
    try {
        await result.current.logout();
    } catch (error) {
        expect(error).toBeDefined();
    }
});
  });
});
