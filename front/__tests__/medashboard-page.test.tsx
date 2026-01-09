/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import Me from "@/app/dashboard/me/page";
import { AuthProvider } from "@/contexts/AuthContext";
describe("me dashboard page", () => {
  it("should render the page", () => {
    const { container } = render(<Me />);
    expect(container).toBeInTheDocument();
  });
});
