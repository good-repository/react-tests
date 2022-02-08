import { App } from "../../../App";
import { render } from "../../../test-utils";

const mockState = { user: { userDetails: { email: "test@test.com" } } };

test("redirect to /tickets/:showId if seatCount is missing", () => {
  const { history } = render(<App />, {
    preloadedState: mockState,
    routeHistory: ["/confirm/0?holdId=12345"],
  });

  expect(history.location.pathname).toBe("/tickets/0");
});
