/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ExportKpiButton } from "@/components/export-kpi-button";
import { MockedProvider } from "@apollo/client/testing";
import { gql } from "@apollo/client";
import { toast } from "sonner";

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const EXPORT_USER_KPI_CSV = gql`
  query ExportUserKpiCSV($userID: ID, $from: Date, $to: Date) {
    exportUserKpiCSV(userID: $userID, from: $from, to: $to)
  }
`;

describe("ExportKpiButton", () => {
    const mockCsvData = `UserID,From,To,WorkedMinutes
123,2024-01-01,2024-01-31,9600`;

    beforeEach(() => {
        jest.clearAllMocks();
        global.URL.createObjectURL = jest.fn(() => "mock-url");
        global.URL.revokeObjectURL = jest.fn();
        document.createElement = jest.fn((tag) => {
            if (tag === "a") {
                return {
                    href: "",
                    download: "",
                    click: jest.fn(),
                    style: {},
                } as any;
            }
            return document.createElement(tag);
        });
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render export button", () => {
        render(
            <MockedProvider>
            <ExportKpiButton />
            </MockedProvider>
        );

        expect(screen.getByText("Export CSV")).toBeInTheDocument();
    });

    it("should render with custom label", () => {
        render(
            <MockedProvider>
            <ExportKpiButton label="Télécharger" />
        </MockedProvider>
        );

        expect(screen.getByText("Télécharger")).toBeInTheDocument();
    });

    it("should trigger export on button click", async () => {
        const mocks = [
            {
                request: {
                    query: EXPORT_USER_KPI_CSV,
                    variables: {
                        userID: null,
                        from: null,
                        to: null,
                    },
                },
                result: {
                    data: {
                        exportUserKpiCSV: mockCsvData,
                    },
                },
            },
        ];

        render(
            <MockedProvider mocks={ mocks } >
            <ExportKpiButton />
        </MockedProvider>
        );

        const button = screen.getByText("Export CSV");
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled();
        });
    });

    it("should show loading state while exporting", async () => {
        const mocks = [
            {
                request: {
                    query: EXPORT_USER_KPI_CSV,
                    variables: {
                        userID: null,
                        from: null,
                        to: null,
                    },
                },
                result: {
                    data: {
                        exportUserKpiCSV: mockCsvData,
                    },
                },
                delay: 100,
            },
        ];

        render(
            <MockedProvider mocks={ mocks } >
            <ExportKpiButton />
        </MockedProvider>
        );

        const button = screen.getByText("Export CSV");
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText("Export en cours...")).toBeInTheDocument();
        });
    });

    it("should pass correct variables to query", async () => {
        const mocks = [
            {
                request: {
                    query: EXPORT_USER_KPI_CSV,
                    variables: {
                        userID: "123",
                        from: "2024-01-01",
                        to: "2024-01-31",
                    },
                },
                result: {
                    data: {
                        exportUserKpiCSV: mockCsvData,
                    },
                },
            },
        ];

        render(
            <MockedProvider mocks={ mocks } >
        <ExportKpiButton
          userID="123"
          from = "2024-01-01"
          to = "2024-01-31"
          fileName = "test-export.csv"
            />
            </MockedProvider>
        );

        const button = screen.getByText("Export CSV");
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled();
        });
    });

    it("should handle export errors", async () => {
        const mocks = [
            {
                request: {
                    query: EXPORT_USER_KPI_CSV,
                    variables: {
                        userID: null,
                        from: null,
                        to: null,
                    },
                },
                error: new Error("Export failed"),
            },
        ];

        render(
            <MockedProvider mocks={ mocks } >
            <ExportKpiButton />
        </MockedProvider>
        );

        const button = screen.getByText("Export CSV");
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Erreur lors de l'export",
                expect.any(Object)
            );
        });
    });

    it("should apply custom variant and size", () => {
        render(
            <MockedProvider>
            <ExportKpiButton variant="secondary" size = "lg" />
            </MockedProvider>
        );

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
    });

    it("should create download link with correct filename", async () => {
        const mocks = [
            {
                request: {
                    query: EXPORT_USER_KPI_CSV,
                    variables: {
                        userID: null,
                        from: null,
                        to: null,
                    },
                },
                result: {
                    data: {
                        exportUserKpiCSV: mockCsvData,
                    },
                },
            },
        ];

        render(
            <MockedProvider mocks={ mocks } >
        <ExportKpiButton fileName="custom-name.csv" />
        </MockedProvider>
        );

        const button = screen.getByText("Export CSV");
        fireEvent.click(button);

        await waitFor(() => {
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    it("should revoke object URL after download", async () => {
        const mocks = [
            {
                request: {
                    query: EXPORT_USER_KPI_CSV,
                    variables: {
                        userID: null,
                        from: null,
                        to: null,
                    },
                },
                result: {
                    data: {
                        exportUserKpiCSV: mockCsvData,
                    },
                },
            },
        ];

        render(
            <MockedProvider mocks={ mocks } >
            <ExportKpiButton />
        </MockedProvider>
        );

        const button = screen.getByText("Export CSV");
        fireEvent.click(button);

        await waitFor(() => {
            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("mock-url");
        });
    });
});
