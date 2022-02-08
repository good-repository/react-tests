import { App } from "../../../App";
import { fireEvent, render, screen } from "../../../test-utils";

const mockState = { user: { userDetails: { email: "test@test.com" } } };

test("ticket page displays band name for correct showId", async () => {
  render(<App />, {
    preloadedState: mockState,
    routeHistory: ["/tickets/0"],
  });
  const bandName = await screen.findByRole("heading", {
    name: /avalanche of cheese/i,
  });

  expect(bandName).toBeInTheDocument();
});

test("'purchase' button pushes the correct URL", async () => {
  const { history } = render(<App />, {
    preloadedState: mockState,
    routeHistory: ["/tickets/0"],
  });

  const purchaseButton = await screen.findByRole("button", {
    name: /purchase/i,
  });
  fireEvent.click(purchaseButton);

  expect(history.location.pathname).toBe("/confirm/0");

  const searchRegex = expect.stringMatching(/holdId=\d+&seatCount=2/);
  expect(history.location.search).toEqual(searchRegex);
});
