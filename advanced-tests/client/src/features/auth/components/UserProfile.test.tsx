import { render, screen } from "../../../test-utils";
import { UserProfile } from "./UserProfile";

const testUser = { email: "testuser@test.com" };

test("greest the user", () => {
  render(<UserProfile />, {
    preloadedState: { user: { userDetails: testUser } },
  });
  expect(screen.getByText(/hi, testuser@test.com/i)).toBeInTheDocument();
});
