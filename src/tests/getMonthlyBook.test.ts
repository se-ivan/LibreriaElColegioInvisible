import { describe, it, expect, vi } from "vitest";


vi.mock("../lib/prisma", () => ({
  prisma: {
    book: {
      findFirst: vi.fn().mockResolvedValue({
        title: "Libro del mes",
        author: "Autor",
        description: "Descripción",
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
