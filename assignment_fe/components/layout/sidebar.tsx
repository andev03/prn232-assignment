"use client"

interface MenuItem {
    id: string
    label: string
    icon: string
}

interface SidebarProps {
    role: "admin" | "staff"
    menuItems: MenuItem[]
    currentPage: string
    onPageChange: (page: string) => void
}

export default function Sidebar({ role, menuItems, currentPage, onPageChange }: SidebarProps) {
    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <h1 className="text-2xl font-bold text-primary">FU News</h1>
                <p className="text-xs text-muted mt-1">Management System</p>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onPageChange(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentPage === item.id ? "bg-primary text-white" : "text-foreground hover:bg-background"
                            }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border text-xs text-muted">
                <p>
                    Role: <span className="text-primary capitalize">{role}</span>
                </p>
            </div>
        </aside>
    )
}
