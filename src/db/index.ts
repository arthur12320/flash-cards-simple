import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";
const db = drizzle({ schema });

export default db;
