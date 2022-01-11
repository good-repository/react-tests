import { Container } from "react-bootstrap";
import { OrderDetailsProvider } from "./contexts/OrderDetails";
import OrderEntry from "./pages/entry/OrderEntry";

function App() {
  return (
    <OrderDetailsProvider>
      <Container>
        {/* Summary page and entry page need a provider */}
        <OrderEntry />
      </Container>
    </OrderDetailsProvider>
  );
}

export default App;
