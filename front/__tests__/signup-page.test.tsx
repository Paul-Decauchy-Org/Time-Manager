/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import SignupPage from "@/app/signup/page";

describe("SignupPage", () => {
  it("should render the page", () => {
    const { container } = render(<SignupPage />);
    expect(container).toBeInTheDocument();
  });
});
