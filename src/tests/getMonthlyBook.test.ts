import { describe, it, expect, vi } from "vitest";

vi.mock("../pages/lib/prisma", () => ({
  default: {
    book: {
      findFirst: vi.fn().mockResolvedValue({
        title: "Libro del mes",
        author: "Autor",
        description: "Descripción",
        coverImage: "/cover.jpg",
      }),
    },
  },
}));

import { GET } from "../pages/api/monthlyBook";

describe("GET /api/monthlyBook", () => {
  it("devuelve el libro del mes", async () => {
    const res = await GET({} as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe("Libro del mes");
  });
});
