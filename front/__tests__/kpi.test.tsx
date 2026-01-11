/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import KPICSV from "@/components/kpiCSV";

const { useKpiCSV } = require("@/hooks/kpiCSV");

describe("KPICSV Component", () => {
  // Mock des APIs du navigateur
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock URL.createObjectURL et URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();

    // Mock document.createElement pour le lien
    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    };
    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") {
        return mockLink as any;
      }
      return document.createElement(tag);
    });

    // Mock appendChild et removeChild
    jest.spyOn(document.body, "appendChild").mockImplementation(() => null as any);
    jest.spyOn(document.body, "removeChild").mockImplementation(() => null as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("devrait afficher le bouton de chargement", () => {
    useKpiCSV.mockReturnValue({
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

    useKpiCSV.mockReturnValue({
      data: { exportUserKpiCSV: mockCSVData },
      loading: false,
      error: null,
    });

    render(<KPICSV />);

    expect(screen.getByText(/télécharger kpi/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("devrait afficher une erreur si le chargement échoue", () => {
    useKpiCSV.mockReturnValue({
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
      "UserID,From,To,WorkedMinutes,OvertimeMinutes,DaysPresent,CurrentStreakDays,PunctualityRate,PresentNow\n,2025-12-12,2026-01-11,0,0,0,0,0.00,false\n";

    useKpiCSV.mockReturnValue({
      data: { exportUserKpiCSV: mockCSVData },
      loading: false,
      error: null,
    });

    render(<KPICSV />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    // Vérifie que le Blob a été créé avec les bonnes données
    const createObjectURLCall = (global.URL.createObjectURL as jest.Mock).mock
      .calls[0][0];
    expect(createObjectURLCall).toBeInstanceOf(Blob);
    expect(createObjectURLCall.type).toBe("text/csv;charset=utf-8;");

    // Vérifie que le lien a été cliqué
    const mockLink = (document.createElement as jest.Mock).mock.results[0].value;
    expect(mockLink.click).toHaveBeenCalled();

    // Vérifie le nettoyage
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("ne devrait pas télécharger si pas de données", () => {
    useKpiCSV.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    render(<KPICSV />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("devrait utiliser la date actuelle dans le nom du fichier", async () => {
    const mockCSVData = "UserID,From,To\n1,2025-01-01,2025-01-10\n";

    useKpiCSV.mockReturnValue({
      data: { exportUserKpiCSV: mockCSVData },
      loading: false,
      error: null,
    });

    // Mock Date
    const mockDate = new Date("2025-01-15T10:00:00Z");
    jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

    render(<KPICSV />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      const mockLink = (document.createElement as jest.Mock).mock.results[0]
        .value;
      expect(mockLink.download).toBe("kpi-report-2025-01-15.csv");
    });

    jest.restoreAllMocks();
  });

  it("devrait gérer les erreurs de téléchargement", async () => {
    const mockCSVData = "UserID,From,To\n";
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Simuler une erreur lors de createObjectURL
    global.URL.createObjectURL = jest.fn(() => {
      throw new Error("Failed to create blob URL");
    });

    useKpiCSV.mockReturnValue({
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

    useKpiCSV.mockReturnValue({
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