import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";

describe("Accordion component", () => {
  it("renders accordion items and handles expansion", async () => {
    const user = userEvent.setup();

    render(
      <Accordion defaultValue={[0]}>
        <AccordionItem value={0}>
          <AccordionTrigger>Question 1</AccordionTrigger>
          <AccordionPanel>Answer 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem value={1}>
          <AccordionTrigger>Question 2</AccordionTrigger>
          <AccordionPanel>Answer 2</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByRole("button", { name: /question 1/i });
    const trigger2 = screen.getByRole("button", { name: /question 2/i });

    expect(trigger1).toHaveAttribute("data-panel-open", "");
    expect(screen.getByText("Answer 1")).toBeInTheDocument();

    await user.click(trigger2);
    expect(trigger2).toHaveAttribute("data-panel-open", "");
    expect(screen.getByText("Answer 2")).toBeInTheDocument();
  });
});
