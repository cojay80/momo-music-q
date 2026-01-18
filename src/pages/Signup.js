import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../services/firebase';
import { UserPlus } from 'lucide-react';

export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError("Email is already in use.");
            } else {
                setError("Signup failed: " + err.message);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-black p-8 rounded-xl max-w-sm w-full border border-white/10">
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <UserPlus className="text-black" size={24} />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white text-center mb-8">Create account</h2>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-white block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#121212] border border-[#727272] rounded-md p-3 text-white focus:border-white focus:outline-none transition-colors hover:border-white"
                            placeholder="name@domain.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-white block mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#121212] border border-[#727272] rounded-md p-3 text-white focus:border-white focus:outline-none transition-colors hover:border-white"
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-white block mb-2">Confirm password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#121212] border border-[#727272] rounded-md p-3 text-white focus:border-white focus:outline-none transition-colors hover:border-white"
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <button type="submit" className="w-full py-3 bg-green-500 rounded-full font-bold text-black hover:scale-105 transition-transform mt-4">
                        Sign up
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-slate-400 text-sm">
                        Already have an account? <Link to="/login" className="text-white font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
