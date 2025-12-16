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
  it("retorna el libro del mes", async () => {
    const response = await GET({} as any);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.title).toBe("Libro del mes");
  });
});
