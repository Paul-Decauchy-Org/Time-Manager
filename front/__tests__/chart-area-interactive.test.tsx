/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

describe("ChartAreaInteractive", () => {
    it("should render without crashing", () => {
        const { container } = render(<ChartAreaInteractive />);
        expect(container).toBeInTheDocument();
    });

    it("should render with empty container", () => {
        const { container } = render(<ChartAreaInteractive />);
        expect(container.firstChild).toBeTruthy();
    });
});
