import userEvent from "@testing-library/user-event";

import { App } from "../../../App";
import { getByRole, render, screen, waitFor } from "../../../test-utils";

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

test.each([["Sign in"], ["Sign up"]])(
  "successful %p flow",
  async (buttonName) => {
    const { history } = render(<App />, { routeHistory: ["/tickets/1"] });

    const emailField = screen.getByLabelText(/email/i);
    userEvent.type(emailField, "email@test.com");

    const passwordField = screen.getByLabelText(/email/i);
    userEvent.type(passwordField, "blablabla");

    const signInForm = screen.getByTestId("sign-in-form");
    const signInButton = getByRole(signInForm, "button", {
      name: buttonName,
    });
    userEvent.click(signInButton);

    await waitFor(() => {
      expect(history.location.pathname).toBe("/tickets/1");
    });

    expect(history.entries).toHaveLength(1);
  }
);
