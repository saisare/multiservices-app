'use client';

import { ReactNode, useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { 
  Menu, X, Home, Users, FileText, Calendar, BarChart3, Shield,
  Building2, PackageCheck, HardDrive, Hammer, Globe2
} from "lucide-react";
import Link from "next/link";

interface User {
  nom: string;
  prenom: string;
  departement: string;
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("btp");

useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token || !u) {
      router.push("/login");
      return;
    }
    try {
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      const routeDepartment =
        (params.department as string) ||
        pathname.split("/")[2] ||
        parsedUser?.departement ||
        localStorage.getItem("departement") ||
        "btp";
      setDepartment(routeDepartment);
    } catch {
      router.push("/login");
    }
    setLoading(false);
  }, [params, pathname, router]); 

  if (loading) return <div>Loading...</div>;

  // Menu dynamique par département
  const getNavItems = () => {
    const baseItems = [
      { icon: Home, label: "Accueil", href: `/dashboard/${department}` },
    ];

const deptMenus = {
      btp: [
        { icon: Building2, label: "Chantiers", href: "/dashboard/btp/chantiers" },
        { icon: Hammer, label: "Ouvriers", href: "/dashboard/btp/ouvriers" },
        { icon: PackageCheck, label: "Matériaux", href: "/dashboard/btp/materiaux" },
        { icon: HardDrive, label: "Commandes", href: "/dashboard/btp/commandes" },
      ],
      voyage: [
        { icon: Users, label: "Clients", href: "/dashboard/voyage/clients" },
        { icon: Globe2, label: "Destinations", href: "/dashboard/voyage/destinations" },
        { icon: FileText, label: "Offres", href: "/dashboard/voyage/offre" },
        { icon: Calendar, label: "Immigration", href: "/dashboard/service-immigration" },
      ],
    }; 

    return [...baseItems, ...(deptMenus[department as keyof typeof deptMenus] || [])];
  };

  const handleLogout = () => {
    localStorage.clear();
    // Clear auth cookie
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
    router.push("/login");
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen h-screen flex flex-col lg:flex-row overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <aside className={`
        flex-none w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl
        fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 lg:h-screen lg:z-auto
        transition-transform duration-300 ease-in-out
      `}>



        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.nom.charAt(0)}{user?.prenom?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold capitalize">{department}</h1>
              <p className="text-xs text-gray-400">{user?.nom} {user?.prenom}</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center px-4 py-3 rounded-lg hover:bg-white/10 transition-colors w-full"
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors"
          >
            <X className="w-5 h-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col order-1 lg:order-2">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {department} Dashboard
                </h2>
                <p className="text-sm text-gray-500">
                  Bonjour, {user?.prenom} {user?.nom}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg" aria-label="Notifications">
                <div className="w-2 h-2 bg-red-500 absolute top-1 right-1 rounded-full" />
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.nom.charAt(0)}{user?.prenom?.charAt(0)}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-50">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg">Profil</Link>
                    <Link href="/profile/photo" className="block px-4 py-2 hover:bg-gray-100">Photo</Link>
                    <div className="border-t" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-b-lg">
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>


      </div>
    </div>
  );




}

