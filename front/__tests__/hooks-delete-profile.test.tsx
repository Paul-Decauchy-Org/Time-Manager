/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { useDeleteProfile } from "@/hooks/delete-profile";
import { MockedProvider } from "@apollo/client/testing";
import { DeleteProfileDocument } from "@/generated/graphql";

describe("useDeleteProfile hook", () => {
    const mockDeleteResponse = {
        deleteProfile: true,
    };

    const mocks = [
        {
            request: {
                query: DeleteProfileDocument,
            },
            result: {
                data: mockDeleteResponse,
            },
        },
    ];

    it("should initialize with correct default values", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

    const { result } = renderHook(() => useDeleteProfile(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
    expect(typeof result.current.deleteProfile).toBe("function");
});

it("should call deleteProfile mutation", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { mocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useDeleteProfile(), { wrapper });

await waitFor(async () => {
    const deleteResult = await result.current.deleteProfile();
    expect(deleteResult).toEqual(mockDeleteResponse);
});
  });

it("should handle delete errors", async () => {
    const errorMocks = [
        {
            request: {
                query: DeleteProfileDocument,
            },
            error: new Error("Delete failed"),
        },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MockedProvider mocks= { errorMocks } > { children } </MockedProvider>
    );

const { result } = renderHook(() => useDeleteProfile(), { wrapper });

await waitFor(async () => {
    try {
        await result.current.deleteProfile();
    } catch (error) {
        expect(error).toBeDefined();
    }
});
  });
});
