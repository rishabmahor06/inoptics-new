/**
 * Admin Login route (/admin-login) uses the SAME unified login component
 * as the exhibitor route. The component reads the URL and shows the
 * correct tab (Admin or Exhibitor) — so user can switch between them
 * without leaving the page, and the route updates automatically.
 */
import ExhibitorLogin from "./exhibitorArea/ExhibitorLogin";
export default ExhibitorLogin;
