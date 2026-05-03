import { UserRole } from "@server/security";

export interface AuthenticatedUser {
    id: number;
    email: string;
    role: UserRole;
    name: string;
}

