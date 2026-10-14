
import {
  LayoutDashboard,
  Users,
  Mail,
  Send,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Contacts", icon: Users },
  { name: "Templates", icon: Mail },
  { name: "Campaigns", icon: Send },
  { name: "Settings", icon: Settings },

];

export default function Sidebar({
  activePage,
  setActivePage,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Mail size={23} />
        </div>
        <div>
          <h2>EmailFlow</h2>
          <span>Email Marketing</span>
        </div>
      </div>

      <p className="menu-label">MAIN MENU</p>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* <div className="sidebar-bottom">
        <Settings size={18} />
        <span>Settings</span>
      </div> */}
      <div
  className="sidebar-bottom"
  onClick={() => setActivePage("Settings")}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      setActivePage("Settings");
    }
  }}
>
  <Settings size={18} />
  <span>Settings</span>
</div>
    </aside>
  );
}
