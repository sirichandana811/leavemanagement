import NextAuth from "next-auth";
import {authOptions} from "./authOptions";

// Define authOptions to use across the project

// Create handler using authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

