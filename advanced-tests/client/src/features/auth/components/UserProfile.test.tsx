import { render, screen } from "../../../test-utils";
import { UserProfile } from "./UserProfile";

const testUser = { email: "testuser@test.com" };

test("greets the user", () => {
  render(<UserProfile />, {
    preloadedState: { user: { userDetails: testUser } },
  });
  expect(screen.getByText(/hi, testuser@test.com/i)).toBeInTheDocument();
});

test("redirects to signin if user is false", () => {
  const { history } = render(<UserProfile />);
  expect(history.location.pathname).toBe("/signin");
});
