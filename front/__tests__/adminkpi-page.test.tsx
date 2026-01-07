/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import AdminKpiPage from "@/app/dashboard/kpi/admin/page";
import { AuthProvider } from "@/contexts/AuthContext";

describe("admin kpi page", () => {
  it("should render the page", () => {
    const { container } = render(<AdminKpiPage />);
    expect(container).toBeInTheDocument();
  });
});
