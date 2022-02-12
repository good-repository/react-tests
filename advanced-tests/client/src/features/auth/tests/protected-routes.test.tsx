import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

test.each([
  ["/profile"],
  ["/tickets/0"],
  ["/confirm/0?holdId=123&seatCount=2"],
])(
  "Route %p does redirect to sign in screen when not authenticated",
  (routePath) => {
    render(<App />, { routeHistory: [routePath] });

    const heading = screen.getByRole("heading", { name: /sign in/i });
    expect(heading).toBeInTheDocument();
  }
);
