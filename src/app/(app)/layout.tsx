import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrapper">
      <Sidebar />
      <div className="wrapper__main">
        <SearchBar />
        {children}
      </div>
    </div>
  );
}
