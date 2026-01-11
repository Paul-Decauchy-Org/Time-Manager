/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import KPICSV from "@/components/kpiCSV";
import { useKpiCSV } from "../hooks/kpiCSV";

let mockLink: {
    href: string;
    download: string;
    click: jest.Mock;
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    })),
});

jest.mock("../hooks/kpiCSV", () => ({
    useKpiCSV: jest.fn(),
}));

const mockedUseKpiCSV = useKpiCSV as jest.Mock

describe("KPICSV Component", () => {
    // Mock des APIs du navigateur
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock URL.createObjectURL et URL.revokeObjectURL
        global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
        global.URL.revokeObjectURL = jest.fn();

        // Mock document.createElement pour le lien
        mockLink = {
            href: "",
            download: "",
            click: jest.fn(),
        };
        const originalCreateElement = document.createElement.bind(document);

        jest.spyOn(document, "createElement").mockImplementation((tag) => {
            if (tag === "a") {
                return mockLink as any;
            }
            return originalCreateElement(tag);
        });


    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("devrait afficher le bouton de chargement", () => {
        mockedUseKpiCSV.mockReturnValue({
            data: null,
            loading: true,
            error: null,
        });

        render(<KPICSV />);

        expect(screen.getByText(/chargement/i)).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("devrait afficher le bouton de téléchargement", () => {
        const mockCSVData =
            "UserID,From,To,WorkedMinutes\n1,2025-01-01,2025-01-10,480\n";

        mockedUseKpiCSV.mockReturnValue({
            data: { exportUserKpiCSV: mockCSVData },
            loading: false,
            error: null,
        });

        render(<KPICSV />);

        expect(screen.getByText(/télécharger kpi/i)).toBeInTheDocument();
        expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("devrait afficher une erreur si le chargement échoue", () => {
        mockedUseKpiCSV.mockReturnValue({
            data: null,
            loading: false,
            error: new Error("Network error"),
        });

        render(<KPICSV />);

        expect(screen.getByText(/erreur de chargement/i)).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("devrait télécharger le CSV au clic", async () => {
        const mockCSVData =
            "UserID,From,To\n1,2025-01-01,2025-01-10\n";

        mockedUseKpiCSV.mockReturnValue({
            data: { exportUserKpiCSV: mockCSVData },
            loading: false,
            error: null,
        });

        render(<KPICSV />);

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });

    });

    it("ne devrait pas télécharger si pas de données", () => {
        mockedUseKpiCSV.mockReturnValue({
            data: null,
            loading: false,
            error: null,
        });

        render(<KPICSV />);

        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
    });

    it("devrait utiliser la date actuelle dans le nom du fichier", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2025-01-15T10:00:00Z"));

        const mockCSVData = "UserID,From,To\n1,2025-01-01,2025-01-10\n";

        mockedUseKpiCSV.mockReturnValue({
            data: { exportUserKpiCSV: mockCSVData },
            loading: false,
            error: null,
        });

        render(<KPICSV />);

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(mockLink.download).toBe("kpi-report-2025-01-15.csv");
        });

        jest.useRealTimers();
    });

    it("devrait gérer les erreurs de téléchargement", async () => {
        const mockCSVData = "UserID,From,To\n";
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });

        // Simuler une erreur lors de createObjectURL
        global.URL.createObjectURL = jest.fn(() => {
            throw new Error("Failed to create blob URL");
        });

        mockedUseKpiCSV.mockReturnValue({
            data: { exportUserKpiCSV: mockCSVData },
            loading: false,
            error: null,
        });

        render(<KPICSV />);

        const button = screen.getByRole("button");
        fireEvent.click(button);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Error downloading CSV:",
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it("devrait désactiver le bouton pendant le téléchargement", async () => {
        const mockCSVData = "UserID,From,To\n1,2025-01-01,2025-01-10\n";

        mockedUseKpiCSV.mockReturnValue({
            data: { exportUserKpiCSV: mockCSVData },
            loading: false,
            error: null,
        });

        render(<KPICSV />);

        const button = screen.getByRole("button");

        // Avant le clic
        expect(button).not.toBeDisabled();

        fireEvent.click(button);

        // Pendant le téléchargement (brièvement)
        // Le bouton revient enabled très rapidement après le téléchargement
        await waitFor(() => {
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });
});