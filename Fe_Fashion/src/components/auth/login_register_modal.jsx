import Modal from "../common/modal";
import { useAuthModal } from "../../context/AuthModalContext";

export default function LoginRegisterModal() {
  const { isOpen, setIsOpen, mode, setMode } = useAuthModal();

  if (!isOpen) return null;

  return (
    <Modal onClose={() => setIsOpen(false)}>
      <div className="flex gap-4 mb-4">
        <button 
          className={`font-semibold ${mode === "login" ? "text-black" : "text-gray-400"}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button 
          className={`font-semibold ${mode === "register" ? "text-black" : "text-gray-400"}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      {mode === "login" ? (
        <LoginForm />
      ) : (
        <RegisterForm />
      )}
    </Modal>
  );
}

function LoginForm() {
  return (
    <form className="flex flex-col gap-3">
      <input className="border p-2 rounded" placeholder="Email" />
      <input className="border p-2 rounded" placeholder="Password" type="password" />
      <button className="bg-black text-white py-2 rounded">Login</button>
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="flex flex-col gap-3">
      <input className="border p-2 rounded" placeholder="Name" />
      <input className="border p-2 rounded" placeholder="Email" />
      <input className="border p-2 rounded" placeholder="Password" type="password" />
      <button className="bg-black text-white py-2 rounded">Register</button>
    </form>
  );
}
