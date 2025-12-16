import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../pages/lib/prisma", () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "../pages/lib/prisma";
import { GET } from "../pages/api/usersTest"; 

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve la lista de usuarios", async () => {
    (prisma.user.findMany as any).mockResolvedValue([
      { id: "1", name: "Juan", isUser: true },
      { id: "2", name: "Ana", isUser: true },
    ]);

    const res = await GET({} as any);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual(expect.objectContaining({ 
        id: "1", 
        name: "Juan" 
    }));
  })});