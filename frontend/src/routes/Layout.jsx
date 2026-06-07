import Navbar from "../components/Navbar";

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            <div className="main-content-layout">
                {children}
            </div>
        </>
    );
}
