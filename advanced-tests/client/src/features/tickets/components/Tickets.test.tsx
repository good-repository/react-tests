import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

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
