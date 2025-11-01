// [File: app/admin/layout.tsx]

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- Import CSS

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="admin-layout">
            {/* (Sidebar, Header... của bạn) */}
            <main>
                {children}
            </main>

            {/* THÊM DÒNG NÀY VÀO CUỐI CÙNG (TRƯỚC </body>) */}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark" // (Hoặc "light" tùy giao diện của bạn)
            />
        </div>
    )
}