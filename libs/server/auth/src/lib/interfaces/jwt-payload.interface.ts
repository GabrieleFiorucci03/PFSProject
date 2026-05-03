import { UserRole } from "@server/security";

export interface JwtPayload {
    sub: number;
    email: string;
    role: UserRole;
    name: string;
}
