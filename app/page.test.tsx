import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "./page";

describe("LandingPage (Page Integration & Component Tier)", () => {
  it("renders all sections and elements per ADR 0004 selectors", () => {
    // Arrange & Act
    render(<LandingPage />);

    // Assert: Top-level container and header
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page__header")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page__wordmark")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page__sign-in-link")).toHaveAttribute(
      "href",
      "/welcome",
    );
    expect(screen.getByTestId("landing-page__sign-up-link")).toHaveAttribute(
      "href",
      "/welcome",
    );

    // Assert: Hero section and all 4 mascots
    expect(screen.getByTestId("landing-page__hero")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page__hero-title")).toHaveTextContent(
      "Your Wardrobe,Finally Organized.",
    );
    const mascots = screen.getAllByTestId("landing-page__mascot");
    expect(mascots).toHaveLength(4);
    expect(
      document.querySelector(
        '[data-testid="landing-page__mascot"][data-entity-id="mascot-42"]',
      ),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        '[data-testid="landing-page__mascot"][data-entity-id="mascot-43"]',
      ),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        '[data-testid="landing-page__mascot"][data-entity-id="mascot-44"]',
      ),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        '[data-testid="landing-page__mascot"][data-entity-id="mascot-45"]',
      ),
    ).toBeInTheDocument();

    // Assert: Overview, steps, stats
    expect(screen.getByTestId("landing-page__overview")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page__steps")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page__stats")).toBeInTheDocument();
    const statItems = screen.getAllByTestId("landing-page__stat-item");
    expect(statItems).toHaveLength(4);

    // Assert: Reviews
    expect(screen.getByTestId("landing-page__reviews")).toBeInTheDocument();
    const reviews = screen.getAllByTestId("landing-page__review-card");
    expect(reviews).toHaveLength(3);

    // Assert: FAQ and Footer
    expect(screen.getByTestId("landing-page__faq")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page__footer")).toBeInTheDocument();
  });

  it("expands and collapses FAQ accordion items when clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<LandingPage />);

    const triggers = screen.getAllByTestId("landing-page__faq-trigger");
    expect(triggers).toHaveLength(3);

    // Act: Click first FAQ question
    await user.click(triggers[0]);

    // Assert: Answer text becomes visible
    expect(
      screen.getByText(/Loomette works across all styles, aesthetics/i),
    ).toBeInTheDocument();
  });

  it("provides functional navigation links to welcome for both hero and final CTAs", () => {
    // Arrange & Act
    render(<LandingPage />);

    // Assert: Both CTAs link to /welcome
    const heroCta = screen.getByTestId("landing-page__hero-cta");
    expect(heroCta.closest("a") || heroCta).toHaveAttribute("href", "/welcome");

    const finalCta = screen.getByTestId("landing-page__final-cta-button");
    expect(finalCta.closest("a") || finalCta).toHaveAttribute("href", "/welcome");
  });
});
