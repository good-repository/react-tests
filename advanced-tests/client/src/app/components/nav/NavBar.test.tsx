import { App } from "../../../App";
import { fireEvent, render, screen } from "../../../test-utils";
import { NavBar } from "./NavBar";

const testUser = { email: "testuser@test.com" };

describe("sign-in button navigation", () => {
  // unit test
  test("Clicking sign-in button push '/signin' to history", () => {
    const { history } = render(<NavBar />);
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(history.location.pathname).toBe("/signin");
  });

  // behavior test
  test("Clicking sign-in button shows sign-in page", () => {
    render(<App />);
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(
      screen.getByRole("heading", { name: /sign in to your account/i })
    ).toBeInTheDocument();
  });
});

describe("display sign-in/sign-out button", () => {
  test("Show sign in button when user is falsy", () => {
    render(<NavBar />);
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
  });

  test("Show sign out button when user is truthy", () => {
    render(<NavBar />, {
      preloadedState: { user: { userDetails: testUser } },
    });
    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    const userEmail = screen.getByText(/testuser@test.com/);
    expect(signOutButton).toBeInTheDocument();
    expect(userEmail).toBeInTheDocument();
  });
});
