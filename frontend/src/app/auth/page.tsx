"use client";

import { SignIn } from "@/components/auth/SignIn";
import { UserMenu } from "@/components/auth/UserMenu";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AuthPage() {
    const user = useQuery(api.users.viewer);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Authentication Test</h1>
                    <p className="text-muted-foreground">Verify the implementation of Convex Auth</p>
                </div>

                <Unauthenticated>
                    <SignIn />
                </Unauthenticated>

                <Authenticated>
                    <div className="flex flex-col items-center space-y-6 w-full max-w-sm mx-auto p-6 border rounded-xl shadow-sm bg-card">
                        <div className="text-center space-y-2">
                            <p className="text-lg font-medium">You are logged in!</p>
                            <p className="text-sm text-muted-foreground">User Data from Convex:</p>
                        </div>

                        <div className="w-full bg-muted/50 p-4 rounded-lg overflow-hidden">
                            <pre className="text-xs font-mono overflow-auto max-h-40">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>

                        <div className="flex items-center justify-between w-full pt-4 border-t">
                            <span className="text-sm font-medium">Account Actions</span>
                            <UserMenu />
                        </div>
                    </div>
                </Authenticated>
            </div>
        </div>
    );
}
