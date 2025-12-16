export function formatPrice(price: number | string): string {
    const numericPrice = Number(price);
    
    if (isNaN(numericPrice)) {
        return "$0.00";
    }

    return `$${numericPrice.toFixed(2)}`;
}

export function validateBookInput(book: { title: string; isbn: string; price: number }) {
    if (!book.title || book.title.trim().length === 0) {
        return { valid: false, error: "El título es obligatorio" };
    }
    
    if (!book.isbn || book.isbn.trim().length < 3) {
        return { valid: false, error: "ISBN inválido" };
    }

    if (book.price < 0) {
        return { valid: false, error: "El precio no puede ser negativo" };
    }

    return { valid: true, error: null };
}

export function calculateDiscount(price: number, discountPercentage: number): number {
    if (price < 0) return 0;
    if (discountPercentage < 0 || discountPercentage > 100) return price;
    
    const discountAmount = (price * discountPercentage) / 100;
    return Number((price - discountAmount).toFixed(2));
}

export function truncateText(text: string, maxLength: number): string {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}