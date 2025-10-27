import { Home, Search, Users } from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const artists = [
    {
      name: "Nina",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=160&auto=format&fit=crop",
    },
    {
      name: "Lara",
      avatar:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=160&auto=format&fit=crop",
    },
    {
      name: "Sandy",
      avatar:
        "https://images.unsplash.com/photo-1544005310-94ddf0286df2?q=80&w=160&auto=format&fit=crop",
    },
    {
      name: "Vedic",
      avatar:
        "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=160&auto=format&fit=crop",
    },
  ];

  return (
    <aside className="sticky top-20 hidden md:block">
      <div className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</div>
        <nav className="mt-3 space-y-2 text-sm">
          <a className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-800 transition" href="#">
            <Home className="size-4" />
            <span>Feeds</span>
          </a>
          <a className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-teal-50 hover:text-teal-800 transition" href="#">
            <Search className="size-4" />
            <span>Search</span>
          </a>
        </nav>
      </div>

      <div className="mt-4 rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Users className="size-3" />
          <span>Artists</span>
        </div>
        <div className="mt-3 space-y-3">
          {artists.map((a) => (
            <div key={a.name} className="flex items-center gap-3">
              <Image
                src={a.avatar}
                alt={a.name}
                width={28}
                height={28}
                className="rounded-full"
              />
              <div className="text-sm text-gray-700">{a.name}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}


