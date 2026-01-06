"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function SignIn() {
    const { signIn } = useAuthActions();
    const [step, setStep] = useState<"signIn" | "signUp">("signIn");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await signIn("password", { email, password, flow: step });
        } catch (err) {
            setError("Error signing in. Please check your credentials.");
            console.error(err);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{step === "signIn" ? "Sign In" : "Sign Up"}</CardTitle>
                <CardDescription>
                    {step === "signIn" ? "Welcome back!" : "Create an account to get started."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full">
                        {step === "signIn" ? "Sign In" : "Sign Up"}
                    </Button>
                    <div className="text-center text-sm mt-4">
                        <button
                            type="button"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                            onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
                        >
                            {step === "signIn" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
