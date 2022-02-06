import { getByRole, getByText, render, screen } from "../../../test-utils";
import { Shows } from "./Shows";

// name: "Avalanche of Cheese",
// description: "rollicking country with ambitious kazoo solos",

test("displays relevant show details for non-sold-out show", async () => {
  render(<Shows />);

  const shows = await screen.findAllByRole("listitem");
  const nonSoldOutShow = shows[0];

  const ticketButton = getByRole(nonSoldOutShow, "button", {
    name: /tickets/i,
  });
  expect(ticketButton).toBeInTheDocument();

  const bandName = getByRole(nonSoldOutShow, "heading", {
    name: /avalanche of cheese/i,
  });
  expect(bandName).toBeInTheDocument();

  const description = getByText(
    nonSoldOutShow,
    /rollicking country with ambitious kazoo solos/i
  );
  expect(description).toBeInTheDocument();
});
