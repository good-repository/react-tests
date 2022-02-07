import {
  fireEvent,
  getByRole,
  getByText,
  render,
  screen,
} from "../../../test-utils";
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

test("displays sould-out show", async () => {
  render(<Shows />);

  const shows = await screen.findAllByRole("listitem");
  const soldOutShow = shows[1];

  const souldOutLabel = getByRole(soldOutShow, "heading", {
    name: /sold out/i,
  });
  expect(souldOutLabel).toBeInTheDocument();

  const bandName = getByRole(soldOutShow, "heading", {
    name: /The Joyous Nun Riot/i,
  });
  expect(bandName).toBeInTheDocument();

  const description = getByText(
    soldOutShow,
    /serious world music with an iconic musical saw/i
  );
  expect(description).toBeInTheDocument();
});

test('redirects to correct tickets URL when "tickets" is clicked', async () => {
  const { history } = render(<Shows />);

  const ticketsButton = await screen.findByRole("button", { name: /tickets/i });
  fireEvent.click(ticketsButton);

  expect(history.location.pathname).toBe("/tickets/0");
});
